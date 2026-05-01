# BUILD_PLAN

## 阶段目标

为 `ENG-WB-CSV-001` 建立真实运行态任务上下文，并推进真实 Dev/Test。当前 CSV export 代码已实现，既有 `api-contract-tester` 与 `browser-flow-tester` 已 PASS；GitHub Gate 尚未启动。第二轮多 Agent 真实复验中，`api-contract-tester-2` PASS，`browser-flow-tester-2` BLOCKED，不能作为新增 PASS 证据。

## 任务列表

| ID | 阶段 | 任务 | task_type | 域 | 状态 | Dev Agent | Test Agent | 修复轮次 | 报告路径 | 备注 |
|----|------|------|-----------|----|------|-----------|------------|----------|----------|------|
| ENG-WB-CSV-001 | Workbench export | Lead Detail 增加 CSV export 按钮 | demo_ready | ENGINEERING | PASS | Dev | api-contract-tester, browser-flow-tester | 0 | `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-1.md`; `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-1.md` | Dev 和既有必需 Test 已通过；第二轮复验 browser-flow BLOCKED；GitHub Gate 未启动 |

## 依赖关系

```text
PRD
-> ENGINEERING_BASELINE
-> ACCEPTANCE
-> ARCH_BOUNDARY
-> ACTIVE_TASK
-> Dev 实现
-> api-contract-tester + browser-flow-tester
-> GitHub Gate
```

## 任务详情

### ENG-WB-CSV-001: Workbench Lead Detail 增加 CSV export 按钮

#### 任务类型

`demo_ready`

#### 任务领域

`ENGINEERING`

#### 任务目标

让 Founder 能在 Workbench Lead Detail 下载当前 lead 的单条 CSV。

#### 本轮只解决

- 创建真实 `docs/harness/` 运行态文件。
- 固化 PRD、Baseline、Acceptance、Build Plan、Architecture Boundary 和 Active Task。
- 不修改产品代码。
- 不执行真实 Dev/Test。

#### 对应 PRD 条目

- `PRD.md`：目标、用户故事、MVP 范围、暂不做、成功标准。

#### 输入文件

- `docs/harness/PRD.md`
- `docs/harness/ENGINEERING_BASELINE.md`
- `docs/harness/ACCEPTANCE.md`
- `docs/harness/ARCH_BOUNDARY.md`
- `docs/harness/ACTIVE_TASK.md`

#### 主要依据

- Workbench 位于 `workbecnch-ui-2/app-old/`。
- Lead Detail 页面：`workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`。
- Workbench 服务端通过 `fetchRootApi()` 访问根 API 并注入 admin token。
- 根项目已有 `GET /api/leads/export`，但当前 `LeadExportQuery` 不明显支持 `id` 精确筛选。

#### 只作参考

- dry-run 记录：`D:/智能体循环/eastaura/records/dry-runs/LeadDetailCSVExportHarness演练记录.md`。
- tester card：`api-contract-tester.md`、`browser-flow-tester.md`。

#### 输出文件

- `docs/harness/RUNTIME_INDEX.md`
- `docs/harness/PRD.md`
- `docs/harness/ENGINEERING_BASELINE.md`
- `docs/harness/ACCEPTANCE.md`
- `docs/harness/BUILD_PLAN.md`
- `docs/harness/ARCH_BOUNDARY.md`
- `docs/harness/ACTIVE_TASK.md`
- `docs/harness/MAIN_LOG.md`

#### 输出要求

运行态文件必须足够支撑后续真实 Dev/Test，但不得声称本轮已完成代码实现或测试 PASS。

#### 验收标准引用

- `ACCEPTANCE.md`：CSV-01 至 CSV-05，以及 CSV-DATA-01、CSV-UI-01、CSV-SEC-01。

#### 对应 Acceptance 验收项

- CSV-01
- CSV-02
- CSV-03
- CSV-04
- CSV-05
- CSV-DATA-01
- CSV-UI-01
- CSV-SEC-01

#### 是否触发 Architecture

必须触发。

#### Architecture 触发原因

