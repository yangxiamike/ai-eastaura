# WORKBENCH PRODUCTIONIZATION PLAN (2026-04-28)

## 目标

把 `workbecnch-ui-2/app-old` 从“可联调原型”收口为“可部署、可鉴权、可验收”的正式后台入口。

## 范围

- 覆盖部署拓扑、鉴权策略、环境变量边界、最小验收命令。
- 不在本轮改动业务 API schema，不引入完整多角色权限系统。

## 发布决策（已定）

1. P0（已采用）：Workbench 独立部署
- Workbench（Next）独立部署，作为内部后台入口。
- Root API 继续在主项目服务上，Workbench 只通过服务端 `/api/workbench/*` 代理访问。
- 浏览器端不持有 `EASTAURA_ADMIN_API_TOKEN`。

2. P1（后续）：接入正式登录
- 用 Supabase Auth 或等价方案替换单 token。
- 保留服务端代理模式，避免浏览器直接命中 Root 内部 API。

## 鉴权边界

- Root 内部 API：由 `EASTAURA_ADMIN_API_TOKEN` 保护，生产默认 fail-close。
- Workbench 前端：不直接调用 Root API，统一走 Workbench 代理层。
- Workbench 服务端：读取 `EASTAURA_API_BASE_URL` 和 `EASTAURA_ADMIN_API_TOKEN` 后转发。

## 环境变量最小集合

- Root:
  - `EASTAURA_ADMIN_API_TOKEN`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Workbench:
  - `EASTAURA_API_BASE_URL`
  - `EASTAURA_ADMIN_API_TOKEN`（与 Root 一致）

## 验收口径

1. Root 数据链路
- `GET /api/health` 返回 `persistence=supabase`、`adminGuard=configured`。
- `POST /api/intake` 后可在 `GET /api/leads` 查询到新线索。

2. Workbench 代理链路
- `npm run verify:workbench-proxy` 返回 `status=DONE`。
- 关键端点 `usingFallback=false`。

3. 通知链路
- `npm run verify:notification-channels` 可跑通 intake 创建通知。
- 当外发通道已配置时，外发记录应无 `deliveryError`。

## 当前结论（2026-04-28）

- 已具备 P0 正式化前提：Root 与 Workbench 代理主链路可用。
- Feishu 外发链路已通过强校验（`EXPECT_NOTIFICATION_CHANNELS=feishu` -> `DONE`）。
- Resend 邮件通道仍待真实密钥与发件域配置（配置后可扩展到 `email,feishu` 双通道强校验）。
- Workbench 正式登录方案（Supabase Auth）仍是 P1。
