import { NextResponse } from "next/server";
import { parsePublishPostPayload } from "@/lib/domain/validation";
import { createPublishPostAndSyncAsset } from "@/lib/server/content-pipeline";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = parsePublishPostPayload(await request.json());
    const result = await createPublishPostAndSyncAsset(getRepository(), payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create publish post.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
