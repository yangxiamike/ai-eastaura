import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootAiRun, type RootLead, type RootNotification } from "@/lib/workbench/api-client";
import { fallbackTriage } from "@/lib/workbench/fallback";
import { mapLeadToWorkbench, mapNotificationToWorkbench } from "@/lib/workbench/mappings";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await fetchRootApi<{ lead: RootLead; aiRun: RootAiRun; notifications: RootNotification[] }>(
      `/api/leads/${encodeURIComponent(id)}/triage`,
      { method: "POST" },
    );

    return NextResponse.json({
      lead: mapLeadToWorkbench(data.lead, { lead: data.lead, aiRuns: [data.aiRun] }),
      aiRun: data.aiRun,
      notifications: data.notifications.map(mapNotificationToWorkbench),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackTriage(id, rootApiErrorMessage(error)));
  }
}
