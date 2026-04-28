import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootDashboardStats, type RootLead } from "@/lib/workbench/api-client";
import { fallbackDashboard } from "@/lib/workbench/fallback";
import { mapDashboardStats, mapLeadToWorkbench } from "@/lib/workbench/mappings";

export async function GET() {
  try {
    const [dashboardData, leadData] = await Promise.all([
      fetchRootApi<{ stats: RootDashboardStats }>("/api/dashboard/stats"),
      fetchRootApi<{ leads: RootLead[]; total: number; limit: number; offset: number }>("/api/leads?limit=12"),
    ]);

    return NextResponse.json({
      stats: mapDashboardStats(dashboardData.stats),
      leads: leadData.leads.map((lead) => mapLeadToWorkbench(lead)),
      rawStats: dashboardData.stats,
      usingFallback: false,
    });
  } catch (error) {
    return NextResponse.json(fallbackDashboard(rootApiErrorMessage(error)));
  }
}
