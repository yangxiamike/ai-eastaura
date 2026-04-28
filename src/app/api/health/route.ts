import { NextResponse } from "next/server";
import { getAdminGuardStatus } from "@/lib/server/auth";
import { getLlmConfig, getNotificationConfig } from "@/lib/server/env";
import { getConfiguredDeliveryChannels } from "@/lib/server/notification-delivery";
import { getPersistenceMode } from "@/lib/server/repositories";

export const runtime = "nodejs";

export function GET() {
  const llmConfig = getLlmConfig();
  const notificationConfig = getNotificationConfig();

  return NextResponse.json({
    ok: true,
    service: "eastaura-mvp-backend",
    persistence: getPersistenceMode(),
    llm: llmConfig.enabled && llmConfig.apiUrl && llmConfig.apiKey ? "configured" : "mock",
    adminGuard: getAdminGuardStatus(),
    notificationChannels: ["in_app", ...getConfiguredDeliveryChannels()],
    notificationConfigState: {
      emailConfigured: Boolean(
        notificationConfig.resendApiKey &&
          notificationConfig.fromEmail &&
          notificationConfig.toEmail,
      ),
      feishuConfigured: Boolean(notificationConfig.feishuWebhookUrl),
      feishuSigningEnabled: Boolean(notificationConfig.feishuBotSecret),
    },
    timestamp: new Date().toISOString(),
  });
}
