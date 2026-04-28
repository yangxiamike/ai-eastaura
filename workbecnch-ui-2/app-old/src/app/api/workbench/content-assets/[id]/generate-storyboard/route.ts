import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootStoryboard } from "@/lib/workbench/api-client";
import { fallbackStoryboard } from "@/lib/workbench/fallback";
import { mapStoryboardToScenes } from "@/lib/workbench/mappings";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const data = await fetchRootApi<{ storyboard?: RootStoryboard; scenes?: RootStoryboard["scenes"] }>(
      `/api/content-assets/${encodeURIComponent(id)}/generate-storyboard`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    const storyboard = data.storyboard ?? { id: `${id}_storyboard`, title: "Storyboard", scenes: data.scenes ?? [] };

    return NextResponse.json({
      scenes: mapStoryboardToScenes(storyboard),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackStoryboard(rootApiErrorMessage(error)));
  }
}
