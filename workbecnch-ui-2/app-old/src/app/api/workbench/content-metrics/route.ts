import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage } from "@/lib/workbench/api-client";
import { fallbackContentMetrics } from "@/lib/workbench/fallback";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await fetchRootApi<{ metrics: unknown[]; total: number; limit: number; offset: number }>(
      `/api/content-metrics${url.search}`,
    );

    return NextResponse.json({
      ...data,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackContentMetrics(rootApiErrorMessage(error)));
  }
}
