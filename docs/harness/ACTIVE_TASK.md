# ACTIVE_TASK

## 任务 ID

`ENG-WB-CSV-001`

## 任务领域

`ENGINEERING`

## 任务类型

`demo_ready`

## 任务目标

为 Workbench Lead Detail 增加当前 lead 的 CSV export 能力。

## 本轮只解决

本轮按用户要求调用子 Agent 执行完整 harness 流程，重点收口之前未完成的 browser flow。

- `api-contract-tester-3`: PASS。
- `browser-flow-tester-4`: FAIL。Playwright-first browser flow 可执行；固定 lead 与动态 lead 导出通过，但不存在 lead 页面在 root 404 后仍展示 fallback `Sarah Mitchell` 与 `Export CSV`。
- Dev 修复：在 Lead Detail 页面识别 `usingFallback` 且响应 lead id 与 URL id 不一致的情况，进入 `Lead not found` 空状态，避免渲染 fallback lead 和导出按钮。
- `browser-flow-tester-5`: PASS。固定 lead、动态 lead、请求边界、浏览器侧 token 暴露、console/pageerror、下载状态和不存在 lead 页面均通过。
- Coordinator 静态验证：`npm run lint` PASS，`npx tsc --noEmit` PASS，harness `rg` 与 `git status --short` 已执行。
- GitHub Gate 已尝试启动；remote 已配置，但 `gh` 未登录且 push 未成功，当前阻塞在 GitHub Gate auth/push。

## 对应 PRD 条目

- `PRD.md`：目标、用户故事、MVP 范围、暂不做、成功标准。

## 输入文件

- `docs/harness/PRD.md`
- `docs/harness/ENGINEERING_BASELINE.md`
- `docs/harness/ACCEPTANCE.md`
- `docs/harness/BUILD_PLAN.md`
- `docs/harness/ARCH_BOUNDARY.md`
- `docs/harness/ENG-WB-CSV-001_NEXT_AGENT_RUN.md`

## 主要依据

