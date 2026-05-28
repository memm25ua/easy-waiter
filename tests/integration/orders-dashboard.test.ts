import { describe, expect, it } from "vitest";
import {
  listAssignedLocationOrders,
  listOrders,
  updateOrderStatus,
} from "$lib/server/orders";
import { demoStaff } from "$lib/server/demo-data";
import { hasProductionSupabaseEnv } from "../setup/production-env";

describe("orders dashboard service contracts", () => {
  it("exposes assigned-location filtering and status updates", () => {
    expect(listAssignedLocationOrders).toBeTypeOf("function");
    expect(updateOrderStatus).toBeTypeOf("function");
  });
});

describe.skipIf(!hasProductionSupabaseEnv())("orders dashboard", () => {
  it("loads orders and applies valid status updates", async () => {
    const [order] = await listOrders(demoStaff.locationId);
    const updated = await updateOrderStatus(
      order.id,
      order.status === "new" ? "accepted" : "ready",
    );
    expect(updated.updatedAt).toBeTruthy();
  });
});
