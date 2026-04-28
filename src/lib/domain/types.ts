export type LeadStatus =
  | "new"
  | "triaged"
  | "needs_review"
  | "contacted"
  | "qualified"
  | "not_fit"
  | "closed";

export type RiskLevel = "low" | "medium" | "high";

export type NotificationChannel = "in_app" | "email" | "feishu";

export type IntakePayload = {
  fullName: string;
  email: string;
  country?: string;
  ageRange?: string;
  goals: string[];
  preferredTiming?: string;
  budgetUsd?: number;
  travelPartySize?: number;
  freeText?: string;
  source?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  consentToContact: boolean;
};

export type LeadListQuery = {
  status?: LeadStatus;
  riskLevel?: RiskLevel;
  source?: string;
  country?: string;
  q?: string;
  limit: number;
  offset: number;
};

export type LeadExportQuery = Omit<LeadListQuery, "limit" | "offset"> & {
  limit: number;
};

export type LeadListResult = {
  leads: Lead[];
  total: number;
  limit: number;
  offset: number;
};

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  fullName: string;
  email: string;
  country?: string;
  ageRange?: string;
  goals: string[];
  preferredTiming?: string;
  budgetUsd?: number;
  travelPartySize?: number;
  freeText?: string;
  source: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  consentToContact: boolean;
  latestAiRunId?: string;
  riskLevel?: RiskLevel;
  fitScore?: number;
  intentScore?: number;
  riskScore?: number;
  latestAiSummary?: string;
};

export type AiRun = {
  id: string;
  leadId: string;
  createdAt: string;
  agentKey: string;
  provider: string;
  model?: string;
  skillRefs: SkillRef[];
  promptSnapshot: string;
  outputSchemaVersion: string;
  output: LeadTriageOutput;
};

export type LeadTriageOutput = {
  summary: string;
  primaryGoals: string[];
  buyingSignals: string[];
  riskLevel: RiskLevel;
  riskNotes: string[];
  fitScore: number;
  intentScore: number;
  riskScore: number;
  nextStep: string;
  followUpDraft: string;
  humanReviewRequired: boolean;
};

export type SkillRef = {
  key: string;
  version: string;
};

export type LeadNote = {
  id: string;
  leadId: string;
  createdAt: string;
  body: string;
  author: string;
};

export type LeadStatusEvent = {
  id: string;
  leadId: string;
  createdAt: string;
  from: LeadStatus;
  to: LeadStatus;
  reason?: string;
};

export type LeadEventType =
  | "lead_created"
  | "triage_run"
  | "status_changed"
  | "note_added"
  | "notification_created"
  | "notification_delivered"
  | "notification_failed";

export type LeadEvent = {
  id: string;
  leadId: string;
  createdAt: string;
  type: LeadEventType;
  actor: "system" | "founder" | "agent";
  metadata: Record<string, unknown>;
};

export type NotificationRecord = {
  id: string;
  createdAt: string;
  channel: NotificationChannel;
  type: "new_lead" | "high_intent" | "high_risk";
  title: string;
  body: string;
  leadId: string;
  delivered: boolean;
  deliveredAt?: string;
  deliveryError?: string;
};

export type DashboardStats = {
  totalLeads: number;
  newLeads: number;
  needsReview: number;
  highIntent: number;
  highRisk: number;
  failedNotifications: number;
  byStatus: Record<LeadStatus, number>;
  byRiskLevel: Record<RiskLevel, number>;
  bySource: Record<string, number>;
  byCountry: Record<string, number>;
};

export type ContentStatus =
  | "idea"
  | "briefed"
  | "drafted"
  | "storyboarded"
  | "compliance_review"
  | "approved"
  | "scheduled"
  | "published"
  | "measured";

export type ReviewStatus = "open" | "approved" | "needs_revision" | "rejected";

export type PublishChannel =
  | "website"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "xiaohongshu"
  | "email"
  | "paid_ad"
  | "other";

export type ContentAssetFormat =
  | "article"
  | "short_video"
  | "image"
  | "carousel"
  | "email"
  | "ad"
  | "landing_page"
  | "other";

export type Campaign = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  objective: string;
  status: ContentStatus;
  targetAudience?: string;
  source?: string;
  owner?: string;
  startDate?: string;
  endDate?: string;
  budgetUsd?: number;
  tags: string[];
};

export type CreateCampaignInput = {
  name: string;
  objective: string;
  targetAudience?: string;
  source?: string;
  owner?: string;
  startDate?: string;
  endDate?: string;
  budgetUsd?: number;
  tags?: string[];
};

export type UpdateCampaignInput = Partial<CreateCampaignInput> & {
  status?: ContentStatus;
};

export type CampaignListQuery = {
  status?: ContentStatus;
  source?: string;
  q?: string;
  limit: number;
  offset: number;
};

export type CampaignListResult = {
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
};

export type ContentAsset = {
  id: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
  status: ContentStatus;
  title: string;
  format: ContentAssetFormat;
  channel: PublishChannel;
  brief?: string;
  body?: string;
  callToAction?: string;
  landingUrl?: string;
  source?: string;
  tags: string[];
};

export type CreateContentAssetInput = {
  campaignId: string;
  title: string;
  format: ContentAssetFormat;
  channel: PublishChannel;
  brief?: string;
  body?: string;
  callToAction?: string;
  landingUrl?: string;
  source?: string;
  tags?: string[];
};

