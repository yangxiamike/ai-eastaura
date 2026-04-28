import { NextResponse } from "next/server";
import { parseLeadExportQuery } from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const query = parseLeadExportQuery(new URL(request.url).searchParams);
  const leads = await getRepository().exportLeads(query);
  const csv = toCsv([
    [
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
    ],
    ...leads.map((lead) => [
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
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="eastaura-leads.csv"',
    },
  });
}

function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
