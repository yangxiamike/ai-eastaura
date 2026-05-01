# RUNTIME_INDEX

## 当前任务

- task_id: `ENG-WB-CSV-001`
- 当前状态: `TEST_PASS_PENDING_GITHUB_GATE`
- 当前阶段: 完整 harness 已重跑 browser-flow。`browser-flow-tester-4` 通过 Playwright-first 真实点击流发现负向页 FAIL；Dev 修复 Lead Detail fallback mismatch；`browser-flow-tester-5` PASS。结合既有 `api-contract-tester-3` PASS，当前必需 Test 岗位已通过，等待 GitHub Gate。
- domain: `ENGINEERING`
- task_type: `demo_ready`

## 当前必读路径

- PRD: `docs/harness/PRD.md`
- ENGINEERING_BASELINE: `docs/harness/ENGINEERING_BASELINE.md`
- INTERFACE_BASELINE: 无，本任务不触发 UI baseline
- ACCEPTANCE: `docs/harness/ACCEPTANCE.md`
- BUILD_PLAN: `docs/harness/BUILD_PLAN.md`
- ACTIVE_TASK: `docs/harness/ACTIVE_TASK.md`
- ARCH_BOUNDARY: `docs/harness/ARCH_BOUNDARY.md`
- MAIN_LOG: `docs/harness/MAIN_LOG.md`
- API PASS 报告: `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md`
- browser-flow FAIL 报告: `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md`
- browser-flow PASS 报告: `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md`
- browser-flow 第 5 轮证据: `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md`

## 当前 Agent

- Coordinator: local Codex，负责调度、汇总和运行态收口。
- Agent / `browser-flow-tester-4`: FAIL，发现不存在 lead 页面仍展示 fallback `Sarah Mitchell` 和 `Export CSV`。
- Agent / Dev 修复: DONE，修复 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx` 的 fallback mismatch 展示。
- Agent / `browser-flow-tester-5`: PASS，复验正向导出、请求边界、token 暴露、console/pageerror 和不存在 lead 页面。
- Coordinator 静态验证: PASS，`npm run lint`、`npx tsc --noEmit`、harness `rg`、`git status --short` 已执行。

## GitHub Gate

- branch: 当前本地分支 `codex-eng-wb-csv-real-testing`
- PR: 未创建
- CI: 未运行
- Review: 未运行
- Merge: 未执行
- 当前状态: NOT_STARTED
- 推进条件: 已满足 Test Gate；下一步可启动 GitHub Gate。

## 运行态文件索引

| 文件 | 用途 | 当前状态 |
|------|------|----------|
| `PRD.md` | 任务目标、用户故事、MVP、非目标 | 已创建 |
| `ENGINEERING_BASELINE.md` | 真实项目事实、权限边界、目录原则 | 已创建 |
| `ACCEPTANCE.md` | CSV-01 至 CSV-05 验收项和测试岗位 | 已创建 |
| `BUILD_PLAN.md` | 能力标签、测试岗位、允许/禁止范围、阶段计划 | 已创建 |
| `ARCH_BOUNDARY.md` | Workbench proxy、根 API、admin token、CSV 生成边界 | 已创建 |
| `ACTIVE_TASK.md` | 当前任务卡，状态 `TEST_PASS_PENDING_GITHUB_GATE` | 已更新 |
| `MAIN_LOG.md` | harness 运行态事件日志 | 已更新 |
| `reports/ENG-WB-CSV-001-api-contract-tester-3.md` | 第三轮 API 合约真实测试报告 | PASS |
| `reports/ENG-WB-CSV-001-browser-flow-tester-4.md` | Playwright-first browser-flow 第 4 轮报告 | FAIL |
| `reports/ENG-WB-CSV-001-browser-flow-tester-5.md` | Playwright-first browser-flow 第 5 轮报告 | PASS |
| `evidence/ENG-WB-CSV-001-browser-flow-tester-4-*` | 第 4 轮浏览器证据 | 已归档 |
| `evidence/ENG-WB-CSV-001-browser-flow-tester-5-*` | 第 5 轮浏览器证据 | 已归档 |

## 最近事件摘要

| 时间 | 事件 | 任务ID | 结果 | 关联路径 |
|------|------|--------|------|----------|
| 2026-05-01 | 实现 Workbench Lead Detail CSV export 并完成既有 Dev/Test | ENG-WB-CSV-001 | TEST PASS PENDING GATE | `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-1.md`; `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-1.md` |
| 2026-05-01 | 第二轮多 Agent 复验：API contract PASS；browser-flow 子 Agent 后端不可用 | ENG-WB-CSV-001 | TEST BLOCKED | `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-2.md`; `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-2.md` |
| 2026-05-01 15:54 +08:00 | 第三轮全面真实测试：API contract PASS；browser-flow 子 Agent `iab` backend 不可连接 | ENG-WB-CSV-001 | TEST BLOCKED | `docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md`; `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-3.md` |
| 2026-05-01 16:19 +08:00 | 按用户要求重跑 browser-flow 子 Agent；服务 smoke 通过，但 Browser Use `iab` backend 仍不可发现 | ENG-WB-CSV-001 | TEST BLOCKED | `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-3.md` |
| 2026-05-01 17:01 +08:00 | 按 Playwright-first 派发 browser-flow 子 Agent 第 4 轮；正向导出通过，不存在 lead 页面仍显示 fallback Sarah Mitchell 和 Export CSV | ENG-WB-CSV-001 | FAIL | `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md`; `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-4-browser-evidence.md` |
| 2026-05-01 17:06 +08:00 | Dev 修复 Lead Detail fallback mismatch：`usingFallback` 且响应 lead id 与 URL id 不一致时进入 not found 状态 | ENG-WB-CSV-001 | DONE | `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx` |
| 2026-05-01 17:09 +08:00 | browser-flow 子 Agent 第 5 轮复验通过：固定/动态 lead 导出、请求边界、token 暴露、console、负向页均通过 | ENG-WB-CSV-001 | PASS | `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md`; `docs/harness/evidence/ENG-WB-CSV-001-browser-flow-tester-5-browser-evidence.md` |
| 2026-05-01 17:11 +08:00 | Coordinator 静态验证：Workbench lint、TypeScript、harness rg、git status 完成 | ENG-WB-CSV-001 | PASS | terminal verification |

## 当前阻塞

- 当前无 Test 阻塞。
- GitHub Gate 未启动，因此任务不得标记最终 PASS。

## 下一步

1. 启动 GitHub Gate：确认 branch、创建 PR、等待 CI / Review。
2. 若 CI 或 Review 失败，回到原 Dev 修复并重跑相关测试岗位。
3. GitHub Gate 完成且状态文件更新后，Coordinator 才能标记最终 PASS。
