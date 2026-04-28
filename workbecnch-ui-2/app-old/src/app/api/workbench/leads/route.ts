import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootLead } from "@/lib/workbench/api-client";
import { fallbackLeads } from "@/lib/workbench/fallback";
import { mapLeadToWorkbench, mapWorkbenchStatusToRoot } from "@/lib/workbench/mappings";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    if (status) {
      url.searchParams.set("status", mapWorkbenchStatusToRoot(status));
    }

    const data = await fetchRootApi<{ leads: RootLead[]; total: number; limit: number; offset: number }>(
      `/api/leads${url.search}`,
    );

    return NextResponse.json({
      leads: data.leads.map((lead) => mapLeadToWorkbench(lead)),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackLeads(rootApiErrorMessage(error)));
  }
}
