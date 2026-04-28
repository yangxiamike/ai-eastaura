import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootContentAsset } from "@/lib/workbench/api-client";
import { fallbackComplianceReview } from "@/lib/workbench/fallback";
import { mapContentAssetToWorkbench } from "@/lib/workbench/mappings";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const data = await fetchRootApi<{ asset: RootContentAsset }>(`/api/content-assets/${encodeURIComponent(id)}/compliance-review`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      asset: mapContentAssetToWorkbench(data.asset),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackComplianceReview(id, rootApiErrorMessage(error)));
  }
}
