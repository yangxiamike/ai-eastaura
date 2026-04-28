import { NextResponse } from "next/server";
import { fetchRootApi, rootApiErrorMessage, type RootLeadNote } from "@/lib/workbench/api-client";
import { fallbackNote } from "@/lib/workbench/fallback";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let bodyText = "";

  try {
    const body = await request.json();
    bodyText = typeof body?.body === "string" ? body.body : "";
    const data = await fetchRootApi<{ note: RootLeadNote }>(`/api/leads/${encodeURIComponent(id)}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ...data, usingFallback: false }, { status: 201 });
  } catch (error) {
    return NextResponse.json(fallbackNote(id, bodyText || "Offline mock note", rootApiErrorMessage(error)), {
      status: 201,
    });
  }
}
