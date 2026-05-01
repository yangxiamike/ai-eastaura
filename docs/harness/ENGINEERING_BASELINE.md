# ENGINEERING_BASELINE

## 适用范围

适用于 `ENG-WB-CSV-001`：Workbench Lead Detail 单条 lead CSV export。

## 已确认项目事实

- Workbench 位于 `workbecnch-ui-2/app-old/`。
- Lead Detail 页面在 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`。
- Workbench Lead Detail API route 在 `workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/route.ts`。
- Workbench 浏览器侧 client API 位于 `workbecnch-ui-2/app-old/src/lib/workbench/client-api.ts`。
- Workbench 浏览器侧只访问 `/api/workbench/*`。
- Workbench 服务端通过 `fetchRootApi()` 访问根 API。
- `fetchRootApi()` 在服务端读取 `EASTAURA_ADMIN_API_TOKEN` 并注入 admin authorization header。
- 根项目已有 `GET /api/leads/export`，文件为 `src/app/api/leads/export/route.ts`。
- 根 `GET /api/leads/export` 当前返回 CSV，并设置 `Content-Type: text/csv; charset=utf-8` 和 `Content-Disposition: attachment; filename="eastaura-leads.csv"`。
- 根 export header 包含：`id`, `createdAt`, `status`, `fullName`, `email`, `country`, `source`, `riskLevel`, `intentScore`, `fitScore`, `riskScore`, `goals`, `preferredTiming`, `budgetUsd`。
- 当前已新增 Workbench route：`workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/export/route.ts`。

## 已确认技术栈

- 根项目：Next.js App Router API route。
- Workbench：`workbecnch-ui-2/app-old/` 下的 Next.js App Router。
- Workbench 服务端代理沿用现有 `fetchRootApi()` 模式。

## 鉴权与权限

- 根 API 通过 admin guard 保护。
- Workbench 服务端 route 负责在服务端访问根 API。
- admin token 不得进入浏览器、URL、localStorage、客户端请求 header 或客户端 bundle。

## 环境变量

- `EASTAURA_ADMIN_API_TOKEN`：只允许服务端使用。

## 目录结构原则

- Workbench 页面改动应限制在 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`。
- Workbench export route 推荐新增在 `workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/export/route.ts`。
- 如需要客户端 helper，只允许在 Workbench client API 边界内增加 Workbench proxy URL 相关封装。

## 测试策略

- `api-contract-tester`：验证 Workbench export route 的状态码、CSV header、Content-Type、Content-Disposition、单条 lead 契约和错误状态。
- `browser-flow-tester`：验证按钮入口、点击流、浏览器请求路径、下载/失败状态和浏览器侧 token 不暴露。

## 不采用方案

- 不让浏览器直接请求根 `/api/leads/export`。
- 不让浏览器读取或携带 admin token。
- 不为当前任务修改根数据模型。
- 不把根 API、auth 或无关文件纳入默认 Dev 范围。

## 待确认问题

### 阻塞进入 Plan

无。当前事实足以进入 Build Plan 和 Dev 前准备。

### 不阻塞当前任务但后续需确认

- 真实测试需要一个可用 lead id / fixture。
- 真实 Dev 前需要确认是否允许 Workbench export route 自行生成单条 CSV。
