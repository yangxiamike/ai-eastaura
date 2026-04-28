import type { AiRun, Lead, LeadTriageOutput, SkillRef } from "@/lib/domain/types";
import { generateLeadTriageOutput } from "./llm";
import { buildPromptSnapshot, loadSkillAssets } from "./skills";

const skillRefs: SkillRef[] = [
  { key: "eastaura_brand", version: "v0_1" },
  { key: "lead_triage", version: "v0_1" },
  { key: "risk_screening", version: "v0_1" },
  { key: "medical_boundary", version: "v0_1" },
  { key: "notification_priority", version: "v0_1" },
];

export async function runLeadTriage(lead: Lead): Promise<AiRun> {
  const skills = await loadSkillAssets(skillRefs);
  const promptSnapshot = buildPromptSnapshot(skills);
  const triage = await generateLeadTriageOutput({
    lead,
    promptSnapshot,
    fallbackOutput: buildDeterministicTriage(lead),
  });

  return {
    id: crypto.randomUUID(),
    leadId: lead.id,
    createdAt: new Date().toISOString(),
    agentKey: "lead_triage_agent",
    provider: triage.provider,
    model: triage.model,
    skillRefs,
    promptSnapshot,
    outputSchemaVersion: "lead_triage_output_v0_1",
    output: triage.output,
  };
}

function buildDeterministicTriage(lead: Lead): LeadTriageOutput {
  const text = `${lead.goals.join(" ")} ${lead.freeText ?? ""}`.toLowerCase();
  const riskTerms = [
    "pregnant",
    "cancer",
    "heart",
    "surgery",
    "severe",
    "medication",
    "diagnosed",
    "depression",
    "suicidal",
    "emergency",
  ];
  const buyingTerms = [
    "book",
    "price",
    "available",
    "date",
    "schedule",
    "package",
    "retreat",
    "consultation",
  ];

  const riskHits = riskTerms.filter((term) => text.includes(term));
  const buyingSignals = buyingTerms
    .filter((term) => text.includes(term))
    .map((term) => `Mentioned ${term}`);

  if (lead.budgetUsd && lead.budgetUsd >= 2500) {
    buyingSignals.push("Budget is within the current pilot price assumption.");
  }

  if (lead.preferredTiming) {
    buyingSignals.push("Shared preferred travel timing.");
  }

  const riskScore = Math.min(100, riskHits.length * 25);
  const riskLevel = riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";
  const intentScore = Math.min(100, 35 + buyingSignals.length * 18);
  const fitScore = Math.min(100, 45 + lead.goals.length * 8 + (lead.country ? 10 : 0));
  const humanReviewRequired = riskLevel !== "low" || intentScore >= 70;

  return {
    summary: `${lead.fullName} is interested in ${lead.goals.join(", ")} through an Eastaura TCM wellness retreat.`,
    primaryGoals: lead.goals,
    buyingSignals,
    riskLevel,
    riskNotes:
      riskHits.length > 0
        ? riskHits.map((term) => `Review mention of "${term}" before recommending next steps.`)
        : ["No obvious high-risk medical terms detected in the intake text."],
    fitScore,
    intentScore,
    riskScore,
    nextStep:
      riskLevel === "high"
        ? "Ask clarifying questions and route to human review before any proposal."
        : "Send a concierge-style follow-up email and offer a discovery call.",
    followUpDraft: buildFollowUpDraft(lead),
    humanReviewRequired,
  };
}

function buildFollowUpDraft(lead: Lead): string {
  return [
    `Hi ${lead.fullName},`,
    "",
    "Thank you for reaching out to Eastaura. Based on what you shared, we can explore a China-based TCM wellness retreat focused on stress recovery, sleep reset, and whole-person balance.",
    "",
    "A good next step would be a short discovery call so we can understand your goals, timing, travel preferences, and any safety considerations before suggesting a suitable itinerary.",
    "",
    "Warmly,",
    "Eastaura",
  ].join("\n");
}
