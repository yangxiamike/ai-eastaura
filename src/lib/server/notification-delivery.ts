import type { NotificationRecord } from "@/lib/domain/types";
import { createHmac } from "crypto";
import { getNotificationConfig } from "./env";
import type { EastauraRepository } from "./repositories/types";

export function getConfiguredDeliveryChannels(): Array<"email" | "feishu"> {
  const config = getNotificationConfig();
  const channels: Array<"email" | "feishu"> = [];

  if (config.resendApiKey && config.fromEmail && config.toEmail) {
    channels.push("email");
  }

  if (config.feishuWebhookUrl) {
    channels.push("feishu");
  }

  return channels;
}

export async function deliverNotification(
  repository: EastauraRepository,
  notification: NotificationRecord,
): Promise<NotificationRecord> {
  if (notification.channel === "in_app") {
    return notification;
  }

  try {
    if (notification.channel === "email") {
      await sendResendEmail(notification);
    } else if (notification.channel === "feishu") {
      await sendFeishuMessage(notification);
    }

    return repository.updateNotificationDelivery(notification.id, {
      delivered: true,
      deliveredAt: new Date().toISOString(),
    });
  } catch (error) {
    return repository.updateNotificationDelivery(notification.id, {
      delivered: false,
      deliveryError: error instanceof Error ? error.message : "Delivery failed.",
    });
  }
}

async function sendResendEmail(notification: NotificationRecord): Promise<void> {
  const config = getNotificationConfig();

  if (!config.resendApiKey || !config.fromEmail || !config.toEmail) {
    throw new Error("Resend notification is not configured.");
  }

  const response = await fetchWithTimeout(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [config.toEmail],
        subject: notification.title,
        text: `${notification.title}\n\n${notification.body}\n\nLead ID: ${notification.leadId}`,
      }),
    },
    10000,
  );

  if (!response.ok) {
    throw new Error(`Resend delivery failed with status ${response.status}.`);
  }
}

async function sendFeishuMessage(notification: NotificationRecord): Promise<void> {
  const config = getNotificationConfig();

  if (!config.feishuWebhookUrl) {
    throw new Error("Feishu notification is not configured.");
  }

  const payload: {
    msg_type: "text";
    content: {
      text: string;
    };
    timestamp?: string;
    sign?: string;
  } = {
    msg_type: "text",
    content: {
      text: `${notification.title}\n${notification.body}\nLead ID: ${notification.leadId}`,
    },
  };

  if (config.feishuBotSecret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    payload.timestamp = timestamp;
    payload.sign = createFeishuSignature(timestamp, config.feishuBotSecret);
  }

  const response = await fetchWithTimeout(
    config.feishuWebhookUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    10000,
  );

  if (!response.ok) {
    throw new Error(`Feishu delivery failed with status ${response.status}.`);
  }

  const body = (await response.json().catch(() => null)) as
    | {
        code?: number;
        msg?: string;
      }
    | null;

  if (body && typeof body.code === "number" && body.code !== 0) {
    throw new Error(`Feishu delivery failed: ${body.msg ?? `code ${body.code}`}.`);
  }
}

function createFeishuSignature(timestamp: string, secret: string): string {
  return createHmac("sha256", `${timestamp}\n${secret}`).digest("base64");
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
