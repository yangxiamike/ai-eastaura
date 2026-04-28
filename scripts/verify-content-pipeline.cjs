#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function readEnvFileValue(key) {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return "";
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const prefix = `${key}=`;
  const line = lines.find((item) => item.startsWith(prefix));

  if (!line) {
    return "";
  }

  return line.slice(prefix.length).trim().replace(/^['"]|['"]$/g, "");
}

function makeRunId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "");
  return `${stamp}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    url,
    body,
  };
}

function pushStep(result, name, response, details = {}) {
  result.steps.push({
    name,
    url: response.url,
    httpStatus: response.status,
    ok: response.ok,
    ...details,
  });
}

function fail(result, summary, details = {}) {
  result.status = "BLOCKED";
  result.summary = summary;
  Object.assign(result, details);
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const rootBaseUrl = trimTrailingSlash(
    process.env.E2E_ROOT_URL || "http://127.0.0.1:3010",
  );
  const adminToken =
    process.env.EASTAURA_ADMIN_API_TOKEN || readEnvFileValue("EASTAURA_ADMIN_API_TOKEN");
  const adminHeaders = adminToken ? { authorization: `Bearer ${adminToken}` } : {};
  const runId = makeRunId();
  const now = new Date();
  const nowIso = now.toISOString();

  const result = {
    status: "IN_PROGRESS",
    rootBaseUrl,
    checkedAt: nowIso,
    runId,
    health: null,
    ids: {},
    assertions: [],
    steps: [],
  };

  try {
    const healthResponse = await fetchJson(`${rootBaseUrl}/api/health`);
    pushStep(result, "health", healthResponse);

    if (!healthResponse.ok) {
      fail(result, "GET /api/health failed.", {
        health: { ok: false, status: healthResponse.status, body: healthResponse.body },
      });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = 1;
      return;
    }

    result.health = {
      ok: true,
      persistence: healthResponse.body?.persistence || null,
      adminGuard: healthResponse.body?.adminGuard || null,
      llm: healthResponse.body?.llm || null,
      notificationChannels: healthResponse.body?.notificationChannels || [],
    };

    if (result.health.adminGuard === "configured" && !adminToken) {
      fail(result, "Admin API is guarded, but EASTAURA_ADMIN_API_TOKEN is not available.");
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = 1;
      return;
    }

    const campaignResponse = await fetchJson(`${rootBaseUrl}/api/campaigns`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: `P0 Content Pipeline QA ${runId}`,
        objective:
          "Verify Eastaura content pipeline P0 from campaign creation to lead attribution.",
        targetAudience: "US wellness travelers evaluating a safety-screened TCM reset.",
        source: "qa_content_pipeline",
        owner: "codex",
        tags: ["qa", "content-pipeline", runId],
      }),
    });
    pushStep(result, "create_campaign", campaignResponse);
    expect(campaignResponse.ok, "POST /api/campaigns failed.");
    const campaign = campaignResponse.body.campaign;
    expect(campaign?.id, "Campaign id missing.");
    result.ids.campaignId = campaign.id;

    const assetResponse = await fetchJson(`${rootBaseUrl}/api/content-assets`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        campaignId: campaign.id,
        title: `POV Shanghai arrival content QA ${runId}`,
        format: "short_video",
        channel: "instagram",
        brief:
          "Explain a calm Shanghai arrival and Hangzhou wellness reset without medical claims.",
        callToAction: "Start the safety intake before any recommendation is made.",
        landingUrl: `${rootBaseUrl}/intake?utm_source=instagram&utm_medium=social&utm_campaign=${encodeURIComponent(runId)}&utm_content=qa_content_pipeline`,
        source: `qa_content_pipeline_${runId}`,
        tags: ["qa", "short-video", runId],
      }),
    });
    pushStep(result, "create_content_asset", assetResponse);
    expect(assetResponse.ok, "POST /api/content-assets failed.");
    const createdAsset = assetResponse.body.asset;
    expect(createdAsset?.id, "Content asset id missing.");
    result.ids.assetId = createdAsset.id;

    const scriptResponse = await fetchJson(
      `${rootBaseUrl}/api/content-assets/${encodeURIComponent(createdAsset.id)}/generate-script`,
      {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({}),
      },
    );
    pushStep(result, "generate_script", scriptResponse, {
      assetStatus: scriptResponse.body?.asset?.status || null,
    });
    expect(scriptResponse.ok, "POST generate-script failed.");
    expect(scriptResponse.body.asset.status === "drafted", "Script step did not draft asset.");
    expect(
      typeof scriptResponse.body.asset.body === "string" &&
        scriptResponse.body.asset.body.includes("Hook:"),
      "Generated script body is missing expected Hook section.",
    );
    result.assertions.push("asset drafted with generated script body");

    const storyboardResponse = await fetchJson(
      `${rootBaseUrl}/api/content-assets/${encodeURIComponent(createdAsset.id)}/generate-storyboard`,
      {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({}),
      },
    );
    const scenes = storyboardResponse.body?.storyboard?.scenes || [];
    pushStep(result, "generate_storyboard", storyboardResponse, {
      assetStatus: storyboardResponse.body?.asset?.status || null,
      sceneCount: scenes.length,
    });
    expect(storyboardResponse.ok, "POST generate-storyboard failed.");
    expect(storyboardResponse.body.asset.status === "storyboarded", "Storyboard step did not update asset status.");
    expect(scenes.length === 5, "Storyboard did not generate 5 scenes.");
    result.ids.storyboardId = storyboardResponse.body.storyboard.id;
    result.assertions.push("storyboard generated with 5 scenes");

    const reviewResponse = await fetchJson(
      `${rootBaseUrl}/api/content-assets/${encodeURIComponent(createdAsset.id)}/compliance-review`,
      {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({}),
      },
    );
    pushStep(result, "create_compliance_review", reviewResponse, {
      assetStatus: reviewResponse.body?.asset?.status || null,
      reviewStatus: reviewResponse.body?.reviewTask?.status || null,
      riskLevel: reviewResponse.body?.review?.riskLevel || null,
    });
    expect(reviewResponse.ok, "POST compliance-review failed.");
    expect(reviewResponse.body.asset.status === "compliance_review", "Compliance review did not update asset status.");
    expect(reviewResponse.body.reviewTask.status === "open", "Review task is not open.");
    result.ids.reviewTaskId = reviewResponse.body.reviewTask.id;
    result.assertions.push("open human compliance review task created");

    const approveResponse = await fetchJson(
      `${rootBaseUrl}/api/review-tasks/${encodeURIComponent(reviewResponse.body.reviewTask.id)}`,
      {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          status: "approved",
          reviewer: "founder",
          notes: `Approved by automated P0 verification run ${runId}.`,
          decidedAt: nowIso,
        }),
      },
    );
    pushStep(result, "approve_review_task", approveResponse, {
      assetStatus: approveResponse.body?.asset?.status || null,
      reviewStatus: approveResponse.body?.reviewTask?.status || null,
    });
    expect(approveResponse.ok, "PATCH review task failed.");
    expect(approveResponse.body.reviewTask.status === "approved", "Review task was not approved.");
    expect(approveResponse.body.asset.status === "approved", "Asset was not synced to approved.");
    result.assertions.push("review approval synced asset to approved");

    const publishedAt = new Date(now.getTime() + 1000).toISOString();
    const publishResponse = await fetchJson(`${rootBaseUrl}/api/publish-posts`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        campaignId: campaign.id,
        assetId: createdAsset.id,
        channel: "instagram",
        publishedAt,
        postUrl: `https://example.com/eastaura/content-pipeline/${encodeURIComponent(runId)}`,
        externalPostId: `qa_${runId}`,
        trackingCode: runId,
      }),
    });
    pushStep(result, "create_publish_post", publishResponse, {
      assetStatus: publishResponse.body?.asset?.status || null,
      publishStatus: publishResponse.body?.publishPost?.status || null,
    });
    expect(publishResponse.ok, "POST /api/publish-posts failed.");
    expect(publishResponse.body.publishPost.status === "published", "Publish post was not published.");
    expect(publishResponse.body.asset.status === "published", "Asset was not synced to published.");
    result.ids.publishPostId = publishResponse.body.publishPost.id;
    result.assertions.push("manual publish record synced asset to published");

    const intakeResponse = await fetchJson(`${rootBaseUrl}/api/intake`, {
      method: "POST",
      body: JSON.stringify({
        fullName: `Content Pipeline QA ${runId}`,
        email: `qa-content-${runId}@example.com`,
        country: "United States",
        ageRange: "35-44",
        goals: ["Stress recovery", "Sleep reset"],
        preferredTiming: "September 2026",
        budgetUsd: 2800,
        travelPartySize: 1,
        freeText:
          "Automated content pipeline verification lead. No urgent medical need; evaluating a guided wellness reset.",
        source: "instagram",
        campaign: campaign.name,
        utmSource: "instagram",
        utmMedium: "social",
        utmCampaign: runId,
        utmContent: createdAsset.id,
        consentToContact: true,
      }),
    });
    pushStep(result, "create_intake_with_utm", intakeResponse, {
      leadId: intakeResponse.body?.lead?.id || null,
      notificationCount: Array.isArray(intakeResponse.body?.notifications)
        ? intakeResponse.body.notifications.length
        : null,
    });
    expect(intakeResponse.ok, "POST /api/intake failed.");
    expect(intakeResponse.body.lead?.id, "Lead id missing from intake response.");
    result.ids.leadId = intakeResponse.body.lead.id;
    result.assertions.push("intake lead created with UTM/content source fields");

    const metricResponse = await fetchJson(`${rootBaseUrl}/api/content-metrics`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        campaignId: campaign.id,
        assetId: createdAsset.id,
        publishPostId: publishResponse.body.publishPost.id,
        leadId: intakeResponse.body.lead.id,
        occurredAt: new Date(now.getTime() + 2000).toISOString(),
        source: "instagram",
        channel: "instagram",
        metricType: "lead_submit",
        metricValue: 1,
        metadata: {
          runId,
          utmCampaign: runId,
          utmContent: createdAsset.id,
        },
      }),
    });
    pushStep(result, "create_lead_submit_metric", metricResponse, {
      tracked: metricResponse.body?.attribution?.tracked || false,
    });
    expect(metricResponse.ok, "POST /api/content-metrics failed.");
    expect(metricResponse.body.attribution?.tracked === true, "Metric attribution hint was not tracked.");
    result.ids.metricId = metricResponse.body.metric.id;
    result.assertions.push("lead_submit metric tracked with asset and lead ids");

    const attributionUrl = new URL(`${rootBaseUrl}/api/content-attribution`);
    attributionUrl.searchParams.set("campaignId", campaign.id);
    attributionUrl.searchParams.set("source", "instagram");
    attributionUrl.searchParams.set("channel", "instagram");
    const attributionResponse = await fetchJson(attributionUrl.toString(), {
      headers: adminHeaders,
    });
    pushStep(result, "get_content_attribution", attributionResponse, {
      leadsAttributed: attributionResponse.body?.leadsAttributed || 0,
      leadSubmitCount: attributionResponse.body?.byMetricType?.lead_submit || 0,
    });
    expect(attributionResponse.ok, "GET /api/content-attribution failed.");
    expect(
      attributionResponse.body.leadsAttributed >= 1,
      "Attribution did not count the test lead.",
    );
    expect(
      (attributionResponse.body.byMetricType?.lead_submit || 0) >= 1,
      "Attribution did not count lead_submit metric.",
    );
    result.attribution = {
      leadsAttributed: attributionResponse.body.leadsAttributed,
      byMetricType: attributionResponse.body.byMetricType,
      byCampaign: attributionResponse.body.byCampaign,
      bySource: attributionResponse.body.bySource,
      byChannel: attributionResponse.body.byChannel,
    };
    result.assertions.push("content attribution reports at least one attributed lead");

    result.status = "DONE";
    result.summary =
      "Content pipeline P0 verified: campaign -> content asset -> script -> storyboard -> review -> publish -> intake -> metric -> attribution.";
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 0;
  } catch (error) {
    result.status = "BLOCKED";
    result.summary = error instanceof Error ? error.message : String(error);
    result.error = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          cause: error.cause ? String(error.cause) : null,
          stack: error.stack || null,
        }
      : { message: String(error) };
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
  }
}

main();
