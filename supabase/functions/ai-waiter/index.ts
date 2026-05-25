import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const payload = await request.json();
  const locale = payload.locale === "es" ? "es" : "en";
  const copy = {
    missing:
      locale === "es"
        ? "Falta la sesión de mesa o el mensaje."
        : "Missing table session or message.",
    unavailable:
      locale === "es"
        ? "La asistencia de IA no está disponible ahora. Aun así puedes hacer un pedido manual."
        : "AI assistance is unavailable right now. You can still place a manual order.",
    unavailableReason:
      locale === "es"
        ? "Proveedor de IA no disponible."
        : "AI provider unavailable.",
    errorReason:
      locale === "es" ? "Error del proveedor de IA." : "AI provider error.",
    defaultReply:
      locale === "es"
        ? "Puedo preparar una propuesta de pedido, pero debes confirmarla antes de enviarla."
        : "I can prepare a cart proposal, but you must confirm it before the order is submitted.",
    languageInstruction:
      locale === "es" ? "Reply in Spanish." : "Reply in English.",
  };
  if (!payload.table_session_id || !payload.message) {
    return Response.json({ reply: copy.missing, locale }, { status: 400 });
  }
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json({
      reply: copy.unavailable,
      recommended_items: [],
      cart_proposal: payload.current_cart ?? [],
      requires_confirmation: false,
      escalation_reason: copy.unavailableReason,
      submitted_order_id: null,
      provider_status: "disabled",
      locale,
    });
  }

  const response = await fetch(
    `${Deno.env.get("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Easy Waiter",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${copy.languageInstruction} Answer only from restaurant-approved context. Never submit orders directly.`,
          },
          { role: "user", content: payload.message },
        ],
      }),
    },
  );
  if (!response.ok) {
    return Response.json({
      reply: copy.unavailable,
      recommended_items: [],
      cart_proposal: payload.current_cart ?? [],
      requires_confirmation: false,
      escalation_reason: copy.errorReason,
      submitted_order_id: null,
      provider_status: "error",
      locale,
    });
  }
  const completion = await response.json();
  return Response.json({
    reply: completion.choices?.[0]?.message?.content ?? copy.defaultReply,
    recommended_items: [],
    cart_proposal: payload.current_cart ?? [],
    requires_confirmation: (payload.current_cart ?? []).length > 0,
    escalation_reason: null,
    submitted_order_id: null,
    provider_status: "success",
    locale,
  });
});
