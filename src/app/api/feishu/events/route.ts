import { NextResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = ["hkg1"];

type FeishuUrlVerificationPayload = {
  type?: "url_verification";
  token?: string;
  challenge?: string;
  event?: {
    challenge?: string;
  };
};

type FeishuMessageEventPayload = {
  schema?: string;
  header?: {
    event_type?: string;
    token?: string;
  };
  event?: {
    message?: {
      message_id?: string;
      content?: string;
      mentions?: Array<{
        key?: string;
      }>;
    };
  };
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | FeishuUrlVerificationPayload
    | FeishuMessageEventPayload
    | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid Feishu event payload." }, { status: 400 });
  }

  const tokenError = verifyFeishuToken(payload);
  if (tokenError) {
    return tokenError;
  }

  const challenge = getFeishuChallenge(payload);
  if (challenge) {
    return NextResponse.json({ challenge });
  }

  if (isMessageEvent(payload)) {
    await handleMessageEvent(payload);
  }

  return NextResponse.json({ ok: true });
}

function getFeishuChallenge(payload: FeishuUrlVerificationPayload | FeishuMessageEventPayload): string | null {
  if ("type" in payload && payload.type === "url_verification" && payload.challenge) {
    return payload.challenge;
  }

  if ("event" in payload && payload.event && "challenge" in payload.event) {
    return payload.event.challenge ?? null;
  }

  return null;
}

function verifyFeishuToken(payload: FeishuUrlVerificationPayload | FeishuMessageEventPayload) {
  const expectedToken = process.env.FEISHU_VERIFICATION_TOKEN;
  if (!expectedToken) {
    return null;
  }

  const actualToken =
    "header" in payload && payload.header?.token ? payload.header.token : "token" in payload ? payload.token : undefined;

  if (actualToken !== expectedToken) {
    return NextResponse.json({ error: "Invalid Feishu verification token." }, { status: 401 });
  }

  return null;
}

function isMessageEvent(payload: FeishuUrlVerificationPayload | FeishuMessageEventPayload): payload is FeishuMessageEventPayload {
  return "header" in payload && payload.header?.event_type === "im.message.receive_v1";
}

async function handleMessageEvent(payload: FeishuMessageEventPayload): Promise<void> {
  const message = payload.event?.message;
  if (!message?.message_id || !message.content) {
    return;
  }

  const commandText = extractTextCommand(message.content, message.mentions ?? []);
  const responseText = buildFeishuCommandResponse(commandText);

  try {
    await replyToFeishuMessage(message.message_id, responseText);
  } catch (error) {
    console.error("Failed to reply to Feishu message", error);
  }
}

function buildFeishuCommandResponse(commandText: string): string {
  const normalized = commandText.trim().toLowerCase();

  if (!normalized || normalized === "/help" || normalized === "help") {
    return ["Eastaura Codex Bot 已在线。", "", "可用命令：", "/health - 查看项目 API 状态", "/help - 查看命令列表"].join(
      "\n",
    );
  }

  if (normalized === "/health" || normalized === "health") {
    return [
      "✅ Eastaura API 正常",
      "runtime: edge",
      `llm: ${process.env.EASTAURA_LLM_ENABLED === "true" ? "configured" : "mock"}`,
      `time: ${new Date().toISOString()}`,
    ].join("\n");
  }

  return ["⚠️ 暂不支持这个命令。", "", "当前可用：", "/health", "/help"].join("\n");
}

async function replyToFeishuMessage(messageId: string, text: string): Promise<void> {
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

  const body = (await response.json().catch(() => null)) as { code?: number; msg?: string } | null;
  if (!response.ok || (body && typeof body.code === "number" && body.code !== 0)) {
    throw new Error(body?.msg ?? `Feishu reply failed with status ${response.status}.`);
  }
}

async function getTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("FEISHU_APP_ID and FEISHU_APP_SECRET are required to reply messages.");
  }

  const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  const body = (await response.json()) as {
    code?: number;
    msg?: string;
    tenant_access_token?: string;
  };

  if (!response.ok || body.code !== 0 || !body.tenant_access_token) {
    throw new Error(body.msg ?? `Feishu tenant token failed with status ${response.status}.`);
  }

  return body.tenant_access_token;
}

function extractTextCommand(content: string, mentions: Array<{ key?: string }>): string {
  const parsed = JSON.parse(content) as { text?: string };
  let text = parsed.text ?? "";

  for (const mention of mentions) {
    if (mention.key) {
      text = text.replace(mention.key, "");
    }
  }

  return text.trim();
}
