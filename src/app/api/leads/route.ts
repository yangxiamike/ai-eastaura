import { NextResponse } from "next/server";
import { parseLeadListQuery } from "@/lib/domain/validation";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const repository = getRepository();
  const query = parseLeadListQuery(new URL(request.url).searchParams);

  return NextResponse.json(await repository.listLeads(query));
}
