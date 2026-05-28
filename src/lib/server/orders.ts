import { assertOrderStatusTransition } from "$lib/order-status";
import { createServiceRoleClient } from "./supabase";
import type { CartItem, Order, OrderStatus, StaffAssignment } from "$lib/types";

interface OrderRow {
  id: string;
  location_id: string;
  table_session_id: string;
  source: "manual" | "ai";
  status: OrderStatus;
  items: CartItem[];
  total: number;
  currency: string;
  customer_notes: string;
  staff_notes: string;
  created_at: string;
  updated_at: string;
  table_sessions?: {
    restaurant_tables?: { label: string } | { label: string }[] | null;
  } | null;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export function mapOrder(row: OrderRow): Order {
  const session = one(row.table_sessions);
  const table = one(session?.restaurant_tables);
  return {
    id: row.id,
    locationId: row.location_id,
    tableSessionId: row.table_session_id,
    tableLabel: table?.label ?? "Table",
    source: row.source,
    status: row.status,
    items: row.items ?? [],
    total: row.total,
    currency: row.currency,
    customerNotes: row.customer_notes,
    staffNotes: row.staff_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const orderSelect =
  "id,location_id,table_session_id,source,status,items,total,currency,customer_notes,staff_notes,created_at,updated_at,table_sessions(restaurant_tables(label))";

export async function listOrders(locationId: string): Promise<Order[]> {
  const { data, error } = await createServiceRoleClient()
    .from("orders")
    .select(orderSelect)
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as unknown as OrderRow));
}

export async function listAssignedLocationOrders(staff: StaffAssignment) {
  return listOrders(staff.locationId);
}

export async function listOrdersForSession(
  tableSessionId: string,
): Promise<Order[]> {
  const { data, error } = await createServiceRoleClient()
    .from("orders")
    .select(orderSelect)
    .eq("table_session_id", tableSessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as unknown as OrderRow));
}

export function orderNeedsAttention(order: Order): boolean {
  return (
    order.status === "needs_attention" ||
    order.customerNotes.toLowerCase().includes("allergy")
  );
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt"> & {
    restaurantId?: string | null;
    publishedMenuSnapshotId?: string | null;
  },
) {
  const { data, error } = await createServiceRoleClient()
    .from("orders")
    .insert({
      restaurant_id: input.restaurantId ?? null,
      location_id: input.locationId,
      table_session_id: input.tableSessionId,
      published_menu_snapshot_id: input.publishedMenuSnapshotId ?? null,
      source: input.source,
      status: input.status,
      items: input.items,
      total: input.total,
      currency: input.currency,
      customer_notes: input.customerNotes,
      staff_notes: input.staffNotes,
    })
    .select(orderSelect)
    .single();

  if (error) throw error;
  const { error: eventError } = await createServiceRoleClient()
    .from("order_status_events")
    .insert({
      order_id: data.id,
      from_status: null,
      to_status: input.status,
    });
  if (eventError) throw eventError;
  return mapOrder(data as unknown as OrderRow);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  staffNotes = "",
  changedBy?: string | null,
) {
  const client = createServiceRoleClient();
  const { data: existing, error: readError } = await client
    .from("orders")
    .select(orderSelect)
    .eq("id", orderId)
    .single();
  if (readError) throw readError;
  const order = mapOrder(existing as unknown as OrderRow);
  assertOrderStatusTransition(order.status, status);

  const { data, error } = await client
    .from("orders")
    .update({ status, staff_notes: staffNotes || order.staffNotes })
    .eq("id", orderId)
    .select(orderSelect)
    .single();

  if (error) throw error;
  const { error: eventError } = await client
    .from("order_status_events")
    .insert({
      order_id: orderId,
      from_status: order.status,
      to_status: status,
      changed_by: changedBy ?? null,
    });
  if (eventError) throw eventError;
  return mapOrder(data as unknown as OrderRow);
}
