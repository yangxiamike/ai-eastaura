import { getIntakeProtectionConfig } from "./env";

type RateEntry = {
  count: number;
  resetAt: number;
};

type DuplicateEntry = {
  expiresAt: number;
};

const globalProtection = globalThis as typeof globalThis & {
  __eastauraRateLimits?: Map<string, RateEntry>;
  __eastauraDuplicateIntakes?: Map<string, DuplicateEntry>;
};

function getRateLimits(): Map<string, RateEntry> {
  if (!globalProtection.__eastauraRateLimits) {
    globalProtection.__eastauraRateLimits = new Map();
  }

  return globalProtection.__eastauraRateLimits;
}

function getDuplicates(): Map<string, DuplicateEntry> {
  if (!globalProtection.__eastauraDuplicateIntakes) {
    globalProtection.__eastauraDuplicateIntakes = new Map();
  }

  return globalProtection.__eastauraDuplicateIntakes;
}

export async function validatePublicIntakeRequest(
  request: Request,
  rawBody: unknown,
): Promise<void> {
  const config = getIntakeProtectionConfig();
  const clientKey = readClientKey(request, rawBody);
  checkRateLimit(clientKey, config.rateLimitWindowMs, config.rateLimitMax);
  checkDuplicateSubmission(rawBody, config.duplicateWindowMs);

  if (config.turnstileSecretKey) {
    await verifyTurnstile(readTurnstileToken(rawBody), config.turnstileSecretKey);
  }
}

function checkRateLimit(key: string, windowMs: number, max: number): void {
  const now = Date.now();
  const limits = getRateLimits();
  const entry = limits.get(key);

  if (!entry || entry.resetAt <= now) {
    limits.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  entry.count += 1;

  if (entry.count > max) {
    throw new Error("Too many intake submissions. Please try again later.");
  }
}

function checkDuplicateSubmission(rawBody: unknown, windowMs: number): void {
  if (!isRecord(rawBody)) {
    return;
  }

  const email = typeof rawBody.email === "string" ? rawBody.email.trim().toLowerCase() : "";
  const freeText =
    typeof rawBody.freeText === "string" ? rawBody.freeText.trim().toLowerCase() : "";
  const goals = Array.isArray(rawBody.goals)
    ? rawBody.goals
        .filter((goal): goal is string => typeof goal === "string")
        .map((goal) => goal.trim().toLowerCase())
        .sort()
        .join("|")
    : "";

  if (!email) {
    return;
  }

  const key = `${email}:${goals}:${freeText.slice(0, 80)}`;
  const now = Date.now();
  const duplicates = getDuplicates();
  const entry = duplicates.get(key);

  if (entry && entry.expiresAt > now) {
    throw new Error("Duplicate intake submission detected. Please wait before retrying.");
  }

  duplicates.set(key, {
    expiresAt: now + windowMs,
  });
}

async function verifyTurnstile(token: string | undefined, secretKey: string): Promise<void> {
  if (!token) {
    throw new Error("Turnstile token is required.");
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification failed with status ${response.status}.`);
  }

  const body = (await response.json()) as {
    success?: boolean;
  };

  if (!body.success) {
    throw new Error("Turnstile verification failed.");
  }
}

function readClientKey(request: Request, rawBody: unknown): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const email =
    isRecord(rawBody) && typeof rawBody.email === "string"
      ? rawBody.email.trim().toLowerCase()
      : "";

  return `${forwardedFor ?? realIp ?? "unknown"}:${email}`;
}

function readTurnstileToken(rawBody: unknown): string | undefined {
  if (!isRecord(rawBody)) {
    return undefined;
  }

  return typeof rawBody.turnstileToken === "string"
    ? rawBody.turnstileToken
    : undefined;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
