import { createServiceRoleClient } from "./supabase";
import type { SupportedLocale } from "$lib/types";

export interface LeadInput {
  email: string;
  restaurantName?: string;
  contactName?: string;
  message?: string;
  locale?: SupportedLocale;
}

export function validateLead(input: LeadInput) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return {
    email,
    restaurantName: input.restaurantName?.trim() ?? "",
    contactName: input.contactName?.trim() ?? "",
    message: input.message?.trim() ?? "",
    locale: input.locale ?? "en",
  };
}

export async function createMarketingLead(input: LeadInput) {
  const lead = validateLead(input);
  const { data, error } = await createServiceRoleClient()
    .from("marketing_leads")
    .insert({
      email: lead.email,
      restaurant_name: lead.restaurantName,
      contact_name: lead.contactName,
      message: lead.message,
      source: "landing",
      locale: lead.locale,
    })
    .select(
      "id,email,restaurant_name,contact_name,message,source,locale,created_at",
    )
    .single();
  if (error) throw error;
  return data;
}
