import { NextResponse } from "next/server";
import {
  parseReviewTaskListQuery,
  parseReviewTaskUpdatePayload,
} from "@/lib/domain/validation";
import { updateReviewTaskAndSyncAsset } from "@/lib/server/content-pipeline";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const query = parseReviewTaskListQuery(new URL(request.url).searchParams);

    return NextResponse.json(await getRepository().listReviewTasks(query));
  } catch (error) {
    return jsonError(error, "Unable to list review tasks.");
  }
}

export async function PATCH(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const payload = parseReviewTaskUpdatePayload(body);
    const result = await updateReviewTaskAndSyncAsset(getRepository(), id, payload);

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error, "Unable to update review task.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
