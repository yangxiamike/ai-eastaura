import { NextResponse } from "next/server";
import { parseContentMetricPayload } from "@/lib/domain/validation";
import { createContentMetricWithAttributionHint } from "@/lib/server/content-pipeline";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = parseContentMetricPayload(await request.json());
    const result = await createContentMetricWithAttributionHint(
      getRepository(),
      payload,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create content metric.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
