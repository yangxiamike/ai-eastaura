import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootReviewTask } from "@/lib/workbench/api-client";
import { fallbackPatchedReviewTask } from "@/lib/workbench/fallback";
import { mapReviewTaskToWorkbench, mapWorkbenchReviewStatus } from "@/lib/workbench/mappings";
import type { ReviewTask } from "@/lib/workbench/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let requestedStatus: ReviewTask["status"] | undefined;

  try {
    const body = await request.json();
    requestedStatus = typeof body?.status === "string" ? body.status : undefined;
    const data = await fetchRootApi<{ reviewTask: RootReviewTask }>(`/api/review-tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...body,
        status: mapWorkbenchReviewStatus(body.status),
      }),
    });

    return NextResponse.json({
      reviewTask: mapReviewTaskToWorkbench(data.reviewTask),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackPatchedReviewTask(id, requestedStatus, rootApiErrorMessage(error)));
  }
}
