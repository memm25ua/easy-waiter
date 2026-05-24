import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const payload = await request.json();
  if (!payload.table_session_id || !payload.message) {
    return Response.json(
      { reply: "Missing table session or message." },
      { status: 400 },
    );
  }
  return Response.json({
    reply:
      "I can prepare a cart proposal, but you must confirm it before the order is submitted.",
    recommended_items: [],
    cart_proposal: payload.current_cart ?? [],
    requires_confirmation: true,
    escalation_reason: null,
    submitted_order_id: null,
  });
});
