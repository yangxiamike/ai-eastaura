import { NextResponse } from "next/server";
import { parseIntakePayload } from "@/lib/domain/validation";
import { validatePublicIntakeRequest } from "@/lib/server/intake-protection";
import { runLeadTriage } from "@/lib/server/lead-triage";
import { createLeadNotifications } from "@/lib/server/notifications";
import { getRepository } from "@/lib/server/repositories";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const repository = getRepository();
    const rawBody = await request.json();
    await validatePublicIntakeRequest(request, rawBody);
    const payload = parseIntakePayload(rawBody);
    const lead = await repository.createLead(payload);
    const aiRun = await repository.saveAiRun(await runLeadTriage(lead));
    const updatedLead = (await repository.getLead(lead.id)) ?? lead;
    const notifications = await createLeadNotifications(repository, updatedLead, aiRun);

    return NextResponse.json(
      {
        lead: updatedLead,
        aiRun,
        notifications,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid intake payload.",
      },
      { status: 400 },
    );
  }
}
