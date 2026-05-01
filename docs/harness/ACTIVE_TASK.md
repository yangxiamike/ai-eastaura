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

本轮已从真实运行态推进到 Dev + Test：实现 CSV export，并完成既有 `api-contract-tester` 与 `browser-flow-tester` 验收。2026-05-01 的第二轮多 Agent 真实复验中，`api-contract-tester` PASS，但 `browser-flow-tester` 子 Agent 因 browser-use 后端不可用而 BLOCKED；Coordinator 浏览器诊断不能替代该岗位验收。GitHub Gate 尚未启动。

## 对应 PRD 条目

- `PRD.md`：目标、用户故事、MVP 范围、暂不做、成功标准。

## 输入文件

- `docs/harness/PRD.md`
- `docs/harness/ENGINEERING_BASELINE.md`
- `docs/harness/ACCEPTANCE.md`
- `docs/harness/BUILD_PLAN.md`
- `docs/harness/ARCH_BOUNDARY.md`

## 主要依据

- Workbench 位于 `workbecnch-ui-2/app-old/`。
- Lead Detail 页面位于 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`。
- Workbench 浏览器侧只访问 `/api/workbench/*`。
- Workbench 服务端通过 `fetchRootApi()` 访问根 API 并服务端注入 admin token。
- 根项目已有 `GET /api/leads/export`，但不明显支持 `id` 精确筛选。

## 只作参考

- `D:/智能体循环/eastaura/records/dry-runs/LeadDetailCSVExportHarness演练记录.md`
- `D:/智能体循环/eastaura/testing/tester-cards/api-contract-tester.md`
- `D:/智能体循环/eastaura/testing/tester-cards/browser-flow-tester.md`

## 输出文件

- `docs/harness/RUNTIME_INDEX.md`
- `docs/harness/PRD.md`
- `docs/harness/ENGINEERING_BASELINE.md`
- `docs/harness/ACCEPTANCE.md`
- `docs/harness/BUILD_PLAN.md`
- `docs/harness/ARCH_BOUNDARY.md`
- `docs/harness/ACTIVE_TASK.md`
- `docs/harness/MAIN_LOG.md`
- `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-2.md`
- `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-2.md`
- `docs/harness/ENG-WB-CSV-001_NEXT_AGENT_RUN.md`

## 输出要求

运行态文件记录当前真实 Dev/Test 结果，并明确 GitHub Gate 尚未启动。

## 验收标准引用

- `ACCEPTANCE.md`

## 对应 Acceptance 验收项

- CSV-01
- CSV-02
- CSV-03
- CSV-04
- CSV-05
- CSV-DATA-01
- CSV-UI-01
- CSV-SEC-01

## 边界说明引用

- `ARCH_BOUNDARY.md`

## 是否触发 Architecture

是，必须触发。

## Architecture 触发原因

涉及 Workbench proxy、根 API、admin token 和 CSV 契约边界。

## 本任务能力标签

- `api-contract`
- `browser-e2e`
- `workbench-proxy`

## 本任务启用 Skill

- `browser-flow-tester` 后续真实执行时启用 `browser-use:browser`。

## 本任务 Agent 模型

- Coordinator / Planner / Architecture：`gpt-5.5`
- Dev / Test：`gpt-5.3`

## 本任务测试岗位

- `api-contract-tester`
- `browser-flow-tester`

## 测试岗位触发依据

- `api-contract-tester`：新增 Workbench proxy API 和 CSV response 契约。
- `browser-flow-tester`：新增 Lead Detail 下载按钮和浏览器点击流。

## 当前任务相关 lessons

- 下载类 Workbench 任务默认通过 `/api/workbench/*` 服务端代理访问根 API。
- 已有根 export endpoint 不等于天然支持单条 lead 导出。

## UI baseline 判断

不触发 UI baseline。本任务不是视觉维护任务。

## 界面基线引用

无。

## 允许修改范围

本轮实际修改：

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

- `git status --short` 确认产品代码改动仅在允许范围内，且未触碰禁止范围。
- `rg -n "ENG-WB-CSV-001|api-contract-tester|browser-flow-tester|/api/workbench/leads" docs/harness` 确认关键运行态信息存在。
- `npm run lint` in `workbecnch-ui-2/app-old`。
- `npx tsc --noEmit` in `workbecnch-ui-2/app-old`。
- 本地 API contract 验证 Workbench export route。
- Browser skill 验证 Lead Detail 按钮与点击状态。

## 预期风险

- 真实执行前缺少可用 lead id / fixture。
- 需要确认是否允许 Workbench export route 自行生成单条 CSV。
- 若未来要求完全复用根 export API，需要重新评估根 `LeadExportQuery` 是否支持 id 精确筛选。

## 阻塞处理提示

- 缺少 lead id / fixture：返回 `BLOCKED`，请求用户提供测试数据或允许建立 fixture。
- 不允许 Workbench route 自行生成 CSV：返回 Architecture 重新设计。

## 完成判断

本轮完成判断：Dev 实现完成，既有 `api-contract-tester` 和 `browser-flow-tester` 均 PASS；第二轮多 Agent 复验未完成，`browser-flow-tester` 为 BLOCKED。

真实任务最终完成判断：GitHub Gate 完成后才最终 PASS。

## GitHub Gate

- branch: 未创建
- PR: 未创建
- CI: 未运行
- Review: 未运行
- Merge: 未执行
- 当前状态: NOT_STARTED
- 不适用原因: 必需 Test 已 PASS，但本轮未执行 branch / PR / CI / Review / Merge

## 当前状态

`TEST_PASS_PENDING_GITHUB_GATE`

说明：Dev 和既有必需测试岗位均已通过；第二轮多 Agent 真实复验没有形成完整 PASS 证据；尚未执行 GitHub Gate。

## 第二轮复验阻塞

- `api-contract-tester-2`: PASS。
- `browser-flow-tester-2`: BLOCKED，子 Agent 无法连接 browser-use / in-app browser 后端。
- Coordinator 主线程浏览器诊断不得替代 `browser-flow-tester` 岗位验收。
- 若要以第二轮复验作为推进依据，必须重跑 `browser-flow-tester` 并取得子 Agent 自己的 PASS 报告。
- 下一会话按 `ENG-WB-CSV-001_NEXT_AGENT_RUN.md` 顺序调 `api-contract-tester-3`、`browser-flow-tester-3` 和 Coordinator 汇总。

## 交付要求

后续真实 Dev 必须遵守 `ARCH_BOUNDARY.md`，并在实现后生成对应测试报告。
