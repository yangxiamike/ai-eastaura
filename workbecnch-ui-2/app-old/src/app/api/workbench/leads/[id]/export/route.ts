import { NextResponse } from "next/server";
import { fetchRootApi, RootApiError, rootApiErrorMessage, type RootLead } from "@/lib/workbench/api-client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RootLeadDetail = {
  lead: RootLead;
};

const CSV_HEADERS = [
  "id",
  "createdAt",
  "status",
  "fullName",
  "email",
  "country",
  "source",
  "riskLevel",
  "intentScore",
  "fitScore",
  "riskScore",
  "goals",
  "preferredTiming",
  "budgetUsd",
];

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const data = await fetchRootApi<RootLeadDetail>(`/api/leads/${encodeURIComponent(id)}`);
    const lead = data.lead;
    const csv = toCsv([
      CSV_HEADERS,
      [
        lead.id,
        lead.createdAt,
        lead.status,
        lead.fullName,
        lead.email,
        lead.country ?? "",
        lead.source,
        lead.riskLevel ?? "",
        lead.intentScore?.toString() ?? "",
        lead.fitScore?.toString() ?? "",
        lead.riskScore?.toString() ?? "",
        lead.goals.join("; "),
        lead.preferredTiming ?? "",
        lead.budgetUsd?.toString() ?? "",
      ],
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeCsvFilename(lead.fullName || lead.id)}"`,
      },
    });
  } catch (error) {
    const status = error instanceof RootApiError && error.status ? error.status : 502;

    return NextResponse.json({ error: rootApiErrorMessage(error) }, { status });
  }
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}

function safeCsvFilename(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `eastaura-lead-${slug || "export"}.csv`;
}
