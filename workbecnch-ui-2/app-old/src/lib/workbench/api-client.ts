import "server-only";

export type RootLeadStatus =
  | "new"
  | "triaged"
  | "needs_review"
  | "contacted"
  | "qualified"
  | "not_fit"
  | "closed";

export type RootRiskLevel = "low" | "medium" | "high";

export type RootLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RootLeadStatus;
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
  riskLevel?: RootRiskLevel;
  fitScore?: number;
  intentScore?: number;
  riskScore?: number;
  latestAiSummary?: string;
};

export type RootAiRun = {
  id: string;
  leadId: string;
  createdAt: string;
  output?: {
    summary?: string;
    primaryGoals?: string[];
    riskLevel?: RootRiskLevel;
    riskNotes?: string[];
    fitScore?: number;
    intentScore?: number;
    riskScore?: number;
    nextStep?: string;
    followUpDraft?: string;
  };
};

export type RootLeadNote = {
  id: string;
  leadId: string;
  createdAt: string;
  body: string;
  author: string;
};

export type RootLeadStatusEvent = {
  id: string;
  leadId: string;
  createdAt: string;
  from: RootLeadStatus;
  to: RootLeadStatus;
  reason?: string;
};

export type RootLeadEvent = {
  id: string;
  leadId: string;
  createdAt: string;
  type: string;
  actor?: string;
  metadata?: Record<string, unknown>;
};

export type RootNotification = {
  id: string;
  createdAt: string;
  channel: "in_app" | "email" | "feishu";
  type: "new_lead" | "high_intent" | "high_risk";
  title: string;
  body: string;
  leadId: string;
  delivered: boolean;
  deliveredAt?: string;
  deliveryError?: string;
};

export type RootDashboardStats = {
  totalLeads: number;
  newLeads: number;
  needsReview: number;
  highIntent: number;
  highRisk: number;
  failedNotifications: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  bySource: Record<string, number>;
  byCountry: Record<string, number>;
};

export type RootContentStatus =
  | "idea"
  | "briefed"
  | "drafted"
  | "storyboarded"
  | "compliance_review"
  | "approved"
  | "scheduled"
  | "published"
  | "measured";

export type RootReviewStatus = "open" | "approved" | "needs_revision" | "rejected";

export type RootPublishChannel =
  | "website"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "xiaohongshu"
  | "email"
  | "paid_ad"
  | "other";

export type RootContentAssetFormat =
  | "article"
  | "short_video"
  | "image"
  | "carousel"
  | "email"
  | "ad"
  | "landing_page"
  | "other";

export type RootCampaign = {
  id: string;
  name: string;
  objective?: string;
  status?: RootContentStatus;
  source?: string;
  tags?: string[];
};

export type RootContentAsset = {
  id: string;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
  status: RootContentStatus;
  title: string;
  format: RootContentAssetFormat;
  channel: RootPublishChannel;
  brief?: string;
  body?: string;
  callToAction?: string;
  landingUrl?: string;
  source?: string;
  tags: string[];
};

export type RootStoryboardScene = {
  id?: string;
  order?: number;
  number?: number;
  title?: string;
  visual?: string;
  caption?: string;
  narration?: string;
  durationSeconds?: number;
  duration?: string;
  imagePrompt?: string;
  videoPrompt?: string;
};

export type RootStoryboard = {
  id: string;
  campaignId?: string;
  assetId?: string;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  status?: RootContentStatus;
  scenes: RootStoryboardScene[];
  notes?: string;
};

export type RootReviewTask = {
  id: string;
  campaignId?: string;
  assetId?: string;
  createdAt: string;
  updatedAt?: string;
  status: RootReviewStatus;
  reviewer?: string;
  notes?: string;
  dueAt?: string;
  decidedAt?: string;
  asset?: RootContentAsset;
  campaign?: RootCampaign;
};

export type RootPublishPost = {
  id: string;
  campaignId: string;
  assetId: string;
  createdAt: string;
  updatedAt: string;
  channel: RootPublishChannel;
  status: RootContentStatus;
  scheduledAt?: string;
  publishedAt?: string;
  postUrl?: string;
  externalPostId?: string;
  trackingCode?: string;
  asset?: RootContentAsset;
  campaign?: RootCampaign;
};

export type RootContentAttributionSummary = {
  campaignId?: string;
  source?: string;
  channel?: RootPublishChannel;
  totalMetrics: number;
  totalMetricValue: number;
  leadsAttributed: number;
  byMetricType: Record<string, number>;
  byCampaign: Record<string, number>;
  bySource: Record<string, number>;
  byChannel: Record<string, number>;
};

export class RootApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RootApiError";
    this.status = status;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getApiBaseUrl() {
  return (process.env.EASTAURA_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = process.env.EASTAURA_ADMIN_API_TOKEN;

  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return headers;
}

export function rootApiErrorMessage(error: unknown) {
  if (error instanceof RootApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Root Eastaura API is unavailable.";
}

export async function fetchRootApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    let detail = response.statusText;

    try {
      const body = await response.json();
      if (typeof body?.error === "string") {
        detail = body.error;
      }
    } catch {
      // Keep the status text when the upstream response is not JSON.
    }

    throw new RootApiError(`Root API ${path} failed (${response.status}): ${detail}`, response.status);
  }

  return response.json() as Promise<T>;
}
