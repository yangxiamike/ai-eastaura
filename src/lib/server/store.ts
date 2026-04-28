import type {
  AiRun,
  Campaign,
  CampaignListQuery,
  CampaignListResult,
  ContentAsset,
  ContentAssetListQuery,
  ContentAssetListResult,
  ContentAttributionQuery,
  ContentAttributionSummary,
  ContentMetric,
  ContentMetricListQuery,
  ContentMetricListResult,
  CreateCampaignInput,
  CreateContentAssetInput,
  CreateContentMetricInput,
  CreatePublishPostInput,
  CreateReviewTaskInput,
  CreateStoryboardInput,
  DashboardStats,
  IntakePayload,
  Lead,
  LeadEvent,
  LeadEventType,
  LeadExportQuery,
  LeadListQuery,
  LeadListResult,
  LeadNote,
  LeadStatus,
  LeadStatusEvent,
  NotificationRecord,
  PublishPost,
  PublishPostListQuery,
  PublishPostListResult,
  ReviewTask,
  ReviewTaskListQuery,
  ReviewTaskListResult,
  Storyboard,
  StoryboardListQuery,
  StoryboardListResult,
  UpdateCampaignInput,
  UpdateContentAssetInput,
  UpdatePublishPostInput,
  UpdateReviewTaskInput,
  UpdateStoryboardInput,
} from "@/lib/domain/types";

type Store = {
  leads: Map<string, Lead>;
  aiRuns: Map<string, AiRun>;
  notes: Map<string, LeadNote>;
  statusEvents: Map<string, LeadStatusEvent>;
  notifications: Map<string, NotificationRecord>;
  leadEvents: Map<string, LeadEvent>;
  campaigns: Map<string, Campaign>;
  contentAssets: Map<string, ContentAsset>;
  storyboards: Map<string, Storyboard>;
  reviewTasks: Map<string, ReviewTask>;
  publishPosts: Map<string, PublishPost>;
  contentMetrics: Map<string, ContentMetric>;
};

const globalStore = globalThis as typeof globalThis & {
  __eastauraStore?: Store;
};

function getStore(): Store {
  if (!globalStore.__eastauraStore) {
    globalStore.__eastauraStore = {
      leads: new Map(),
      aiRuns: new Map(),
      notes: new Map(),
      statusEvents: new Map(),
      notifications: new Map(),
      leadEvents: new Map(),
      campaigns: new Map(),
      contentAssets: new Map(),
      storyboards: new Map(),
      reviewTasks: new Map(),
      publishPosts: new Map(),
      contentMetrics: new Map(),
    };
  }

  return globalStore.__eastauraStore;
}

export function createLead(payload: IntakePayload): Lead {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    fullName: payload.fullName,
    email: payload.email,
    country: payload.country,
    ageRange: payload.ageRange,
    goals: payload.goals,
    preferredTiming: payload.preferredTiming,
    budgetUsd: payload.budgetUsd,
    travelPartySize: payload.travelPartySize,
    freeText: payload.freeText,
    source: payload.source ?? "direct",
    campaign: payload.campaign,
    utmSource: payload.utmSource,
    utmMedium: payload.utmMedium,
    utmCampaign: payload.utmCampaign,
    utmContent: payload.utmContent,
    consentToContact: payload.consentToContact,
  };

  getStore().leads.set(lead.id, lead);
  createLeadEvent({
    leadId: lead.id,
    type: "lead_created",
    metadata: {
      source: lead.source,
      campaign: lead.campaign,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,
      utmContent: lead.utmContent,
      country: lead.country,
    },
  });
  return lead;
}

