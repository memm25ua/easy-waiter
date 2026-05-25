declare global {
  namespace App {
    interface Locals {
      supabase?: import("@supabase/supabase-js").SupabaseClient;
      session?: import("@supabase/supabase-js").Session | null;
      account?: import("@supabase/supabase-js").User | null;
      staff?: import("$lib/types").StaffAssignment | null;
      locale?: import("$lib/types").SupportedLocale;
    }
  }
}

export {};
