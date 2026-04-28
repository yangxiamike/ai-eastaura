import { NextResponse } from "next/server";
import {
  fetchRootApi,
  rootApiErrorMessage,
  type RootAiRun,
  type RootLeadEvent,
  type RootLead,
  type RootLeadNote,
  type RootLeadStatusEvent,
} from "@/lib/workbench/api-client";
import { fallbackLead, fallbackPatchedLead } from "@/lib/workbench/fallback";
import { mapLeadToWorkbench, mapWorkbenchStatusToRoot } from "@/lib/workbench/mappings";
import type { Lead } from "@/lib/workbench/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RootLeadDetail = {
  lead: RootLead;
  aiRuns?: RootAiRun[];
  notes?: RootLeadNote[];
  statusEvents?: RootLeadStatusEvent[];
  leadEvents?: RootLeadEvent[];
};

function mapStatusEvent(event: RootLeadStatusEvent) {
  return {
    id: event.id,
    createdAt: event.createdAt,
    action: `Status changed from ${event.from} to ${event.to}${event.reason ? ` - ${event.reason}` : ""}`,
    by: "System",
  };
}

function stringifyMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) {
    return "";
  }

  const summary = metadata.summary ?? metadata.title ?? metadata.body ?? metadata.status ?? metadata.error;
  return typeof summary === "string" ? summary : "";
}

function mapLeadEvent(event: RootLeadEvent) {
  return {
    id: event.id,
    createdAt: event.createdAt,
    type: event.type,
    action: stringifyMetadata(event.metadata) || event.type.replace(/_/g, " "),
    by: event.actor ?? "system",
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await fetchRootApi<RootLeadDetail>(`/api/leads/${encodeURIComponent(id)}`);
    return NextResponse.json({
      lead: mapLeadToWorkbench(data.lead, data),
      aiRuns: data.aiRuns ?? [],
      notes: data.notes ?? [],
      statusEvents: (data.statusEvents ?? []).map(mapStatusEvent),
      leadEvents: (data.leadEvents ?? []).map(mapLeadEvent),
      root: data,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackLead(id, rootApiErrorMessage(error)));
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let requestedStatus: Lead["status"] | undefined;

  try {
    const body = await request.json();
    requestedStatus = typeof body?.status === "string" ? body.status : undefined;
    const data = await fetchRootApi<{ lead: RootLead }>(`/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...body,
        status: mapWorkbenchStatusToRoot(body.status),
      }),
    });

    return NextResponse.json({
      lead: mapLeadToWorkbench(data.lead),
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackPatchedLead(id, requestedStatus, rootApiErrorMessage(error)));
  }
}
