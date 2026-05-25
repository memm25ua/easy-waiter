import { env } from "$env/dynamic/private";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResult {
  content: string;
  model: string;
  providerStatus: "success" | "timeout" | "error" | "disabled";
  metadata: Record<string, unknown>;
}

function getConfig() {
  return {
    apiKey: env.OPENROUTER_API_KEY,
    baseUrl: env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    model: env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
    timeoutMs: Number(env.OPENROUTER_TIMEOUT_MS ?? 12000),
  };
}

export function assertOpenRouterConfigured() {
  const config = getConfig();
  if (!config.apiKey) throw new Error("OPENROUTER_API_KEY is required.");
  return config;
}

export async function createChatCompletion(
  messages: OpenRouterMessage[],
): Promise<OpenRouterResult> {
  const config = getConfig();
  if (!config.apiKey) {
    return {
      content: "",
      model: config.model,
      providerStatus: "disabled",
      metadata: { reason: "missing_api_key" },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.PUBLIC_APP_URL ?? "http://localhost",
        "X-Title": "Easy Waiter",
      },
      body: JSON.stringify({ model: config.model, messages }),
    });

    if (!response.ok) {
      return {
        content: "",
        model: config.model,
        providerStatus: "error",
        metadata: { status: response.status },
      };
    }
    const payload = await response.json();
    return {
      content: String(payload.choices?.[0]?.message?.content ?? ""),
      model: String(payload.model ?? config.model),
      providerStatus: "success",
      metadata: { id: payload.id, usage: payload.usage },
    };
  } catch (error) {
    return {
      content: "",
      model: config.model,
      providerStatus:
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "error",
      metadata: {
        message: error instanceof Error ? error.message : "provider error",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
