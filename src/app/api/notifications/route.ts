import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repositories";

export async function GET(request: Request) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json({
    notifications: await getRepository().listNotifications(),
  });
}
