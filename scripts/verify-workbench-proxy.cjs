#!/usr/bin/env node

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    url,
    body,
  };
}

async function main() {
  const uiBaseUrl = trimTrailingSlash(
    process.env.E2E_WORKBENCH_URL || "http://127.0.0.1:5182/workbench",
  );
  const apiBaseUrl = new URL(uiBaseUrl).origin;

  const checks = [
    { name: "dashboard", path: "/api/workbench/dashboard/" },
    { name: "leads", path: "/api/workbench/leads/" },
    { name: "notifications", path: "/api/workbench/notifications/" },
    { name: "content_assets", path: "/api/workbench/content-assets/" },
    { name: "review_tasks", path: "/api/workbench/review-tasks/" },
    { name: "content_attribution", path: "/api/workbench/content-attribution/" },
  ];

  const result = {
    status: "IN_PROGRESS",
    uiBaseUrl,
    apiBaseUrl,
    checkedAt: new Date().toISOString(),
    checks: [],
  };

  for (const check of checks) {
    const response = await fetchJson(`${apiBaseUrl}${check.path}`);
    const usingFallback = Boolean(response.body && response.body.usingFallback === true);
    const errorMessage =
      response.body && typeof response.body.error === "string"
        ? response.body.error
        : null;

    result.checks.push({
      name: check.name,
      url: response.url,
      httpStatus: response.status,
      ok: response.ok,
      usingFallback,
      error: errorMessage,
    });
  }

  const failedChecks = result.checks.filter((item) => !item.ok);
  const fallbackChecks = result.checks.filter((item) => item.usingFallback);

  if (failedChecks.length > 0) {
    result.status = "BLOCKED";
    result.summary = `HTTP failed checks: ${failedChecks.map((item) => item.name).join(", ")}`;
  } else if (fallbackChecks.length > 0) {
    result.status = "DONE_WITH_CONCERNS";
    result.summary = `Fallback detected: ${fallbackChecks.map((item) => item.name).join(", ")}`;
  } else {
    result.status = "DONE";
    result.summary = "All checked workbench proxy endpoints are healthy and not using fallback.";
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
