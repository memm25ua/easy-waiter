const requiredPublicKeys = ["PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY"];
const requiredServerKeys = ["SUPABASE_SERVICE_ROLE_KEY"];
const requiredAiImportKeys = ["OPENROUTER_API_KEY", "OPENROUTER_MODEL"];
const optionalOcrKeys = ["OCR_PROVIDER", "OCR_ENDPOINT", "OCR_API_KEY"];

export function hasProductionSupabaseEnv(env = process.env) {
  return [...requiredPublicKeys, ...requiredServerKeys].every((key) =>
    Boolean(env[key]),
  );
}

export function requireProductionSupabaseEnv(env = process.env) {
  const missing = [...requiredPublicKeys, ...requiredServerKeys].filter(
    (key) => !env[key],
  );
  if (missing.length > 0) {
    throw new Error(`Missing Supabase test environment: ${missing.join(", ")}`);
  }
}

export function skipWhenProductionEnvMissing() {
  return hasProductionSupabaseEnv() ? false : "Supabase env not configured";
}

export function hasAiImportEnv(env = process.env) {
  return requiredAiImportKeys.every((key) => Boolean(env[key]));
}

export function requireAiImportEnv(env = process.env) {
  const missing = requiredAiImportKeys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing AI import-agent environment: ${missing.join(", ")}`,
    );
  }
}

export function hasOcrEnv(env = process.env) {
  return optionalOcrKeys.some((key) => Boolean(env[key]));
}

export function getCompleteWorkflowEnvStatus(env = process.env) {
  return {
    supabase: hasProductionSupabaseEnv(env),
    aiImportAgent: hasAiImportEnv(env),
    ocr: hasOcrEnv(env),
  };
}

export function skipWhenCompleteWorkflowEnvMissing() {
  const status = getCompleteWorkflowEnvStatus();
  return status.supabase && status.aiImportAgent
    ? false
    : "Complete workflow env not configured";
}
