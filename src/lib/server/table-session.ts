import { validateCart } from "$lib/cart";
import { createOpaqueToken, hashToken } from "./security";
import { getCurrentPublishedMenuSnapshot, getPublishedMenu } from "./menu";
import { createOrder, listOrdersForSession } from "./orders";
import { createServiceRoleClient } from "./supabase";
import type { CartItem, Order, TableSession } from "$lib/types";
import type { StaffAssignment, StableTableLink } from "$lib/types";

interface SessionRow {
  id: string;
  table_id?: string;
  session_code: string;
  access_token_hash?: string | null;
  location_id: string;
  status: "active" | "closed" | "expired";
  opened_at: string;
  expires_at?: string | null;
  restaurant_tables:
    | {
        label: string;
        locations?:
          | { restaurant_id: string }
          | { restaurant_id: string }[]
          | null;
      }
    | {
        label: string;
        locations?:
          | { restaurant_id: string }
          | { restaurant_id: string }[]
          | null;
      }[]
    | null;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function mapSession(row: SessionRow): TableSession {
  const table = one(row.restaurant_tables);
  const location = one(table?.locations);
  return {
    id: row.id,
    sessionCode: row.session_code,
    tableLabel: table?.label ?? "Table",
    locationId: row.location_id,
    restaurantId: location?.restaurant_id,
    status: row.status,
    openedAt: row.opened_at,
    expiresAt: row.expires_at ?? null,
  };
}

const sessionSelect =
  "id,table_id,session_code,access_token_hash,location_id,status,opened_at,expires_at,restaurant_tables(label,locations(restaurant_id))";

interface TableRow {
  id: string;
  label: string;
  location_id: string;
  qr_token?: string | null;
  stable_entry_token_hash?: string | null;
  stable_entry_token_hint?: string | null;
  locations:
    | { name: string; restaurant_id: string }
    | { name: string; restaurant_id: string }[]
    | null;
}

export async function getTableSession(
  sessionToken: string,
): Promise<TableSession | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("table_sessions")
    .select(sessionSelect)
    .eq("access_token_hash", hashToken(sessionToken))
    .maybeSingle();

  if (error) throw error;
  if (data) return mapSession(data as unknown as SessionRow);

  const { data: legacyData, error: legacyError } = await client
    .from("table_sessions")
    .select(sessionSelect)
    .eq("session_code", sessionToken)
    .maybeSingle();
  if (legacyError) throw legacyError;
  return legacyData ? mapSession(legacyData as unknown as SessionRow) : null;
}

export async function openTableSession(input: {
  tableId: string;
  locationId: string;
  createdBy?: string | null;
}) {
  const client = createServiceRoleClient();
  const stableToken = await ensureStableTableEntryToken(input.tableId);
  const { data: existing, error: existingError } = await client
    .from("table_sessions")
    .select(sessionSelect)
    .eq("table_id", input.tableId)
    .eq("status", "active")
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    return {
      ...mapSession(existing as unknown as SessionRow),
      stableCustomerUrl: `/table/${stableToken}`,
    };
  }

  const sessionToken = createOpaqueToken();
  const displayCode = sessionToken.slice(0, 10);
  const { data, error } = await client
    .from("table_sessions")
    .insert({
      table_id: input.tableId,
      location_id: input.locationId,
      session_code: displayCode,
      access_token_hash: hashToken(sessionToken),
      status: "active",
      created_by: input.createdBy ?? null,
      opened_by: input.createdBy ?? null,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    })
    .select(sessionSelect)
    .single();

  if (error) throw error;
  const session = mapSession(data as unknown as SessionRow);
  return {
    ...session,
    sessionCode: sessionToken,
    stableCustomerUrl: `/table/${stableToken}`,
  };
}

export async function closeTableSession(
  sessionId: string,
  closedBy?: string | null,
) {
  const { data, error } = await createServiceRoleClient()
    .from("table_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: closedBy ?? null,
    })
    .eq("id", sessionId)
    .select(sessionSelect)
    .single();
  if (error) throw error;
  return mapSession(data as unknown as SessionRow);
}

export async function ensureStableTableEntryToken(tableId: string) {
  const client = createServiceRoleClient();
  const { data: table, error } = await client
    .from("restaurant_tables")
    .select("id,qr_token,stable_entry_token_hash,stable_entry_token_hint")
    .eq("id", tableId)
    .single();
  if (error) throw error;

  if (table.stable_entry_token_hint) return table.stable_entry_token_hint;
  if (table.qr_token && table.stable_entry_token_hash) return table.qr_token;

  const token = createOpaqueToken();
  const { error: updateError } = await client
    .from("restaurant_tables")
    .update({
      qr_token: table.qr_token ?? token,
      stable_entry_token_hash: hashToken(token),
      stable_entry_token_hint: token,
    })
    .eq("id", tableId);
  if (updateError) throw updateError;
  return token;
}

