import { getAdminGuardStatus } from "./auth";
import { getFeishuAppConfig, getLlmConfig } from "./env";
import { getConfiguredDeliveryChannels } from "./notification-delivery";
import { getPersistenceMode } from "./repositories";

type FeishuTenantAccessTokenResponse = {
  code?: number;
  msg?: string;
  tenant_access_token?: string;
  expire?: number;
};

type FeishuApiResponse = {
  code?: number;
  msg?: string;
};

type CachedTenantToken = {
  token: string;
  expiresAt: number;
};

let cachedTenantToken: CachedTenantToken | null = null;

export function buildFeishuHealthText(): string {
  const llmConfig = getLlmConfig();
  const llmStatus = llmConfig.enabled && llmConfig.apiUrl && llmConfig.apiKey ? "configured" : "mock";

  return [
    "✅ Eastaura API 正常",
    `persistence: ${getPersistenceMode()}`,
    `llm: ${llmStatus}`,
    `adminGuard: ${getAdminGuardStatus()}`,
    `notifications: ${["in_app", ...getConfiguredDeliveryChannels()].join(", ")}`,
    `time: ${new Date().toISOString()}`,
  ].join("\n");
}

export function buildFeishuCommandResponse(commandText: string): string {
  const normalized = commandText.trim().toLowerCase();

  if (!normalized || normalized === "/help" || normalized === "help") {
    return [
      "Eastaura Codex Bot 已在线。",
      "",
      "可用命令：",
      "/health - 查看项目 API 状态",
      "/help - 查看命令列表",
    ].join("\n");
  }

  if (normalized === "/health" || normalized === "health") {
    return buildFeishuHealthText();
  }

  return [
    "⚠️ 暂不支持这个命令。",
    "",
    "当前可用：",
    "/health",
    "/help",
  ].join("\n");
}

export async function replyToFeishuMessage(messageId: string, text: string): Promise<void> {
  const tenantAccessToken = await getTenantAccessToken();
  const response = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages/${encodeURIComponent(messageId)}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        msg_type: "text",
        content: JSON.stringify({ text }),
      }),
    },
  );

  const body = (await response.json().catch(() => null)) as FeishuApiResponse | null;
  if (!response.ok || (body && typeof body.code === "number" && body.code !== 0)) {
    throw new Error(body?.msg ?? `Feishu reply failed with status ${response.status}.`);
  }
}

async function getTenantAccessToken(): Promise<string> {
  if (cachedTenantToken && cachedTenantToken.expiresAt > Date.now() + 60000) {
    return cachedTenantToken.token;
  }

  const config = getFeishuAppConfig();
  if (!config.appId || !config.appSecret) {
    throw new Error("FEISHU_APP_ID and FEISHU_APP_SECRET are required to reply messages.");
  }

  const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      app_id: config.appId,
      app_secret: config.appSecret,
    }),
  });

  const body = (await response.json()) as FeishuTenantAccessTokenResponse;
  if (!response.ok || body.code !== 0 || !body.tenant_access_token) {
    throw new Error(body.msg ?? `Feishu tenant token failed with status ${response.status}.`);
  }

  cachedTenantToken = {
    token: body.tenant_access_token,
    expiresAt: Date.now() + Math.max((body.expire ?? 7200) - 300, 60) * 1000,
  };

  return cachedTenantToken.token;
}
