import { NextResponse } from "next/server";
import { runLeadTriage } from "@/lib/server/lead-triage";
import { requireAdminRequest } from "@/lib/server/auth";
import { createLeadNotifications } from "@/lib/server/notifications";
import { getRepository } from "@/lib/server/repositories";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const unauthorized = requireAdminRequest(_request);

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const repository = getRepository();
    const lead = await repository.getLead(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const aiRun = await repository.saveAiRun(await runLeadTriage(lead));
    const updatedLead = (await repository.getLead(id)) ?? lead;
    const notifications = await createLeadNotifications(repository, updatedLead, aiRun);

    return NextResponse.json({
      lead: updatedLead,
      aiRun,
      notifications,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to run lead triage.",
      },
      { status: 400 },
    );
  }
}
