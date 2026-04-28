import type {
  ContentAsset,
  CreateContentMetricInput,
  CreatePublishPostInput,
  ReviewTask,
  StoryboardScene,
  UpdateReviewTaskInput,
} from "@/lib/domain/types";
import type { EastauraRepository } from "@/lib/server/repositories/types";

const COMPLIANCE_RISK_TERMS = [
  "cure",
  "heal",
  "treat",
  "guarantee",
  "reverse disease",
  "doctor-approved",
];

export async function generateContentScript(
  repository: EastauraRepository,
  assetId: string,
) {
  const asset = await requireContentAsset(repository, assetId);
  const body = buildScriptBody(asset);
  const callToAction =
    asset.callToAction ??
    "Apply for a private Eastaura intake so our team can assess fit and safety boundaries.";
  const updatedAsset = await repository.updateContentAsset(asset.id, {
    body,
    callToAction,
    status: "drafted",
  });

  return {
    asset: updatedAsset,
    generation: {
      provider: "rule_based",
      skillRef: "short_video_script_v0_1",
      outputSchemaVersion: "0.1",
    },
  };
}

export async function generateContentStoryboard(
  repository: EastauraRepository,
  assetId: string,
) {
  const asset = await requireContentAsset(repository, assetId);

  if (asset.format !== "short_video") {
    throw new Error("Storyboard generation requires a short_video content asset.");
  }

  const storyboard = await repository.createStoryboard({
    campaignId: asset.campaignId,
    assetId: asset.id,
    title: `${asset.title} storyboard`,
    scenes: buildStoryboardScenes(asset),
    notes:
      "Rule-based storyboard for a human-reviewed short video draft. No clinical claim is approved by automation.",
  });
  const updatedAsset = await repository.updateContentAsset(asset.id, {
    status: "storyboarded",
  });

  return {
    asset: updatedAsset,
    storyboard,
    generation: {
      provider: "rule_based",
      skillRef: "storyboard_v0_1",
      outputSchemaVersion: "0.1",
    },
  };
}

export async function createComplianceReview(
  repository: EastauraRepository,
  assetId: string,
) {
  const asset = await requireContentAsset(repository, assetId);
  const review = inspectComplianceRisk(asset);
  const updatedAsset = await repository.updateContentAsset(asset.id, {
    status: "compliance_review",
  });
  const reviewTask = await repository.createReviewTask({
    campaignId: asset.campaignId,
    assetId: asset.id,
    reviewer: "human_compliance",
    notes: review.notes,
  });

  return {
    asset: updatedAsset,
    reviewTask,
    review,
  };
}

export async function updateReviewTaskAndSyncAsset(
  repository: EastauraRepository,
  id: string,
  payload: UpdateReviewTaskInput,
): Promise<{ reviewTask: ReviewTask; asset?: ContentAsset }> {
  const reviewTask = await repository.updateReviewTask(id, payload);

  if (reviewTask.status !== "approved") {
    return { reviewTask };
  }

  const asset = await repository.updateContentAsset(reviewTask.assetId, {
    status: "approved",
  });

  return { reviewTask, asset };
}

export async function createPublishPostAndSyncAsset(
  repository: EastauraRepository,
  payload: CreatePublishPostInput,
) {
  const publishPost = await repository.createPublishPost(payload);
  const status = payload.publishedAt || payload.postUrl ? "published" : "scheduled";
  const syncedPost =
    publishPost.status === status
      ? publishPost
      : await repository.updatePublishPost(publishPost.id, { status });
  const asset = await repository.updateContentAsset(payload.assetId, { status });

  return { publishPost: syncedPost, asset };
}

export async function createContentMetricWithAttributionHint(
  repository: EastauraRepository,
  payload: CreateContentMetricInput,
) {
  const metric = await repository.createContentMetric(payload);

  return {
    metric,
    attribution:
      metric.metricType === "lead_submit" && metric.leadId && metric.assetId
        ? {
            tracked: true,
            reason: "lead_submit includes both leadId and assetId.",
          }
        : {
            tracked: false,
            reason: "Attribution requires metricType=lead_submit with leadId and assetId.",
          },
  };
}

function buildScriptBody(asset: ContentAsset): string {
  const brief = asset.brief ?? "Introduce the Eastaura wellness retreat concept.";
  const channel = asset.channel.replaceAll("_", " ");

  return [
    `Hook: If stress, sleep disruption, or low energy has become your normal, ${asset.title} is a calm place to begin.`,
    `Context: ${brief}`,
    "Value: Eastaura frames TCM as a guided wellness experience with clear safety boundaries, concierge coordination, and licensed providers wherever clinical care is involved.",
    `Channel angle: Keep the ${channel} version grounded, specific, and human. Avoid medical promises; focus on rest, cultural learning, and whole-person balance.`,
    "Close: Share one honest reason this journey may fit someone who wants a structured reset in China, then invite them to complete an intake before any recommendation is made.",
  ].join("\n\n");
}

function buildStoryboardScenes(asset: ContentAsset): StoryboardScene[] {
  const brief = asset.brief ?? "A private Eastaura TCM wellness reset in China.";
  const scenes = [
    {
      title: "Quiet Arrival",
      visual: "Soft morning exterior of a calm wellness space, slow push-in, natural light.",
      narration: `Open with the tension behind ${asset.title}: a guest looking for a reset, not a medical promise.`,
    },
    {
      title: "Human Intake",
      visual: "Concierge reviewing an intake form beside tea, hands and notes in frame.",
      narration: `Explain the brief: ${brief}`,
    },
    {
      title: "TCM Wellness Context",
      visual: "Licensed provider consultation room, herbs and acupuncture tools shown as context only.",
      narration: "Clinical care, when relevant, belongs with licensed providers and human review.",
    },
    {
      title: "Reset Rhythm",
      visual: "Guided breathing, walkable city garden, restorative meal, unhurried transitions.",
      narration: "Show stress recovery support, sleep routine reset, and whole-person balance.",
    },
    {
      title: "Intake CTA",
      visual: "Minimal landing page on phone with Eastaura logo and intake button.",
      narration: "Invite viewers to apply for a private intake before any recommendation is made.",
    },
  ];

  return scenes.map((scene, index) => ({
    id: `scene_${index + 1}`,
    order: index + 1,
    durationSeconds: index === 0 ? 4 : 5,
    ...scene,
  }));
}

function inspectComplianceRisk(asset: ContentAsset) {
  const haystack = [
    asset.title,
    asset.brief,
    asset.body,
    asset.callToAction,
    asset.landingUrl,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const matchedTerms = COMPLIANCE_RISK_TERMS.filter((term) =>
    haystack.includes(term),
  );
  const riskLevel =
    matchedTerms.length >= 3 ? "high" : matchedTerms.length > 0 ? "medium" : "low";
  const notes =
    riskLevel === "low"
      ? "Low risk ready for human approval. No automated approval was applied."
      : `Compliance risk detected (${matchedTerms.join(", ")}). Human review required before publishing.`;

  return {
    provider: "rule_based",
    skillRef: "review_compliance_v0_1",
    riskLevel,
    matchedTerms,
    notes,
  };
}

async function requireContentAsset(
  repository: EastauraRepository,
  assetId: string,
): Promise<ContentAsset> {
  const asset = await repository.getContentAsset(assetId);

  if (!asset) {
    throw new Error("Content asset not found.");
  }

  return asset;
}
