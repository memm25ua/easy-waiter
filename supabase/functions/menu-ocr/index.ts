import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const USER_SAFE_FAILURE =
  "Menu text extraction could not be completed. You can still create the menu manually.";

function json(body: Record<string, unknown>, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function logOcr(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown>,
) {
  console[level](
    JSON.stringify({
      area: "menu-ocr",
      event,
      ...details,
    }),
  );
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function normalizeOcrText(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function isImageMimeType(value: string) {
  return value.startsWith("image/");
}

function getPageConfidenceSummary(pages: unknown[]) {
  const scores = pages
    .map((page) => {
      if (!page || typeof page !== "object") return null;
      const confidence = (page as Record<string, unknown>).confidence_scores;
      if (!confidence || typeof confidence !== "object") return null;
      const average = (confidence as Record<string, unknown>)
        .average_page_confidence_score;
      return typeof average === "number" ? average : null;
    })
    .filter((score): score is number => typeof score === "number");
  return {
    pageCount: pages.length,
    average:
      scores.length > 0
        ? scores.reduce((total, score) => total + score, 0) / scores.length
        : null,
  };
}

async function extractWithMistral(input: {
  apiKey: string;
  sourceUrl: string;
  mimeType: string;
}) {
  const document = isImageMimeType(input.mimeType)
    ? { type: "image_url", image_url: input.sourceUrl }
    : { type: "document_url", document_url: input.sourceUrl };
  const response = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document,
      confidence_scores_granularity: "page",
    }),
  });
  if (!response.ok) throw new Error("Mistral OCR request failed.");
  const result = await response.json();
  const pages = Array.isArray(result.pages) ? result.pages : [];
  const text = normalizeOcrText(
    pages
      .map((page) =>
        page && typeof page === "object"
          ? String((page as Record<string, unknown>).markdown ?? "")
          : "",
      )
      .join("\n"),
  );
  return {
    text,
    confidenceSummary: {
      provider: "mistral",
      model: String(result.model ?? "mistral-ocr-latest"),
      usage: result.usage_info ?? null,
      ...getPageConfidenceSummary(pages),
    },
  };
}

async function extractWithGenericHttp(input: {
  endpoint: string;
  apiKey: string;
  sourceUrl: string;
  mimeType: string;
  fileName: string;
  locale: string;
}) {
  const response = await fetch(input.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceUrl: input.sourceUrl,
      mimeType: input.mimeType,
      fileName: input.fileName,
      locale: input.locale,
    }),
  });
  if (!response.ok) throw new Error("Generic OCR request failed.");
  const result = await response.json();
  return {
    text: normalizeOcrText(String(result.text ?? "")),
    confidenceSummary:
      result.confidenceSummary && typeof result.confidenceSummary === "object"
        ? result.confidenceSummary
        : {},
  };
}

serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: {
    menuImportJobId?: string;
    restaurantId?: string;
    locationId?: string;
    locale?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return json(
      { status: "failed", message: "Invalid request body." },
      {
        status: 400,
      },
    );
  }

  const { menuImportJobId, restaurantId, locationId } = payload;
  const locale = payload.locale === "es" ? "es" : "en";
  if (!menuImportJobId || !restaurantId || !locationId) {
    logOcr("warn", "request.invalid_scope", {
      hasMenuImportJobId: Boolean(menuImportJobId),
      hasRestaurantId: Boolean(restaurantId),
      hasLocationId: Boolean(locationId),
    });
    return json(
      { status: "failed", message: "Missing import scope." },
      {
        status: 400,
      },
    );
  }

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient(
      getRequiredEnv("SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );
  } catch {
    logOcr("error", "supabase.config_missing", {
      menuImportJobId,
      restaurantId,
      locationId,
    });
    return json(
      {
        status: "failed",
        message:
          "Menu text extraction is not configured. You can still create the menu manually.",
      },
      { status: 500 },
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("menu_imports")
    .select(
      "id,restaurant_id,location_id,source_file_path,source_file_name,source_file_type",
    )
    .eq("id", menuImportJobId)
    .eq("restaurant_id", restaurantId)
    .eq("location_id", locationId)
    .single();

  if (jobError || !job) {
    logOcr("error", "job.not_found", {
      menuImportJobId,
      restaurantId,
      locationId,
      message: jobError?.message,
    });
    return json(
      { status: "failed", message: "Menu import was not found." },
      {
        status: 404,
      },
    );
  }

  const failJob = async (message = USER_SAFE_FAILURE) => {
    logOcr("error", "job.failed", {
      menuImportJobId,
      restaurantId,
      locationId,
      message,
    });
    await supabase
      .from("menu_imports")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", menuImportJobId);
    return json({ status: "failed", message }, { status: 502 });
  };

  const provider = Deno.env.get("OCR_PROVIDER") ?? "mistral";
  const apiKey = Deno.env.get("OCR_API_KEY");
  if (!apiKey || (provider !== "mistral" && provider !== "generic-http")) {
    logOcr("error", "provider.config_invalid", {
      menuImportJobId,
      provider,
      hasApiKey: Boolean(apiKey),
    });
    return await failJob(
      "Menu text extraction is not configured. You can still create the menu manually.",
    );
  }

  await supabase
    .from("menu_imports")
    .update({ status: "ocr_processing", error_message: null })
    .eq("id", menuImportJobId);
  logOcr("info", "provider.start", {
    menuImportJobId,
    restaurantId,
    locationId,
    provider,
    fileName: job.source_file_name,
    mimeType: job.source_file_type,
  });

  const { data: signed, error: signedError } = await supabase.storage
    .from("menu-imports")
    .createSignedUrl(job.source_file_path, 60 * 10);
  if (signedError || !signed?.signedUrl) {
    logOcr("error", "storage.signed_url_failed", {
      menuImportJobId,
      message: signedError?.message,
    });
    return await failJob();
  }

  try {
    const extracted =
      provider === "mistral"
        ? await extractWithMistral({
            apiKey,
            sourceUrl: signed.signedUrl,
            mimeType: job.source_file_type,
          })
        : await extractWithGenericHttp({
            endpoint: getRequiredEnv("OCR_ENDPOINT"),
            apiKey,
            sourceUrl: signed.signedUrl,
            mimeType: job.source_file_type,
            fileName: job.source_file_name,
            locale,
          });
    const text = normalizeOcrText(extracted.text);
    if (!text) {
      logOcr("error", "provider.empty_text", {
        menuImportJobId,
        provider,
        confidenceSummary: extracted.confidenceSummary,
      });
      return await failJob(
        "No readable menu text was found. You can still create the menu manually.",
      );
    }

    const { error: updateError } = await supabase
      .from("menu_imports")
      .update({
        status: "ai_processing",
        ocr_text: text,
        ocr_confidence_summary: extracted.confidenceSummary,
      })
      .eq("id", menuImportJobId);
    if (updateError) {
      logOcr("error", "job.update_failed", {
        menuImportJobId,
        message: updateError.message,
      });
      return await failJob();
    }

    logOcr("info", "provider.success", {
      menuImportJobId,
      provider,
      textLength: text.length,
      confidenceSummary: extracted.confidenceSummary,
    });
    return json({
      status: "ocr_ready",
      text,
      confidenceSummary: extracted.confidenceSummary,
    });
  } catch {
    logOcr("error", "provider.exception", {
      menuImportJobId,
      provider,
    });
    return await failJob();
  }
});
