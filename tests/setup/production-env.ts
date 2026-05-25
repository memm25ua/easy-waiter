const requiredPublicKeys = ["PUBLIC_SUPABASE_URL", "PUBLIC_SUPABASE_ANON_KEY"];
const requiredServerKeys = ["SUPABASE_SERVICE_ROLE_KEY"];

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
