import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootNotification } from "@/lib/workbench/api-client";
import { fallbackNotificationRetry } from "@/lib/workbench/fallback";
import { mapNotificationToWorkbench } from "@/lib/workbench/mappings";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await fetchRootApi<{ notification: RootNotification; retried: boolean; reason?: string }>(
      `/api/notifications/${encodeURIComponent(id)}/retry`,
      { method: "POST" },
    );

    return NextResponse.json({
      notification: mapNotificationToWorkbench(data.notification),
      retried: data.retried,
      reason: data.reason,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackNotificationRetry(id, rootApiErrorMessage(error)));
  }
}
