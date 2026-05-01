# TEST_REPORT: api-contract-tester

## 任务

- task_id: `ENG-WB-CSV-001`
- 测试岗位: `api-contract-tester`
- 时间: `2026-05-01 15:49:00 +08:00`
- 结果: `PASS`

## 验证范围

- root API: `GET /api/leads?limit=10`、`GET /api/leads/export`
- Workbench canonical export route: `GET /api/workbench/leads/{id}/export/`
- CSV response contract: status、headers、字段顺序、行数、当前 lead id
- 负向路径: 不存在 UUID、非法 id 均必须非 2xx
- 客户端安全边界: 浏览器侧不得出现 admin token、Authorization/Bearer 或根 `/api/leads/export`

## 测试目标

- root dev server: `http://127.0.0.1:3000`
- Workbench dev server: `http://127.0.0.1:5182`
- 固定 lead: `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`
- 动态真实 lead 来源: `GET http://127.0.0.1:3000/api/leads?limit=10`，返回 10 条真实 Supabase lead
- 动态 lead 1: `4edd10c5-c45e-486c-a5d2-36e997d3f555`
- 动态 lead 2: `7c353d58-0f95-4a46-bf22-27cfc75414b8`

## 证据摘要

### 服务状态

- `GET /api/health`: `200`，`persistence=supabase`，`adminGuard=configured`
- `GET /workbench/`: `200 OK`

### root export header

`GET http://127.0.0.1:3000/api/leads/export` 返回 `200`，header 为：

```csv
"id","createdAt","status","fullName","email","country","source","riskLevel","intentScore","fitScore","riskScore","goals","preferredTiming","budgetUsd"
```

### 正向 Workbench 单 lead export

全部请求均为 `GET http://127.0.0.1:5182/api/workbench/leads/{id}/export/`。

- 固定 lead `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`: `200`，`text/csv; charset=utf-8`，`attachment; filename="eastaura-lead-content-pipeline-qa-20260428161043875-4j1on7.csv"`，CSV `header + 1` 行，数据行 id 匹配。
- 动态 lead `4edd10c5-c45e-486c-a5d2-36e997d3f555`: `200`，`attachment; filename="eastaura-lead-notification-qa-20260428094648567-987l44.csv"`，CSV `header + 1` 行，数据行 id 匹配。
- 动态 lead `7c353d58-0f95-4a46-bf22-27cfc75414b8`: `200`，`attachment; filename="eastaura-lead-notification-qa-20260428094458875-65tf8r.csv"`，CSV `header + 1` 行，数据行 id 匹配。

三次 Workbench export header 均与 root export header 完全一致。

### 空值 / 多 goals / 特殊字符样例

- 多 goals 样例: 固定 lead `4960b5ca-dbef-4d75-b5cf-08e58adc01b1`，root detail 中 goals 为 `Stress recovery | Sleep reset`。
- CSV 实测 goals 输出为单列：`"Stress recovery; Sleep reset"`，未增加列数，header 仍为 14 列。
- 空值样例: 动态 lead `4edd10c5-c45e-486c-a5d2-36e997d3f555` 和 `7c353d58-0f95-4a46-bf22-27cfc75414b8` 的 `preferredTiming`、`budgetUsd` 输出为 `""`，未返回 `null` 或错列。
- 特殊字符样例: 在 `limit=10` 查询范围内找到分号/多 goals 样例；CSV 生成逻辑对所有字段统一加双引号，样例行保持 14 列。

未发现真实 lead 含逗号、双引号或换行的字段；本轮没有造假数据。

### 负向 API

- 不存在 UUID: `GET /api/workbench/leads/00000000-0000-0000-0000-000000000000/export/` -> `404`，非 2xx，可判定错误。
- 无效 id: `GET /api/workbench/leads/not-a-real-lead/export/` -> `500`，非 2xx，可判定错误；没有返回空 CSV 200。

### 客户端安全检索

执行客户端范围检索：

```powershell
rg -n "EASTAURA_ADMIN_API_TOKEN|authorization|Bearer|/api/leads/export" D:\work\ai-eastaura\workbecnch-ui-2\app-old\src -g "*.ts" -g "*.tsx" -g "!**/app/api/**" -g "!**/lib/workbench/api-client.ts"
```

结果：无命中，退出码 `1`。

补充核查：`src/lib/workbench/api-client.ts` 中按设计存在 `EASTAURA_ADMIN_API_TOKEN`、`authorization`、`Bearer`，但它是 Workbench 服务端代理 helper，由 `app/api/workbench/*` 路由使用；浏览器侧 `client-api.ts` 的 `exportLeadCsv()` 只请求 `/api/workbench/leads/${id}/export`，再由 `normalizeWorkbenchApiPath()` 规范为 trailing slash URL。

## Acceptance 覆盖

- 固定 lead 正向导出: `PASS`
- 2 个动态真实 lead 正向导出: `PASS`
- 空值和多 goals 输出: `PASS`
- 特殊字符/多 goals CSV 列数与引号包裹: `PASS`
- 不存在 UUID 非 2xx: `PASS`
- 无效 id 非 2xx: `PASS`
- 客户端安全检索: `PASS`

## 剩余风险

- 本轮验证基于本地 dev server 运行态，未验证远端部署。
- 无效 id 当前由 root Supabase 层返回 `500`，满足“非 2xx/不返回空 CSV 200”的验收，但后续可考虑产品化为 `400`。

```yaml
status: PASS
domain: ENGINEERING
task_id: "ENG-WB-CSV-001"
role: "api-contract-tester"
output_paths:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md"
changed_files:
  - "docs/harness/reports/ENG-WB-CSV-001-api-contract-tester-3.md"
summary: "固定 lead 与两个动态真实 lead 的 Workbench CSV export 均返回 header + 当前 lead 1 条数据，header 与 root export 一致；负向路径非 2xx；客户端安全边界未发现 token 或根 export 暴露。"
risks:
  - "无效 id 当前返回 500；验收允许非 2xx，但后续可收敛为 400。"
next_action: "进入 browser-flow-tester，由 browser-flow 子 Agent 自己执行浏览器点击流验证。"
```
