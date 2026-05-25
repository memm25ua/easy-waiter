import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { t } from "$lib/i18n";
import type { SupportedLocale } from "$lib/types";

export interface DeploymentCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface DeploymentHealth {
  app: string;
  environment: string;
  coolify?: {
    appUrl?: string;
    projectId?: string;
    serviceId?: string;
  };
  noIndex: boolean;
  checks: DeploymentCheck[];
  ok: boolean;
}

const requiredPublic = [
  "PUBLIC_APP_URL",
  "PUBLIC_SUPABASE_URL",
  "PUBLIC_SUPABASE_ANON_KEY",
];
const requiredPrivate = ["SUPABASE_SERVICE_ROLE_KEY", "OPENROUTER_API_KEY"];
const requiredCoolify = ["COOLIFY_APP_URL"];

export function getProductionMetadata() {
  const environment = privateEnv.DEPLOYMENT_ENVIRONMENT ?? "local";
  return {
    appName: "Easy Waiter",
    environment,
    coolify: {
      appUrl: privateEnv.COOLIFY_APP_URL,
      projectId: privateEnv.COOLIFY_PROJECT_ID,
      serviceId: privateEnv.COOLIFY_SERVICE_ID,
    },
    noIndex: environment !== "production",
    privateRoutePrefixes: [
      "/manager",
      "/onboarding",
      "/health/deployment-smoke",
    ],
  };
}

function checkValues(
  source: Record<string, string | undefined>,
  keys: string[],
  label: string,
  exposeMissingNames = true,
  locale: SupportedLocale = "en",
): DeploymentCheck {
  const missing = keys.filter((key) => !source[key]);
  return {
    name: label,
    ok: missing.length === 0,
    detail:
      missing.length === 0
        ? t(locale, "health.configured")
        : exposeMissingNames
          ? `missing ${missing.join(", ")}`
          : `missing ${missing.length} required value${missing.length === 1 ? "" : "s"}`,
  };
}

export function evaluateDeploymentHealth(
  locale: SupportedLocale = "en",
): DeploymentHealth {
  const metadata = getProductionMetadata();
  const checks = [
    checkValues(
      publicEnv,
      requiredPublic,
      t(locale, "health.publicRuntime"),
      true,
      locale,
    ),
    checkValues(
      privateEnv,
      requiredPrivate,
      t(locale, "health.serverSecrets"),
      false,
      locale,
    ),
    checkValues(
      privateEnv,
      requiredCoolify,
      t(locale, "health.coolify"),
      true,
      locale,
    ),
    {
      name: t(locale, "health.openrouter"),
      ok: (
        privateEnv.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1"
      ).startsWith("https://"),
      detail: "configured",
    },
  ];

  return {
    app: metadata.appName,
    environment: metadata.environment,
    coolify: metadata.coolify,
    noIndex: metadata.noIndex,
    checks,
    ok: checks.every((check) => check.ok),
  };
}

export async function recordSmokeTestResult(input: {
  name: string;
  status: "pass" | "fail";
  details?: Record<string, unknown>;
}) {
  return {
    ...input,
    recordedAt: new Date().toISOString(),
  };
}
