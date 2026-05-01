# PRD

## 任务

- 任务 ID：`ENG-WB-CSV-001`
- 任务名称：Workbench Lead Detail 增加 CSV export 按钮
- 当前阶段：真实运行态准备
- 本轮边界：只创建 `docs/harness/` 运行态文件，暂不实现 CSV export 代码

## 目标

Founder 在 Workbench Lead Detail 页面查看单个 lead 时，可以下载当前 lead 的 CSV，用于离线跟进、手工分析或转交后续运营动作。

## 用户/使用者

- 主要使用者：Founder / Workbench operator
- 入口页面：Workbench Lead Detail

## 用户故事

作为 Founder，我希望在 Workbench Lead Detail 页面点击 CSV export 按钮，下载当前 lead 的单条 CSV，这样我可以把该 lead 的关键字段带到离线分析或人工跟进流程中。

## MVP 范围

- 在 Lead Detail 页面增加当前 lead 的 CSV export 入口。
- 浏览器只访问 Workbench 代理路径：`/api/workbench/leads/{id}/export`。
- Workbench 服务端 route 返回单条 lead CSV。
- CSV 字段优先对齐根项目现有 `GET /api/leads/export` 的字段集合。
- 失败状态必须可收敛，不允许页面无限 loading 或静默失败。

## 暂不做

- 不做列表页批量导出。
- 不做跨 lead 多选导出。
- 不改根数据模型。
- 不调整 admin auth 机制。
- 不让浏览器接触 admin token。
- 不要求本轮修改根项目 `src/app/api/leads/export/route.ts`。

## 工程约束与技术栈偏好

### 硬性约束

- Workbench 浏览器侧只能请求 `/api/workbench/*`。
- `EASTAURA_ADMIN_API_TOKEN` 只能在 Workbench 服务端 route 中使用。
- 客户端不得读取、拼接、透传 admin token。
- 本任务真实 Dev 前必须遵守 `ARCH_BOUNDARY.md`。

### 可接受方案

- 新增 Workbench 服务端代理 route：`workbecnch-ui-2/app-old/src/app/api/workbench/leads/[id]/export/route.ts`。
- Workbench route 调根 `GET /api/leads/{id}` 获取单条 lead，再在服务端生成 CSV。
- Lead Detail 页面通过按钮或链接触发 `/api/workbench/leads/{id}/export` 下载。

### 明确不采用

- 浏览器直接请求根 `/api/leads/export`。
- 客户端自行拼 CSV。
- 客户端携带 admin token。
- 为单条导出强行修改根 API、auth 或数据模型。

## 关键流程

```text
Founder 打开 Workbench Lead Detail
-> 点击 CSV export
-> 浏览器请求 /api/workbench/leads/{id}/export
-> Workbench 服务端用 fetchRootApi() 访问根 API
-> Workbench 服务端返回单条 lead CSV
-> 浏览器下载或明确失败
```

## 关键对象/数据

- lead id：来自 Lead Detail 当前路由参数。
- CSV 字段：优先对齐根 export header：`id`, `createdAt`, `status`, `fullName`, `email`, `country`, `source`, `riskLevel`, `intentScore`, `fitScore`, `riskScore`, `goals`, `preferredTiming`, `budgetUsd`。
- 下载响应：`Content-Type: text/csv; charset=utf-8`，`Content-Disposition: attachment; filename=...csv`。

## 成功标准

- 用户能从 Lead Detail 下载当前 lead 的单条 CSV。
- 浏览器网络请求不越过 Workbench proxy。
- admin token 不进入浏览器。
- API 契约和浏览器流程均可被测试岗位独立验收。

## 待确认问题

- 需要真实可用的 lead id / fixture 才能做运行态 Test。
- 需要用户确认是否允许 Workbench export route 自行生成单条 CSV。