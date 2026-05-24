import type { Handle } from "@sveltejs/kit";
import { createSupabaseServerClient } from "$lib/server/supabase";
import { getStaffAssignment } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event.cookies);
  const {
    data: { session },
  } = await event.locals.supabase.auth.getSession();
  event.locals.session = session;
  event.locals.staff = await getStaffAssignment(event.locals);

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};
