# ARCH_BOUNDARY

## 关联任务

- `ENG-WB-CSV-001`：Workbench Lead Detail 增加 CSV export 按钮

## 触发原因

任务涉及 Workbench 服务端代理、根 API、CSV export 契约和 admin token 安全边界，必须先明确 Architecture 边界，避免浏览器直接接触根 admin API 或错误复用根 export。

## 技术边界

推荐实现：

1. 新增 Workbench 服务端代理 route：`/api/workbench/leads/[id]/export`。
2. Workbench route 在服务端取根 API 数据并返回单条 lead CSV。
3. Lead Detail 页面只负责触发 Workbench proxy 下载，不在客户端生成 CSV。
4. CSV header 优先保持和根 `GET /api/leads/export` 一致。

## API 边界

- 浏览器只请求：`GET /api/workbench/leads/{id}/export`。
- Workbench 服务端可以通过 `fetchRootApi()` 调用根 API。
- 根 `GET /api/leads/export` 已存在，但当前 `LeadExportQuery` 不明显支持 `id` 精确筛选。
- 因此不能假设直接转发根 export + `id` query 可行。
- 若不改根 API，Workbench route 应调用单条 lead API 获取当前 lead，然后在 Workbench 服务端生成同字段 CSV。

## 数据边界

- CSV 只包含当前 `{id}` 对应的单条 lead。
- CSV 字段优先对齐根 export 字段：`id`, `createdAt`, `status`, `fullName`, `email`, `country`, `source`, `riskLevel`, `intentScore`, `fitScore`, `riskScore`, `goals`, `preferredTiming`, `budgetUsd`。
- CSV 生成必须处理逗号、换行、双引号等基础转义。
- 不修改根数据模型，不新增 schema，不新增 migration。

## fallback / 错误处理边界

- lead 不存在：返回可判定的 404 或与现有 Workbench proxy 一致的错误状态。
- 根 API 失败：返回可判定的非 2xx 状态，不生成空 CSV 伪成功。
- token 缺失或服务端配置错误：返回可判定错误，不让客户端补 token。
- 页面侧失败状态必须收敛，不允许永久 loading。

## 安全/权限边界

- admin token 只在 Workbench 服务端使用。
- 客户端不得读取 `EASTAURA_ADMIN_API_TOKEN`。
- 不允许 token 出现在浏览器 URL、请求 header、localStorage、sessionStorage、console 明文或下载链接参数中。
- 浏览器不得直接请求根 `/api/leads/export` 或根 `/api/leads/{id}`。

## 边界相关测试要求

- `api-contract-tester`：验证 route 响应 headers、CSV 内容、单条数据、错误状态和服务端 token 边界。
- `browser-flow-tester`：验证 Lead Detail 按钮、点击后请求路径、浏览器侧无 admin token、页面状态收敛。

## 禁止事项

- 不修改根 `src/app/api/leads/export/route.ts`，除非 Architecture 后续重新批准。
- 不修改 admin auth。
- 不修改根数据模型。
- 不让客户端拼 CSV。
- 不让浏览器接触 admin token。
- 不把 Workbench export 做成批量导出。

## 待确认问题

### 阻塞当前实现

无。当前推荐边界允许进入 Dev，但 Dev 前仍需用户确认是否接受 Workbench route 自行生成单条 CSV。

### 影响后续任务

- 如果未来需要批量导出或统一 CSV 逻辑，可能需要抽共享 CSV helper 或扩展根 export API；这不属于当前任务。
- 如果产品要求完全复用根 `/api/leads/export`，需要先扩展并验证 `LeadExportQuery` 的 id 精确筛选能力。