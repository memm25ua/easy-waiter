import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (request) => {
  if (request.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const payload = await request.json();
  for (const key of [
    "menu_import_id",
    "location_id",
    "source_file_path",
    "requested_by",
  ]) {
    if (!payload[key])
      return Response.json(
        { status: "failed", error_message: `${key} is required` },
        { status: 400 },
      );
  }
  return Response.json({
    status: "needs_review",
    draft_menu: { sections: [] },
    confidence_flags: ["description"],
    suggestions: ["Review extracted descriptions before publishing."],
  });
});
