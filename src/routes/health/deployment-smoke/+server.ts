import { json, type RequestHandler } from "@sveltejs/kit";
import {
  evaluateDeploymentHealth,
  recordSmokeTestResult,
} from "$lib/server/deployment-health";

export const GET: RequestHandler = async ({ locals }) => {
  const health = evaluateDeploymentHealth(locals.locale ?? "en");
  const result = await recordSmokeTestResult({
    name: "deployment-smoke",
    status: health.ok ? "pass" : "fail",
    details: {
      checks: health.checks,
      completeWorkflows: [
        "import-agent configuration",
        "stable table links",
        "published menu",
        "customer order",
        "staff status update",
      ],
    },
  });
  return json({ health, result }, { status: health.ok ? 200 : 503 });
};
