import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: "/api/feishu/events",
};

export async function proxy(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        type?: string;
        challenge?: string;
        event?: {
          challenge?: string;
        };
      }
    | null;

  const challenge =
    payload?.type === "url_verification" && payload.challenge
      ? payload.challenge
      : payload?.event?.challenge;

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.next();
}
