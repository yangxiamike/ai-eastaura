import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootNotification } from "@/lib/workbench/api-client";
import { fallbackNotifications } from "@/lib/workbench/fallback";
import { mapNotificationToWorkbench } from "@/lib/workbench/mappings";

export async function GET() {
  try {
    const data = await fetchRootApi<{ notifications: RootNotification[] }>("/api/notifications");

    return NextResponse.json({
      notifications: data.notifications.map(mapNotificationToWorkbench),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackNotifications(rootApiErrorMessage(error)));
  }
}
