# TEST_REPORT: browser-flow-tester

## 任务

- task_id: `ENG-WB-CSV-001`
- 测试岗位: `browser-flow-tester`
- 时间: `2026-05-01 17:09 +08:00`
- 结果: `PASS`

## 执行方式

按 Playwright-first 口径执行。项目内未发现本任务专用现成 Playwright/Cypress 脚本，因此在 `docs/harness/evidence/` 下创建第 5 轮独立临时 Playwright probe：

```powershell
Invoke-WebRequest 'http://127.0.0.1:3000/api/health' -UseBasicParsing
Invoke-WebRequest 'http://127.0.0.1:5182/workbench/' -UseBasicParsing
node 'D:\work\ai-eastaura\docs\harness\evidence\ENG-WB-CSV-001-browser-flow-tester-5-probe.cjs'
```

沙箱内首次启动 Chromium 出现 `spawn EPERM`，随后按权限要求使用同一 node 命令在本机权限下运行成功。证据包：`docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md`。

## 结论

第 5 轮 browser flow 复验通过。固定 lead 与动态真实 lead 的 CSV export 点击流均满足关键正向要求；不存在 lead 页面已收敛为 `Lead not found` 空状态，不再展示 fallback `Sarah Mitchell`，也不渲染 `Export CSV` 按钮。

## 正向证据摘要

### 固定 lead

- URL: `http://127.0.0.1:5182/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/`
- 点击 `Export CSV` 后观察到 `Exporting CSV...`
- 随后按钮恢复为 `Export CSV`
- 页面 URL 未跳走
- Playwright download event 出现，保存 `ENG-WB-CSV-001-browser-flow-tester-5-probe.fixed.csv`
- 浏览器 response listener 记录：`GET http://127.0.0.1:5182/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/export/` -> `200`, `text/csv; charset=utf-8`

### 动态真实 lead

- URL: `http://127.0.0.1:5182/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/`
- 点击 `Export CSV` 后观察到 `Exporting CSV...`
- 随后按钮恢复为 `Export CSV`
- 页面 URL 未跳走
- Playwright download event 出现，保存 `ENG-WB-CSV-001-browser-flow-tester-5-probe.dynamic.csv`
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

## 负向页面复验

不存在 lead: `00000000-0000-0000-0000-000000000000`

- 页面 URL: `http://127.0.0.1:5182/workbench/leads/00000000-0000-0000-0000-000000000000/`
- 页面没有永久 loading: `loadingVisibleAfterSettle=false`
- 页面显示 `Lead not found`: `leadNotFoundVisible=true`
- 页面不再展示 fallback lead `Sarah Mitchell`: `sarahMitchellVisible=false`
- `Export CSV` 按钮不可见: `exportButtonVisible=false`
- 截图: `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.missing.png`

## Acceptance 覆盖

- CSV-01: 固定 lead 与动态真实 lead 页面均出现 CSV export 按钮，正向可点击。
- CSV-02: 正向点击只请求 Workbench proxy export route，未请求根 `/api/leads/export`。
- CSV-04 / CSV-SEC-01 浏览器侧: 未发现 admin token / Authorization / Bearer 暴露。
- CSV-UI-01: 正向点击不阻断页面，按钮状态恢复。
- CSV-05: 不存在 lead 页面错误可收敛，不永久 loading，不展示 fallback `Sarah Mitchell`，不出现可导出空 CSV 的按钮。

## 剩余风险

- 本轮只验证本地 dev server，未验证远端部署。
- Probe 为捕捉 `Exporting CSV...` 对 export 请求做 700ms 延迟继续；未 mock 响应，但会影响请求耗时。

---YAML_START---
status: PASS
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
role: "browser-flow-tester"
output_paths:
  - "docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md"
changed_files:
  - "docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.cjs"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.results.json"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.fixed.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.dynamic.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.missing.png"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.fixed.csv"
  - "docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-probe.dynamic.csv"
summary: "Playwright browser-flow round 5 passed. Fixed and dynamic lead CSV exports worked through /api/workbench/leads/{id}/export/ with loading state, restored button, downloads, no console errors, and no browser-side token/root export exposure. Missing lead page now shows Lead not found, does not show Sarah Mitchell, and does not render Export CSV."
risks: []
next_action: "browser-flow-tester-5 PASS; Coordinator can combine with current api-contract-tester PASS evidence and proceed to the next harness gate if no newer blocking evidence exists."
---YAML_END---
