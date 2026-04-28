# ai-eastaura

## 项目简介

Eastaura 是一个面向海外用户的中国中医康养体验品牌。目标是整合国内中医机构、翻译、住宿、接送和康养服务，面向海外人群推出以压力恢复、睡眠改善、精力管理和身心调理体验为核心的来华康养套餐。

## 技术栈

当前已进入 MVP 后端骨架、公开 Website 和内容获客闭环开发。现有实现采用 Next.js App Router、TypeScript、Supabase repository 适配层和版本化 Skill 文件；公开官网使用 App Router 页面、共享内容数据和全局 CSS 实现，并已按 boutique luxury wellness 方向重做首页桌面视觉。官网 `/intake` 已接入真实 `POST /api/intake`，可创建 Lead、AI triage、通知记录和 UTM/内容归因字段。新版 Workbench 原型位于 `workbecnch-ui-2/app-old/`，已支持系统界面中英文切换，并通过服务端代理读取根项目 Lead、Dashboard、Notification、Content、Review、Publishing 和 Attribution API；根 API 不可用时保留 mock fallback。未配置真实密钥时默认使用内存 mock，配置 Supabase/LLM 环境变量后可切换到真实数据库和模型接口。

## 本地运行

```powershell
npm install
npm run dev
```

默认服务地址：`http://localhost:3000`。

Workbench 本地联调：

```powershell
cd workbecnch-ui-2/app-old
npm install
$env:EASTAURA_API_BASE_URL="http://127.0.0.1:3000"
npm run dev -- --hostname 127.0.0.1 --port 5182
```

Workbench 服务地址：`http://127.0.0.1:5182/workbench`。如果根项目配置了 `EASTAURA_ADMIN_API_TOKEN`，Workbench 进程也需要配置同名环境变量，token 只会在服务端代理中使用。

公开 Website 路由：

- `/`：Eastaura 英文首页。
- `/program`：5-Day TCM Wellness Reset 套餐页。
- `/safety`：安全边界与 FAQ。
- `/insights`：英文内容/SEO 文章列表。
- `/insights/[slug]`：文章详情页。
- `/intake`：真实 Intake 表单，提交后创建 lead、AI run 和通知记录。
- `/thank-you`：表单提交成功页。

复制 `.env.example` 为 `.env.local` 后按需配置：

```powershell
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EASTAURA_LLM_ENABLED=false
EASTAURA_LLM_API_URL=
EASTAURA_LLM_API_KEY=
EASTAURA_LLM_MODEL=
EASTAURA_ADMIN_API_TOKEN=
EASTAURA_API_BASE_URL=http://127.0.0.1:3000
RESEND_API_KEY=
EASTAURA_NOTIFICATION_FROM=
EASTAURA_NOTIFICATION_TO=
FEISHU_WEBHOOK_URL=
FEISHU_BOT_SECRET=
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_VERIFICATION_TOKEN=
EASTAURA_INTAKE_RATE_LIMIT_WINDOW_MS=600000
EASTAURA_INTAKE_RATE_LIMIT_MAX=10
EASTAURA_INTAKE_DUPLICATE_WINDOW_MS=600000
TURNSTILE_SECRET_KEY=
```

当 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 同时存在时，API 使用 Supabase；否则使用内存 mock。

生产构建下，如果未配置 `EASTAURA_ADMIN_API_TOKEN` 且没有显式设置 `EASTAURA_ALLOW_OPEN_ADMIN_API=true`，内部 API 会 fail-close 返回 `503`。本地 `next start` smoke test 如需无 token 调试，可以临时设置 `EASTAURA_ALLOW_OPEN_ADMIN_API=true`。

当 `EASTAURA_ADMIN_API_TOKEN` 存在时，Lead、Notification 和 Skill 等内部 API 需要请求头：

```text
Authorization: Bearer <token>
```

Resend/飞书未配置时只记录 in-app 通知；配置对应环境变量后会尝试外部投递并回写 delivery 状态。飞书机器人开启签名校验时，同时配置 `FEISHU_BOT_SECRET`。

本地测试飞书机器人：

```powershell
$env:FEISHU_WEBHOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/..."
$env:FEISHU_BOT_SECRET="..."
& 'C:\Users\hp\anaconda3\envs\mt5\python.exe' scripts\notify_feishu.py "✅ Eastaura 飞书通知测试"
```

