import type { AttributionSummary, CalendarEvent, ChannelPerformance, ContentItem, Notification, Lead, ReviewTask, Scene } from "./types";
import type {
  RootContentAsset,
  RootContentAttributionSummary,
  RootAiRun,
  RootDashboardStats,
  RootLead,
  RootLeadNote,
  RootLeadStatus,
  RootLeadStatusEvent,
  RootNotification,
  RootPublishPost,
  RootReviewStatus,
  RootReviewTask,
  RootStoryboard,
  RootStoryboardScene,
} from "./api-client";

type RootLeadDetail = {
  lead: RootLead;
  aiRuns?: RootAiRun[];
  notes?: RootLeadNote[];
  statusEvents?: RootLeadStatusEvent[];
};

const avatarPool = [
  "/workbench/avatars/sarah.jpg",
  "/workbench/avatars/james.jpg",
  "/workbench/avatars/elena.jpg",
  "/workbench/avatars/anna.jpg",
  "/workbench/avatars/marcus.jpg",
];

const sourceCampaigns: Record<string, string> = {
  website: "Website Intake",
  instagram: "POV Experience Series Q2",
  linkedin: "Trust & Transparency Series",
  youtube: "Sleep Reset Explainers",
  referral: "Founder Referral",
};

export function mapWorkbenchStatusToRoot(status: string): RootLeadStatus {
  const map: Record<string, RootLeadStatus> = {
    new: "new",
    contacted: "contacted",
    qualified: "qualified",
    consultation_booked: "qualified",
    proposal_sent: "qualified",
    won: "closed",
    not_fit: "not_fit",
    nurture: "contacted",
  };

  return map[status] ?? "new";
}

function mapRootStatusToWorkbench(status: RootLeadStatus): Lead["status"] {
  const map: Record<RootLeadStatus, Lead["status"]> = {
    new: "new",
    triaged: "triaged",
    needs_review: "needs_review",
    contacted: "contacted",
    qualified: "qualified",
    not_fit: "not_fit",
    closed: "won",
  };

  return map[status];
}

function stableIndex(id: string, modulo: number) {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % modulo;
}

function parseAge(ageRange?: string) {
  if (!ageRange) {
    return 42;
  }

  const match = ageRange.match(/\d+/);
  return match ? Number(match[0]) : 42;
}

function formatBudget(budgetUsd?: number) {
  if (!budgetUsd) {
    return "Not specified";
  }

  return `$${budgetUsd.toLocaleString("en-US")}`;
}

function relativeActivity(dateValue?: string) {
  if (!dateValue) {
    return "Recently";
  }

  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffHours = Math.max(1, Math.round((Date.now() - timestamp) / 36e5));
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  return `${Math.round(diffHours / 24)} days ago`;
}

function nextActionFor(lead: RootLead, latestRun?: RootAiRun) {
  if (latestRun?.output?.nextStep) {
    return latestRun.output.nextStep;
  }

  if (lead.status === "needs_review" || lead.riskLevel === "high") {
    return "Founder review before outreach";
  }

  if (lead.status === "new" || lead.status === "triaged") {
    return "Send fit-call invitation";
  }

  return "Prepare next founder follow-up";
}

