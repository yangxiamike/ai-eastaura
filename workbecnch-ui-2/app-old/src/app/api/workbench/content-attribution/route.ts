import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootContentAttributionSummary } from "@/lib/workbench/api-client";
import { fallbackAttribution } from "@/lib/workbench/fallback";
import { mapAttributionChannels, mapAttributionSummary } from "@/lib/workbench/mappings";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await fetchRootApi<RootContentAttributionSummary>(`/api/content-attribution${url.search}`);
    const summary = mapAttributionSummary(data);

    return NextResponse.json({
      summary,
      channels: mapAttributionChannels(summary),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackAttribution(rootApiErrorMessage(error)));
  }
}
