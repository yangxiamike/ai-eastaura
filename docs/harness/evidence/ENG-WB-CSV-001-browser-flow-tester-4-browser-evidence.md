# BROWSER_EVIDENCE

## 关联任务

- task_id: `ENG-WB-CSV-001`
- 验收来源: `docs/harness/ACCEPTANCE.md`
- 参考 API 报告: `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md`

## 目标测试岗位

`browser-flow-tester`

## 采集轮次

第 4 轮 / `browser-flow-tester-4`

## 执行者

Test Agent

## 浏览器执行方式

- Playwright / Cypress 命令: `node docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.cjs`
- 临时 probe 路径: `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.cjs`
- 结果 JSON: `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.results.json`
- 浏览器: Playwright `chromium` headless，使用根项目 `node_modules/playwright`
- 说明: probe 对 `/api/workbench/leads/*/export/` 请求只延迟 `route.continue()` 700ms，用于捕捉 `Exporting CSV...` 中间态；未 mock、未改写响应。

## 环境

- root URL: `http://127.0.0.1:3000`
- Workbench URL: `http://127.0.0.1:5182`
- dev server smoke:
  - `GET http://127.0.0.1:3000/api/health` -> `200`
  - `GET http://127.0.0.1:5182/workbench/` -> `200`
- viewport: `1440x1000`
- 测试数据:
  - 固定 lead: `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`
  - 动态真实 lead: `4edd10c5-c45e-486c-a5d2-36e997d3f555`
  - 不存在 lead: `00000000-0000-0000-0000-000000000000`

## 执行步骤

| 步骤 | 操作 | 期望 | 实际 | 证据 |
|------|------|------|------|------|
| 1 | smoke root health | `200` | `200`，body 显示 `ok=true`、`persistence=supabase`、`adminGuard=configured` | `probe.results.json -> smoke.rootHealth` |
| 2 | smoke Workbench 首页 | `200` | `200 OK`，返回 HTML | `probe.results.json -> smoke.workbench` |
| 3 | 打开固定 lead 页面 | 页面保持在 `/workbench/leads/4960.../`，导出按钮可见 | URL 未跳走，`Export CSV` 可见 | `probe.results.json -> flows[fixed]`，`probe.fixed.png` |
| 4 | 点击固定 lead `Export CSV` | 出现 `Exporting CSV...`，随后回到 `Export CSV` | `exportingObserved=true`，`exportCsvRestored=true`，下载事件出现 | `probe.results.json -> flows[fixed]`，`probe.fixed.csv` |
| 5 | 打开动态 lead 页面 | 页面保持在 `/workbench/leads/4edd.../`，导出按钮可见 | URL 未跳走，`Export CSV` 可见 | `probe.results.json -> flows[dynamic]`，`probe.dynamic.png` |
| 6 | 点击动态 lead `Export CSV` | 出现 `Exporting CSV...`，随后回到 `Export CSV` | `exportingObserved=true`，`exportCsvRestored=true`，下载事件出现 | `probe.results.json -> flows[dynamic]`，`probe.dynamic.csv` |
| 7 | 打开不存在 lead 页面 | 错误可收敛、不永久 loading、不出现可导出空 CSV 的按钮 | 页面不 loading；显示 warning；但仍渲染 Sarah Mitchell fallback 数据且 `Export CSV` 按钮可见 | `probe.results.json -> flows[missing]`，`probe.missing.png` |
| 8 | 检查浏览器请求边界 | 只请求 `/api/workbench/leads/{id}/export/`，不请求根 `/api/leads/export` | 两次导出响应 URL 均为 Workbench route；`anyRootLeadsExportRequest=false` | Playwright request/response listener，`probe.results.json -> network/security` |
| 9 | 检查浏览器侧 token 暴露 | URL/header/storage/cookie/页面文本/DOM 不出现 admin token、Authorization、Bearer | `anyAuthorizationOrBearerInBrowserRequestUrlOrHeaders=false`，`anySensitiveInStorageCookiesOrDom=false` | Playwright request listener + storage/cookie/DOM snapshot，`probe.results.json -> security` |
| 10 | 检查 console/pageerror | 正向点击流无阻断 error | `consoleErrorCount=0`，`pageErrorCount=0`；仅 React DevTools info 与 HMR log | `probe.results.json -> console/pageErrors/verdictHints` |

## 截图 / 页面快照

