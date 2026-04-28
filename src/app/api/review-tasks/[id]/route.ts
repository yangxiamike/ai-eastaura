import { NextResponse } from "next/server";
import { parseReviewTaskUpdatePayload } from "@/lib/domain/validation";
import { updateReviewTaskAndSyncAsset } from "@/lib/server/content-pipeline";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const payload = parseReviewTaskUpdatePayload(await request.json());
    const result = await updateReviewTaskAndSyncAsset(getRepository(), id, payload);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update review task.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
