import { NextResponse } from "next/server";
import { parseLeadStatus } from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const repository = getRepository();
  const lead = await repository.getLead(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({
    lead,
    aiRuns: await repository.getAiRunsForLead(id),
    notes: await repository.getLeadNotes(id),
    statusEvents: await repository.getLeadStatusEvents(id),
    leadEvents: await repository.getLeadEventsForLead(id),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const repository = getRepository();
    const body = await request.json();
    const status = parseLeadStatus(body.status);
    const lead = await repository.updateLeadStatus(
      id,
      status,
      typeof body.reason === "string" ? body.reason : undefined,
    );

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update lead.";
    const status = message === "Lead not found." ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
