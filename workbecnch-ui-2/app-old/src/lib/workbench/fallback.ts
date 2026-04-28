import {
  attributionFunnel,
  attributionKPIs,
  calendarEvents,
  channelPerformance,
  contentItems,
  dashboardStats,
  leads,
  notifications,
  reviewTasks,
  videoScenes,
} from "./mock-data";
import type { AttributionSummary, CalendarEvent, ContentItem, Notification, Lead, ReviewTask } from "./types";

export type WorkbenchFallback<T extends object> = T & {
  usingFallback: true;
  error: string;
};

export function fallbackResponse<T extends object>(payload: T, error: string): WorkbenchFallback<T> {
  return {
    ...payload,
    usingFallback: true,
    error,
  };
}

export function fallbackDashboard(error: string) {
  return fallbackResponse({ stats: dashboardStats, leads: leads.slice(0, 3) }, error);
}

export function fallbackLeads(error: string) {
  return fallbackResponse({ leads, total: leads.length }, error);
}

export function fallbackLead(id: string, error: string) {
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  return fallbackResponse({ lead, notes: [], statusEvents: [], leadEvents: [] }, error);
}

export function fallbackPatchedLead(id: string, status: Lead["status"] | undefined, error: string) {
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  return fallbackResponse({ lead: { ...lead, status: status ?? lead.status } }, error);
}

export function fallbackNote(id: string, body: string, error: string) {
  return fallbackResponse(
    {
      note: {
        id: `mock_note_${Date.now()}`,
        leadId: id,
        createdAt: new Date().toISOString(),
        body,
        author: "founder",
      },
    },
    error,
  );
}

export function fallbackTriage(id: string, error: string) {
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  return fallbackResponse({ lead, aiRun: null, notifications: [] }, error);
}

export function fallbackNotifications(error: string) {
  return fallbackResponse({ notifications }, error);
}

export function fallbackNotificationRetry(id: string, error: string) {
  const notification: Notification = notifications.find((item) => item.id === id) ?? notifications[0];
  return fallbackResponse({ notification, retried: false }, error);
}

export function fallbackContentAssets(error: string) {
  return fallbackResponse({ assets: contentItems, total: contentItems.length }, error);
}

export function fallbackCreatedContentAsset(input: Partial<ContentItem>, error: string) {
  const now = new Date().toISOString();
  const asset: ContentItem = {
    id: `mock_content_${Date.now()}`,
    title: input.title || "New content draft",
    type: input.type || "short_video_script",
    channel: input.channel || "Instagram Reels",
    campaign: input.campaign || "Fallback Content Pipeline",
    cta: input.cta || "Start Safety Intake",
    complianceStatus: "pending",
    publishStatus: "draft",
    sourceCode: `fallback_${Date.now()}`,
    performanceNotes: "Fallback draft created locally because the root API is unavailable.",
    createdAt: now.slice(0, 10),
    updatedAt: now.slice(0, 10),
    body: input.body || "",
    topics: input.topics || [],
    platforms: input.platforms || [input.channel || "Instagram Reels"],
  };

  return fallbackResponse({ asset }, error);
}

export function fallbackGeneratedScript(id: string, error: string) {
  const asset = contentItems.find((item) => item.id === id) ?? contentItems[0];

  return fallbackResponse(
    {
      asset: {
        ...asset,
        body:
          asset.body ||
          "[Hook] A calm China arrival that feels guided, translated, and safety-screened.\n[CTA] Start the Eastaura pilot safety intake.",
        publishStatus: "draft" as const,
      },
    },
    error,
  );
}

export function fallbackComplianceReview(id: string, error: string) {
  const asset = contentItems.find((item) => item.id === id) ?? contentItems[0];
  return fallbackResponse({ asset: { ...asset, complianceStatus: "pending" as const, publishStatus: "review" as const } }, error);
}

export function fallbackStoryboard(error: string) {
  return fallbackResponse({ scenes: videoScenes }, error);
}

export function fallbackReviewTasks(error: string) {
  return fallbackResponse({ reviewTasks, total: reviewTasks.length }, error);
}

export function fallbackPatchedReviewTask(id: string, status: ReviewTask["status"] | undefined, error: string) {
  const task = reviewTasks.find((item) => item.id === id) ?? reviewTasks[0];
  return fallbackResponse({ reviewTask: { ...task, status: status ?? task.status } }, error);
}

export function fallbackPublishPosts(error: string) {
  return fallbackResponse({ publishPosts: calendarEvents, total: calendarEvents.length }, error);
}

export function fallbackCreatedPublishPost(input: Partial<CalendarEvent>, error: string) {
  const post: CalendarEvent = {
    id: `mock_post_${Date.now()}`,
    title: input.title || contentItems[0]?.title || "Scheduled content",
    channel: input.channel || "Instagram Reels",
    day: input.day ?? 0,
    time: input.time || "09:00",
    status: input.status || "planned",
    type: input.type || "short_video_script",
    thumbnail: input.thumbnail,
  };

  return fallbackResponse({ publishPost: post }, error);
}

export function fallbackContentMetrics(error: string) {
  return fallbackResponse({ metrics: [], total: 0 }, error);
}

export function fallbackAttribution(error: string) {
  const summary: AttributionSummary = {
    totalMetrics: attributionFunnel[0]?.count ?? 0,
    totalMetricValue: Number.parseInt(attributionKPIs.siteClicks.replace(/,/g, ""), 10) || 0,
    leadsAttributed: attributionKPIs.formSubmissions,
    byMetricType: {
      impressions: attributionFunnel[0]?.count ?? 0,
      clicks: Number.parseInt(attributionKPIs.siteClicks.replace(/,/g, ""), 10) || 0,
      leads: attributionKPIs.formSubmissions,
    },
    byCampaign: {},
    bySource: {},
    byChannel: Object.fromEntries(channelPerformance.map((item) => [item.channel, item.leads])),
  };

  return fallbackResponse({ summary, channels: channelPerformance }, error);
}
