import { createServiceRoleClient } from "./supabase";
import type { User } from "@supabase/supabase-js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export async function completeRestaurantOnboarding(input: {
  user: User;
  restaurantName: string;
  locationName: string;
  timezone: string;
  currency: string;
}) {
  const client = createServiceRoleClient();
  const restaurantName = input.restaurantName.trim();
  const locationName = input.locationName.trim();
  if (!restaurantName || !locationName)
    throw new Error("Restaurant and location are required.");

  await client.from("accounts").upsert({
    id: input.user.id,
    email: input.user.email ?? "",
    display_name: input.user.user_metadata?.display_name ?? "",
    last_sign_in_at: new Date().toISOString(),
  });

  const { data: restaurant, error: restaurantError } = await client
    .from("restaurants")
    .insert({
      name: restaurantName,
      slug: slugify(restaurantName),
      owner_account_id: input.user.id,
      owner_user_id: input.user.id,
    })
    .select("id,name")
    .single();
  if (restaurantError) throw restaurantError;

  const { data: location, error: locationError } = await client
    .from("locations")
    .insert({
      restaurant_id: restaurant.id,
      name: locationName,
      timezone: input.timezone || "Europe/Madrid",
      currency: input.currency || "EUR",
    })
    .select("id")
    .single();
  if (locationError) throw locationError;

  const { data: assignment, error: assignmentError } = await client
    .from("staff_members")
    .insert({
      restaurant_id: restaurant.id,
      location_id: location.id,
      user_id: input.user.id,
      role: "owner",
      is_active: true,
    })
    .select("id")
    .single();
  if (assignmentError) throw assignmentError;

  return {
    restaurantId: restaurant.id,
    locationId: location.id,
    staffAssignmentId: assignment.id,
  };
}
