# TEST_REPORT: browser-flow-tester

## 任务

- task_id: `ENG-WB-CSV-001`
- 测试岗位: `browser-flow-tester`
- 时间: `2026-05-01 17:01 +08:00`
- 结果: `FAIL`

## 执行方式

按本轮 Playwright-first 口径执行。项目内未发现现成 Playwright/Cypress 配置或脚本，因此在 `docs/harness/evidence/` 下创建临时 Playwright probe：

```powershell
Invoke-WebRequest 'http://127.0.0.1:3000/api/health' -UseBasicParsing
Invoke-WebRequest 'http://127.0.0.1:5182/workbench/' -UseBasicParsing
node 'D:\work\ai-eastaura\docs\harness\evidence\ENG-WB-CSV-001-browser-flow-tester-4-probe.cjs'
```

证据包：`docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-browser-evidence.md`

## 结论

本轮可执行，不是 BLOCKED。固定 lead 与动态真实 lead 的 CSV export 点击流均满足关键正向要求；但不存在 lead 页面不满足负向验收：页面显示 404 warning 后仍渲染 fallback lead `Sarah Mitchell`，并且 `Export CSV` 按钮可见。

该行为违反本轮必测项 7：不存在 lead 页面必须错误可收敛、不永久 loading、不出现可导出空 CSV 的按钮。因此 `browser-flow-tester-4` 判定为 `FAIL`。

## 正向证据摘要

### 固定 lead

- URL: `http://127.0.0.1:5182/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/`
- 点击 `Export CSV` 后观察到 `Exporting CSV...`
- 随后按钮恢复为 `Export CSV`
- 页面 URL 未跳走
- Playwright download event 出现，保存 `ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.csv`
- 浏览器 response listener 记录：`GET http://127.0.0.1:5182/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/export/` -> `200`, `text/csv; charset=utf-8`

### 动态真实 lead

- URL: `http://127.0.0.1:5182/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/`
- 点击 `Export CSV` 后观察到 `Exporting CSV...`
- 随后按钮恢复为 `Export CSV`
- 页面 URL 未跳走
- Playwright download event 出现，保存 `ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.csv`
- 浏览器 response listener 记录：`GET http://127.0.0.1:5182/api/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/export/` -> `200`, `text/csv; charset=utf-8`

## 网络与安全边界

证据来源：Playwright `request` / `response` listener、storage/cookie/DOM 快照。

- 导出请求均为 `/api/workbench/leads/{id}/export/`
- 未观察到浏览器请求根 `/api/leads/export`
- `anyRootLeadsExportRequest=false`
- 浏览器请求 URL/header 未出现 `EASTAURA_ADMIN_API_TOKEN` / `Authorization` / `Bearer`
- localStorage/sessionStorage/cookie/page text/DOM 快照未出现敏感 token 关键词
- `anyAuthorizationOrBearerInBrowserRequestUrlOrHeaders=false`
- `anySensitiveInStorageCookiesOrDom=false`

## Console / 卡死检查

- `consoleErrorCount=0`
- `pageErrorCount=0`
- Console 仅有 React DevTools development info 和 HMR log
- 两条正向页面点击后均未卡死，URL 未跳走，按钮恢复可用

## 负向失败证据

不存在 lead: `00000000-0000-0000-0000-000000000000`

- 页面 URL: `http://127.0.0.1:5182/workbench/leads/00000000-0000-0000-0000-000000000000/`
- 页面没有永久 loading: `loadingVisibleAfterSettle=false`
- 页面显示 warning: `Root API /api/leads/00000000-0000-0000-0000-000000000000 failed (404): Lead not found.`
- 但同一页面仍展示 fallback lead `Sarah Mitchell`
- 右侧 `Lead Actions` 中 `Export CSV` 按钮仍可见: `exportButtonVisible=true`
- 截图: `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.missing.png`

## Acceptance 覆盖

- CSV-01: 固定 lead 与动态 lead 页面均出现 CSV export 按钮，正向可点击。
- CSV-02: 正向点击只请求 Workbench proxy export route，未请求根 `/api/leads/export`。
- CSV-04 / CSV-SEC-01 浏览器侧: 未发现 admin token / Authorization / Bearer 暴露。
- CSV-UI-01: 正向点击不阻断页面，按钮状态恢复。
- CSV-05: `FAIL`。不存在 lead 页面错误没有永久 loading，但仍展示 fallback lead 与可见 `Export CSV` 按钮，不符合负向页面不得出现可导出空 CSV 按钮的要求。

## 剩余风险

- 本轮只验证本地 dev server，未验证远端部署。
- Probe 为捕捉 `Exporting CSV...` 对 export 请求做 700ms 延迟继续；未 mock 响应，但会影响请求耗时。

---YAML_START---
status: FAIL
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
role: "browser-flow-tester"
output_paths:
  - "docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-browser-evidence.md"
changed_files:
  - "docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-browser-evidence.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.cjs"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.results.json"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.missing.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.csv"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.csv"
summary: "Playwright browser-flow completed. Positive fixed/dynamic lead CSV exports worked through /api/workbench/leads/{id}/export/ with loading state, restored button, downloads, no console errors, and no browser-side token/root export exposure. Negative missing lead page failed because it still rendered fallback Sarah Mitchell data and a visible Export CSV button after a 404 warning."
risks:
  - "Probe delayed export route.continue() by 700ms only to capture the transient Exporting CSV state; response was not mocked."
next_action: "Return to implementation owner to fix missing-lead Lead Detail behavior so 404 state does not render fallback exportable data/button, then rerun browser-flow-tester."
---YAML_END---