- Workbench 位于 `workbecnch-ui-2/app-old/`。
- Lead Detail 页面位于 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`。
- Workbench 浏览器侧只访问 `/api/workbench/*`。
- Workbench 服务端通过 `fetchRootApi()` 访问根 API 并服务端注入 admin token。
- 根项目已有 `GET /api/leads/export`，但不明显支持 `id` 精确筛选。
- Browser-flow 岗位采用 Playwright-first，由 Test 子 Agent 自己运行项目脚本或临时 probe。

## 只作参考

- `D:/智能体循环/eastaura/records/dry-runs/LeadDetailCSVExportHarness演练记录.md`
- `D:/智能体循环/eastaura/testing/tester-cards/api-contract-tester.md`
- `D:/智能体循环/eastaura/testing/tester-cards/browser-flow-tester.md`

## 输出文件

- `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md`
- `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md`
- `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md`
- `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-*`
- `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-*`
- `docs/harness/MAIN_LOG.md`
- `docs/harness/RUNTIME_INDEX.md`
- `docs/harness/ACTIVE_TASK.md`
- `D:\智能体循环\CONTEXT.md`

## 验收标准引用

- `ACCEPTANCE.md`

## 对应 Acceptance 验收项

- CSV-01: PASS，固定 lead 与动态 lead 页面均出现 CSV export 按钮且可点击。
- CSV-02: PASS，浏览器导出请求只访问 `/api/workbench/leads/{id}/export/`，未请求根 `/api/leads/export`。
- CSV-03: PASS，第三轮 API 合约真实测试已确认 Workbench export route 返回单条 lead CSV。
- CSV-04: PASS，API 侧与浏览器侧均未发现 admin token / Authorization / Bearer 暴露。
- CSV-05: PASS，API 负向为非 2xx；浏览器不存在 lead 页面已收敛为 `Lead not found`，不永久 loading，不显示导出按钮。
- CSV-DATA-01: PASS，API 合约测试确认 header 与根 export 字段一致。
- CSV-UI-01: PASS，正向点击不阻断页面，按钮从 `Exporting CSV...` 恢复为 `Export CSV`。
- CSV-SEC-01: PASS，改动未扩散到根 auth、根数据模型或无关 API。

## 边界说明引用

- `ARCH_BOUNDARY.md`

## 是否触发 Architecture

已触发，边界已固化。

## 本任务能力标签

- `api-contract`
- `browser-e2e`
- `workbench-proxy`

## 本任务启用 Skill

- `browser-flow-tester` 使用 Playwright-first 工作流；本轮由 Test 子 Agent 创建临时 Playwright probe 并写证据。

## 本任务测试岗位

- `api-contract-tester`
- `browser-flow-tester`

## 测试岗位触发依据

- `api-contract-tester`：新增 Workbench proxy API 和 CSV response 契约。
- `browser-flow-tester`：新增 Lead Detail 下载按钮和浏览器点击流。

## 当前任务相关 lessons

- 下载类 Workbench 任务默认通过 `/api/workbench/*` 服务端代理访问根 API。
- 已有根 export endpoint 不等于天然支持单条 lead 导出。
- browser-flow 岗位不得由 Coordinator 代测；Playwright-first 证据可由 Test 子 Agent 使用临时 probe 采集。
- Workbench fallback detail 如果返回的 fallback lead id 与 URL id 不一致，页面不得把 fallback 数据当作当前 lead 展示。

## UI baseline 判断

不触发 UI baseline。本任务不是视觉维护任务。

## 允许修改范围

本轮新增/更新范围：

- `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`
- `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md`
- `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md`
- `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-*`
- `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-*`
- `docs/harness/ACTIVE_TASK.md`
- `docs/harness/RUNTIME_INDEX.md`
- `docs/harness/MAIN_LOG.md`

既有产品改动范围：

- `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`
- `workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/export/route.ts`
- `workbecnch-ui-2/app-old/src/lib/workbench/client-api.ts`

## 禁止修改范围

- `workbecnch-ui-2/app-old/src/app/api/workbench/...` 中与本任务无关的 route
- 根项目 `src/app/api/leads/export/route.ts`
- 根 API auth
- 根数据模型和数据库 schema
- 无关页面、无关 API、无关文档

## 本轮不处理

- 不修改根 API。
- 不修改 admin auth。
- 不修改根数据模型。
- 不进入 GitHub Gate。

## 可独立验收方式

已执行：

- `npm run lint` in `workbecnch-ui-2/app-old` -> PASS。
- `npx tsc --noEmit` in `workbecnch-ui-2/app-old` -> PASS。
- `rg -n "ENG-WB-CSV-001|api-contract-tester|browser-flow-tester|/api/workbench/leads" D:\work\ai-eastaura\docs\harness` -> 第 4/5 轮报告与证据均命中。
- `git status --short` -> 已记录当前工作树状态。
- API 合约真实测试 -> PASS，见 `reports/ENG-WB-CSV-001-api-contract-tester-3.md`。
- Browser-flow 第 4 轮 -> FAIL，见 `reports/ENG-WB-CSV-001-browser-flow-tester-4.md`。
- Dev 修复 -> DONE，Lead Detail mismatch fallback 不再渲染为当前 lead。
- Browser-flow 第 5 轮 -> PASS，见 `reports/ENG-WB-CSV-001-browser-flow-tester-5.md` 与 `evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md`。

## 预期风险

- 本轮验证基于本地 dev server，未验证远端部署。
- Playwright probe 为捕捉瞬时 `Exporting CSV...` 对 export 请求增加 700ms `route.continue()` 延迟；未 mock 响应。
- 无效 id 当前 API 侧返回 `500`，满足非 2xx 验收，但后续可产品化为 `400`。

## 阻塞处理提示

- 当前无 Test 阻塞。
- GitHub Gate 当前 BLOCKED：需要完成 `gh auth login` 或提供有效 `GH_TOKEN`，并确认远端写权限。
- 若进入 GitHub Gate 后 CI 或 Review 失败，应回到原 Dev 修复，再重跑相关失败测试岗位。

## 完成判断

当前必需测试岗位已通过：

- `api-contract-tester-3`: PASS。
- `browser-flow-tester-5`: PASS。

真实任务最终完成判断：进入 GitHub Gate，并在 CI / Review / Merge 完成且状态文件更新后才最终 PASS。

## GitHub Gate

- branch: 当前本地分支 `codex-eng-wb-csv-real-testing`
- PR: 未创建
- CI: 未运行
- Review: 未运行
- Merge: 未执行
- 当前状态: BLOCKED_AUTH
- 阻塞原因: `origin` 已配置为 `https://github.com/yangxiamike/ai-eastaura.git`，但 `gh auth status` 显示未登录；`git push -u origin codex-eng-wb-csv-real-testing` 未成功返回；当前工作区仍有无关未提交改动，不能混入本 PR。
- 下一步: 完成 `gh auth login` 或设置有效 `GH_TOKEN` 后，重新 push branch 并创建 PR。

## 当前状态

`BLOCKED`

说明：API 合约真实测试与第 5 轮 browser-flow 子 Agent 测试均已 PASS。GitHub Gate 已尝试启动，但因 GitHub auth/push 阻塞无法创建 PR / CI / Review / Merge，因此不得标记最终 PASS。

## 第五轮测试结果

- `browser-flow-tester-5`: PASS。
- 正向固定 lead 与动态 lead 导出均观察到 `Exporting CSV...` -> `Export CSV`，下载成功，URL 不跳走。
- 浏览器请求只访问 `/api/workbench/leads/{id}/export/`，未访问根 `/api/leads/export`。
- 浏览器请求 URL/header、storage、cookie、页面文本和 DOM 未发现 admin token / Authorization / Bearer。
- 不存在 lead 页面显示 `Lead not found`，不显示 `Sarah Mitchell`，不显示 `Export CSV`。
- Coordinator 静态验证: `npm run lint` PASS，`npx tsc --noEmit` PASS。

## 交付要求

下一步解除 GitHub Gate auth/push 阻塞：完成 `gh auth login` 或提供有效 `GH_TOKEN`，重新 push branch，创建 PR / CI / Review / Merge；完成后再更新最终 PASS 状态。