飞书自建应用机器人可通过 `POST /api/feishu/events` 接收事件回调。首次配置事件订阅时，该接口会响应飞书 URL challenge；配置 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET` 后，机器人可以回复 `/health`、`/help` 等白名单命令。`FEISHU_VERIFICATION_TOKEN` 可选，配置后会校验飞书回调 token。

`TURNSTILE_SECRET_KEY` 未配置时，Intake 只启用内存限流与重复提交防护；配置后会要求表单提交 `turnstileToken` 并校验 Cloudflare Turnstile。

## 常用命令

```powershell
npm run typecheck
npm run build
npm run start
npm run verify:intake-flow
```

`verify:intake-flow` 会执行从 `/intake` 提交到 Workbench（Dashboard / Leads / Lead Detail / Notifications）的端到端点击流验收，并输出 JSON 结果。  
可选环境变量：

```powershell
$env:E2E_ROOT_URL="http://127.0.0.1:3000"
$env:E2E_WORKBENCH_URL="http://127.0.0.1:5182/workbench"
```

常用 API：

- `GET /api/health`：服务健康检查。
- `POST /api/feishu/events`：飞书自建应用机器人事件回调，支持 URL 校验和基础命令回复。
- `POST /api/intake`：提交 Intake，创建 lead、AI run 和通知记录。
- `GET /api/dashboard/stats`：Workbench Dashboard 聚合数据，内部 API。
- `GET /api/leads`：查看 lead 列表，内部 API。支持 `status`、`riskLevel`、`source`、`country`、`q`、`limit`、`offset` 查询参数。
- `GET /api/leads/export`：按筛选条件导出 lead CSV，内部 API。
- `GET /api/leads/{id}`：查看 lead 详情、AI run、备注和状态事件，内部 API。
- `PATCH /api/leads/{id}`：更新 lead 状态，内部 API。
- `POST /api/leads/{id}/notes`：添加人工备注，内部 API。
- `POST /api/leads/{id}/triage`：重新触发 Lead AI triage，内部 API。
- `GET /api/notifications`：查看通知记录，内部 API。
- `POST /api/notifications/{id}/retry`：重试外部通知投递，内部 API。
- `GET /api/skills`：查看已登记 Skill 资产，内部 API。
- `GET/POST /api/campaigns`：内容获客 campaign 列表和创建，内部 API。
- `GET/POST /api/content-assets`：内容资产列表和创建，内部 API。
- `GET/PATCH /api/content-assets/{id}`：查看或更新内容资产，内部 API。
- `POST /api/content-assets/{id}/generate-script`：规则生成内容脚本，内部 API。
- `POST /api/content-assets/{id}/generate-storyboard`：规则生成短视频分镜，内部 API。
- `POST /api/content-assets/{id}/compliance-review`：生成合规审核任务，内部 API。
- `GET/PATCH /api/review-tasks` 与 `PATCH /api/review-tasks/{id}`：查看和更新人工审核任务，内部 API。
- `POST /api/publish-posts`：记录人工发布或排期，不自动发布到外部平台。
- `POST /api/content-metrics`：录入内容表现或 lead_submit 指标。
- `GET /api/content-attribution`：按 campaign/source/channel 汇总内容归因。

Workbench 内部代理 API 位于 `workbecnch-ui-2/app-old/src/app/api/workbench/`，浏览器只访问 `/api/workbench/*`，由 Workbench 服务端读取 `EASTAURA_API_BASE_URL` 和 `EASTAURA_ADMIN_API_TOKEN` 后转发到根项目 API。

## 目录结构

- `AGENTS.md`：Agent 协作规则和回复风格。
- `README.md`：项目整体说明。
- `ARCHITECTURE.md`：业务模块与关键设计决策。
- `CONTEXT.md`：当前进度、决定、阻塞和下一步。
- `src/app/api/`：MVP 后端 API 路由。
- `src/app/(public pages)`：公开 Website 页面，包括首页、Program、Safety、Insights、Intake 和 Thank You。
- `src/components/site/`：公开 Website 的导航、页脚、表单、时间线、图标和复用展示组件。
- `src/lib/site/`：公开 Website 的 mock 内容、文章、套餐、retreat moments 和首页结构化展示数据。
- `src/lib/domain/`：业务类型和请求校验。
- `src/lib/server/`：repository 层、Supabase client、内存 fallback、admin guard、Intake 防滥用、Skill 读取、Lead triage、LLM 适配、通知投递和通知记录逻辑。
- `workbecnch-ui-2/app-old/`：新版 Workbench Next.js 原型，覆盖内容、视频、日历、归因、线索、审核、通知、Skill、设置和合作方资产页面；`src/lib/workbench/i18n.ts` 与 `LanguageProvider` 提供系统级中英文切换，`src/app/api/workbench/` 提供服务端代理，Dashboard/Leads/Lead Detail/Notifications/Content/Review/Publishing/Attribution 已接入真实根 API。
- `supabase/migrations/`：Supabase 表结构 migration。
- `skills/`：版本化 Skill 文档、schema 和示例。
- `docs/PRD.md`：Eastaura 产品需求文档。
- `docs/MVP_SYSTEM_DESIGN.md`：MVP 系统设计文档。
- `docs/ACQUISITION_TECH_IMPLEMENTATION_PLAN_2026-04-27.md`：获客系统技术实现梳理，覆盖知识库、Agent/Skill、分镜、图片/图生视频 API、编排和落地路线。