function mapTimeline(detail?: RootLeadDetail): Lead["timeline"] {
  if (!detail) {
    return undefined;
  }

  const notes =
    detail.notes?.map((note) => ({
      date: new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      action: note.body,
      by: note.author,
    })) ?? [];
  const statusEvents =
    detail.statusEvents?.map((event) => ({
      date: new Date(event.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      action: `Status changed from ${event.from} to ${event.to}${event.reason ? ` - ${event.reason}` : ""}`,
      by: "System",
    })) ?? [];

  return [...statusEvents, ...notes].slice(0, 8);
}

export function mapLeadToWorkbench(lead: RootLead, detail?: RootLeadDetail): Lead {
  const latestRun = detail?.aiRuns?.[0];
  const campaign =
    lead.campaign ||
    lead.utmCampaign ||
    sourceCampaigns[lead.source?.toLowerCase()] ||
    `${lead.source || "Website"} Intake`;
  const goals = latestRun?.output?.primaryGoals?.length ? latestRun.output.primaryGoals : lead.goals;
  const source = lead.source || "Website";

  return {
    id: lead.id,
    name: lead.fullName || "Unknown lead",
    email: lead.email,
    country: lead.country || "Unknown",
    age: parseAge(lead.ageRange),
    avatar: avatarPool[stableIndex(lead.id, avatarPool.length)],
    primaryGoals: goals.length ? goals : ["Stress Recovery"],
    source,
    campaign,
    status: mapRootStatusToWorkbench(lead.status),
    riskLevel: latestRun?.output?.riskLevel ?? lead.riskLevel ?? "low",
    intentScore: latestRun?.output?.intentScore ?? lead.intentScore ?? 50,
    lastActivity: relativeActivity(lead.updatedAt || lead.createdAt),
    nextAction: nextActionFor(lead, latestRun),
    budget: formatBudget(lead.budgetUsd),
    aiSummary: latestRun?.output?.summary ?? lead.latestAiSummary ?? lead.freeText ?? "No AI summary yet.",
    riskNotes: latestRun?.output?.riskNotes ?? [],
    intakeDetails: {
      goals: (lead.goals ?? []).join(", ") || "Not specified",
      concerns: lead.freeText || "No additional concern captured.",
      timeline: lead.preferredTiming || "Not specified",
      previousExperience: "Not captured yet",
      medicalConditions: [],
      medications: [],
      preferredContact: "Email",
    },
    timeline: mapTimeline(detail),
    sourceAttribution: {
      campaign,
      contentItem: lead.utmContent || `${source} intake form`,
      channel: source,
      utmSource: lead.utmSource || source.toLowerCase().replace(/\s+/g, "_"),
      utmMedium: lead.utmMedium || "intake",
      utmCampaign: lead.utmCampaign || campaign.toLowerCase().replace(/\s+/g, "_"),
    },
  };
}

export function mapNotificationToWorkbench(notification: RootNotification): Notification {
  const typeMap: Record<RootNotification["type"], Notification["type"]> = {
    new_lead: "new_lead",
    high_intent: "followup_reminder",
    high_risk: "high_risk_alert",
  };

  return {
    id: notification.id,
    type: typeMap[notification.type],
    title: notification.title,
    message: notification.body,
    status: notification.deliveryError ? "failed" : notification.delivered ? "sent" : "pending",
    createdAt: notification.createdAt,
    read: Boolean(notification.deliveredAt),
    relatedId: notification.leadId,
  };
}

export function mapDashboardStats(stats: RootDashboardStats) {
  const totalLeads = Math.max(stats.totalLeads, 1);

  return {
    newLeadsToday: stats.newLeads,
    highIntentLeads: stats.highIntent,
    highRiskLeads: stats.highRisk,
    pendingReviewTasks: stats.needsReview,
    contentDraftsWaiting: 0,
    followUpsDueToday: stats.byStatus?.contacted ?? 0,
    weeklyPublished: 0,
    formConversionRate: `${Math.round((stats.totalLeads / totalLeads) * 100)}%`,
    aiTimeSaved: `${Math.max(1, Math.round(stats.totalLeads * 0.25))}h`,
  };
}

function normalizeChannel(channel?: string) {
  const map: Record<string, string> = {
    instagram: "Instagram Reels",
    tiktok: "TikTok",
    youtube: "YouTube Shorts",
    email: "Newsletter",
    website: "Blog",
    other: "Other",
    paid_ad: "Paid Ad",
    xiaohongshu: "Xiaohongshu",
  };

  return map[(channel ?? "").toLowerCase()] ?? channel ?? "Instagram Reels";
}

function normalizeContentType(format?: string): ContentItem["type"] {
  const map: Record<string, ContentItem["type"]> = {
    article: "blog",
    short_video: "short_video_script",
    email: "newsletter",
    landing_page: "blog",
    ad: "linkedin_post",
    carousel: "linkedin_post",
  };

  return map[(format ?? "").toLowerCase()] ?? "short_video_script";
}

function mapComplianceStatus(status?: string): ContentItem["complianceStatus"] {
  if (status === "approved" || status === "scheduled" || status === "published" || status === "measured") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  if (status === "compliance_review") {
    return "pending";
  }

  return "pending";
}

function mapPublishStatus(status?: string): ContentItem["publishStatus"] {
  const map: Record<string, ContentItem["publishStatus"]> = {
    idea: "idea",
    briefed: "draft",
    drafted: "draft",
    storyboarded: "review",
    compliance_review: "review",
    approved: "review",
    scheduled: "scheduled",
    published: "published",
    measured: "published",
  };

  return map[(status ?? "").toLowerCase()] ?? "draft";
}

export function mapContentAssetToWorkbench(asset: RootContentAsset): ContentItem {
  return {
    id: asset.id,
    title: asset.title || "Untitled content asset",
    type: normalizeContentType(asset.format),
    channel: normalizeChannel(asset.channel),
    campaign: asset.campaignId || "Content Pipeline",
    cta: asset.callToAction || "Start Safety Intake",
    complianceStatus: mapComplianceStatus(asset.status),
    publishStatus: mapPublishStatus(asset.status),
    sourceCode: asset.source || asset.id,
    performanceNotes: asset.brief || "Content asset from Eastaura acquisition pipeline.",
    createdAt: asset.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    updatedAt: asset.updatedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    body: asset.body ?? asset.brief ?? "",
    topics: asset.tags ?? [],
    platforms: [normalizeChannel(asset.channel)],
  };
}

export function mapReviewStatusToWorkbench(status?: RootReviewStatus): ReviewTask["status"] {
  if (status === "open") {
    return "open";
  }

  return status ?? "open";
}

export function mapWorkbenchReviewStatus(status: string): RootReviewStatus {
  const map: Record<string, RootReviewStatus> = {
    pending: "open",
    open: "open",
    approved: "approved",
    needs_revision: "needs_revision",
    edited: "needs_revision",
    rejected: "rejected",
  };

  return map[status] ?? "open";
}

export function mapReviewTaskToWorkbench(task: RootReviewTask): ReviewTask {
  const title = task.asset?.title || task.notes || task.assetId || "Content review task";
  const status = mapReviewStatusToWorkbench(task.status);

  return {
    id: task.id,
    type: task.asset?.format === "short_video" ? "script_approval" : "content_compliance",
    priority: task.dueAt ? "high" : "medium",
    relatedObject: title,
    relatedObjectId: task.assetId || task.campaignId || task.id,
    aiRecommendation:
      task.notes ||
      (status === "open" ? "Review content for medical-boundary and brand language before publishing." : `Marked ${status}.`),
    status,
    createdAt: task.createdAt,
    details: task.dueAt ? `Due ${new Date(task.dueAt).toLocaleString()}` : task.reviewer ? `Reviewer: ${task.reviewer}` : undefined,
  };
}

function dayIndexFromDate(dateValue?: string) {
  if (!dateValue) {
    return 0;
  }

  const day = new Date(dateValue).getDay();
  return day === 0 ? 6 : day - 1;
}

function timeFromDate(dateValue?: string) {
  if (!dateValue) {
    return "09:00";
  }

  return new Date(dateValue).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function mapPublishPostToWorkbench(post: RootPublishPost): CalendarEvent {
  return {
    id: post.id,
    title: post.asset?.title || post.trackingCode || post.assetId,
    channel: normalizeChannel(post.channel),
    day: dayIndexFromDate(post.scheduledAt ?? post.publishedAt ?? post.createdAt),
    time: timeFromDate(post.scheduledAt ?? post.publishedAt ?? post.createdAt),
    status: post.status === "published" || post.status === "scheduled" ? post.status : post.status === "approved" ? "planned" : "pending",
    type: normalizeContentType(post.asset?.format),
  };
}

function durationLabel(scene: RootStoryboardScene) {
  if (scene.duration) {
    return scene.duration;
  }

  if (typeof scene.durationSeconds === "number") {
    return `${scene.durationSeconds}s`;
  }

  return "5s";
}

export function mapStoryboardSceneToWorkbench(scene: RootStoryboardScene, index: number): Scene {
  const visual = scene.visual || scene.caption || scene.title || "Experience-focused visual scene";

  return {
    number: scene.number ?? scene.order ?? index + 1,
    title: scene.title || `Scene ${index + 1}`,
    thumbnail: "/workbench/thumbs/scene-arrival.jpg",
    caption: visual,
    narration: scene.narration || visual,
    duration: durationLabel(scene),
    imagePrompt: scene.imagePrompt || visual,
    videoPrompt: scene.videoPrompt || scene.narration || visual,
  };
}

export function mapStoryboardToScenes(storyboard?: RootStoryboard): Scene[] {
  return (storyboard?.scenes ?? []).map(mapStoryboardSceneToWorkbench);
}

export function mapAttributionSummary(summary: RootContentAttributionSummary): AttributionSummary {
  return {
    totalMetrics: summary.totalMetrics,
    totalMetricValue: summary.totalMetricValue,
    leadsAttributed: summary.leadsAttributed,
    byMetricType: summary.byMetricType ?? {},
    byCampaign: summary.byCampaign ?? {},
    bySource: summary.bySource ?? {},
    byChannel: summary.byChannel ?? {},
  };
}

export function mapAttributionChannels(summary: AttributionSummary): ChannelPerformance[] {
  return Object.entries(summary.byChannel).map(([channel, leads]) => {
    const clicks = summary.byMetricType.click ?? summary.byMetricType.clicks ?? summary.totalMetricValue;
    const safeClicks = Math.max(Number(clicks) || 0, 1);
    const numericLeads = Number(leads) || 0;

    return {
      channel: normalizeChannel(channel),
      contentCount: 0,
      clicks: Math.round(safeClicks),
      clickRate: summary.totalMetricValue ? `${Math.round((safeClicks / Math.max(summary.totalMetricValue, 1)) * 100)}%` : "0%",
      leads: numericLeads,
      leadRate: `${Math.round((numericLeads / safeClicks) * 100)}%`,
      highIntent: 0,
      suggestion: "Review source quality and keep human-approved content cadence.",
    };
  });
}
