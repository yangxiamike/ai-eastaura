# TEST_REPORT: api-contract-tester

## 任务

- task_id: `ENG-WB-CSV-001`
- 测试岗位: `api-contract-tester`
- 时间: `2026-05-01 15:10:50 +08:00`
- 结果: `PASS`

## 验证范围

- Workbench export route: `GET /api/workbench/leads/{id}/export/`
- 根 API 数据来源: `GET /api/leads/{id}` via Workbench server `fetchRootApi()`
- CSV response contract
- admin token 边界
- 负向错误收敛

## 验证命令/方式

- `npm run lint` in `workbecnch-ui-2/app-old`
- `npx tsc --noEmit` in `workbecnch-ui-2/app-old`
- 本地 root dev server: `http://127.0.0.1:3000`
- 本地 Workbench dev server: `http://127.0.0.1:5182`
- 使用本地 `.env.local` 中 admin token 仅调用 root API 取测试 lead id；token 未输出。
- 调用 Workbench export route 验证 status、headers 和 CSV 内容。

## 测试数据

- lead id: `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`
- Workbench export path: `/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/export/`

说明：Workbench `next.config.ts` 设置 `trailingSlash: true`，因此浏览器/API canonical path 带尾斜杠；仍保持在 `/api/workbench/leads/{id}/export` 命名空间内，没有请求根 `/api/leads/export`。

## 结果摘要

| 项 | 结果 |
|----|------|
| HTTP status | `200` |
| Content-Type | `text/csv; charset=utf-8` |
| Content-Disposition | `attachment; filename="eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv"` |
| CSV header | 匹配根 export header |
| 数据行数 | 1 条 lead 数据 |
| lead id 匹配 | 是 |
| 不存在 UUID | `404` JSON error，可判定 |
| 无效 id | 非 2xx JSON error，可判定 |

## Acceptance 覆盖

- CSV-03: PASS
- CSV-04: PASS
- CSV-05: PASS
- CSV-DATA-01: PASS
- CSV-SEC-01: PASS

## 代码边界检查

`rg` 检查客户端相关文件未出现：

- `EASTAURA_ADMIN_API_TOKEN`
- `authorization`
- `Bearer`
- `/api/leads/export`

客户端只通过 Workbench helper 构造 `/api/workbench/leads/${id}/export`。

## 剩余风险

- 由于 Workbench 全局 `trailingSlash: true`，真实请求会规范为 `/export/`。这不是根 API 越界，但后续文档若严格要求无尾斜杠，需要先调整 Workbench 全局 routing 策略。

---YAML_START---
status: PASS
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
output_paths:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-1.md"
changed_files:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-1.md"
summary: "Workbench lead export route 返回单条 CSV，headers、字段、错误状态和 admin token 边界满足 Acceptance。"
risks:
  - "Workbench trailingSlash=true 会将 canonical path 规范为 /export/。"
next_action: "等待或查看 browser-flow-tester；两个必需岗位均 PASS 后可进入 GitHub Gate。"
ephemeral_reflection: ""
lesson_candidates: []
---YAML_END---
