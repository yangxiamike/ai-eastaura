import { NextResponse } from "next/server";
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
    const body = await request.json();

    if (typeof body.body !== "string" || body.body.trim().length === 0) {
      throw new Error("body is required.");
    }

    const note = await getRepository().createLeadNote(
      id,
      body.body.trim(),
      typeof body.author === "string" && body.author.trim().length > 0
        ? body.author.trim()
        : "founder",
    );

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create note.";
    const status = message === "Lead not found." ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
