# ENG-WB-CSV-001 Next Agent Run

## 目标

下个会话在 `codex-eng-wb-csv-real-testing` 分支上，按 Agent 顺序逐个完成 Workbench Lead Detail CSV export 的全面真实测试。

## 当前状态

- 既有 Dev/Test 已通过，任务状态仍为 `TEST_PASS_PENDING_GITHUB_GATE`。
- 第二轮复验：`api-contract-tester-2` PASS；`browser-flow-tester-2` BLOCKED。
- 关键规则：`browser-flow-tester` 必须由 browser-flow 子 Agent 自己执行，Coordinator 不能代测。

## 启动

在 `D:\work\ai-eastaura`：

```powershell
git branch --show-current
npm run dev:clean
npm run workbench:dev:clean
Invoke-WebRequest http://127.0.0.1:3000/api/health -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:5182/workbench/ -UseBasicParsing
```

固定 lead：

```text
4960b5ca-dbef-4d75-b5cf-08e58adc01b1
```

## Agent 1: api-contract-tester

输出：

```text
docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md
```

逐个完成：

1. 固定 lead 正向导出：`GET /api/workbench/leads/{id}/export/`。
2. 从真实 `/api/leads?limit=10` 取 2 个不同 lead，分别导出。
3. 若真实数据里有空值或多 goals lead，选 1 个验证 CSV 列数和空值输出。
4. 若真实数据里有逗号、双引号、换行、分号或多 goals 字段，选 1 个验证 CSV 转义；没有则记录 `DATA_NOT_AVAILABLE`。
5. 不存在 UUID：`00000000-0000-0000-0000-000000000000`，必须非 2xx。
6. 无效 id：`not-a-real-lead`，必须非 2xx。
7. 客户端安全检索：浏览器侧不得出现 `EASTAURA_ADMIN_API_TOKEN` / `authorization` / `Bearer` / `/api/leads/export`。

PASS 要求：

- header 与根 export 字段一致。
- 每个正向导出只返回 header + 当前 lead 1 条数据。
- 错误路径可判定，不返回空 CSV 200。
- CSV 特殊字符样例若无真实数据，不能造假，记录 `DATA_NOT_AVAILABLE` 后不影响 PASS。

## Agent 2: browser-flow-tester

输出：

```text
docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-3.md
```

逐个完成：

1. 固定 lead 页面打开并点击 `Export CSV`。
2. 使用 Agent 1 选出的 1 个动态真实 lead 页面打开并点击 `Export CSV`。
3. 验证每次点击都出现 `Exporting CSV...`，随后回到 `Export CSV`。
4. 验证页面 URL 不跳走、不卡死、console 无 error。
5. 验证请求仍在 `/api/workbench/leads/{id}/export/`，不请求根 `/api/leads/export`；报告必须写明证据来源，例如 browser network、Workbench dev server log、或 browser 工具可见请求记录。
6. 验证浏览器侧无 admin token / Authorization / Bearer 暴露。
7. 打开不存在 lead 页面：`/workbench/leads/00000000-0000-0000-0000-000000000000/`，验证页面错误可收敛、不永久 loading、不出现可导出空 CSV 的按钮。

BLOCKED 规则：

- 如果 browser-flow 子 Agent 无法连接 browser-use / in-app browser，必须返回 `BLOCKED`。
- Coordinator 不能用自己的浏览器结果替代该报告。
- 如果固定 lead 或动态 lead 页面因服务未启动、端口不可达、浏览器工具不可用而无法执行，必须返回 `BLOCKED`，并写清楚阻塞点。
- 如果页面可打开但按钮缺失、点击失败、状态不收敛、出现 console error、请求越过 Workbench proxy，则返回 `FAIL`，不是 `BLOCKED`。

## 结果判定规则

### PASS

- 当前 Agent 的必测项都完成。
- 所有验收项满足 Acceptance。
- 报告包含真实证据、命令/浏览器步骤、输出路径和 YAML 返回块。

### FAIL

- 测试可以执行，但行为不满足验收。
- 例子：CSV header 不匹配、返回多条 lead、错误路径返回空 CSV 200、浏览器直接请求根 `/api/leads/export`、浏览器暴露 token、点击后永久 loading。

### BLOCKED

- 测试无法执行，且不能判断产品是否符合验收。
- 例子：browser-flow 子 Agent 无法连接 in-app browser、dev server 启动失败、固定 lead 不存在且无法获取替代真实 lead、必要权限缺失。
- BLOCKED 不得当 PASS；Coordinator 不得代测 browser-flow。

### DATA_NOT_AVAILABLE

- 仅用于可选数据形态样例，例如没有真实 lead 含逗号、双引号、换行或多 goals。
- 必须说明查询范围和未找到的数据条件。
- 不能用于跳过固定 lead、动态 lead、负向错误、安全边界或 browser-flow 必测项。

## 报告格式要求

- 每个 Agent 报告必须有 `PASS` / `FAIL` / `BLOCKED` 总结。
- 可选数据样例未找到时，在报告中列出 `DATA_NOT_AVAILABLE` 小节。
- YAML 块必须包含：

```yaml
status: PASS | FAIL | BLOCKED
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
role: "api-contract-tester" # or browser-flow-tester
output_paths:
  - "docs/harness/reports/..."
changed_files:
  - "docs/harness/reports/..."
summary: "..."
risks: []
next_action: "..."
```

## Agent 3: coordinator-summary

输出/更新：

```text
docs/harness/MAIN_LOG.md
docs/harness/RUNTIME_INDEX.md
docs/harness/ACTIVE_TASK.md
D:\智能体循环\CONTEXT.md
```

逐个完成：

1. 汇总 Agent 1/2 报告。
2. 若两者都 PASS，记录“全面真实测试 PASS，仍等待 GitHub Gate”。
3. 若任一 BLOCKED/FAIL，保持阻塞原因，不能推进 GitHub Gate。
4. 检查报告中是否误把 `DATA_NOT_AVAILABLE`、Coordinator 诊断或自然语言 fallback 当作 PASS 证据。
5. 运行静态验证：

```powershell
cd D:\work\ai-eastaura\workbecnch-ui-2\app-old
npm run lint
npx tsc --noEmit
cd D:\work\ai-eastaura
rg -n "ENG-WB-CSV-001|api-contract-tester|browser-flow-tester|/api/workbench/leads" D:\work\ai-eastaura\docs\harness
git status --short
```

6. 如果只是测试，不继续开发，关闭 localhost `:3000` 和 `:5182`。