export async function listStableTableLinks(
  staff: StaffAssignment,
): Promise<StableTableLink[]> {
  const { data, error } = await createServiceRoleClient()
    .from("restaurant_tables")
    .select("id,location_id,label,qr_token,stable_entry_token_hint,is_active")
    .eq("location_id", staff.locationId)
    .order("label", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((table) => ({
    tableId: table.id,
    locationId: table.location_id,
    tableLabel: table.label,
    tokenHint: table.stable_entry_token_hint ?? table.qr_token ?? null,
    customerUrl: `/table/${table.stable_entry_token_hint ?? table.qr_token ?? table.id}`,
    isActive: table.is_active,
  }));
}

export async function expireTableSessions(before: Date) {
  const { error } = await createServiceRoleClient()
    .from("table_sessions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("opened_at", before.toISOString());
  if (error) throw error;
}

export async function resolveCustomerTableLink(
  stableEntryToken: string,
  locale: "en" | "es" = "en",
) {
  const client = createServiceRoleClient();
  const tokenHash = hashToken(stableEntryToken);
  const { data: table, error } = await client
    .from("restaurant_tables")
    .select(
      "id,label,location_id,qr_token,stable_entry_token_hash,stable_entry_token_hint,locations(name,restaurant_id)",
    )
    .or(
      `stable_entry_token_hash.eq.${tokenHash},stable_entry_token_hash.eq.${stableEntryToken},qr_token.eq.${stableEntryToken},stable_entry_token_hint.eq.${stableEntryToken}`,
    )
    .maybeSingle();
  if (error) throw error;
  if (!table) {
    return {
      locale,
      tableLabel: "",
      locationName: "",
      session: null,
      menu: null,
      orders: [],
      blockedReason: "invalid_link" as const,
    };
  }

  const tableRow = table as unknown as TableRow;
  const location = one(tableRow.locations);
  const { data: sessionRow, error: sessionError } = await client
    .from("table_sessions")
    .select(sessionSelect)
    .eq("table_id", tableRow.id)
    .eq("status", "active")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessionError) throw sessionError;

  const session = sessionRow
    ? mapSession(sessionRow as unknown as SessionRow)
    : null;
  if (!session) {
    return {
      locale,
      tableLabel: tableRow.label,
      locationName: location?.name ?? "",
      session: null,
      menu: null,
      orders: [],
      blockedReason: "no_active_session" as const,
    };
  }

  const [menu, orders] = await Promise.all([
    getPublishedMenu(tableRow.location_id),
    listOrdersForSession(session.id),
  ]);
  return {
    locale,
    tableLabel: tableRow.label,
    locationName: location?.name ?? "",
    session,
    menu,
    orders,
    blockedReason: menu ? null : ("no_published_menu" as const),
  };
}

export async function getTableOrderingContext(sessionCode: string) {
  const stableContext = await resolveCustomerTableLink(sessionCode);
  if (stableContext.session || stableContext.blockedReason !== "invalid_link") {
    return {
      session: stableContext.session,
      menu: stableContext.menu,
      orders: stableContext.orders,
      blockedReason: stableContext.blockedReason,
    };
  }

  const session = await getTableSession(sessionCode);
  if (!session)
    return { session: null, menu: null, orders: [], blockedReason: "invalid_link" };
  const isExpired =
    session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now();
  if (session.status !== "active" || isExpired)
    return { session, menu: null, orders: [], blockedReason: "closed_session" };
  const [menu, orders] = await Promise.all([
    getPublishedMenu(session.locationId),
    listOrdersForSession(session.id),
  ]);
  return {
    session,
    menu,
    orders,
    blockedReason: menu ? null : "no_published_menu",
  };
}

export async function submitCustomerOrder(input: {
  session: TableSession;
  items: CartItem[];
  source: "manual" | "ai";
  customerNotes?: string;
}): Promise<Order> {
  const currentSession = await getTableSession(input.session.sessionCode);
  const activeSession = currentSession ?? input.session;
  if (activeSession.status !== "active") {
    throw new Error("This table session is not active.");
  }
  const menu = await getPublishedMenu(activeSession.locationId);
  if (!menu) throw new Error("No published menu is available for this table.");
  const validation = validateCart(menu, input.items);
  if (validation.issues.length > 0)
    throw new Error(validation.issues[0].message);

  const snapshot = await getCurrentPublishedMenuSnapshot(
    activeSession.locationId,
  );
  return createOrder({
    restaurantId: activeSession.restaurantId,
    locationId: activeSession.locationId,
    tableSessionId: activeSession.id,
    tableLabel: activeSession.tableLabel,
    publishedMenuSnapshotId: snapshot?.id,
    source: input.source,
    status: "new",
    items: input.items,
    total: validation.total,
    currency: validation.currency,
    customerNotes: input.customerNotes ?? "",
    staffNotes: "",
  });
}
