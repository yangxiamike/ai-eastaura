import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/server/auth";
import { deliverNotification } from "@/lib/server/notification-delivery";
import { getRepository } from "@/lib/server/repositories";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = requireAdminRequest(request);

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const repository = getRepository();
  const notification = await repository.getNotification(id);

  if (!notification) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  if (notification.channel === "in_app") {
    return NextResponse.json({
      notification,
      retried: false,
      reason: "In-app notifications do not require external retry.",
    });
  }

  const updatedNotification = await deliverNotification(repository, notification);

  return NextResponse.json({
    notification: updatedNotification,
    retried: true,
  });
}
