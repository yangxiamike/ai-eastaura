import { NextResponse } from "next/server";
import { parseContentAttributionQuery } from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const query = parseContentAttributionQuery(new URL(request.url).searchParams);
    const attribution = await getRepository().getContentAttribution(query);

    return NextResponse.json({ ...attribution, attribution });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to get content attribution.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