export function listLeads(query: LeadListQuery): LeadListResult {
  const filteredLeads = [...getStore().leads.values()]
    .filter((lead) => matchesLeadQuery(lead, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    leads: filteredLeads.slice(query.offset, query.offset + query.limit),
    total: filteredLeads.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function getLead(id: string): Lead | undefined {
  return getStore().leads.get(id);
}

export function exportLeads(query: LeadExportQuery): Lead[] {
  return [...getStore().leads.values()]
    .filter((lead) => matchesLeadQuery(lead, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, query.limit);
}

export function updateLeadStatus(
  id: string,
  status: LeadStatus,
  reason?: string,
): Lead {
  const store = getStore();
  const lead = store.leads.get(id);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const now = new Date().toISOString();
  const event: LeadStatusEvent = {
    id: crypto.randomUUID(),
    leadId: id,
    createdAt: now,
    from: lead.status,
    to: status,
    reason,
  };

  const updatedLead: Lead = {
    ...lead,
    status,
    updatedAt: now,
  };

  store.leads.set(id, updatedLead);
  store.statusEvents.set(event.id, event);
  createLeadEvent({
    leadId: id,
    type: "status_changed",
    actor: "founder",
    metadata: {
      from: event.from,
      to: event.to,
      reason,
    },
  });
  return updatedLead;
}

export function saveAiRun(aiRun: AiRun): AiRun {
  const store = getStore();
  const lead = store.leads.get(aiRun.leadId);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  store.aiRuns.set(aiRun.id, aiRun);
  store.leads.set(aiRun.leadId, {
    ...lead,
    latestAiRunId: aiRun.id,
    riskLevel: aiRun.output.riskLevel,
    fitScore: aiRun.output.fitScore,
    intentScore: aiRun.output.intentScore,
    riskScore: aiRun.output.riskScore,
    latestAiSummary: aiRun.output.summary,
    status: aiRun.output.humanReviewRequired ? "needs_review" : "triaged",
    updatedAt: aiRun.createdAt,
  });
  createLeadEvent({
    leadId: aiRun.leadId,
    type: "triage_run",
    actor: "agent",
    metadata: {
      aiRunId: aiRun.id,
      provider: aiRun.provider,
      model: aiRun.model,
      riskLevel: aiRun.output.riskLevel,
      intentScore: aiRun.output.intentScore,
    },
  });

  return aiRun;
}

export function getAiRunsForLead(leadId: string): AiRun[] {
  return [...getStore().aiRuns.values()]
    .filter((run) => run.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createLeadNote(leadId: string, body: string, author = "founder"): LeadNote {
  if (!getStore().leads.has(leadId)) {
    throw new Error("Lead not found.");
  }

  const note: LeadNote = {
    id: crypto.randomUUID(),
    leadId,
    createdAt: new Date().toISOString(),
    body,
    author,
  };

  getStore().notes.set(note.id, note);
  createLeadEvent({
    leadId,
    type: "note_added",
    actor: "founder",
    metadata: {
      noteId: note.id,
      author,
    },
  });
  return note;
}

export function getLeadNotes(leadId: string): LeadNote[] {
  return [...getStore().notes.values()]
    .filter((note) => note.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLeadStatusEvents(leadId: string): LeadStatusEvent[] {
  return [...getStore().statusEvents.values()]
    .filter((event) => event.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createNotification(
  notification: Omit<NotificationRecord, "id" | "createdAt" | "delivered">,
): NotificationRecord {
  const now = new Date().toISOString();
  const record: NotificationRecord = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: now,
    delivered: notification.channel === "in_app",
    deliveredAt: notification.channel === "in_app" ? now : undefined,
  };

  getStore().notifications.set(record.id, record);
  createLeadEvent({
    leadId: record.leadId,
    type: "notification_created",
    metadata: {
      notificationId: record.id,
      channel: record.channel,
      notificationType: record.type,
    },
  });
  return record;
}

export function updateNotificationDelivery(
  id: string,
  delivery: {
    delivered: boolean;
    deliveredAt?: string;
    deliveryError?: string;
  },
): NotificationRecord {
  const store = getStore();
  const notification = store.notifications.get(id);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  const updatedNotification: NotificationRecord = {
    ...notification,
    delivered: delivery.delivered,
    deliveredAt: delivery.deliveredAt,
    deliveryError: delivery.deliveryError,
  };

  store.notifications.set(id, updatedNotification);
  createLeadEvent({
    leadId: updatedNotification.leadId,
    type: delivery.delivered ? "notification_delivered" : "notification_failed",
    metadata: {
      notificationId: id,
      channel: updatedNotification.channel,
      deliveryError: delivery.deliveryError,
    },
  });
  return updatedNotification;
}

export function getNotification(id: string): NotificationRecord | undefined {
  return getStore().notifications.get(id);
}

export function listNotifications(): NotificationRecord[] {
  return [...getStore().notifications.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function createLeadEvent(event: {
  leadId: string;
  type: LeadEventType;
  actor?: LeadEvent["actor"];
  metadata?: Record<string, unknown>;
}): LeadEvent {
  const record: LeadEvent = {
    id: crypto.randomUUID(),
    leadId: event.leadId,
    createdAt: new Date().toISOString(),
    type: event.type,
    actor: event.actor ?? "system",
    metadata: event.metadata ?? {},
  };

  getStore().leadEvents.set(record.id, record);
  return record;
}

export function getLeadEventsForLead(leadId: string): LeadEvent[] {
  return [...getStore().leadEvents.values()]
    .filter((event) => event.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDashboardStats(): DashboardStats {
  const leads = [...getStore().leads.values()];
  const notifications = [...getStore().notifications.values()];
  const byStatus = {
    new: 0,
    triaged: 0,
    needs_review: 0,
    contacted: 0,
    qualified: 0,
    not_fit: 0,
    closed: 0,
  };
  const byRiskLevel = {
    low: 0,
    medium: 0,
    high: 0,
  };
  const bySource: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const lead of leads) {
    byStatus[lead.status] += 1;

    if (lead.riskLevel) {
      byRiskLevel[lead.riskLevel] += 1;
    }

    bySource[lead.source] = (bySource[lead.source] ?? 0) + 1;

    if (lead.country) {
      byCountry[lead.country] = (byCountry[lead.country] ?? 0) + 1;
    }
  }

  return {
    totalLeads: leads.length,
    newLeads: byStatus.new,
    needsReview: byStatus.needs_review,
    highIntent: leads.filter((lead) => (lead.intentScore ?? 0) >= 70).length,
    highRisk: byRiskLevel.high,
    failedNotifications: notifications.filter(
      (notification) => notification.deliveryError,
    ).length,
    byStatus,
    byRiskLevel,
    bySource,
    byCountry,
  };
}

export function createCampaign(payload: CreateCampaignInput): Campaign {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: payload.name,
    objective: payload.objective,
    status: "idea",
    targetAudience: payload.targetAudience,
    source: payload.source,
    owner: payload.owner,
    startDate: payload.startDate,
    endDate: payload.endDate,
    budgetUsd: payload.budgetUsd,
    tags: payload.tags ?? [],
  };

  getStore().campaigns.set(campaign.id, campaign);
  return campaign;
}

export function getCampaign(id: string): Campaign | undefined {
  return getStore().campaigns.get(id);
}

export function listCampaigns(query: CampaignListQuery): CampaignListResult {
  const campaigns = [...getStore().campaigns.values()]
    .filter((campaign) => matchesCampaignQuery(campaign, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    campaigns: campaigns.slice(query.offset, query.offset + query.limit),
    total: campaigns.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updateCampaign(id: string, payload: UpdateCampaignInput): Campaign {
  const campaign = getStore().campaigns.get(id);

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const updatedCampaign: Campaign = {
    ...campaign,
    ...payload,
    tags: payload.tags ?? campaign.tags,
    updatedAt: new Date().toISOString(),
  };

  getStore().campaigns.set(id, updatedCampaign);
  return updatedCampaign;
}

export function createContentAsset(
  payload: CreateContentAssetInput,
): ContentAsset {
  assertCampaignExists(payload.campaignId);

  const now = new Date().toISOString();
  const asset: ContentAsset = {
    id: crypto.randomUUID(),
    campaignId: payload.campaignId,
    createdAt: now,
    updatedAt: now,
    status: payload.brief ? "briefed" : "idea",
    title: payload.title,
    format: payload.format,
    channel: payload.channel,
    brief: payload.brief,
    body: payload.body,
    callToAction: payload.callToAction,
    landingUrl: payload.landingUrl,
    source: payload.source,
    tags: payload.tags ?? [],
  };

  getStore().contentAssets.set(asset.id, asset);
  return asset;
}

export function getContentAsset(id: string): ContentAsset | undefined {
  return getStore().contentAssets.get(id);
}

export function listContentAssets(
  query: ContentAssetListQuery,
): ContentAssetListResult {
  const assets = [...getStore().contentAssets.values()]
    .filter((asset) => matchesContentAssetQuery(asset, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    assets: assets.slice(query.offset, query.offset + query.limit),
    total: assets.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updateContentAsset(
  id: string,
  payload: UpdateContentAssetInput,
): ContentAsset {
  const asset = getStore().contentAssets.get(id);

  if (!asset) {
    throw new Error("Content asset not found.");
  }

  if (payload.campaignId) {
    assertCampaignExists(payload.campaignId);
  }

  const updatedAsset: ContentAsset = {
    ...asset,
    ...payload,
    tags: payload.tags ?? asset.tags,
    updatedAt: new Date().toISOString(),
  };

  getStore().contentAssets.set(id, updatedAsset);
  return updatedAsset;
}

export function createStoryboard(payload: CreateStoryboardInput): Storyboard {
  assertCampaignExists(payload.campaignId);
  assertContentAssetExists(payload.assetId);

  const now = new Date().toISOString();
  const storyboard: Storyboard = {
    id: crypto.randomUUID(),
    campaignId: payload.campaignId,
    assetId: payload.assetId,
    createdAt: now,
    updatedAt: now,
    title: payload.title,
    status: "storyboarded",
    scenes: payload.scenes,
    notes: payload.notes,
  };

  getStore().storyboards.set(storyboard.id, storyboard);
  return storyboard;
}

export function getStoryboard(id: string): Storyboard | undefined {
  return getStore().storyboards.get(id);
}

export function listStoryboards(query: StoryboardListQuery): StoryboardListResult {
  const storyboards = [...getStore().storyboards.values()]
    .filter((storyboard) => matchesStoryboardQuery(storyboard, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    storyboards: storyboards.slice(query.offset, query.offset + query.limit),
    total: storyboards.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updateStoryboard(
  id: string,
  payload: UpdateStoryboardInput,
): Storyboard {
  const storyboard = getStore().storyboards.get(id);

  if (!storyboard) {
    throw new Error("Storyboard not found.");
  }

  if (payload.campaignId) {
    assertCampaignExists(payload.campaignId);
  }

  if (payload.assetId) {
    assertContentAssetExists(payload.assetId);
  }

  const updatedStoryboard: Storyboard = {
    ...storyboard,
    ...payload,
    scenes: payload.scenes ?? storyboard.scenes,
    updatedAt: new Date().toISOString(),
  };

  getStore().storyboards.set(id, updatedStoryboard);
  return updatedStoryboard;
}

export function createReviewTask(payload: CreateReviewTaskInput): ReviewTask {
  assertCampaignExists(payload.campaignId);
  assertContentAssetExists(payload.assetId);

  const now = new Date().toISOString();
  const task: ReviewTask = {
    id: crypto.randomUUID(),
    campaignId: payload.campaignId,
    assetId: payload.assetId,
    createdAt: now,
    updatedAt: now,
    status: "open",
    reviewer: payload.reviewer,
    notes: payload.notes,
    dueAt: payload.dueAt,
  };

  getStore().reviewTasks.set(task.id, task);
  return task;
}

export function getReviewTask(id: string): ReviewTask | undefined {
  return getStore().reviewTasks.get(id);
}

export function listReviewTasks(query: ReviewTaskListQuery): ReviewTaskListResult {
  const reviewTasks = [...getStore().reviewTasks.values()]
    .filter((task) => matchesReviewTaskQuery(task, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    reviewTasks: reviewTasks.slice(query.offset, query.offset + query.limit),
    total: reviewTasks.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updateReviewTask(
  id: string,
  payload: UpdateReviewTaskInput,
): ReviewTask {
  const task = getStore().reviewTasks.get(id);

  if (!task) {
    throw new Error("Review task not found.");
  }

  if (payload.campaignId) {
    assertCampaignExists(payload.campaignId);
  }

  if (payload.assetId) {
    assertContentAssetExists(payload.assetId);
  }

  const statusChangedToDecision =
    payload.status &&
    payload.status !== "open" &&
    payload.status !== task.status &&
    !payload.decidedAt;
  const updatedTask: ReviewTask = {
    ...task,
    ...payload,
    decidedAt: statusChangedToDecision
      ? new Date().toISOString()
      : payload.decidedAt ?? task.decidedAt,
    updatedAt: new Date().toISOString(),
  };

  getStore().reviewTasks.set(id, updatedTask);
  return updatedTask;
}

export function createPublishPost(payload: CreatePublishPostInput): PublishPost {
  assertCampaignExists(payload.campaignId);
  assertContentAssetExists(payload.assetId);

  const now = new Date().toISOString();
  const post: PublishPost = {
    id: crypto.randomUUID(),
    campaignId: payload.campaignId,
    assetId: payload.assetId,
    createdAt: now,
    updatedAt: now,
    channel: payload.channel,
    status: payload.publishedAt ? "published" : "scheduled",
    scheduledAt: payload.scheduledAt,
    publishedAt: payload.publishedAt,
    postUrl: payload.postUrl,
    externalPostId: payload.externalPostId,
    trackingCode: payload.trackingCode,
  };

  getStore().publishPosts.set(post.id, post);
  return post;
}

export function getPublishPost(id: string): PublishPost | undefined {
  return getStore().publishPosts.get(id);
}

export function listPublishPosts(
  query: PublishPostListQuery,
): PublishPostListResult {
  const publishPosts = [...getStore().publishPosts.values()]
    .filter((post) => matchesPublishPostQuery(post, query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    publishPosts: publishPosts.slice(query.offset, query.offset + query.limit),
    total: publishPosts.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function updatePublishPost(
  id: string,
  payload: UpdatePublishPostInput,
): PublishPost {
  const post = getStore().publishPosts.get(id);

  if (!post) {
    throw new Error("Publish post not found.");
  }

  if (payload.campaignId) {
    assertCampaignExists(payload.campaignId);
  }

  if (payload.assetId) {
    assertContentAssetExists(payload.assetId);
  }

  const updatedPost: PublishPost = {
    ...post,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  getStore().publishPosts.set(id, updatedPost);
  return updatedPost;
}

export function createContentMetric(
  payload: CreateContentMetricInput,
): ContentMetric {
  assertCampaignExists(payload.campaignId);

  if (payload.assetId) {
    assertContentAssetExists(payload.assetId);
  }

  if (payload.publishPostId && !getStore().publishPosts.has(payload.publishPostId)) {
    throw new Error("Publish post not found.");
  }

  if (payload.leadId && !getStore().leads.has(payload.leadId)) {
    throw new Error("Lead not found.");
  }

  const now = new Date().toISOString();
  const metric: ContentMetric = {
    id: crypto.randomUUID(),
    campaignId: payload.campaignId,
    assetId: payload.assetId,
    publishPostId: payload.publishPostId,
    leadId: payload.leadId,
    createdAt: now,
    occurredAt: payload.occurredAt ?? now,
    source: payload.source,
    channel: payload.channel,
    metricType: payload.metricType,
    metricValue: payload.metricValue,
    metadata: payload.metadata ?? {},
  };

  getStore().contentMetrics.set(metric.id, metric);
  return metric;
}

export function listContentMetrics(
  query: ContentMetricListQuery,
): ContentMetricListResult {
  const metrics = [...getStore().contentMetrics.values()]
    .filter((metric) => matchesContentMetricQuery(metric, query))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return {
    metrics: metrics.slice(query.offset, query.offset + query.limit),
    total: metrics.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function getContentAttribution(
  query: ContentAttributionQuery,
): ContentAttributionSummary {
  const metrics = [...getStore().contentMetrics.values()].filter((metric) =>
    matchesContentAttributionQuery(metric, query),
  );
  const leadIds = new Set(metrics.map((metric) => metric.leadId).filter(Boolean));

  return {
    campaignId: query.campaignId,
    source: query.source,
    channel: query.channel,
    totalMetrics: metrics.length,
    totalMetricValue: sumBy(metrics, (metric) => metric.metricValue),
    leadsAttributed: leadIds.size,
    byMetricType: groupMetricValues(metrics, (metric) => metric.metricType),
    byCampaign: groupMetricValues(metrics, (metric) => metric.campaignId),
    bySource: groupMetricValues(metrics, (metric) => metric.source ?? "unknown"),
    byChannel: groupMetricValues(metrics, (metric) => metric.channel ?? "unknown"),
  };
}

function matchesLeadQuery(
  lead: Lead,
  query: Pick<LeadListQuery, "status" | "riskLevel" | "source" | "country" | "q">,
): boolean {
  if (query.status && lead.status !== query.status) {
    return false;
  }

  if (query.riskLevel && lead.riskLevel !== query.riskLevel) {
    return false;
  }

  if (query.source && lead.source !== query.source) {
    return false;
  }

  if (query.country && lead.country !== query.country) {
    return false;
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    const haystack = `${lead.fullName} ${lead.email} ${lead.freeText ?? ""}`.toLowerCase();

    if (!haystack.includes(q)) {
      return false;
    }
  }

  return true;
}

function matchesCampaignQuery(
  campaign: Campaign,
  query: Pick<CampaignListQuery, "status" | "source" | "q">,
): boolean {
  if (query.status && campaign.status !== query.status) {
    return false;
  }

  if (query.source && campaign.source !== query.source) {
    return false;
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    const haystack =
      `${campaign.name} ${campaign.objective} ${campaign.targetAudience ?? ""}`.toLowerCase();

    if (!haystack.includes(q)) {
      return false;
    }
  }

  return true;
}

function matchesContentAssetQuery(
  asset: ContentAsset,
  query: Pick<
    ContentAssetListQuery,
    "campaignId" | "status" | "channel" | "source" | "q"
  >,
): boolean {
  if (query.campaignId && asset.campaignId !== query.campaignId) {
    return false;
  }

  if (query.status && asset.status !== query.status) {
    return false;
  }

  if (query.channel && asset.channel !== query.channel) {
    return false;
  }

  if (query.source && asset.source !== query.source) {
    return false;
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    const haystack =
      `${asset.title} ${asset.brief ?? ""} ${asset.body ?? ""}`.toLowerCase();

    if (!haystack.includes(q)) {
      return false;
    }
  }

  return true;
}

function matchesStoryboardQuery(
  storyboard: Storyboard,
  query: Pick<StoryboardListQuery, "campaignId" | "assetId" | "status">,
): boolean {
  return (
    (!query.campaignId || storyboard.campaignId === query.campaignId) &&
    (!query.assetId || storyboard.assetId === query.assetId) &&
    (!query.status || storyboard.status === query.status)
  );
}

function matchesReviewTaskQuery(
  task: ReviewTask,
  query: Pick<
    ReviewTaskListQuery,
    "campaignId" | "assetId" | "status" | "reviewer"
  >,
): boolean {
  return (
    (!query.campaignId || task.campaignId === query.campaignId) &&
    (!query.assetId || task.assetId === query.assetId) &&
    (!query.status || task.status === query.status) &&
    (!query.reviewer || task.reviewer === query.reviewer)
  );
}

function matchesPublishPostQuery(
  post: PublishPost,
  query: Pick<
    PublishPostListQuery,
    "campaignId" | "assetId" | "channel" | "status" | "trackingCode"
  >,
): boolean {
  return (
    (!query.campaignId || post.campaignId === query.campaignId) &&
    (!query.assetId || post.assetId === query.assetId) &&
    (!query.channel || post.channel === query.channel) &&
    (!query.status || post.status === query.status) &&
    (!query.trackingCode || post.trackingCode === query.trackingCode)
  );
}

function matchesContentMetricQuery(
  metric: ContentMetric,
  query: Pick<
    ContentMetricListQuery,
    | "campaignId"
    | "assetId"
    | "publishPostId"
    | "leadId"
    | "source"
    | "channel"
    | "metricType"
    | "from"
    | "to"
  >,
): boolean {
  return (
    (!query.campaignId || metric.campaignId === query.campaignId) &&
    (!query.assetId || metric.assetId === query.assetId) &&
    (!query.publishPostId || metric.publishPostId === query.publishPostId) &&
    (!query.leadId || metric.leadId === query.leadId) &&
    (!query.source || metric.source === query.source) &&
    (!query.channel || metric.channel === query.channel) &&
    (!query.metricType || metric.metricType === query.metricType) &&
    (!query.from || metric.occurredAt >= query.from) &&
    (!query.to || metric.occurredAt <= query.to)
  );
}

function matchesContentAttributionQuery(
  metric: ContentMetric,
  query: ContentAttributionQuery,
): boolean {
  return (
    (!query.campaignId || metric.campaignId === query.campaignId) &&
    (!query.source || metric.source === query.source) &&
    (!query.channel || metric.channel === query.channel) &&
    (!query.from || metric.occurredAt >= query.from) &&
    (!query.to || metric.occurredAt <= query.to)
  );
}

function assertCampaignExists(campaignId: string): void {
  if (!getStore().campaigns.has(campaignId)) {
    throw new Error("Campaign not found.");
  }
}

function assertContentAssetExists(assetId: string): void {
  if (!getStore().contentAssets.has(assetId)) {
    throw new Error("Content asset not found.");
  }
}

function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function groupMetricValues(
  metrics: ContentMetric[],
  keySelector: (metric: ContentMetric) => string,
): Record<string, number> {
  const grouped: Record<string, number> = {};

  for (const metric of metrics) {
    const key = keySelector(metric);
    grouped[key] = (grouped[key] ?? 0) + metric.metricValue;
  }

  return grouped;
}
