import type { AiRun, Lead, NotificationRecord } from "@/lib/domain/types";
import {
  deliverNotification,
  getConfiguredDeliveryChannels,
} from "./notification-delivery";
import type { EastauraRepository } from "./repositories/types";

export async function createLeadNotifications(
  repository: EastauraRepository,
  lead: Lead,
  aiRun: AiRun,
): Promise<NotificationRecord[]> {
  const events: Array<{
    type: NotificationRecord["type"];
    title: string;
    body: string;
  }> = [
    {
      type: "new_lead",
      title: `New lead: ${lead.fullName}`,
      body: `${lead.fullName} submitted an intake from ${lead.source}.`,
    },
  ];

  if (aiRun.output.intentScore >= 70) {
    events.push({
      type: "high_intent",
      title: `High-intent lead: ${lead.fullName}`,
      body: `Intent score ${aiRun.output.intentScore}. Suggested next step: ${aiRun.output.nextStep}`,
    });
  }

  if (aiRun.output.riskLevel === "high") {
    events.push({
      type: "high_risk",
      title: `High-risk review needed: ${lead.fullName}`,
      body: aiRun.output.riskNotes.join(" "),
    });
  }

  const notifications: NotificationRecord[] = [];
  const externalChannels = getConfiguredDeliveryChannels();

  for (const event of events) {
    notifications.push(
      await repository.createNotification({
        channel: "in_app",
        type: event.type,
        title: event.title,
        body: event.body,
        leadId: lead.id,
      }),
    );

    for (const channel of externalChannels) {
      const notification = await repository.createNotification({
        channel,
        type: event.type,
        title: event.title,
        body: event.body,
        leadId: lead.id,
      });

      notifications.push(await deliverNotification(repository, notification));
    }
  }

  return notifications;
}