| 名称 | 路径 | 说明 |
|------|------|------|
| 固定 lead 导出后截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.png` | 固定 lead 页面点击后仍停留在 lead detail，按钮恢复 `Export CSV` |
| 动态 lead 导出后截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.png` | 动态 lead 页面点击后仍停留在 lead detail，按钮恢复 `Export CSV` |
| 不存在 lead 页面截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.missing.png` | URL 为不存在 UUID；页面显示 warning，同时仍展示 Sarah Mitchell fallback 详情和 `Export CSV` 按钮 |
| 页面文本快照 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.results.json` | `storageBeforeClick.bodyTextPrefix` / `storageAfterClick.bodyTextPrefix` / `flows[missing].bodyTextPrefix` |

## 网络请求摘要

| 请求 | 方法 | 状态 | 关键 header / payload | 说明 |
|------|------|------|------------------------|------|
| `/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/` | GET | 200 | `content-type: application/json` | 固定 lead detail 数据请求 |
| `/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/export/` | GET | 200 | `content-type: text/csv; charset=utf-8`; `content-disposition: attachment; filename="eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv"` | 固定 lead CSV 下载请求；浏览器网络记录来源为 Playwright response listener |
| `/api/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/` | GET | 200 | `content-type: application/json` | 动态 lead detail 数据请求 |
| `/api/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/export/` | GET | 200 | `content-type: text/csv; charset=utf-8`; `content-disposition: attachment; filename="eastaura-lead-notification-qa-20260428094648567-987l44.csv"` | 动态 lead CSV 下载请求；浏览器网络记录来源为 Playwright response listener |
| `/api/workbench/leads/00000000-0000-0000-0000-000000000000/` | GET | 200 | `content-type: application/json` | 不存在 lead 页面数据请求；页面随后显示 warning 与 fallback 数据 |
| 根 `/api/leads/export` | - | - | - | Playwright request listener 未记录到该请求；`anyRootLeadsExportRequest=false` |
| Authorization/Bearer/admin token | - | - | - | Playwright request listener 未在 URL/header 发现；storage/cookie/DOM 快照也未发现 |

## Console 摘要

| 级别 | 内容 | 是否阻断 |
|------|------|----------|
| info | React DevTools development 提示 | 否 |
| log | `[HMR] connected` | 否 |

- `consoleErrorCount=0`
- `pageErrorCount=0`

## 下载 / 跳转 / 状态变化

- 固定 lead:
  - 点击后观察到 `Exporting CSV...`
  - 下载保存到 `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.csv`
  - suggested filename: `eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv`
  - 最终 URL: `http://127.0.0.1:5182/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/`
  - 最终按钮文本: `Export CSV`
- 动态 lead:
  - 点击后观察到 `Exporting CSV...`
  - 下载保存到 `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.csv`
  - suggested filename: `eastaura-lead-notification-qa-20260428094648567-987l44.csv`
  - 最终 URL: `http://127.0.0.1:5182/workbench/leads/4edd10c5-c45e-486c-a5d2-36e997d3f555/`
  - 最终按钮文本: `Export CSV`
- 不存在 lead:
  - 最终 URL: `http://127.0.0.1:5182/workbench/leads/00000000-0000-0000-0000-000000000000/`
  - `loadingVisibleAfterSettle=false`
  - `exportButtonVisible=true`
  - 页面文本包含: `Lead detail returned a warning: Root API /api/leads/00000000-0000-0000-0000-000000000000 failed (404): Lead not found.`
  - 同页仍展示 `Sarah Mitchell` 详情与右侧 `Lead Actions` / `Export CSV` 按钮。

## Trace / Video / Test Result

| 类型 | 路径 | 说明 |
|------|------|------|
| Probe 脚本 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.cjs` | 临时 Playwright 证据采集脚本 |
| JSON 结果 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.results.json` | 完整网络、console、页面状态、security flags |
| CSV 下载 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.csv` | 固定 lead 下载产物，header + 当前 lead 一行 |
| CSV 下载 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.csv` | 动态 lead 下载产物，header + 当前 lead 一行 |
| 截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.fixed.png` | 固定 lead 页面 |
| 截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.dynamic.png` | 动态 lead 页面 |
| 截图 | `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-probe.missing.png` | 不存在 lead 页面 |

## 采集限制

- 本轮使用本地 dev server 与 Playwright headless Chromium，未验证远端部署。
- 为捕捉瞬时 loading 文案，probe 对 export 请求增加 700ms 继续前延迟；响应仍来自真实 Workbench route。
- 本轮未使用 Browser Use / iab；按当前新口径采用 Playwright-first。

## 给 Tester 的判定提示

- 正向固定 lead 与动态 lead 的点击、下载、URL 保持、console、网络边界和浏览器侧 token 暴露检查均有 Playwright 证据。
- 不存在 lead 页面没有永久 loading，但页面在显示 404 warning 后仍渲染 fallback lead 数据，并且 `Export CSV` 按钮可见；请按 `CSV-05` 和本轮“负向页不出现可导出空 CSV 的按钮”口径判定。