本任务涉及 Workbench proxy、根 API、admin token 边界和 CSV 契约；如果直接复用根 export，需要确认根 API 是否支持单条 lead 精确筛选。Architecture 已在 `ARCH_BOUNDARY.md` 中收敛推荐边界。

#### 本任务能力标签

- `api-contract`
- `browser-e2e`
- `workbench-proxy`

#### 本任务 Agent 模型

- Coordinator / Planner / Architecture：`gpt-5.5`
- Dev / Test：`gpt-5.3`

#### 本任务测试岗位

- `api-contract-tester`
- `browser-flow-tester`

#### 测试岗位触发依据

- `api-contract-tester`：新增 Workbench export route，涉及 CSV response、状态码、错误契约和 token 边界。
- `browser-flow-tester`：新增 Lead Detail 按钮和下载点击流，要求验证浏览器请求路径和页面状态。

#### 相关经验引用

- Workbench 下载类任务应走 `/api/workbench/*` 服务端代理，不让浏览器直接访问根 admin API。
- 已有根 export endpoint 不等于天然支持单条导出，是否复用必须先由 Architecture 确认。

#### UI baseline 判断

不触发 `frontend-visual-tester`。本任务是功能入口和下载流程验证，不是视觉基线维护任务。

#### 允许修改范围

真实 Dev 阶段推荐但本轮不修改：

- `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`
- `workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/export/route.ts`
- 必要时：`workbecnch-ui-2/app-old/src/lib/workbench/client-api.ts`

#### 禁止修改范围

- 根项目 `src/app/api/leads/export/route.ts`
- 根项目 admin auth / admin token 机制
- 根数据模型、数据库 schema、migration
- 无关 Workbench 页面或无关 API route
- `D:/work/ai-eastaura` 之外的产品代码

#### 本轮不处理

- 不实现 CSV export 按钮。
- 不新增 Workbench export route。
- 不运行 dev server。
- 不运行浏览器测试。
- 不创建测试报告。

#### 可独立验收方式

本轮只验收运行态文件是否存在、内容是否包含任务 ID、测试岗位、代理路径、边界和不改产品代码约束。

#### 预期风险

- 后续真实 Test 缺少可用 lead id / fixture 时会 `BLOCKED`。
- 若不允许 Workbench route 自行生成 CSV，则需要重新评估是否修改根 API 或抽共享 CSV helper。

#### 阻塞处理提示

- 缺少 lead id / fixture：向用户请求可用测试 lead 或建立安全 fixture。
- 不允许 Workbench route 生成 CSV：返回 Architecture 重新评估根 export 支持或共享 helper 方案。

#### 完成判断

- 本轮完成：运行态文件创建完成，且验证只新增/修改 `docs/harness/`。
- 任务完成：后续真实 Dev/Test/GitHub Gate 全部通过后才可最终 PASS。

#### GitHub Gate

本轮不进入 GitHub Gate。后续必须在全部必需 Test 岗位 PASS 后才进入。

#### 跨任务影响

低。若后续修改根 API 或抽共享 CSV helper，则需要重新评估跨任务影响。

## 当前进度

- 运行态文件：已创建。
- 产品代码：已按允许范围修改。
- Dev：已执行。
- Test：既有 `api-contract-tester` PASS；既有 `browser-flow-tester` PASS。第二轮多 Agent 复验中 `api-contract-tester-2` PASS，`browser-flow-tester-2` BLOCKED。
- GitHub Gate：未启动。

## 跨任务风险

| 风险 | 影响任务 | 如果假设不成立需要重新规划什么 |
|------|----------|--------------------------------|
| Workbench route 不允许自行生成 CSV | ENG-WB-CSV-001 | 需要评估根 export 单条筛选或共享 CSV helper |
| 缺少可用 lead id / fixture | ENG-WB-CSV-001 | 需要补测试 fixture 或人工提供测试数据 |

## 风险与阻塞

当前无阻塞进入 Dev 的技术信息缺口，但真实执行前需确认测试 lead id / fixture 和 Workbench route 生成 CSV 的许可。
