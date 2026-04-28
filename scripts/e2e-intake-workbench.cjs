#!/usr/bin/env node

const { chromium } = require("playwright");

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function waitUntilNotLoading(page, loadingText, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const body = await page.textContent("body");
    if (!body.includes(loadingText)) {
      return body;
    }
    await page.waitForTimeout(1000);
  }
  return page.textContent("body");
}

async function main() {
  const rootBaseUrl = trimTrailingSlash(process.env.E2E_ROOT_URL || "http://127.0.0.1:3000");
  const workbenchBaseUrl = trimTrailingSlash(
    process.env.E2E_WORKBENCH_URL || "http://127.0.0.1:5182/workbench/"
  );

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const email = `qa+${stamp}@example.com`;
  const fullName = `QA Flow ${stamp}`;

  const result = {
    status: "IN_PROGRESS",
    config: {
      rootBaseUrl,
      workbenchBaseUrl,
    },
    intake: {},
    workbench: {},
    leadId: null,
    email,
    fullName,
    redirects308: [],
    consoleErrors: [],
    steps: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      result.consoleErrors.push(msg.text());
    }
  });

  page.on("response", (resp) => {
    if (resp.status() === 308) {
      result.redirects308.push({
        url: resp.url(),
        location: resp.headers().location || null,
      });
    }
  });

  try {
    result.steps.push("open_intake");
    await page.goto(`${rootBaseUrl}/intake`, { waitUntil: "domcontentloaded", timeout: 30000 });
    result.intake.url = page.url();
    result.intake.title = await page.title();

    await page.fill('input[name="fullName"]', fullName);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="country"]', "United States");
    await page.fill('input[name="phone"]', "+1 202 555 0188");
    await page.selectOption('select[name="ageRange"]', { label: "35-44" });
    await page.fill('input[name="travelWindow"]', "September 2026");
    await page.selectOption('select[name="travelParty"]', "solo");
    await page.selectOption('select[name="budget"]', "pilot");
    await page.check('input[name="goals"][value="Stress recovery"]');
    await page.check('input[name="goals"][value="Sleep reset"]');
    await page.check('input[name="risks"][value="None of the above"]');
    await page.fill('textarea[name="message"]', "Playwright acceptance flow submission.");
    await page.check('input[name="privacyConsent"]');
    await page.check('input[name="nonMedicalConsent"]');

    result.steps.push("submit_intake");
    await Promise.all([
      page.waitForURL(/\/thank-you(\?|$)/, { timeout: 90000 }),
      page.click('button[type="submit"]'),
    ]);

    result.intake.afterSubmitUrl = page.url();
    result.intake.afterSubmitTitle = await page.title();
    result.intake.thankYouSnippet = ((await page.textContent("main")) || "").slice(0, 220);

    const leadId = new URL(page.url()).searchParams.get("leadId");
    result.leadId = leadId;

    result.steps.push("open_workbench_dashboard");
    await page.goto(`${workbenchBaseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const dashboardBody = await waitUntilNotLoading(page, "Loading dashboard data...");
    result.workbench.dashboard = {
      url: page.url(),
      title: await page.title(),
      loaded: !dashboardBody.includes("Loading dashboard data..."),
      snippet: dashboardBody.slice(0, 220),
    };

    result.steps.push("open_workbench_leads");
    await page.goto(`${workbenchBaseUrl}/leads/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const leadsBody = await waitUntilNotLoading(page, "Loading leads...");
    const leadVisible = Boolean(
      (leadId && leadsBody.includes(leadId)) || leadsBody.includes(email)
    );
    result.workbench.leads = {
      url: page.url(),
      title: await page.title(),
      loaded: !leadsBody.includes("Loading leads..."),
      leadVisible,
      snippet: leadsBody.slice(0, 220),
    };

    result.steps.push("open_workbench_lead_detail");
    if (!leadId) {
      throw new Error("No leadId found in thank-you URL.");
    }
    await page.goto(`${workbenchBaseUrl}/leads/${encodeURIComponent(leadId)}/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const detailBody = await waitUntilNotLoading(page, "Loading lead detail...");
    result.workbench.detail = {
      url: page.url(),
      title: await page.title(),
      loaded: !detailBody.includes("Loading lead detail..."),
      detailHasName: detailBody.includes(fullName),
      detailHasEmail: detailBody.includes(email),
      detailHasLeadId: detailBody.includes(leadId),
      snippet: detailBody.slice(0, 220),
    };

    result.steps.push("open_workbench_notifications");
    await page.goto(`${workbenchBaseUrl}/notifications/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const notificationsBody = await waitUntilNotLoading(page, "Loading notifications...");
    const notificationVisible =
      notificationsBody.includes(fullName) ||
      notificationsBody.includes(email) ||
      notificationsBody.includes(leadId);
    result.workbench.notifications = {
      url: page.url(),
      title: await page.title(),
      loaded: !notificationsBody.includes("Loading notifications..."),
      notificationVisible,
      snippet: notificationsBody.slice(0, 220),
    };

    const pass =
      /\/thank-you/.test(result.intake.afterSubmitUrl || "") &&
      result.workbench.dashboard.loaded &&
      result.workbench.leads.loaded &&
      result.workbench.leads.leadVisible &&
      result.workbench.detail.loaded &&
      (result.workbench.detail.detailHasName || result.workbench.detail.detailHasEmail) &&
      result.workbench.notifications.loaded &&
      result.workbench.notifications.notificationVisible;

    result.status = pass ? "DONE" : "DONE_WITH_CONCERNS";
  } catch (error) {
    result.status = "BLOCKED";
    result.error =
      error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === "DONE" ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

