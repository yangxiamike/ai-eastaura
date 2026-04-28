import { NextResponse } from "next/server";
import { parseContentAssetUpdatePayload } from "@/lib/domain/validation";
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
  const asset = await getRepository().getContentAsset(id);

  if (!asset) {
    return NextResponse.json({ error: "Content asset not found." }, { status: 404 });
  }

  return NextResponse.json({ asset });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const payload = parseContentAssetUpdatePayload(await request.json());
    const asset = await getRepository().updateContentAsset(id, payload);

    return NextResponse.json({ asset });
  } catch (error) {
    return jsonError(error, "Unable to update content asset.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message === "Content asset not found." ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
