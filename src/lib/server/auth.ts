import { redirect } from "@sveltejs/kit";
import { demoStaff } from "./demo-data";
import type { StaffAssignment, StaffRole } from "$lib/types";

export async function getStaffAssignment(
  locals: App.Locals,
): Promise<StaffAssignment | null> {
  return locals.staff ?? demoStaff;
}

export async function requireStaff(
  locals: App.Locals,
  roles: StaffRole[] = ["owner", "manager", "staff"],
) {
  const staff = await getStaffAssignment(locals);
  if (!staff || !roles.includes(staff.role)) {
    throw redirect(303, "/");
  }
  return staff;
}
