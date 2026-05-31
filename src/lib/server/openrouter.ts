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

export interface AiMenuDraftItem {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  available?: boolean;
  optionGroups?: AiMenuDraftOptionGroup[];
  warnings?: string[];
}

export interface AiMenuDraftOptionValue {
  name: string;
  priceDelta?: number;
  available?: boolean;
}

export interface AiMenuDraftOptionGroup {
  name: string;
  required?: boolean;
  minChoices?: number;
  maxChoices?: number;
  values: AiMenuDraftOptionValue[];
}

export interface AiMenuDraftCategory {
  name: string;
  description?: string;
  items: AiMenuDraftItem[];
}

export interface AiMenuDraftWarning {
  severity: "critical" | "non_critical";
  fieldName: string;
  message: string;
  sourceExcerpt?: string;
}

export interface AiMenuDraftResponse {
  categories: AiMenuDraftCategory[];
  warnings: AiMenuDraftWarning[];
  summary: string;
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

export function sanitizeProviderMetadata(metadata: Record<string, unknown>) {
  const { apiKey: _apiKey, authorization: _authorization, ...safe } = metadata;
  return safe;
}

export function parseJsonObjectFromModelContent(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("AI menu draft response was not valid JSON.");
  }
}

export function validateAiMenuDraftResponse(
  value: unknown,
): AiMenuDraftResponse {
  if (!value || typeof value !== "object") {
    throw new Error("AI menu draft response must be an object.");
  }
  const candidate = value as Partial<AiMenuDraftResponse>;
  if (!Array.isArray(candidate.categories)) {
    throw new Error("AI menu draft response must include categories.");
  }
  if (!Array.isArray(candidate.warnings)) {
    throw new Error("AI menu draft response must include warnings.");
  }
  for (const category of candidate.categories) {
    if (!category || typeof category.name !== "string") {
      throw new Error("Each category needs a name.");
    }
    if (!Array.isArray(category.items)) {
      throw new Error("Each category needs items.");
    }
    for (const item of category.items) {
      if (!item || typeof item.name !== "string") {
        throw new Error("Each item needs a name.");
      }
      if (item.price !== undefined && typeof item.price !== "number") {
        throw new Error("Item price must be numeric when present.");
      }
      if (item.optionGroups !== undefined) {
        if (!Array.isArray(item.optionGroups)) {
          throw new Error("Item option groups must be an array.");
        }
        for (const optionGroup of item.optionGroups) {
          if (!optionGroup || typeof optionGroup.name !== "string") {
            throw new Error("Each option group needs a name.");
          }
          if (!Array.isArray(optionGroup.values)) {
            throw new Error("Each option group needs choices.");
          }
          for (const value of optionGroup.values) {
            if (!value || typeof value.name !== "string") {
              throw new Error("Each option choice needs a name.");
            }
            if (
              value.priceDelta !== undefined &&
              typeof value.priceDelta !== "number"
            ) {
              throw new Error("Option choice price delta must be numeric.");
            }
          }
        }
      }
    }
  }
  for (const warning of candidate.warnings) {
    if (
      warning.severity !== "critical" &&
      warning.severity !== "non_critical"
    ) {
      throw new Error("Import warning severity is invalid.");
    }
    if (!warning.message || !warning.fieldName) {
      throw new Error("Import warnings need message and fieldName.");
    }
  }
  return {
    categories: candidate.categories,
    warnings: candidate.warnings,
    summary: String(candidate.summary ?? ""),
  };
}