export type UpdateContentAssetInput = Partial<
  Omit<CreateContentAssetInput, "campaignId">
> & {
  campaignId?: string;
  status?: ContentStatus;
};

export type ContentAssetListQuery = {
  campaignId?: string;
  status?: ContentStatus;
  channel?: PublishChannel;
  source?: string;
  q?: string;
  limit: number;
  offset: number;
};

export type ContentAssetListResult = {
  assets: ContentAsset[];
  total: number;
  limit: number;
  offset: number;
};

export type StoryboardScene = {
  id: string;
  order: number;
  title: string;
  visual: string;
  narration?: string;
  durationSeconds?: number;
};

export type Storyboard = {
  id: string;
  campaignId: string;
  assetId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  status: ContentStatus;
  scenes: StoryboardScene[];
  notes?: string;
};

export type CreateStoryboardInput = {
  campaignId: string;
  assetId: string;
  title: string;
  scenes: StoryboardScene[];
  notes?: string;
};

export type UpdateStoryboardInput = Partial<CreateStoryboardInput> & {
  status?: ContentStatus;
};

export type StoryboardListQuery = {
  campaignId?: string;
  assetId?: string;
  status?: ContentStatus;
  limit: number;
  offset: number;
};

export type StoryboardListResult = {
  storyboards: Storyboard[];
  total: number;
  limit: number;
  offset: number;
};

export type ReviewTask = {
  id: string;
  campaignId: string;
  assetId: string;
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
  reviewer: string;
  notes?: string;
  dueAt?: string;
  decidedAt?: string;
};

export type CreateReviewTaskInput = {
  campaignId: string;
  assetId: string;
  reviewer: string;
  notes?: string;
  dueAt?: string;
};

export type UpdateReviewTaskInput = Partial<CreateReviewTaskInput> & {
  status?: ReviewStatus;
  decidedAt?: string;
};

export type ReviewTaskListQuery = {
  campaignId?: string;
  assetId?: string;
  status?: ReviewStatus;
  reviewer?: string;
  limit: number;
  offset: number;
};

export type ReviewTaskListResult = {
  reviewTasks: ReviewTask[];
  total: number;
  limit: number;
  offset: number;
};

export type PublishPost = {
  id: string;
  campaignId: string;
  assetId: string;
  createdAt: string;
  updatedAt: string;
  channel: PublishChannel;
  status: ContentStatus;
  scheduledAt?: string;
  publishedAt?: string;
  postUrl?: string;
  externalPostId?: string;
  trackingCode?: string;
};

export type CreatePublishPostInput = {
  campaignId: string;
  assetId: string;
  channel: PublishChannel;
  scheduledAt?: string;
  publishedAt?: string;
  postUrl?: string;
  externalPostId?: string;
  trackingCode?: string;
};

export type UpdatePublishPostInput = Partial<CreatePublishPostInput> & {
  status?: ContentStatus;
};

export type PublishPostListQuery = {
  campaignId?: string;
  assetId?: string;
  channel?: PublishChannel;
  status?: ContentStatus;
  trackingCode?: string;
  limit: number;
  offset: number;
};

export type PublishPostListResult = {
  publishPosts: PublishPost[];
  total: number;
  limit: number;
  offset: number;
};

export type ContentMetric = {
  id: string;
  campaignId: string;
  assetId?: string;
  publishPostId?: string;
  leadId?: string;
  createdAt: string;
  occurredAt: string;
  source?: string;
  channel?: PublishChannel;
  metricType: string;
  metricValue: number;
  metadata: Record<string, unknown>;
};

export type CreateContentMetricInput = {
  campaignId: string;
  assetId?: string;
  publishPostId?: string;
  leadId?: string;
  occurredAt?: string;
  source?: string;
  channel?: PublishChannel;
  metricType: string;
  metricValue: number;
  metadata?: Record<string, unknown>;
};

export type ContentMetricListQuery = {
  campaignId?: string;
  assetId?: string;
  publishPostId?: string;
  leadId?: string;
  source?: string;
  channel?: PublishChannel;
  metricType?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
};

export type ContentMetricListResult = {
  metrics: ContentMetric[];
  total: number;
  limit: number;
  offset: number;
};

export type ContentAttributionQuery = {
  campaignId?: string;
  source?: string;
  channel?: PublishChannel;
  from?: string;
  to?: string;
};

export type ContentAttributionSummary = {
  campaignId?: string;
  source?: string;
  channel?: PublishChannel;
  totalMetrics: number;
  totalMetricValue: number;
  leadsAttributed: number;
  byMetricType: Record<string, number>;
  byCampaign: Record<string, number>;
  bySource: Record<string, number>;
  byChannel: Record<string, number>;
};

export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed";

export type GenerationJob = {
  id: string;
  campaignId?: string;
  assetId?: string;
  createdAt: string;
  updatedAt: string;
  status: GenerationJobStatus;
  provider: string;
  model?: string;
  prompt: string;
  metadata: Record<string, unknown>;
};

export type GeneratedAsset = {
  id: string;
  generationJobId: string;
  createdAt: string;
  assetType: ContentAssetFormat;
  url?: string;
  text?: string;
  metadata: Record<string, unknown>;
};
