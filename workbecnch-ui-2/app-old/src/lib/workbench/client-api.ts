import type { AttributionSummary, CalendarEvent, ChannelPerformance, ContentItem, Lead, Notification, ReviewTask, Scene } from "./types";

export type WorkbenchStats = {
  newLeadsToday?: number;
  highIntentLeads?: number;
  highRiskLeads?: number;
  pendingReviewTasks?: number;
  aiTimeSaved?: string;
};

export type WorkbenchNote = {
  id?: string;
  body?: string;
  author?: string;
  createdAt?: string;
};

export type WorkbenchEvent = {
  id?: string;
  type?: string;
  action?: string;
  status?: string;
  by?: string;
  createdAt?: string;
  date?: string;
  message?: string;
};

export type ApiMeta = {
  usingFallback?: boolean;
  error?: string;
};

export type LeadStatus = Lead["status"] | "triaged";

type DashboardResponse = ApiMeta & {
  stats?: WorkbenchStats;
  leads?: Lead[];
};

type LeadsResponse = ApiMeta & {
  leads?: Lead[];
  total?: number;
};

type LeadDetailResponse = ApiMeta & {
  lead?: Lead;
  aiRuns?: unknown[];
  notes?: WorkbenchNote[];
  statusEvents?: WorkbenchEvent[];
  leadEvents?: WorkbenchEvent[];
};

type NotificationsResponse = ApiMeta & {
  notifications?: Notification[];
};

type ContentAssetsResponse = ApiMeta & {
  assets?: ContentItem[];
  asset?: ContentItem;
  total?: number;
};

type StoryboardResponse = ApiMeta & {
  scenes?: Scene[];
};

type ReviewTasksResponse = ApiMeta & {
  reviewTasks?: ReviewTask[];
  reviewTask?: ReviewTask;
  total?: number;
};

type PublishPostsResponse = ApiMeta & {
  publishPosts?: CalendarEvent[];
  publishPost?: CalendarEvent;
  total?: number;
};

type AttributionResponse = ApiMeta & {
  summary?: AttributionSummary;
  channels?: ChannelPerformance[];
};

function normalizeWorkbenchApiPath(path: string) {
  if (!path.startsWith("/api/workbench")) {
    return path;
  }

  const [withoutHash, hash = ""] = path.split("#", 2);
  const [pathname, search = ""] = withoutHash.split("?", 2);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;

  return `${normalizedPathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(normalizeWorkbenchApiPath(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

export function getDashboard() {
  return requestJson<DashboardResponse>("/api/workbench/dashboard");
}

export function getLeads() {
  return requestJson<LeadsResponse>("/api/workbench/leads");
}

export function getLeadDetail(id: string) {
  return requestJson<LeadDetailResponse>(`/api/workbench/leads/${encodeURIComponent(id)}`);
}

export function updateLeadStatus(id: string, status: LeadStatus, reason?: string) {
  return requestJson<{ lead?: Lead }>(`/api/workbench/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
}

export function addLeadNote(id: string, body: string, author = "Founder") {
  return requestJson<{ note?: WorkbenchNote; notes?: WorkbenchNote[] }>(
    `/api/workbench/leads/${encodeURIComponent(id)}/notes`,
    {
      method: "POST",
      body: JSON.stringify({ body, author }),
    }
  );
}

export function rerunLeadTriage(id: string) {
  return requestJson<Partial<LeadDetailResponse>>(`/api/workbench/leads/${encodeURIComponent(id)}/triage`, {
    method: "POST",
  });
}

export function getNotifications() {
  return requestJson<NotificationsResponse>("/api/workbench/notifications");
}

export function retryNotification(id: string) {
  return requestJson<{ notification?: Notification }>(`/api/workbench/notifications/${encodeURIComponent(id)}/retry`, {
    method: "POST",
  });
}

export function getContentAssets() {
  return requestJson<ContentAssetsResponse>("/api/workbench/content-assets/");
}

export function createContentAsset(input: Partial<ContentItem> & { brief?: string }) {
  return requestJson<ContentAssetsResponse>("/api/workbench/content-assets/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function generateContentScript(id: string, input?: Record<string, unknown>) {
  return requestJson<ContentAssetsResponse>(`/api/workbench/content-assets/${encodeURIComponent(id)}/generate-script/`, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
  });
}

export function generateContentStoryboard(id: string, input?: Record<string, unknown>) {
  return requestJson<StoryboardResponse>(`/api/workbench/content-assets/${encodeURIComponent(id)}/generate-storyboard/`, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
  });
}

export function runContentComplianceReview(id: string, input?: Record<string, unknown>) {
  return requestJson<ContentAssetsResponse>(`/api/workbench/content-assets/${encodeURIComponent(id)}/compliance-review/`, {
    method: "POST",
    body: JSON.stringify(input ?? {}),
  });
}

export function getReviewTasks() {
  return requestJson<ReviewTasksResponse>("/api/workbench/review-tasks/");
}

export function updateReviewTask(id: string, status: ReviewTask["status"]) {
  return requestJson<ReviewTasksResponse>(`/api/workbench/review-tasks/${encodeURIComponent(id)}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getPublishPosts() {
  return requestJson<PublishPostsResponse>("/api/workbench/publish-posts/");
}

export function createPublishPost(input: Partial<CalendarEvent> & { assetId?: string; campaignId?: string }) {
  return requestJson<PublishPostsResponse>("/api/workbench/publish-posts/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getContentAttribution() {
  return requestJson<AttributionResponse>("/api/workbench/content-attribution/");
}

export function getLeadGoals(lead: Pick<Lead, "primaryGoals">) {
  return Array.isArray(lead.primaryGoals) ? lead.primaryGoals : [];
}

export function getLeadAvatar(lead?: Pick<Lead, "avatar"> | null) {
  return lead?.avatar || "/workbench/avatars/sarah.jpg";
}
