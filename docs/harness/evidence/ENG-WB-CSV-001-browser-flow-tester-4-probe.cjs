const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const TASK = 'ENG-WB-CSV-001';
const ROOT_URL = 'http://127.0.0.1:3000';
const WORKBENCH_URL = 'http://127.0.0.1:5182';
const FIXED_LEAD = '4960b5ca-dbef-4d75-b5cf-08e58adc01b1';
const DYNAMIC_LEAD = '4edd10c5-c45e-486c-a5d2-36e997d3f555';
const MISSING_LEAD = '00000000-0000-0000-0000-000000000000';
const SENSITIVE = [/EASTAURA_ADMIN_API_TOKEN/i, /authorization/i, /Bearer/i];
const ROOT_EXPORT = /\/api\/leads\/export/i;

function nowIso() {
  return new Date().toISOString();
}

function hasSensitive(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return SENSITIVE.some((pattern) => pattern.test(text));
}

function hasRootExport(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return ROOT_EXPORT.test(text);
}

function redactHeaders(headers) {
  const safe = {};
  for (const [name, value] of Object.entries(headers || {})) {
    if (/cookie/i.test(name)) {
      safe[name] = `[redacted length=${String(value || '').length}]`;
    } else {
      safe[name] = value;
    }
  }
  return safe;
}

async function smoke() {
  const health = await fetch(`${ROOT_URL}/api/health`);
  const workbench = await fetch(`${WORKBENCH_URL}/workbench/`);
  return {
    rootHealth: { status: health.status, ok: health.ok, bodyPrefix: (await health.text()).slice(0, 180) },
    workbench: { status: workbench.status, ok: workbench.ok, bodyPrefix: (await workbench.text()).slice(0, 120) },
  };
}

async function storageSnapshot(page, context) {
  const localStorage = await page.evaluate(() => Object.fromEntries(Object.entries(window.localStorage)));
  const sessionStorage = await page.evaluate(() => Object.fromEntries(Object.entries(window.sessionStorage)));
  const cookies = await context.cookies();
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const dom = await page.content().catch(() => '');
  return {
    localStorageKeys: Object.keys(localStorage),
    sessionStorageKeys: Object.keys(sessionStorage),
    cookieNames: cookies.map((cookie) => cookie.name),
    sensitiveInLocalStorage: hasSensitive(localStorage),
    sensitiveInSessionStorage: hasSensitive(sessionStorage),
    sensitiveInCookies: cookies.some((cookie) => hasSensitive(cookie.name) || hasSensitive(cookie.value)),
    sensitiveInBodyText: hasSensitive(bodyText),
    sensitiveInDom: hasSensitive(dom),
    rootExportInBodyText: hasRootExport(bodyText),
    rootExportInDom: hasRootExport(dom),
    bodyTextPrefix: bodyText.slice(0, 500),
  };
}

