const { chromium } = require('playwright');

(async () => {
  const result = {
    status: 'DONE',
    steps: [],
    consoleErrors: [],
    redirects308: [],
    leadId: null,
  };

  function pushStep(name, ok, extra = {}) {
    result.steps.push({ name, ok, ...extra });
    if (!ok && result.status === 'DONE') result.status = 'DONE_WITH_CONCERNS';
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      args: ['--no-sandbox'],
    });
  } catch (e) {
    result.status = 'BLOCKED';
    result.error = 'Launch failed: ' + String(e && e.message ? e.message : e);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      result.consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('response', (resp) => {
    if (resp.status() === 308) {
      result.redirects308.push({
        url: resp.url(),
        location: resp.headers()['location'] || null,
      });
    }
  });

  try {
    await page.goto('http://127.0.0.1:3000/intake', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    pushStep('打开 /intake', true, { url: page.url(), title: await page.title() });

    const email = `qa+${Date.now()}@example.com`;

    const fillByLabel = async (label, value) => {
      const loc = page.getByLabel(label, { exact: false }).first();
      if ((await loc.count()) > 0) {
        await loc.fill(value);
        return true;
      }
      return false;
    };

    const typed = [];
    if (await fillByLabel('First name', 'QA')) typed.push('First name');
    if (await fillByLabel('Last name', 'Runner')) typed.push('Last name');
    if (await fillByLabel('Email', email)) typed.push('Email');
    if (await fillByLabel('Phone', '+1 202 555 0123')) typed.push('Phone');
    if (await fillByLabel('Country', 'United States')) typed.push('Country');
    if (await fillByLabel('Goals', 'Stress recovery and sleep reset')) typed.push('Goals');
    if (await fillByLabel('Notes', 'E2E QA submission')) typed.push('Notes');

    const emailInput = page.locator('input[type="email"]').first();
    if ((await emailInput.count()) > 0) {
      await emailInput.fill(email);
      if (!typed.includes('Email')) typed.push('Email(type=email)');
    }

    let submitClicked = false;
    const submitCandidates = [
      page.getByRole('button', { name: /submit|send|book|start|continue|request/i }).first(),
      page.locator('button[type="submit"]').first(),
      page.locator('input[type="submit"]').first(),
    ];

    for (const btn of submitCandidates) {
      if ((await btn.count()) > 0) {
        await btn.click();
        submitClicked = true;
        break;
      }
    }

    if (!submitClicked) {
      pushStep('填写并提交线索', false, { reason: '未找到提交按钮', fieldsFilled: typed });
    } else {
      await page.waitForURL(/\/thank-you/i, { timeout: 30000 }).catch(() => {});
      const current = page.url();
      const title = await page.title();
      let leadId = null;
      try {
        const u = new URL(current);
        leadId = u.searchParams.get('leadId') || u.searchParams.get('leadid') || u.searchParams.get('id');
      } catch {}
      result.leadId = leadId;

      const visibleText = (await page.locator('main,body').innerText()).slice(0, 600);
      const ok = /thank-you/i.test(current) || /thank you/i.test(visibleText);
      pushStep('提交后跳转 /thank-you 并记录 leadId', ok, {
        url: current,
        title,
        leadId,
        email,
        fieldsFilled: typed,
        visibleSnippet: visibleText,
      });
    }

    await page.goto('http://127.0.0.1:5182/workbench/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    pushStep('打开 Workbench', true, { url: page.url(), title: await page.title() });

    async function navTo(nameRegex) {
      const link = page.getByRole('link', { name: nameRegex }).first();
      if ((await link.count()) > 0) {
        await link.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        return true;
      }
      const button = page.getByRole('button', { name: nameRegex }).first();
      if ((await button.count()) > 0) {
        await button.click();
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        return true;
      }
      return false;
    }

    const dashboardOk = await navTo(/dashboard|总览|仪表盘/i);
    pushStep('Dashboard 页面检查', dashboardOk, {
      url: page.url(),
      title: await page.title(),
      textSnippet: (await page.locator('body').innerText()).slice(0, 400),
    });

    const leadsOk = await navTo(/leads|线索/i);
    let leadsBody = '';
    let leadVisible = false;
    if (leadsOk) {
      await page.waitForTimeout(1000);
      leadsBody = await page.locator('body').innerText();
      const email = result.steps.find((s) => s.name.includes('提交后跳转'))?.email;
      if (result.leadId && leadsBody.includes(result.leadId)) leadVisible = true;
      if (!leadVisible && email && leadsBody.toLowerCase().includes(email.toLowerCase())) leadVisible = true;
    }
    pushStep('Leads 页面检查（含新线索可见性）', leadsOk && leadVisible, {
      url: page.url(),
      title: await page.title(),
      leadVisible,
      textSnippet: leadsBody.slice(0, 700),
    });

    let detailOk = false;
    let detailText = '';
    const detailLink = page.locator('a[href*="/workbench/leads/"]').first();
    if ((await detailLink.count()) > 0) {
      await detailLink.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      detailText = (await page.locator('body').innerText()).slice(0, 900);
      const email = result.steps.find((s) => s.name.includes('提交后跳转'))?.email;
      detailOk = !!(email && detailText.toLowerCase().includes(email.toLowerCase())) || (result.leadId && detailText.includes(result.leadId));
    }
    pushStep('Lead Detail 页面检查（新线索）', detailOk, {
      url: page.url(),
      title: await page.title(),
      textSnippet: detailText,
    });

    const notifOk = await navTo(/notifications|通知/i);
    let notifText = '';
    let notifVisible = false;
    if (notifOk) {
      notifText = (await page.locator('body').innerText()).slice(0, 1200);
      const email = result.steps.find((s) => s.name.includes('提交后跳转'))?.email;
      if (result.leadId && notifText.includes(result.leadId)) notifVisible = true;
      if (!notifVisible && email && notifText.toLowerCase().includes(email.toLowerCase())) notifVisible = true;
    }
    pushStep('Notifications 页面检查（新线索通知）', notifOk && notifVisible, {
      url: page.url(),
      title: await page.title(),
      notifVisible,
      textSnippet: notifText,
    });
  } catch (e) {
    result.status = 'BLOCKED';
    result.error = String(e && e.stack ? e.stack : e);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(result, null, 2));
})();
