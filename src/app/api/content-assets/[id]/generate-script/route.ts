import { NextResponse } from "next/server";
import { generateContentScript } from "@/lib/server/content-pipeline";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const unauthorized = requireAdminRequest(request);

    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const result = await generateContentScript(getRepository(), id);

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error, "Unable to generate script.");
  }
}

function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message === "Content asset not found." ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