async function runLeadFlow(page, context, label, leadId) {
  const url = `${WORKBENCH_URL}/workbench/leads/${leadId}/`;
  const startedAt = nowIso();
  const result = {
    label,
    leadId,
    url,
    startedAt,
    status: 'UNKNOWN',
    steps: [],
    exports: [],
    storageBeforeClick: null,
    storageAfterClick: null,
    screenshot: path.join(OUT_DIR, `ENG-WB-CSV-001-browser-flow-tester-4-probe.${label}.png`),
    downloadPath: null,
    finalUrl: null,
    finalButtonText: null,
    buttonVisibleBeforeClick: false,
    buttonVisibleAfterClick: false,
    exportingObserved: false,
    exportCsvRestored: false,
  };

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  result.steps.push({ at: nowIso(), action: 'goto', actualUrl: page.url() });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch((error) => {
    result.steps.push({ at: nowIso(), action: 'networkidle timeout', message: error.message });
  });

  const button = page.getByRole('button', { name: /^Export CSV$/ });
  result.buttonVisibleBeforeClick = await button.isVisible({ timeout: 10000 }).catch(() => false);
  result.storageBeforeClick = await storageSnapshot(page, context);
  if (!result.buttonVisibleBeforeClick) {
    result.status = 'FAIL';
    result.steps.push({ at: nowIso(), action: 'button visible', result: false });
    await page.screenshot({ path: result.screenshot, fullPage: true });
    result.finalUrl = page.url();
    return result;
  }

  const exportResponsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/workbench/leads/${leadId}/export/`),
    { timeout: 20000 }
  );
  const downloadPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);

  await button.click({ timeout: 10000 });
  result.steps.push({ at: nowIso(), action: 'click Export CSV' });
  result.exportingObserved = await page.getByRole('button', { name: /^Exporting CSV\.\.\.$/ }).isVisible({ timeout: 5000 }).catch(() => false);
  result.steps.push({ at: nowIso(), action: 'observe Exporting CSV...', result: result.exportingObserved });

  const exportResponse = await exportResponsePromise.catch((error) => ({ error }));
  if (exportResponse.error) {
    result.steps.push({ at: nowIso(), action: 'wait export response', error: exportResponse.error.message });
  } else {
    result.exports.push({
      url: exportResponse.url(),
      status: exportResponse.status(),
      ok: exportResponse.ok(),
      contentType: exportResponse.headers()['content-type'] || null,
      contentDisposition: exportResponse.headers()['content-disposition'] || null,
    });
  }

  const download = await downloadPromise;
  if (download) {
    result.downloadPath = path.join(OUT_DIR, `ENG-WB-CSV-001-browser-flow-tester-4-probe.${label}.csv`);
    await download.saveAs(result.downloadPath);
    result.steps.push({ at: nowIso(), action: 'download event', suggestedFilename: download.suggestedFilename(), savedAs: result.downloadPath });
  } else {
    result.steps.push({ at: nowIso(), action: 'download event', result: 'not observed by Playwright within timeout' });
  }

  result.exportCsvRestored = await page.getByRole('button', { name: /^Export CSV$/ }).isEnabled({ timeout: 10000 }).catch(() => false);
  result.buttonVisibleAfterClick = await page.getByRole('button', { name: /^Export CSV$/ }).isVisible({ timeout: 10000 }).catch(() => false);
  result.finalButtonText = await page.getByRole('button', { name: /Export/ }).first().innerText({ timeout: 5000 }).catch(() => null);
  result.finalUrl = page.url();
  result.storageAfterClick = await storageSnapshot(page, context);
  await page.screenshot({ path: result.screenshot, fullPage: true });

  result.status = result.exportingObserved && result.exportCsvRestored && result.finalUrl === url && result.exports.some((entry) => entry.status === 200) ? 'PASS' : 'FAIL';
  return result;
}

async function runMissingLeadFlow(page, context) {
  const label = 'missing';
  const url = `${WORKBENCH_URL}/workbench/leads/${MISSING_LEAD}/`;
  const result = {
    label,
    leadId: MISSING_LEAD,
    url,
    status: 'UNKNOWN',
    steps: [],
    screenshot: path.join(OUT_DIR, `ENG-WB-CSV-001-browser-flow-tester-4-probe.${label}.png`),
    finalUrl: null,
    exportButtonVisible: null,
    loadingVisibleAfterSettle: null,
    bodyTextPrefix: null,
    storage: null,
  };

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  result.steps.push({ at: nowIso(), action: 'goto', actualUrl: page.url() });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch((error) => {
    result.steps.push({ at: nowIso(), action: 'networkidle timeout', message: error.message });
  });
  await page.waitForTimeout(1500);

  const exportButton = page.getByRole('button', { name: /^Export CSV$/ });
  result.exportButtonVisible = await exportButton.isVisible({ timeout: 2000 }).catch(() => false);
  result.loadingVisibleAfterSettle = await page.getByText(/loading/i).isVisible({ timeout: 1000 }).catch(() => false);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  result.bodyTextPrefix = bodyText.slice(0, 1000);
  result.finalUrl = page.url();
  result.storage = await storageSnapshot(page, context);
  await page.screenshot({ path: result.screenshot, fullPage: true });
  result.status = !result.exportButtonVisible && !result.loadingVisibleAfterSettle ? 'PASS' : 'FAIL';
  return result;
}

(async () => {
  const result = {
    task: TASK,
    role: 'browser-flow-tester',
    startedAt: nowIso(),
    finishedAt: null,
    smoke: null,
    browser: 'chromium headless via Playwright package from root node_modules',
    viewport: { width: 1440, height: 1000 },
    routeDelayMs: 700,
    flows: [],
    network: { requests: [], responses: [] },
    console: [],
    pageErrors: [],
    security: {},
    verdictHints: {},
  };

  result.smoke = await smoke();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: result.viewport });
  const page = await context.newPage();

  await page.route('**/api/workbench/leads/*/export/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, result.routeDelayMs));
    await route.continue();
  });

  page.on('console', (message) => {
    result.console.push({ type: message.type(), text: message.text(), location: message.location() });
  });
  page.on('pageerror', (error) => {
    result.pageErrors.push({ name: error.name, message: error.message, stack: error.stack });
  });
  page.on('request', (request) => {
    const headers = request.headers();
    result.network.requests.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      sensitiveInUrl: hasSensitive(request.url()),
      sensitiveInHeaders: hasSensitive(headers),
      rootExportInUrl: hasRootExport(request.url()),
      rootExportInHeaders: hasRootExport(headers),
      headers: redactHeaders(headers),
    });
  });
  page.on('response', (response) => {
    const req = response.request();
    result.network.responses.push({
      method: req.method(),
      url: response.url(),
      status: response.status(),
      ok: response.ok(),
      contentType: response.headers()['content-type'] || null,
      contentDisposition: response.headers()['content-disposition'] || null,
      rootExportInUrl: hasRootExport(response.url()),
    });
  });

  try {
    result.flows.push(await runLeadFlow(page, context, 'fixed', FIXED_LEAD));
    result.flows.push(await runLeadFlow(page, context, 'dynamic', DYNAMIC_LEAD));
    result.flows.push(await runMissingLeadFlow(page, context));
  } finally {
    await browser.close();
  }

  const allRequestsText = JSON.stringify(result.network.requests);
  const allStorageText = JSON.stringify(result.flows.map((flow) => [flow.storageBeforeClick, flow.storageAfterClick, flow.storage]).filter(Boolean));
  const positiveConsoleErrors = result.console.filter((entry) => entry.type === 'error');
  result.security = {
    browserRequestCount: result.network.requests.length,
    browserResponseCount: result.network.responses.length,
    anyAuthorizationOrBearerInBrowserRequestUrlOrHeaders: result.network.requests.some((entry) => entry.sensitiveInUrl || entry.sensitiveInHeaders),
    anyRootLeadsExportRequest: result.network.requests.some((entry) => entry.rootExportInUrl || entry.rootExportInHeaders),
    anySensitiveInStorageCookiesOrDom: hasSensitive(allStorageText),
    anyRootExportInDom: result.flows.some((flow) => flow.storageBeforeClick?.rootExportInDom || flow.storageAfterClick?.rootExportInDom || flow.storage?.rootExportInDom),
  };
  result.verdictHints = {
    positiveFlowsPass: result.flows.filter((flow) => flow.label !== 'missing').every((flow) => flow.status === 'PASS'),
    missingFlowPass: result.flows.find((flow) => flow.label === 'missing')?.status === 'PASS',
    consoleErrorCount: positiveConsoleErrors.length,
    pageErrorCount: result.pageErrors.length,
    noBrowserTokenExposure: !result.security.anyAuthorizationOrBearerInBrowserRequestUrlOrHeaders && !result.security.anySensitiveInStorageCookiesOrDom,
    noRootExportRequest: !result.security.anyRootLeadsExportRequest,
  };
  result.finishedAt = nowIso();

  const outputPath = path.join(OUT_DIR, 'ENG-WB-CSV-001-browser-flow-tester-4-probe.results.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(outputPath);
  console.log(JSON.stringify(result.verdictHints, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
