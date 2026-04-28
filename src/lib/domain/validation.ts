import type {
  CampaignListQuery,
  ContentAssetFormat,
  ContentAssetListQuery,
  ContentAttributionQuery,
  ContentMetricListQuery,
  ContentStatus,
  CreateCampaignInput,
  CreateContentAssetInput,
  CreateContentMetricInput,
  CreatePublishPostInput,
  CreateReviewTaskInput,
  CreateStoryboardInput,
  IntakePayload,
  LeadExportQuery,
  LeadListQuery,
  LeadStatus,
  PublishChannel,
  PublishPostListQuery,
  ReviewStatus,
  ReviewTaskListQuery,
  RiskLevel,
  StoryboardListQuery,
  StoryboardScene,
  UpdateCampaignInput,
  UpdateContentAssetInput,
  UpdatePublishPostInput,
  UpdateReviewTaskInput,
  UpdateStoryboardInput,
} from "./types";

const allowedStatuses: LeadStatus[] = [
  "new",
  "triaged",
  "needs_review",
  "contacted",
  "qualified",
  "not_fit",
  "closed",
];

const allowedContentStatuses: ContentStatus[] = [
  "idea",
  "briefed",
  "drafted",
  "storyboarded",
  "compliance_review",
  "approved",
  "scheduled",
  "published",
  "measured",
];

const allowedReviewStatuses: ReviewStatus[] = [
  "open",
  "approved",
  "needs_revision",
  "rejected",
];

const allowedPublishChannels: PublishChannel[] = [
  "website",
  "instagram",
  "tiktok",
  "youtube",
  "xiaohongshu",
  "email",
  "paid_ad",
  "other",
];

const allowedContentAssetFormats: ContentAssetFormat[] = [
  "article",
  "short_video",
  "image",
  "carousel",
  "email",
  "ad",
  "landing_page",
  "other",
];

export function parseIntakePayload(input: unknown): IntakePayload {
  if (!isRecord(input)) {
    throw new Error("Request body must be a JSON object.");
  }

  const fullName = requiredString(input.fullName, "fullName");
  const email = requiredString(input.email, "email");
  const goals = parseGoals(input.goals);
  const consentToContact = input.consentToContact === true;

  if (!email.includes("@")) {
    throw new Error("email must be a valid email address.");
  }

  if (!consentToContact) {
    throw new Error("consentToContact must be true.");
  }

  return {
    fullName,
    email,
    goals,
    consentToContact,
    country: optionalString(input.country),
    ageRange: optionalString(input.ageRange),
    preferredTiming: optionalString(input.preferredTiming),
    budgetUsd: optionalPositiveNumber(input.budgetUsd, "budgetUsd"),
    travelPartySize: optionalPositiveInteger(input.travelPartySize, "travelPartySize"),
    freeText: optionalString(input.freeText),
    source: optionalString(input.source),
    campaign: optionalString(input.campaign),
    utmSource: optionalString(input.utmSource),
    utmMedium: optionalString(input.utmMedium),
    utmCampaign: optionalString(input.utmCampaign),
    utmContent: optionalString(input.utmContent),
  };
}

export function parseLeadStatus(input: unknown): LeadStatus {
  if (typeof input !== "string" || !allowedStatuses.includes(input as LeadStatus)) {
    throw new Error(`status must be one of: ${allowedStatuses.join(", ")}.`);
  }

  return input as LeadStatus;
}

