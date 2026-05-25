import { json, type RequestHandler } from "@sveltejs/kit";
import { evaluateDeploymentHealth } from "$lib/server/deployment-health";

export const GET: RequestHandler = async ({ locals }) => {
  const health = evaluateDeploymentHealth(locals.locale ?? "en");
  return json(health, { status: health.ok ? 200 : 503 });
};
