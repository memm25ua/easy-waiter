import { validateCart } from "$lib/cart";
import { createOpaqueToken, hashToken } from "./security";
import { getPublishedMenu } from "./menu";
import { createOrder, listOrdersForSession } from "./orders";
import { createServiceRoleClient } from "./supabase";
import type { CartItem, Order, TableSession } from "$lib/types";

interface SessionRow {
  id: string;
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
  "id,session_code,access_token_hash,location_id,status,opened_at,expires_at,restaurant_tables(label,locations(restaurant_id))";

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
  const sessionToken = createOpaqueToken();
  const displayCode = sessionToken.slice(0, 10);
  const { data, error } = await createServiceRoleClient()
    .from("table_sessions")
    .insert({
      table_id: input.tableId,
      location_id: input.locationId,
      session_code: displayCode,
      access_token_hash: hashToken(sessionToken),
      status: "active",
      created_by: input.createdBy ?? null,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    })
    .select(sessionSelect)
    .single();

  if (error) throw error;
  const session = mapSession(data as unknown as SessionRow);
  return { ...session, sessionCode: sessionToken };
}

export async function closeTableSession(sessionId: string) {
  const { data, error } = await createServiceRoleClient()
    .from("table_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select(sessionSelect)
    .single();
  if (error) throw error;
  return mapSession(data as unknown as SessionRow);
}

export async function expireTableSessions(before: Date) {
  const { error } = await createServiceRoleClient()
    .from("table_sessions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("opened_at", before.toISOString());
  if (error) throw error;
}

export async function getTableOrderingContext(sessionCode: string) {
  const session = await getTableSession(sessionCode);
  const isExpired =
    session?.expiresAt && new Date(session.expiresAt).getTime() <= Date.now();
  if (!session || session.status !== "active" || isExpired)
    return { session, menu: null, orders: [] };
  const [menu, orders] = await Promise.all([
    getPublishedMenu(session.locationId),
    listOrdersForSession(session.id),
  ]);
  return { session, menu, orders };
}

export async function submitCustomerOrder(input: {
  session: TableSession;
  items: CartItem[];
  source: "manual" | "ai";
  customerNotes?: string;
}): Promise<Order> {
  if (input.session.status !== "active") {
    throw new Error("This table session is not active.");
  }
  const menu = await getPublishedMenu(input.session.locationId);
  if (!menu) throw new Error("No published menu is available for this table.");
  const validation = validateCart(menu, input.items);
  if (validation.issues.length > 0)
    throw new Error(validation.issues[0].message);

  return createOrder({
    locationId: input.session.locationId,
    tableSessionId: input.session.id,
    tableLabel: input.session.tableLabel,
    source: input.source,
    status: "new",
    items: input.items,
    total: validation.total,
    currency: validation.currency,
    customerNotes: input.customerNotes ?? "",
    staffNotes: "",
  });
}
