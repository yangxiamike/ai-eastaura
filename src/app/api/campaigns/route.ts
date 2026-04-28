import { NextResponse } from "next/server";
import {
  parseCampaignListQuery,
  parseCampaignPayload,
} from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const query = parseCampaignListQuery(new URL(request.url).searchParams);

    return NextResponse.json(await getRepository().listCampaigns(query));
  } catch (error) {
    return jsonError(error, "Unable to list campaigns.");
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = parseCampaignPayload(await request.json());
    const campaign = await getRepository().createCampaign(payload);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create campaign.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 400 });
}
