# TEST_REPORT: api-contract-tester

## 任务

- task_id: `ENG-WB-CSV-001`
- 测试岗位: `api-contract-tester`
- 时间: `2026-05-01 15:25:46 +08:00`
- 结果: `PASS`

## 验证范围

- Workbench canonical export route: `GET /api/workbench/leads/{id}/export/`
- CSV response contract: status、headers、字段顺序、行数、lead id
- 负向路径: 不存在 lead 的错误状态
- 安全边界: 浏览器客户端源码不暴露 admin token、Authorization/Bearer 或根 `/api/leads/export`

## 测试目标

- root dev server: `http://127.0.0.1:3000`
- Workbench dev server: `http://127.0.0.1:5182`
- lead id: `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`
- canonical URL: `http://127.0.0.1:5182/api/workbench/leads/4960b5ca-dbef-4d75-b5cf-08e58adc01b1/export/`

## 证据摘要

### 正向 API

- status: `200`
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv"`
- CSV 行数: `2`，即 header + 1 条数据
- 数据行 lead id: `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`

CSV header 实测为：

```csv
id,createdAt,status,fullName,email,country,source,riskLevel,intentScore,fitScore,riskScore,goals,preferredTiming,budgetUsd
```

数据行首字段实测匹配固定 lead id。

### 负向 API

请求：

```text
GET http://127.0.0.1:5182/api/workbench/leads/00000000-0000-0000-0000-000000000000/export/
```

结果：

- status: `404`
- body: `{"error":"Root API /api/leads/00000000-0000-0000-0000-000000000000 failed (404): Lead not found."}`
- 判定: 非 2xx，可明确识别错误

### 安全边界源码检索

执行客户端范围检索：

```powershell
rg -n "EASTAURA_ADMIN_API_TOKEN|authorization|Bearer|/api/leads/export" workbecnch-ui-2/app-old/src -g "*.ts" -g "*.tsx" -g "!**/app/api/**" -g "!**/lib/workbench/api-client.ts"
```

结果：无命中。

补充核查：`workbecnch-ui-2/app-old/src/lib/workbench/api-client.ts` 中存在 `EASTAURA_ADMIN_API_TOKEN`、`authorization`、`Bearer`，但该文件作为 Workbench 服务端代理 helper 被 `app/api/workbench/*` 路由使用；浏览器侧 `client-api.ts` 仅请求 `/api/workbench/leads/${id}/export`，再由 `normalizeWorkbenchApiPath()` 规范为 trailing slash URL，没有暴露根 `/api/leads/export`。

## Acceptance 覆盖

- 1. `GET /api/workbench/leads/{id}/export/` status: `PASS`，返回 `200`
- 2. Content-Type 是 `text/csv; charset=utf-8`: `PASS`
- 3. Content-Disposition 是 attachment filename: `PASS`
- 4. CSV header 匹配根 export 字段: `PASS`
- 5. CSV 只返回 header + 一条当前 lead 数据，且 lead id 匹配: `PASS`
- 6. 不存在 lead 返回可判定非 2xx 错误: `PASS`，返回 `404`
- 7. 客户端代码不暴露 `EASTAURA_ADMIN_API_TOKEN` / `authorization` / `Bearer` / 根 `/api/leads/export`: `PASS`

## 剩余风险

- 本轮验证基于当前本地 dev server 运行态，未重新构建生产 bundle，也未验证远端部署环境。
- 安全边界结论基于源码检索和引用关系判断；服务端代理 helper 中按设计存在 token 注入逻辑，需继续确保它只被 server/API route 使用。
- Workbench `trailingSlash=true`，客户端 helper 请求无尾斜杠路径后会被规范为 `/export/`；本轮按用户指定 canonical path `/export/` 验证通过。

---YAML_START---
status: PASS
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
role: "api-contract-tester"
tested_at: "2026-05-01T15:25:46+08:00"
servers:
  root: "http://127.0.0.1:3000"
  workbench: "http://127.0.0.1:5182"
lead_id: "4960b5ca-dbef-4d75-b5cf-08e58adc01b1"
canonical_path: "/api/workbench/leads/{id}/export/"
acceptance:
  status_200: PASS
  content_type_csv_utf8: PASS
  content_disposition_attachment_filename: PASS
  header_matches_root_export: PASS
  header_plus_one_row_and_id_matches: PASS
  missing_lead_non_2xx: PASS
  client_secret_boundary: PASS
evidence:
  positive_status: 200
  content_type: "text/csv; charset=utf-8"
  content_disposition: "attachment; filename=\"eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv\""
  csv_line_count: 2
  data_lead_id_matches: true
  missing_lead_status: 404
output_paths:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-2.md"
changed_files:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-2.md"
summary: "Workbench canonical CSV export route 返回单条 lead CSV，header、headers、安全边界和负向错误均满足验收。"
risks:
  - "仅验证本地 dev server 运行态，未重新 build 或验证远端部署。"
  - "服务端代理 helper 按设计持有 admin token 注入逻辑，需继续保持仅 server/API route 引用。"
next_action: "可进入后续 Gate 汇总。"
ephemeral_reflection: ""
lesson_candidates: []
---YAML_END---
