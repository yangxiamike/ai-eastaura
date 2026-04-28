import { NextResponse } from "next/server";
import {
  parseContentAssetListQuery,
  parseContentAssetPayload,
} from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const query = parseContentAssetListQuery(new URL(request.url).searchParams);

    return NextResponse.json(await getRepository().listContentAssets(query));
  } catch (error) {
    return jsonError(error, "Unable to list content assets.");
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const payload = parseContentAssetPayload(await request.json());
    const asset = await getRepository().createContentAsset(payload);

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create content asset.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
