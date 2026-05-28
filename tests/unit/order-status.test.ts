import { describe, expect, it } from "vitest";
import {
  canTransitionOrderStatus,
  formatCustomerOrderStatus,
  getAllowedOrderStatuses,
  isCustomerVisibleOrderStatus,
} from "$lib/order-status";

describe("order status transitions", () => {
  it("allows normal kitchen progress", () => {
    expect(canTransitionOrderStatus("new", "accepted")).toBe(true);
    expect(canTransitionOrderStatus("accepted", "preparing")).toBe(true);
    expect(canTransitionOrderStatus("preparing", "ready")).toBe(true);
    expect(canTransitionOrderStatus("ready", "served")).toBe(true);
  });

  it("blocks terminal status changes", () => {
    expect(getAllowedOrderStatuses("served")).toEqual([]);
    expect(canTransitionOrderStatus("cancelled", "preparing")).toBe(false);
  });

  it("formats customer-safe status labels", () => {
    expect(formatCustomerOrderStatus("preparing")).toBe("Preparing");
    expect(isCustomerVisibleOrderStatus("cancelled")).toBe(false);
    expect(isCustomerVisibleOrderStatus("ready")).toBe(true);
  });
});
