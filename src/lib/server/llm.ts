import type { Lead, LeadTriageOutput } from "@/lib/domain/types";
import { getLlmConfig } from "./env";

export type LlmTriageResult = {
  output: LeadTriageOutput;
  provider: "mock" | "llm" | "llm_fallback";
  model?: string;
};

type GenerateTriageInput = {
  lead: Lead;
  promptSnapshot: string;
  fallbackOutput: LeadTriageOutput;
};

export async function generateLeadTriageOutput({
  lead,
  promptSnapshot,
  fallbackOutput,
}: GenerateTriageInput): Promise<LlmTriageResult> {
  const config = getLlmConfig();

  if (!config.enabled || !config.apiUrl || !config.apiKey || !config.model) {
    return {
      output: fallbackOutput,
      provider: "mock",
    };
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content:
              "You are Eastaura's lead triage assistant. Return only valid JSON matching the requested schema. Do not diagnose, treat, or make medical claims.",
          },
          {
            role: "user",
            content: JSON.stringify({
              skillPack: promptSnapshot,
              lead,
              outputSchemaVersion: "lead_triage_output_v0_1",
            }),
          },
        ],
        response_format: {
          type: "json_object",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed with status ${response.status}.`);
    }

    const body = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = body.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM response did not include message content.");
    }

    return {
      output: normalizeTriageOutput(JSON.parse(content), fallbackOutput),
      provider: "llm",
      model: config.model,
    };
  } catch {
    return {
      output: fallbackOutput,
      provider: "llm_fallback",
      model: config.model,
    };
  }
}

function normalizeTriageOutput(
  input: unknown,
  fallback: LeadTriageOutput,
): LeadTriageOutput {
  if (!isRecord(input)) {
    return fallback;
  }

  return {
    summary: readString(input.summary, fallback.summary),
    primaryGoals: readStringArray(input.primaryGoals, fallback.primaryGoals),
    buyingSignals: readStringArray(input.buyingSignals, fallback.buyingSignals),
    riskLevel: readRiskLevel(input.riskLevel, fallback.riskLevel),
    riskNotes: readStringArray(input.riskNotes, fallback.riskNotes),
    fitScore: clampScore(input.fitScore, fallback.fitScore),
    intentScore: clampScore(input.intentScore, fallback.intentScore),
    riskScore: clampScore(input.riskScore, fallback.riskScore),
    nextStep: readString(input.nextStep, fallback.nextStep),
    followUpDraft: readString(input.followUpDraft, fallback.followUpDraft),
    humanReviewRequired:
      typeof input.humanReviewRequired === "boolean"
        ? input.humanReviewRequired
        : fallback.humanReviewRequired,
  };
}

function readString(input: unknown, fallback: string): string {
  return typeof input === "string" && input.trim().length > 0
    ? input.trim()
    : fallback;
}

function readStringArray(input: unknown, fallback: string[]): string[] {
  if (!Array.isArray(input)) {
    return fallback;
  }

  const values = input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return values.length > 0 ? values : fallback;
}

function readRiskLevel(input: unknown, fallback: LeadTriageOutput["riskLevel"]) {
  return input === "low" || input === "medium" || input === "high" ? input : fallback;
}

function clampScore(input: unknown, fallback: number): number {
  return typeof input === "number" && Number.isFinite(input)
    ? Math.max(0, Math.min(100, input))
    : fallback;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