export function parseLeadListQuery(searchParams: URLSearchParams): LeadListQuery {
  const status = searchParams.get("status");
  const riskLevel = searchParams.get("riskLevel");

  return {
    status: status ? parseLeadStatus(status) : undefined,
    riskLevel: riskLevel ? parseRiskLevel(riskLevel) : undefined,
    source: optionalQueryString(searchParams.get("source")),
    country: optionalQueryString(searchParams.get("country")),
    q: optionalQueryString(searchParams.get("q")),
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseLeadExportQuery(searchParams: URLSearchParams): LeadExportQuery {
  const query = parseLeadListQuery(searchParams);

  return {
    ...query,
    limit: parseBoundedInteger(searchParams.get("limit"), 5000, 1, 5000),
  };
}

export function parseCampaignPayload(input: unknown): CreateCampaignInput {
  const record = requiredRecord(input);

  return {
    name: requiredString(record.name, "name"),
    objective: requiredString(record.objective, "objective"),
    targetAudience: optionalString(record.targetAudience),
    source: optionalString(record.source),
    owner: optionalString(record.owner),
    startDate: optionalString(record.startDate),
    endDate: optionalString(record.endDate),
    budgetUsd: optionalPositiveNumber(record.budgetUsd, "budgetUsd"),
    tags: parseOptionalStringArray(record.tags, "tags"),
  };
}

export function parseCampaignUpdatePayload(input: unknown): UpdateCampaignInput {
  const record = requiredRecord(input);

  return stripUndefined({
    name: optionalString(record.name),
    objective: optionalString(record.objective),
    status: record.status === undefined ? undefined : parseContentStatus(record.status),
    targetAudience: optionalString(record.targetAudience),
    source: optionalString(record.source),
    owner: optionalString(record.owner),
    startDate: optionalString(record.startDate),
    endDate: optionalString(record.endDate),
    budgetUsd: optionalPositiveNumber(record.budgetUsd, "budgetUsd"),
    tags: parseOptionalStringArray(record.tags, "tags"),
  });
}

export function parseCampaignListQuery(searchParams: URLSearchParams): CampaignListQuery {
  const status = searchParams.get("status");

  return {
    status: status ? parseContentStatus(status) : undefined,
    source: optionalQueryString(searchParams.get("source")),
    q: optionalQueryString(searchParams.get("q")),
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseContentAssetPayload(input: unknown): CreateContentAssetInput {
  const record = requiredRecord(input);

  return {
    campaignId: requiredString(record.campaignId, "campaignId"),
    title: requiredString(record.title, "title"),
    format: parseContentAssetFormat(record.format),
    channel: parsePublishChannel(record.channel),
    brief: optionalString(record.brief),
    body: optionalString(record.body),
    callToAction: optionalString(record.callToAction),
    landingUrl: optionalString(record.landingUrl),
    source: optionalString(record.source),
    tags: parseOptionalStringArray(record.tags, "tags"),
  };
}

export function parseContentAssetUpdatePayload(
  input: unknown,
): UpdateContentAssetInput {
  const record = requiredRecord(input);

  return stripUndefined({
    campaignId: optionalString(record.campaignId),
    title: optionalString(record.title),
    status: record.status === undefined ? undefined : parseContentStatus(record.status),
    format:
      record.format === undefined
        ? undefined
        : parseContentAssetFormat(record.format),
    channel:
      record.channel === undefined ? undefined : parsePublishChannel(record.channel),
    brief: optionalString(record.brief),
    body: optionalString(record.body),
    callToAction: optionalString(record.callToAction),
    landingUrl: optionalString(record.landingUrl),
    source: optionalString(record.source),
    tags: parseOptionalStringArray(record.tags, "tags"),
  });
}

export function parseContentAssetListQuery(
  searchParams: URLSearchParams,
): ContentAssetListQuery {
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    status: status ? parseContentStatus(status) : undefined,
    channel: channel ? parsePublishChannel(channel) : undefined,
    source: optionalQueryString(searchParams.get("source")),
    q: optionalQueryString(searchParams.get("q")),
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseStoryboardPayload(input: unknown): CreateStoryboardInput {
  const record = requiredRecord(input);

  return {
    campaignId: requiredString(record.campaignId, "campaignId"),
    assetId: requiredString(record.assetId, "assetId"),
    title: requiredString(record.title, "title"),
    scenes: parseStoryboardScenes(record.scenes),
    notes: optionalString(record.notes),
  };
}

export function parseStoryboardUpdatePayload(input: unknown): UpdateStoryboardInput {
  const record = requiredRecord(input);

  return stripUndefined({
    campaignId: optionalString(record.campaignId),
    assetId: optionalString(record.assetId),
    title: optionalString(record.title),
    status: record.status === undefined ? undefined : parseContentStatus(record.status),
    scenes:
      record.scenes === undefined ? undefined : parseStoryboardScenes(record.scenes),
    notes: optionalString(record.notes),
  });
}

export function parseStoryboardListQuery(
  searchParams: URLSearchParams,
): StoryboardListQuery {
  const status = searchParams.get("status");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    assetId: optionalQueryString(searchParams.get("assetId")),
    status: status ? parseContentStatus(status) : undefined,
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseReviewTaskPayload(input: unknown): CreateReviewTaskInput {
  const record = requiredRecord(input);

  return {
    campaignId: requiredString(record.campaignId, "campaignId"),
    assetId: requiredString(record.assetId, "assetId"),
    reviewer: requiredString(record.reviewer, "reviewer"),
    notes: optionalString(record.notes),
    dueAt: optionalString(record.dueAt),
  };
}

export function parseReviewTaskUpdatePayload(input: unknown): UpdateReviewTaskInput {
  const record = requiredRecord(input);

  return stripUndefined({
    campaignId: optionalString(record.campaignId),
    assetId: optionalString(record.assetId),
    reviewer: optionalString(record.reviewer),
    status: record.status === undefined ? undefined : parseReviewStatus(record.status),
    notes: optionalString(record.notes),
    dueAt: optionalString(record.dueAt),
    decidedAt: optionalString(record.decidedAt),
  });
}

export function parseReviewTaskListQuery(
  searchParams: URLSearchParams,
): ReviewTaskListQuery {
  const status = searchParams.get("status");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    assetId: optionalQueryString(searchParams.get("assetId")),
    status: status ? parseReviewStatus(status) : undefined,
    reviewer: optionalQueryString(searchParams.get("reviewer")),
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parsePublishPostPayload(input: unknown): CreatePublishPostInput {
  const record = requiredRecord(input);

  return {
    campaignId: requiredString(record.campaignId, "campaignId"),
    assetId: requiredString(record.assetId, "assetId"),
    channel: parsePublishChannel(record.channel),
    scheduledAt: optionalString(record.scheduledAt),
    publishedAt: optionalString(record.publishedAt),
    postUrl: optionalString(record.postUrl),
    externalPostId: optionalString(record.externalPostId),
    trackingCode: optionalString(record.trackingCode),
  };
}

export function parsePublishPostUpdatePayload(input: unknown): UpdatePublishPostInput {
  const record = requiredRecord(input);

  return stripUndefined({
    campaignId: optionalString(record.campaignId),
    assetId: optionalString(record.assetId),
    channel:
      record.channel === undefined ? undefined : parsePublishChannel(record.channel),
    status: record.status === undefined ? undefined : parseContentStatus(record.status),
    scheduledAt: optionalString(record.scheduledAt),
    publishedAt: optionalString(record.publishedAt),
    postUrl: optionalString(record.postUrl),
    externalPostId: optionalString(record.externalPostId),
    trackingCode: optionalString(record.trackingCode),
  });
}

export function parsePublishPostListQuery(
  searchParams: URLSearchParams,
): PublishPostListQuery {
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    assetId: optionalQueryString(searchParams.get("assetId")),
    channel: channel ? parsePublishChannel(channel) : undefined,
    status: status ? parseContentStatus(status) : undefined,
    trackingCode: optionalQueryString(searchParams.get("trackingCode")),
    limit: parseBoundedInteger(searchParams.get("limit"), 20, 1, 100),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseContentMetricPayload(input: unknown): CreateContentMetricInput {
  const record = requiredRecord(input);

  return {
    campaignId: requiredString(record.campaignId, "campaignId"),
    assetId: optionalString(record.assetId),
    publishPostId: optionalString(record.publishPostId),
    leadId: optionalString(record.leadId),
    occurredAt: optionalString(record.occurredAt),
    source: optionalString(record.source),
    channel:
      record.channel === undefined ? undefined : parsePublishChannel(record.channel),
    metricType: requiredString(record.metricType, "metricType"),
    metricValue: requiredNumber(record.metricValue, "metricValue"),
    metadata: optionalRecord(record.metadata),
  };
}

export function parseContentMetricListQuery(
  searchParams: URLSearchParams,
): ContentMetricListQuery {
  const channel = searchParams.get("channel");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    assetId: optionalQueryString(searchParams.get("assetId")),
    publishPostId: optionalQueryString(searchParams.get("publishPostId")),
    leadId: optionalQueryString(searchParams.get("leadId")),
    source: optionalQueryString(searchParams.get("source")),
    channel: channel ? parsePublishChannel(channel) : undefined,
    metricType: optionalQueryString(searchParams.get("metricType")),
    from: optionalQueryString(searchParams.get("from")),
    to: optionalQueryString(searchParams.get("to")),
    limit: parseBoundedInteger(searchParams.get("limit"), 50, 1, 500),
    offset: parseBoundedInteger(searchParams.get("offset"), 0, 0, 10000),
  };
}

export function parseContentAttributionQuery(
  searchParams: URLSearchParams,
): ContentAttributionQuery {
  const channel = searchParams.get("channel");

  return {
    campaignId: optionalQueryString(searchParams.get("campaignId")),
    source: optionalQueryString(searchParams.get("source")),
    channel: channel ? parsePublishChannel(channel) : undefined,
    from: optionalQueryString(searchParams.get("from")),
    to: optionalQueryString(searchParams.get("to")),
  };
}

export function parseContentStatus(input: unknown): ContentStatus {
  if (
    typeof input !== "string" ||
    !allowedContentStatuses.includes(input as ContentStatus)
  ) {
    throw new Error(
      `status must be one of: ${allowedContentStatuses.join(", ")}.`,
    );
  }

  return input as ContentStatus;
}

export function parseReviewStatus(input: unknown): ReviewStatus {
  if (
    typeof input !== "string" ||
    !allowedReviewStatuses.includes(input as ReviewStatus)
  ) {
    throw new Error(
      `review status must be one of: ${allowedReviewStatuses.join(", ")}.`,
    );
  }

  return input as ReviewStatus;
}

export function parsePublishChannel(input: unknown): PublishChannel {
  if (
    typeof input !== "string" ||
    !allowedPublishChannels.includes(input as PublishChannel)
  ) {
    throw new Error(
      `channel must be one of: ${allowedPublishChannels.join(", ")}.`,
    );
  }

  return input as PublishChannel;
}

export function parseContentAssetFormat(input: unknown): ContentAssetFormat {
  if (
    typeof input !== "string" ||
    !allowedContentAssetFormats.includes(input as ContentAssetFormat)
  ) {
    throw new Error(
      `format must be one of: ${allowedContentAssetFormats.join(", ")}.`,
    );
  }

  return input as ContentAssetFormat;
}

function parseRiskLevel(input: unknown): RiskLevel {
  if (input !== "low" && input !== "medium" && input !== "high") {
    throw new Error("riskLevel must be one of: low, medium, high.");
  }

  return input;
}

function parseGoals(input: unknown): string[] {
  if (!Array.isArray(input)) {
    throw new Error("goals must be a non-empty string array.");
  }

  const goals = input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (goals.length === 0) {
    throw new Error("goals must include at least one item.");
  }

  return goals.slice(0, 12);
}

function requiredString(input: unknown, field: string): string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }

  return input.trim();
}

function requiredNumber(input: unknown, field: string): number {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    throw new Error(`${field} must be a number.`);
  }

  return input;
}

function optionalString(input: unknown): string | undefined {
  return typeof input === "string" && input.trim().length > 0
    ? input.trim()
    : undefined;
}

function optionalQueryString(input: string | null): string | undefined {
  return input && input.trim().length > 0 ? input.trim() : undefined;
}

function parseBoundedInteger(
  input: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!input) {
    return fallback;
  }

  const value = Number(input);

  if (!Number.isInteger(value)) {
    throw new Error("Pagination values must be integers.");
  }

  return Math.max(min, Math.min(max, value));
}

function optionalPositiveNumber(input: unknown, field: string): number | undefined {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  if (typeof input !== "number" || !Number.isFinite(input) || input < 0) {
    throw new Error(`${field} must be a positive number.`);
  }

  return input;
}

function optionalPositiveInteger(input: unknown, field: string): number | undefined {
  const value = optionalPositiveNumber(input, field);

  if (value !== undefined && !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer.`);
  }

  return value;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function requiredRecord(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error("Request body must be a JSON object.");
  }

  return input;
}

function optionalRecord(input: unknown): Record<string, unknown> | undefined {
  return input === undefined ? undefined : requiredRecord(input);
}

function parseOptionalStringArray(
  input: unknown,
  field: string,
): string[] | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  if (!Array.isArray(input)) {
    throw new Error(`${field} must be a string array.`);
  }

  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 24);
}

function parseStoryboardScenes(input: unknown): StoryboardScene[] {
  if (!Array.isArray(input)) {
    throw new Error("scenes must be a non-empty array.");
  }

  const scenes = input.map((item, index) => {
    const scene = requiredRecord(item);

    return {
      id:
        typeof scene.id === "string" && scene.id.trim().length > 0
          ? scene.id.trim()
          : crypto.randomUUID(),
      order:
        scene.order === undefined
          ? index + 1
          : optionalPositiveInteger(scene.order, "scene.order") ?? index + 1,
      title: requiredString(scene.title, "scene.title"),
      visual: requiredString(scene.visual, "scene.visual"),
      narration: optionalString(scene.narration),
      durationSeconds: optionalPositiveInteger(
        scene.durationSeconds,
        "scene.durationSeconds",
      ),
    };
  });

  if (scenes.length === 0) {
    throw new Error("scenes must include at least one item.");
  }

  return scenes.slice(0, 80);
}

function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;
}
