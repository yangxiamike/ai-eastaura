import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";

export type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

export type LlmConfig = {
  enabled: boolean;
  apiUrl?: string;
  apiKey?: string;
  model?: string;
};

export type NotificationConfig = {
  resendApiKey?: string;
  fromEmail?: string;
  toEmail?: string;
  feishuWebhookUrl?: string;
  feishuBotSecret?: string;
};

export type FeishuAppConfig = {
  appId?: string;
  appSecret?: string;
  verificationToken?: string;
};

export type IntakeProtectionConfig = {
  rateLimitWindowMs: number;
  rateLimitMax: number;
  duplicateWindowMs: number;
  turnstileSecretKey?: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = getEnvValue("SUPABASE_URL");
  const serviceRoleKey = getEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url,
    serviceRoleKey,
  };
}

export function getLlmConfig(): LlmConfig {
  return {
    enabled: getEnvValue("EASTAURA_LLM_ENABLED") === "true",
    apiUrl: getEnvValue("EASTAURA_LLM_API_URL"),
    apiKey: getEnvValue("EASTAURA_LLM_API_KEY"),
    model: getEnvValue("EASTAURA_LLM_MODEL"),
  };
}

export function getAdminApiToken(): string | undefined {
  return getEnvValue("EASTAURA_ADMIN_API_TOKEN");
}

export function allowOpenAdminApi(): boolean {
  return getEnvValue("EASTAURA_ALLOW_OPEN_ADMIN_API") === "true";
}

export function getNotificationConfig(): NotificationConfig {
  return {
    resendApiKey: getEnvValue("RESEND_API_KEY"),
    fromEmail: getEnvValue("EASTAURA_NOTIFICATION_FROM"),
    toEmail: getEnvValue("EASTAURA_NOTIFICATION_TO"),
    feishuWebhookUrl: getEnvValue("FEISHU_WEBHOOK_URL"),
    feishuBotSecret: getEnvValue("FEISHU_BOT_SECRET"),
  };
}

export function getFeishuAppConfig(): FeishuAppConfig {
  return {
    appId: getEnvValue("FEISHU_APP_ID"),
    appSecret: getEnvValue("FEISHU_APP_SECRET"),
    verificationToken: getEnvValue("FEISHU_VERIFICATION_TOKEN"),
  };
}

export function getIntakeProtectionConfig(): IntakeProtectionConfig {
  return {
    rateLimitWindowMs: parsePositiveInteger(
      getEnvValue("EASTAURA_INTAKE_RATE_LIMIT_WINDOW_MS"),
      600000,
    ),
    rateLimitMax: parsePositiveInteger(getEnvValue("EASTAURA_INTAKE_RATE_LIMIT_MAX"), 10),
    duplicateWindowMs: parsePositiveInteger(
      getEnvValue("EASTAURA_INTAKE_DUPLICATE_WINDOW_MS"),
      600000,
    ),
    turnstileSecretKey: getEnvValue("TURNSTILE_SECRET_KEY"),
  };
}

let cachedLocalEnv: Record<string, string> | null = null;

function getEnvValue(key: string): string | undefined {
  const runtimeValue = process.env[key];
  if (runtimeValue !== undefined && runtimeValue !== "") {
    return runtimeValue;
  }

  const localEnv = readLocalEnvFile();
  const fallback = localEnv[key];
  return fallback && fallback !== "" ? fallback : undefined;
}

function readLocalEnvFile(): Record<string, string> {
  if (cachedLocalEnv) {
    return cachedLocalEnv;
  }

  const envFile = findEnvFile();
  if (!existsSync(envFile)) {
    cachedLocalEnv = {};
    return cachedLocalEnv;
  }

  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);
  const result: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!key || value === "") {
      continue;
    }

    result[key] = value;
  }

  cachedLocalEnv = result;
  return result;
}

function findEnvFile(): string {
  let current = process.cwd();

  for (let i = 0; i < 8; i += 1) {
    const candidate = join(current, ".env.local");
    if (existsSync(candidate)) {
      return candidate;
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }

    current = parent;
  }

  return join(process.cwd(), ".env.local");
}

function parsePositiveInteger(input: string | undefined, fallback: number): number {
  if (!input) {
    return fallback;
  }

  const value = Number(input);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}
