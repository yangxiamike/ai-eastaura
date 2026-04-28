#!/usr/bin/env node

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function main() {
  const rootBaseUrl = trimTrailingSlash(
    process.env.E2E_ROOT_URL || "http://127.0.0.1:3000",
  );

  const result = {
    status: "IN_PROGRESS",
    rootBaseUrl,
    checkedAt: new Date().toISOString(),
    health: null,
    intake: null,
    notificationSummary: null,
  };

  const expectedChannels = (process.env.EXPECT_NOTIFICATION_CHANNELS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const healthResponse = await fetch(`${rootBaseUrl}/api/health`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!healthResponse.ok) {
    result.status = "BLOCKED";
    result.health = { ok: false, status: healthResponse.status };
    result.error = "GET /api/health failed.";
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  const health = await healthResponse.json();
  const channels = Array.isArray(health.notificationChannels)
    ? health.notificationChannels
    : [];
  result.health = {
    ok: true,
    persistence: health.persistence,
    adminGuard: health.adminGuard,
    notificationChannels: channels,
  };

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "");
  const runId = `${stamp}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = {
    fullName: `Notification QA ${runId}`,
    email: `qa-notify-${runId}@example.com`,
    goals: ["Stress recovery"],
    country: "United States",
    consentToContact: true,
    source: "qa_notification_verify",
    campaign: "notification_pipeline_check",
    freeText: "Automated notification pipeline verification",
  };

  const intakeResponse = await fetch(`${rootBaseUrl}/api/intake`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!intakeResponse.ok) {
    const body = await intakeResponse.text();
    result.status = "BLOCKED";
    result.intake = {
      ok: false,
      status: intakeResponse.status,
      body: body.slice(0, 500),
    };
    result.error = "POST /api/intake failed.";
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  const intakeBody = await intakeResponse.json();
  const notifications = Array.isArray(intakeBody.notifications)
    ? intakeBody.notifications
    : [];

  const countsByChannel = {};
  for (const notification of notifications) {
    const channel = notification && notification.channel ? notification.channel : "unknown";
    countsByChannel[channel] = (countsByChannel[channel] || 0) + 1;
  }

  const externalExpected = channels.filter((channel) => channel !== "in_app");
  const missingExternal = externalExpected.filter(
    (channel) => !notifications.some((notification) => notification.channel === channel),
  );

  const failedExternal = notifications.filter(
    (notification) =>
      notification.channel !== "in_app" && notification.delivered !== true,
  );

  result.intake = {
    ok: true,
    status: intakeResponse.status,
    leadId: intakeBody?.lead?.id || null,
    createdNotifications: notifications.length,
  };

  result.notificationSummary = {
    countsByChannel,
    externalExpected,
    expectedChannels,
    missingExternal,
    failedExternal: failedExternal.map((item) => ({
      id: item.id,
      channel: item.channel,
      deliveryError: item.deliveryError || null,
    })),
  };

  if (expectedChannels.length > 0) {
    const missingExpectedChannels = expectedChannels.filter(
      (channel) => !channels.includes(channel),
    );

    if (missingExpectedChannels.length > 0) {
      result.status = "BLOCKED";
      result.summary = `Expected channels are not configured in /api/health: ${missingExpectedChannels.join(", ")}`;
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = 1;
      return;
    }
  }

  if (externalExpected.length === 0) {
    result.status = "DONE_WITH_CONCERNS";
    result.summary = "Only in_app channel is configured. External channels are not enabled yet.";
  } else if (missingExternal.length > 0) {
    result.status = "DONE_WITH_CONCERNS";
    result.summary = `Missing expected external notifications: ${missingExternal.join(", ")}`;
  } else if (failedExternal.length > 0) {
    result.status = "DONE_WITH_CONCERNS";
    result.summary = `External delivery failed for ${failedExternal.length} notification(s).`;
  } else {
    result.status = "DONE";
    result.summary = "External notification channels are configured and delivered in this run.";
  }

  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === "DONE" ? 0 : 1;
}

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.log(
    JSON.stringify(
      {
        status: "BLOCKED",
        error: message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
