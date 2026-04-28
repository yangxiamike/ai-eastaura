import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootReviewTask } from "@/lib/workbench/api-client";
import { fallbackReviewTasks } from "@/lib/workbench/fallback";
import { mapReviewTaskToWorkbench } from "@/lib/workbench/mappings";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await fetchRootApi<{ reviewTasks: RootReviewTask[]; total: number; limit: number; offset: number }>(
      `/api/review-tasks${url.search}`,
    );

    return NextResponse.json({
      reviewTasks: data.reviewTasks.map(mapReviewTaskToWorkbench),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackReviewTasks(rootApiErrorMessage(error)));
  }
}
