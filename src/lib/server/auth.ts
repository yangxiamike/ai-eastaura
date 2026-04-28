import { NextResponse } from "next/server";
import { allowOpenAdminApi, getAdminApiToken } from "./env";

export function isAdminGuardConfigured(): boolean {
  return Boolean(getAdminApiToken());
}

export function getAdminGuardStatus(): "configured" | "open-dev" | "missing-production-token" {
  if (getAdminApiToken()) {
    return "configured";
  }

  if (process.env.NODE_ENV === "production" && !allowOpenAdminApi()) {
    return "missing-production-token";
  }

  return "open-dev";
}

export function requireAdminRequest(request: Request): NextResponse | null {
  const token = getAdminApiToken();

  if (!token) {
    if (getAdminGuardStatus() === "missing-production-token") {
      return NextResponse.json(
        {
          error: "Admin API token is not configured.",
        },
        {
          status: 503,
        },
      );
    }

    return null;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : undefined;
  const headerToken = request.headers.get("x-eastaura-admin-token") ?? undefined;

  if (bearerToken === token || headerToken === token) {
    return null;
  }

  return NextResponse.json(
    {
      error: "Unauthorized.",
    },
    {
      status: 401,
    },
  );
}
