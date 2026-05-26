import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { completeRestaurantOnboarding } from "$lib/server/onboarding";

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get("code");
  if (!code || !locals.supabase) throw redirect(303, "/auth/sign-in");

  const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error?.message);
    throw redirect(303, "/auth/sign-in");
  }

  const meta = data.user.user_metadata ?? {};
  const restaurantName = meta.pending_restaurant_name as string | undefined;
  const locationName = meta.pending_location_name as string | undefined;

  if (restaurantName && locationName) {
    try {
      await completeRestaurantOnboarding({
        user: data.user,
        restaurantName,
        locationName,
        timezone: (meta.pending_timezone as string) || "Europe/Madrid",
        currency: (meta.pending_currency as string) || "EUR",
      });
    } catch (err) {
      console.error("[auth/callback] onboarding failed:", err instanceof Error ? err.message : err);
    }
  }

  throw redirect(303, "/manager");
};
