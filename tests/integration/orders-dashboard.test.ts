import { describe, expect, it } from "vitest";
import { listOrders, updateOrderStatus } from "$lib/server/orders";
import { demoStaff } from "$lib/server/demo-data";

describe("orders dashboard", () => {
  it("loads orders and applies valid status updates", async () => {
    const [order] = await listOrders(demoStaff.locationId);
    const updated = await updateOrderStatus(
      order.id,
      order.status === "new" ? "accepted" : "ready",
    );
    expect(updated.updatedAt).toBeTruthy();
  });
});
