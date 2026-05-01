# CONTEXT

## 当前在做

围绕 Eastaura 英文品牌定位，形成入境中医康养业务的 PRD、MVP 系统设计和 AI 驱动一人公司方案，并已开始 MVP 后端 P0 骨架、公开 Website 原型和 Workbench 前端原型验收。业务方向是桥接国内翻译、中医机构、酒店住宿等资源，面向海外亚健康/压力恢复人群设计来华康养套餐。`ai-marketing-system/` 仅作为参考目录，不再保留独立 Git；项目根目录作为正式 Git 仓库。当前新增验收：`workbecnch-ui-2/app-old/` 是 Kimi 放入的新版 Next.js Workbench 源码，`workbecnch-ui-2/deploy2/` 是静态导出产物；已基于新版继续修复和填充 Eastaura 业务内容，并通过 build 与 Browser Use/Chrome headless 截图复查。本轮已完成获客系统前期技术实现梳理，形成 `docs/ACQUISITION_TECH_IMPLEMENTATION_PLAN_2026-04-27.md`；并新增 Workbench 中英文切换，默认中文，支持切回英文；同时已从 logo 概念组中选定 01 方向，并落地为公开 Website header/footer 的可维护代码版 wordmark。已排查飞书 `cc-connect` 后电脑卡顿：根因不是 `cc-connect` 本体，而是多个本地 Website/Workbench dev server 的 Node 进程异常膨胀到十几 GB；已停止残留预览服务并清理 `.next`、`workbecnch-ui-2/app-old/.next`、`.chrome-profile-*`、`_tmp_*` 和旧 `.codex-*` 日志。本轮按用户要求使用 sub-agents 做冗余检查：正式根项目源码冗余较少，主要候选是未引用的 `src/lib/server/feishu-app.ts`、未引用的 `public/images/brand/eastaura-logo-concept-01.png`、空 `next.config.ts` 和本地排障脚本；工作区膨胀主要来自 `workbench-ui/` 旧 Vite 原型、`workbecnch-ui-2/app-old/node_modules`、`workbench-ui/node_modules`、静态导出产物、Kimi zip、重复截图、日志和 TS 构建缓存。随后已按低风险清理：删除两个 Workbench 原型目录的 `node_modules`、构建产物、`.npm-cache`、离线 tgz、零字节 dev 日志、根 `tsconfig.tsbuildinfo`、空 `.chrome-profile2` 和旧 PID；根 `node_modules` 因 Next SWC 被 Node 进程占用未清理，清理过程中一度导致 `tsc` bin 缺失，已通过根目录 `npm install` 修复。清理后回归检查：根项目 `npm run typecheck` 通过；`npm run build` 在默认沙箱中遇到 `spawn EPERM`，沙箱外复跑通过，确认不是源码或清理问题；`.next` 与 `tsconfig.tsbuildinfo` 已由验证命令重新生成并被 ignore。当前 `workbench-ui/` 约 0.6MB，`workbecnch-ui-2/` 约 7.9MB，根 `node_modules/` 保留约 342MB；`.codex-cc-connect.*.log` 仍被进程占用，未强删。

本轮新增环境准备：已创建根目录 `.env.local`，并写入 `EASTAURA_LLM_ENABLED=true`、DeepSeek chat-completions API URL、`deepseek-v4-flash` 模型和本地 `EASTAURA_ADMIN_API_TOKEN`，用于真实 LLM + Workbench 内部 API 联调；`SUPABASE_URL` 与 `SUPABASE_SERVICE_ROLE_KEY` 仍待配置，当前真实落库未开启。
本轮补充 Workbench 本地环境：已自动创建 `workbecnch-ui-2/app-old/.env.local`，写入 `EASTAURA_API_BASE_URL=http://127.0.0.1:3000` 与根项目同一 `EASTAURA_ADMIN_API_TOKEN`，避免每次手动注入环境变量启动。
本轮新增 Workbench 联调前置核验：已确认根 `.env.local` 的 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`EASTAURA_LLM_*`、`EASTAURA_ADMIN_API_TOKEN` 均为 `SET`；`workbecnch-ui-2/app-old/.env.local` 与根 token 一致，且代理层 `src/lib/workbench/api-client.ts` 在服务端读取 `EASTAURA_API_BASE_URL` / `EASTAURA_ADMIN_API_TOKEN` 并自动追加 `Authorization: Bearer <token>`。当前本机 `:3000` 和 `:5182` 进程未运行（health/proxy 请求超时或拒绝连接），需先启动根服务与 Workbench 再做链路 smoke。
本轮真实链路验收已通过：Supabase 迁移后，根服务 `GET /api/health` 返回 `persistence=supabase`、`llm=configured`、`adminGuard=configured`；`POST /api/intake` 成功创建 `lead/aiRun/notification`，`GET /api/leads` 可检索到新 lead，`POST /api/leads/{id}/triage` 可重跑，`GET /api/leads/{id}` 显示 `aiRuns=2`，确认“真实落库 + 真实 LLM triage + 通知记录”主链路可用。
本轮完成 Workbench 代理链路验收：`GET /api/workbench/dashboard/`、`GET /api/workbench/leads/`、`GET /api/workbench/leads/{id}/`、`POST /api/workbench/leads/{id}/triage/`、`GET /api/workbench/notifications/` 全部返回 200 且 `usingFallback=false`。`POST triage` 访问无尾斜杠 URL 会触发 308，已确认带尾斜杠可稳定通过；通知列表将线索关联字段映射为 `relatedId`（非 `leadId`），已验证命中最新 smoke lead。
本轮新增 Workbench 308 收口：`workbecnch-ui-2/app-old/src/lib/workbench/client-api.ts` 增加 `normalizeWorkbenchApiPath`，统一将 `/api/workbench*` 请求规范为尾斜杠 URL（保留 query/hash），避免客户端/脚本依赖 308 跳转行为。验证：Workbench `npm run lint` 通过；`GET /api/workbench/dashboard` 仍会返回 308 到 `/api/workbench/dashboard/`，而客户端现已在发起前自动归一化到尾斜杠版本。
本轮继续尝试按用户要求用 sub-agent `@browser-use` 做 `/intake -> Workbench` 点击流验收，但当前会话内 Browser Use MCP server 未挂载，子代理返回 `unknown MCP server 'browser-use'`，验收被环境阻塞，尚未产出新的页面级证据。
2026-04-28 补充：已在本机会话中恢复本地服务运行，根服务 `http://127.0.0.1:3000/api/health` 可用，Workbench 已在提权后成功拉起 `http://127.0.0.1:5182/workbench/`；但 `@browser-use` 子代理在当前运行时仍无法获得可调用的 Browser Use 本地浏览器控制接口，点击流验收继续阻塞。
2026-04-28 补充（Playwright fallback 验收）：在用户授权下改用 Playwright 完成点击流。根站切到生产模式 `npm run build && npm run start` 后，`/intake` 客户端交互恢复，成功提交并跳转 `http://127.0.0.1:3000/thank-you?leadId=c7c259a7-f7fb-4102-8c5b-9ff3d1772902`。Workbench 代理 API 返回 `usingFallback=false`，`/api/workbench/leads/` 可见该 lead（`qa+20260428071836@example.com`），Leads 页面可见新线索；Notifications 页面显示与该线索相关的高意向通知文案。当前遗留风险：Lead Detail 页面在浏览器验收中仍出现 `Loading lead detail...` 持续显示，需要单独排查前端渲染/加载状态。
2026-04-28 补充（Lead Detail 复验收敛）：已针对 `Loading lead detail...` 做独立复验，确认并非页面逻辑缺陷，而是早期验收脚本未等待加载态收敛导致的假阴性。更新后的稳定验收脚本在等待 `Loading` 消失后，`/intake -> /thank-you -> /workbench/dashboard -> /workbench/leads -> /workbench/leads/{id} -> /workbench/notifications` 全链路通过，`leadId=feb2a1cc-094e-4e30-ac70-d3b720d902bc` 在 Leads/Detail/Notifications 均可见，且未捕获 308/console error。
2026-04-28 补充（验收脚本固化）：已新增仓库脚本 `scripts/e2e-intake-workbench.cjs`，并在根 `package.json` 增加 `npm run verify:intake-flow`，用于一键回归 `/intake -> Workbench` 点击流验收，输出结构化 JSON 结果；README 的常用命令已同步补充。
2026-04-28 补充（四任务拉通执行）：已按“数据层 -> Workbench 正式化 -> 通知外发 -> 浏览器验收”执行。实测 `GET /api/health` 返回 `persistence=supabase`、`adminGuard=configured`；真实 `POST /api/intake` + `GET /api/leads` 查询成功。新增 `npm run verify:workbench-proxy`（关键代理 API 全部 200 且 `usingFallback=false`）和 `npm run verify:notification-channels`（当前结论：仅 `in_app` 已启用，外发通道未配置）。`npm run verify:intake-flow` 在默认沙箱会遇到 Playwright `spawn EPERM`，提权后验证通过（status=`DONE`，无 308/console error）。同时新增 `docs/WORKBENCH_PRODUCTIONIZATION_PLAN_2026-04-28.md`，收口 Workbench 正式化拓扑与验收口径。
2026-04-28 补充（通知外发验证增强）：`scripts/verify-notification-channels.cjs` 新增 `EXPECT_NOTIFICATION_CHANNELS`（如 `feishu` 或 `email,feishu`）强校验模式，并修复同秒并发执行触发重复提交的误报（改为毫秒+随机 runId）。当前本地环境 `FEISHU_WEBHOOK_URL`、`RESEND_API_KEY` 等外发变量仍未配置，验收稳定返回 `DONE_WITH_CONCERNS`；开启 `EXPECT_NOTIFICATION_CHANNELS=feishu` 时会返回 `BLOCKED` 并明确缺失通道。
2026-04-28 补充（飞书实参联调）：已将用户提供的 `FEISHU_WEBHOOK_URL` 与 `FEISHU_BOT_SECRET` 写入根 `.env.local`，并通过 `scripts/notify_feishu.py` 直连飞书机器人验证成功（`code=0,msg=success`）。但根服务链路仍只返回 `notificationChannels=["in_app"]`，`EXPECT_NOTIFICATION_CHANNELS=feishu` 仍为 `BLOCKED`。已追加两类收口尝试：1）`src/lib/server/env.ts` 增加 `.env.local` fallback 与向上查找；2）`/api/health`、`/api/intake`、`/api/notifications/[id]/retry` 显式 `runtime=nodejs`。多次 clean build + restart 后阻塞仍在，需进一步排查当前运行进程/运行时环境与配置装载差异。
2026-04-28 补充（飞书外发收口完成）：已定位到阻塞并非代码逻辑，而是本机 `:3000` 存在旧服务实例导致读到旧配置；在干净 `next start --port 3010` 实例上，`/api/health` 返回 `notificationChannels=["in_app","feishu"]` 与 `notificationConfigState.feishuConfigured=true`。强校验执行：`E2E_ROOT_URL=http://127.0.0.1:3010` + `EXPECT_NOTIFICATION_CHANNELS=feishu` 下 `npm run verify:notification-channels` 返回 `DONE`，并确认新 intake 创建 `in_app + feishu` 两条通知且无 deliveryError。
2026-04-28 补充（默认端口 3000 复验通过）：清理 `:3000` 旧监听后，在 `:3000` 启动最新构建实例并执行 `EXPECT_NOTIFICATION_CHANNELS=feishu npm run verify:notification-channels`，结果同样为 `DONE`，`/api/health` 显示 `notificationChannels=["in_app","feishu"]`。注意：当前 Codex 终端环境可能在命令结束后回收后台进程，需用“启动+验收同一命令窗口”或本地常驻终端运行服务。
2026-04-28 补充（回归与运维固化）：新增 `scripts/start-root-clean.ps1`（清端口并启动 root，输出 health）、`scripts/verify-all.cjs`（顺序执行 typecheck/workbench-proxy/notification-channels，可选 intake-flow），并在 `package.json` 增加 `dev:clean`、`start:clean`、`verify:all`。新增 CI 工作流 `.github/workflows/verify.yml`：默认跑 typecheck+build；配置 `FEISHU_WEBHOOK_URL` secret 时自动执行飞书通知强校验。Workbench 发布策略文档已更新为“P0 独立部署已定”，`ARCHITECTURE.md` 与 `README.md` 已同步验收与运维流程。
2026-04-28 补充（verify:all 实跑）：在 root `:3000` + workbench `:5182` 启动后，执行 `EXPECT_NOTIFICATION_CHANNELS=feishu npm run verify:all`，实际通过 `typecheck -> verify:workbench-proxy -> verify:notification-channels` 全链路，summary `failed=false`。
2026-04-28 补充（阶段收口与下一步计划）：当前“管道拉通与稳定化”阶段已完成，新增 `docs/NEXT_STEP_PLAN_2026-04-28.md`，将下一阶段拆分为 `P1 业务定盘 -> P2 转化SOP -> P3 官网收敛 -> P4 Workbench收敛 -> P5 内容方向收敛 -> P6 试运营复盘`，用于业务驱动迭代。

本轮已按“内容生成/营销 skill 分类 -> OpenClaw/Hermes 公开 skill 对应 -> prompt 结构摘要 -> Eastaura 改造建议”完成外部 skill 调研，并归档到 `docs/OPENCLAW_HERMES_MARKETING_SKILLS_RESEARCH_2026-04-27.md`。结论：OpenClaw 更像营销 playbook，Hermes 更像可执行 agent 操作手册；Eastaura 后续应重写为自有 `brand_voice_profile`、`content_strategy`、`short_video_script`、`landing_copy`、`content_repurpose`、`visual_prompt`、`cold_outreach`、`review_compliance` skills。

本轮已按 P0 询盘闭环计划打通最小系统闭环：公开 Website `/intake` 真实提交 `POST /api/intake`，生成 lead、AI triage 和通知记录；`workbecnch-ui-2/app-old/` 从默认静态导出改为动态 Next app，新增 `/api/workbench/*` 服务端代理，通过 `EASTAURA_API_BASE_URL` 与服务端 `EASTAURA_ADMIN_API_TOKEN` 调根项目 API，避免浏览器暴露 token；Dashboard、Leads、Lead Detail、Notifications 已读取真实数据并保留 mock fallback，可在详情页更新状态、添加备注、重跑 triage，并在通知页 retry。验证：根项目 `npm run typecheck` 通过；Workbench `npm run lint` 通过；根项目和 Workbench `npm run build` 在默认沙箱均遇到既有 Next worker `spawn EPERM`，沙箱外复跑均通过；本地 dev server HTTP smoke 已创建新 intake，Workbench dashboard/leads/detail/notifications 均读到真实记录，状态更新、备注、triage、通知 retry 均成功。随后用 Browser Use 打开 Workbench Dashboard、Leads、Lead Detail 和 Notifications，均能看到真实测试 lead 且无 console error；仅有 Next Image 宽高比例 warning。Browser Use 在官网 Intake 卡片式 checkbox 上存在坐标翻译限制，表单浏览器点击未作为最终验收依据。

本轮已按“内容生产线 P0 闭环跑通计划”完成获客内容生产最小内部闭环：新增 Campaign、ContentAsset、Storyboard、ReviewTask、PublishPost、ContentMetric 类型、内存 store、Supabase repository 与 `supabase/migrations/202604280001_content_pipeline_p0.sql`；新增 `content_strategy_v0_1`、`short_video_script_v0_1`、`storyboard_v0_1`、`visual_prompt_v0_1`、`review_compliance_v0_1` Skills；新增根 API `/api/campaigns`、`/api/content-assets`、脚本/分镜/合规生成、`/api/review-tasks`、`/api/publish-posts`、`/api/content-metrics` 和 `/api/content-attribution`；`POST /api/intake` 已保存 `campaign` 与 UTM 字段。Workbench Content Studio、POV Video Generator、Review Tasks、Publishing Calendar、Lead Attribution 已通过 `/api/workbench/*` 接真实根 API，并处理 trailing slash，避免 POST 308。验证：根 `npm run typecheck` 通过；Workbench `npm run lint` 通过；根与 Workbench 沙箱外 `npm run build` 通过；根 API smoke 跑通 `drafted -> storyboarded(5 scenes) -> approved -> published -> intake UTM -> metric tracked -> attributionLeads=1`；Workbench 代理 smoke 跑通创建内容、生成脚本/分镜、合规审核和 review task，全部 `usingFallback=false`。
2026-04-28 补充（内容生产管道 P0 复验收固化）：新增 `scripts/verify-content-pipeline.cjs` 与 `npm run verify:content-pipeline`，默认打干净根服务 `http://127.0.0.1:3010`，自动创建唯一 runId 的 campaign/content asset，依次验证脚本、5 段分镜、合规审核任务、人工批准、发布记录、带 UTM intake、`lead_submit` metric 和 `/api/content-attribution`。实跑结果 `status=DONE`，runId=`20260428093901524-if21m8`，`persistence=supabase`、`adminGuard=configured`、`leadsAttributed=1`。Workbench 代理在沙箱外临时启动 `:3010` root + `:5182` Workbench dev 后复验 `npm run verify:workbench-proxy`，结果 `status=DONE`，dashboard/leads/notifications/content_assets/review_tasks/content_attribution 均 200 且 `usingFallback=false`。已补 `start:clean:3010` / `dev:clean:3010` 命令和 README 说明；本轮不接图片/视频 provider 或外部自动发布。
2026-04-29 补充（DeepSeek P1 聚合优化）：采纳 `docs/CODEX_NEXT_PLAN.md` 中 P1 建议，暂不执行 P0 目录删除/重命名和 P2 写事务化。已由 `gpt-5.3-codex` worker 将 Supabase `getDashboardStats` 与 `getContentAttribution` 改为优先调用数据库侧 RPC，并新增 `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql`，包含 `get_dashboard_stats()` 与 `get_content_attribution(...)`。主控复验发现当前 Supabase 尚未执行新 migration 时接口会报 RPC 不存在，因此补了“仅 RPC 缺失时启用”的兼容 fallback，保证现有系统不断；执行 migration 后会自动走数据库聚合。验证：`npm run typecheck` 通过；`npm run build` 沙箱外通过；最新构建 `:3010` 下 `/api/dashboard/stats` 与 `/api/content-attribution` 均返回 200；`npm run verify:content-pipeline` 返回 `DONE`，runId=`20260428161043875-4j1on7`，`leadsAttributed=1`。
2026-04-29 补充（Codex 编码约定校准）：已审阅 DeepSeek 写入的 `docs/CODEX_CONVENTIONS.md`，保留“不提前抽共享 utils、route handler 不手写返回类型、Workbench token 不进浏览器、LLM 调用必须 fallback”等核心纪律；同时把“别写注释、别引库、别拆 repository interface、别加 try/catch”等绝对表述调整为当前阶段默认约定，并补充例外条件，避免后续 Agent 把协作纪律误用成不可变禁令。

2026-05-01 补充（ENG-WB-CSV-001 完整 harness browser flow 收口）：已按 `D:\智能体循环` harness 规则调用子 Agent 重跑 Workbench Lead Detail CSV export 浏览器流程。第 4 轮 `browser-flow-tester` 使用临时 Playwright probe 发现负向页失败：不存在 lead 页面在 root 404 后仍展示 fallback `Sarah Mitchell` 和 `Export CSV`。随后 Dev 子 Agent 只改 `workbecnch-ui-2/app-old/src/app/workbench/leads/[id]/page.tsx`，当 `usingFallback` 且响应 lead id 与 URL id 不一致时进入 `Lead not found` 空状态。第 5 轮 `browser-flow-tester` PASS：固定 lead 与动态 lead 导出、`Exporting CSV...` 状态恢复、Workbench proxy 请求边界、浏览器侧 token 暴露检查、console/pageerror 和不存在 lead 页面均通过。运行态报告/证据位于 `docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-4.md`、`docs/harness/reports/ENG-WB-CSV-001-browser-flow-tester-5.md` 和 `docs/harness/evidence/`；`api-contract-tester-3` 仍为 PASS。当前 harness 状态为 `TEST_PASS_PENDING_GITHUB_GATE`，GitHub Gate 尚未启动，不能标记最终 PASS。
2026-05-01 补充（ENG-WB-CSV-001 GitHub Gate 前置复查）：`gh` 本地 token 仍失效，网页登录授权未写入 GitHub CLI 凭据；随后改用已验证可用的 SSH 凭据推进。首次 SSH push 的真实失败点不是认证，而是历史提交 `6fe1a4a` 包含 `Kimi_Agent_Eastaura Wellness Retreat Prototype.zip`（116.68MB），超过 GitHub 100MB 单文件限制。已从当前分支历史移除该 zip，补充 `.gitignore` 忽略 `*.zip`，并保留本地副本。当前分支 `codex-eng-wb-csv-real-testing` 已通过 SSH 推送到 `git@github.com:yangxiamike/ai-eastaura.git`，远端 commit 为 `1432091 chore: ignore local archives`。当前 Test Gate 仍为 PASS，GitHub Gate 已完成 branch push，但尚未创建 PR / 等待 CI / Review / Merge，因此任务仍不得标记最终 PASS。

## 上次做到哪里

已完成 Eastaura PRD、MVP 系统设计、AI 一人公司方案、获客/运营/CRM Agent 系统方案、社媒/短视频冷启动方案、通知中心方案、项目系统总览示意图、一版可用于推进 MVP 的假设业务方案和开发缺口清单、Agent/Skill 设计、当前完整流程归档 `docs/ARCHIVE_2026-04-27_EASTAURA_FLOW.md`，后台指挥台 UI 样板图归档 `docs/WORKBENCH_UI_SAMPLES.md`，以及给 Kimi 生成 Website/Workbench 前端原型的完整 prompt 归档 `docs/KIMI_FRONTEND_UI_PROMPTS_2026-04-27.md`。明确首期不做平台，而是做英文官网、套餐页、Intake 表单、内部询盘后台、邮件通知、飞书/企业微信提醒、AI 线索辅助和内容获客流水线，用于验证海外询盘到人工转化的闭环。已更新 `AGENTS.md`，加入开发任务目标闸门、大任务主控 Loop、gpt-5.3 sub-agents 调用规则，并移除每次回复声明开发/研究模式的要求。

已落地 Next.js/TypeScript 后端 P0 骨架：`POST /api/intake`、Lead 列表/详情/状态更新/备注 API、通知记录 API、Skill 列表 API、内存 mock store、确定性 Lead triage mock、`ai_runs` 记录结构，以及首批 `skills/*_v0_1/` Skill 资产。

已新增后端持久化和真实模型接入预留层：Supabase migration、服务端 Supabase client、repository 自动切换、`.env.example`、chat-completions 兼容 LLM 适配器、AI fallback 逻辑，以及 `POST /api/leads/{id}/triage` 手动重跑 triage 接口。当前没有真实 Supabase/LLM token 时仍走内存 mock 和规则 mock；补齐环境变量后可切换到真实数据库和模型接口。

已新增后端内部安全和通知投递 P0：`EASTAURA_ADMIN_API_TOKEN` 可保护 Lead/Notification/Skill 等内部 API；Intake 与 health 保持公开。通知系统新增 Resend/飞书投递适配，默认只记录 in-app，配置 `RESEND_API_KEY`、`EASTAURA_NOTIFICATION_FROM`、`EASTAURA_NOTIFICATION_TO` 或 `FEISHU_WEBHOOK_URL` 后会尝试真实投递，并回写 `delivered`、`deliveredAt` 和 `deliveryError`；飞书机器人开启签名校验时配置 `FEISHU_BOT_SECRET`。

已补强后端可运营数据层：Lead 列表支持 `status`、`riskLevel`、`source`、`country`、`q`、`limit`、`offset` 查询；AI triage 后会把 `riskLevel`、`fitScore`、`intentScore`、`riskScore` 和 `latestAiSummary` 快照写回 lead 主记录，便于 Workbench 直接筛选。生产构建下内部 API 已 fail-close：未配置 `EASTAURA_ADMIN_API_TOKEN` 且未显式设置 `EASTAURA_ALLOW_OPEN_ADMIN_API=true` 时返回 503。

已完成真实案例/API token 前的后端 P0 底座：公开 Intake 增加内存限流、重复提交防护和 Turnstile 预留；新增 `lead_events` 事件日志；新增 `GET /api/dashboard/stats` 聚合 API；新增 `GET /api/leads/export` CSV 导出；新增 `POST /api/notifications/{id}/retry` 通知重试。验证覆盖创建 Intake、查看 lead_events、Dashboard stats、CSV export、通知重试、重复提交 400、生产未配 admin token fail-close 503。

已检查 Kimi/Workbench UI 团队放入的 `workbench-ui/` Vite React 原型，并用 Browser Use 预览。当前已覆盖 Workbench Prompt 的核心页面：Dashboard、Content Studio、Leads、Lead Detail、Review Tasks、Notifications、Skills & Templates、Settings；但与 `docs/assets/workbench-ui/` 的 6 张样板图相比，仍缺 POV 短视频生成器、发布日历、线索归因三类独立页面，以及样板图中的照片缩略图、社媒平台图标、人物头像、插画/品牌装饰和更强的右侧 Agent 面板视觉。

已复验当前 Workbench UI：通过 Browser Use 截取 Dashboard、Content Studio、Leads、Lead Detail、Review Tasks、Skills 页面，截图保存到 `docs/assets/workbench-ui-current/`。`workbench-ui` 的 Vite dev 服务在 `http://127.0.0.1:5173/workbench` 可访问，`npm run build` 在沙箱外验证通过。判断它已经是可用的静态前端骨架，但还不是设想中的第二版增强稿：仍未补齐样板图 03/04/05 对应的 POV Video Generator、Publishing Calendar 和 Lead Attribution 独立工作流。

已处理 `workbecnch-ui-2/app-old/` 新版 Workbench：补齐 Dashboard、Content Studio、POV Video Generator、Publishing Calendar、Lead Attribution、Leads、Lead Detail、Review Tasks、Notifications、Skills、Settings、Partners & Assets 等页面的 Eastaura 业务内容；修复 Next 16 动态路由导致 `/workbench/leads/lead_003/` 显示 `Lead not found` 的问题；修复 Leads 状态筛选逻辑；把长输入改为 textarea、日历改为横向可读周视图、内容表格收窄、Resources 加入侧边栏并改为合作方/资产库；`next.config.ts` 改为 dev 使用 `.next`、生产导出使用 `dist`，避免 `next build` 后污染 dev server。`npm run build` 已通过，Browser Use DOM 逐页复查无 console error；Browser Use 截图接口当前会超时或黑屏，暂以右侧浏览器实际页面和 DOM 结果作为验收依据。

已检查 Kimi 生成的公开 Website 原型 `https://m55sxklrr6ome.ok.kimi.link/` 并归档二轮改版 prompt 到 `docs/KIMI_WEBSITE_UI_REVISION_PROMPT_2026-04-27.md`。判断当前 Kimi 输出是 Next.js 站点，技术栈方向与项目一致；但只有首页返回 200，`/program/`、`/safety/`、`/insights/`、`/intake/`、`/thank-you/` 均返回 404。首页还存在 `text-warm-white`、`bg-warm-white` 等 Tailwind class 未生成导致 hero/CTA 低对比的问题，移动端文字溢出，整体组件偏普通卡片模板。已参考 21st.dev 的 Hero、Landing Page、CTA、Testimonials 分类和 ShadcnSpace 组件，整理了可给 Kimi 下一轮使用的整体整合 prompt。

已将本地 `Kimi_Agent_Eastaura Wellness Retreat Prototype.zip` 作为 Kimi Website 骨架检查：zip 顶层静态导出版包含多页面 HTML 和图片，但 `eastaura/src/app` 源码基本仍是 create-next-app 起步页，不适合作为后续维护源码。现已在根 Next 项目重建可维护公开 Website：实现 `/`、`/program`、`/safety`、`/insights`、`/insights/[slug]`、`/intake`、`/thank-you`，复用 Kimi 图片资产到 `public/images/`，注入项目内 PRD/假设方案内容，保留单张 luxury retreat hero 方向，并补齐 trust bento、program timeline、Safety FAQ、Insights cards、Intake 多段表单和 footer TikTok/Instagram/Facebook icon 入口。当前 Intake 表单已接真实 `POST /api/intake`，提交后成功跳转 `/thank-you?leadId=...`。

公开 Website 验证结果：`npm run build` 在沙箱外通过；`/`、`/program`、`/safety`、`/insights`、`/insights/what-is-tcm-wellness-retreat`、`/intake`、`/thank-you` 均返回 200；CDP 移动端真实视口验证 `clientWidth/bodyScrollWidth/documentScrollWidth = 375/375/375`，无横向溢出；Intake 表单测试提交成功跳转 `/thank-you`。截图保存到 `docs/assets/eastaura-website-current-desktop.png` 和 `docs/assets/eastaura-website-current-mobile-cdp.png`。

本轮已按用户反馈重做公开 Website 首页视觉：明确 desktop 和 mobile 是两套布局策略；桌面端从居中海报式 hero 升级为低亮沉浸式 boutique luxury hero、右侧 private pilot trust note、底部 trust strip，并让首屏露出下一节内容；新增 Opening Editorial Statement、错位图片 collage、recovery state chips、横向 retreat moments rail、sticky 5-Day Reset journey 和首页 deep olive safety boundary 区块；整体色彩从高亮米白降为 warm ivory / stone / deep olive / aged gold；加入 hero slow zoom、scroll reveal、hover lift 和 reduced-motion 降级。参考方向来自 Six Senses、Aman luxury resort website case study 和 boutique editorial resort 设计规律；视觉概念稿由内置 imagegen 生成，路径：`C:\Users\hp\.codex\generated_images\019dce5d-2ea4-7e40-bc2e-c9f8b6221ea9\ig_0f83ab4c9ec2fdee0169ef340702d8819192a1a131533c268a.png`。验证：`npm run typecheck` 通过，`npm run build` 在沙箱外通过；Browser Use 本地页面移动端首屏无 console error；Edge headless 1440px 桌面截图保存到 `docs/assets/eastaura-website-redesign-desktop.png`。

已从 21st.dev 候选组件中筛出 8 个可借鉴的 UI 方向，并保存预览拼图到 `docs/assets/component-previews/selected-21st-components.png`；单图预览也保存于同目录，便于后续给 Kimi 或本项目实现时引用。

用户明确不喜欢 21st 的多图组 hero 方向，认为当前 Kimi 首页“大图满屏 + 居中品牌文案”的 hero 布局方向是对的；下一轮 Website prompt 已调整为保留 luxury boutique 单张大背景图 hero，只优化图片质感、遮罩、文字对比、CTA 可读性和底部信任条。

本轮已给 `workbecnch-ui-2/app-old/` Workbench 增加系统级中英文切换：新增 `LanguageProvider`、Workbench i18n 字典和顶栏语言分段控件，默认中文并用 `localStorage` 记忆选择；侧栏、顶栏、状态标签、Dashboard、Content Studio、Calendar、Video Generator、Attribution、Leads、Review Tasks、Notifications、Skills、Settings、Resources 等主要系统操作文案已接入翻译。客户线索、AI 摘要、社媒内容、Campaign 名、UTM/sourceCode、Skill 长文本等对客或业务素材仍保留英文，避免影响海外传播和归因一致性。`npm run lint` 与 `npm run build` 已通过；Browser Use 在 `http://localhost:5182/workbench/` 验证默认中文、切换英文、再切回中文并进入 Content Studio 均通过。build 仍提示 Next 多 lockfile workspace root warning，属于既有结构提醒。

用户希望公开 Website 底部增加 TikTok、Instagram、Facebook 图标入口；下一轮 prompt 已补充要求 footer 增加可识别社媒 icon button，暂无真实账号链接时使用安全占位，不编造真实 URL。

本轮已更新 `AGENTS.md` 的“大任务执行规范”，新增 sub-agent 显式授权触发句：`授权：本任务允许使用 sub-agents / parallel agents，并允许按项目 AGENTS.md 指定模型。` 若未授权，Agent 应先提示补充授权或说明只能单 Agent 执行。

本轮已继续修复 `workbecnch-ui-2/app-old/` Workbench 排版和交互：Dashboard 移除居中窄栏并改成更紧凑的 dashboard 信息架构，桌面侧栏加宽且文字更可读，移动/中等宽度顶栏不再被菜单按钮压住；`TopBar` 的 `Triage Lead` 增加本地反馈；`Content Studio` 的 `New Draft`、`Add Topic` 和 Content Agent 生成类操作已有本地状态与列表更新；`Publishing Calendar` 放大排期缩略图、折叠拥挤条目，并给 Add Content、切周、空档、新 brief 等操作增加反馈。`AgentPanel` 保持 server-safe：有 `onClick` 的动作可点击，无交互动作显示 `Soon`，避免假按钮和 Next client/server 边界错误。`npm run lint` 与 `npm run build` 已通过；Browser Use 复查 Dashboard、Content Studio、Calendar 的关键路径通过。build 仍提示 Next 多 lockfile workspace root warning，属于既有结构提醒。

本轮按用户反馈继续做 Workbench 可读性改版：Browser Use 先截取 Dashboard、Content Studio、Video Generator、Calendar、Attribution、Leads、Lead Detail、Review Tasks、Notifications、Resources、Skills、Settings 现状，保存到 `docs/assets/workbench-density-before/`；随后将 `workbecnch-ui-2/app-old/` 的 Workbench 内容区从居中窄容器改为全宽工作台，放大 TopBar 搜索、通用 Card、AgentPanel、页面标题和核心卡片字号，并重排 Dashboard 为“今日重点 -> 决策队列 -> 指标 -> 漏斗图/简报”的层级。Content/Calendar/Leads/详情/设置等页面移除窄 `max-w-* mx-auto` 限制，宽屏下减少两侧空白；Calendar 卡片和内容缩略图放大，Content Topic 卡片放大以降低密度。为避免构建依赖 Google Fonts 网络请求，已移除 `next/font/google`，改用本地系统字体变量。验证：`npm run lint` 通过，沙箱外 `npm run build` 通过；Browser Use 重新截图保存到 `docs/assets/workbench-density-after-clean/`（IAB 当前窄视口用于移动检查），Chrome headless 以 1600px 截取 12 个桌面页面保存到 `docs/assets/workbench-density-final-desktop/`，并额外用 2048px Dashboard 截图确认宽屏右侧大留白已解决。

本轮按用户新的 Workbench 示意图反馈完成信息架构收敛：5.5 主流程先分析示意图结构，确认目标是“主界面只暴露少量关键状态和入口，细节下沉到详情/展开区/子页面”；随后拆成 3 个 gpt-5.3 代码子任务执行，分别负责 Dashboard/共享 FocusListPanel、Content/Calendar、Attribution/Leads，5.3 只做代码实现不做视觉判断。主控集成后新增/完善 `FocusListPanel` 渐进披露组件，Dashboard 改为 KPI + 今日 3 件事 + 重点线索 + 右侧 Agent；Content、Calendar、Attribution、Leads 默认隐藏完整表格/周视图/全渠道表，只保留 Top 3/4 焦点和“查看完整”入口；补齐新增首屏文案中文 i18n；修复移动端页头被按钮挤压导致标题竖排的问题。验证：`npm run lint` 通过，沙箱外 `npm run build` 通过；Browser Use 打开核心页面无 console error，并复查移动端标题、主界面密度和默认未展开状态。当前旧 dev server/HMR 曾出现页面级状态按钮不稳定，最终未把该 HMR 状态作为交互验收依据；生产构建本身通过。

本轮围绕获客系统做外部资料调研和技术方案收敛：参考 OpenAI Agents SDK、Claude Skills、OpenClaw/Playbooks 营销类 Skill、LangGraph/CrewAI/n8n 编排、OpenAI GPT Image、Runway、Luma、Google Veo、OpenAI Sora、Google helpful content、TikTok Creative Insights、FTC/NCCIH 健康广告与安全资料，判断 Eastaura 应采用“知识库 -> Skill 化 Agent -> 状态机/任务队列 -> 图片/图生视频 provider adapter -> 人工审核 -> 发布记录 -> CRM 归因”的混合模式。已新增获客技术实现文档，并在 README/ARCHITECTURE 中补充索引和关键架构决策。

本轮生成 Eastaura logo 概念方向板后，用户选定 01：`Eastaura` serif wordmark + 金色半日 + aura 弧线。已新增 `src/components/site/EastauraLogo.tsx` 并替换公开 Website header/footer 的纯文字/圆形 Ea 标识；对应样式写入 `src/app/globals.css`。已从概念图中单独裁出 01 logo 图片，保存到 `public/images/brand/eastaura-logo-concept-01.png`。`npm run typecheck` 与沙箱外 `npm run build` 已通过。

本轮已完成飞书群机器人签名通知接入：`src/lib/server/notification-delivery.ts` 会在配置 `FEISHU_BOT_SECRET` 时自动为飞书 webhook payload 追加 `timestamp` 和 `sign`；新增 `scripts/notify_feishu.py` 用于本地测试飞书机器人，规避当前 PowerShell/curl TLS 问题；`.env.example` 与 README 已补充 `FEISHU_BOT_SECRET`。使用用户当前飞书 webhook 和签名密钥做了一次进程内环境变量测试，飞书返回 `success`，真实密钥未写入仓库。

本轮已为“飞书里召唤 Codex”打通第一段：新增 `POST /api/feishu/events` 飞书自建应用事件回调，支持 URL challenge 校验、`im.message.receive_v1` 消息事件接收、`/health` 与 `/help` 白名单命令响应逻辑；新增 `FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_VERIFICATION_TOKEN` 环境变量说明。Vercel CLI 已安装并登录，项目已 link 到 Vercel `yangxiamikes-projects/ai-eastaura`；首次部署因原型 zip、Workbench、浏览器缓存等目录过大失败，已新增 `.vercelignore` 排除本地/原型资产后部署成功，正式地址为 `https://ai-eastaura.vercel.app`。已用 Python 验证 `https://ai-eastaura.vercel.app/api/feishu/events` 可返回飞书 `challenge`，`/api/health` 正常。

本轮调研、落地并实测了 sub-agent 任务拆分和主动调用规则：Claude 官方建议 subagent 用于上下文隔离、并行独立任务和新视角 review；Obra/Superpowers 的 `subagent-driven-development` 最接近本项目痛点，核心是“主控先写/抽取完整任务计划 -> fresh subagent 执行单个独立任务 -> spec compliance review -> code quality review -> 主控集成”；Codex 社区 `codex-subagent` skill 强调父 Agent 必须给 subagent 提供目标、范围、约束、输出格式和完成标准。已更新 `AGENTS.md`：新增“主控主动拆分协议”“Sub-agent 派发模板”“Review 与集成规则”，要求主控先做目标/范围/验收标准、依赖图、写入边界和集成点判断；并要求维护 `Accumulated Discoveries`，把前序子任务发现的项目约束传给后续子任务。随后用假设需求“Website Intake 接真实 API + Workbench Leads 读真实 API”实际调用 gpt-5.3-codex explorer 验证成功；sub-agent 能按新版规则产出目标、依赖图、写入边界、worker 列表、主控保留项和 Project Discoveries，并指出缺口。已按反馈补充“未授权时单 Agent 降级流程”“fallback 统一策略”“文档责任默认归主控”。另一次测试确认：不必固定粘贴授权句，只要当前任务消息用自然语言明确允许 sub-agent、parallel agents、多 agent 或按 AGENTS.md 多 agent 流程执行，也可以触发调用；完全未提及授权时仍不能默认调用。

## 最近关键决定

- 不与传统景点型入境游拼资源，主打中医康养体验和品牌化服务。
- 对外不直接使用“亚健康”作为核心卖点，转译为压力、睡眠、精力、消化、慢性紧张、恢复力等西方可理解场景。
- 首期产品应以非诊疗或低风险体验为主，医疗诊疗环节必须由合规医疗机构和执业医师承接。
- 冷启动不先做平台，先做高信任、高客单、可人工交付的 concierge 型 MVP。
- `ai-marketing-system/` 是参考目录，根目录 `.gitignore` 会忽略它，正式版本管理以项目根目录为准。
- Agent 回复风格以清楚准确为主，不再要求每次声明开发/研究模式；可适度主动使用 emoji 和文字符号标记状态、结论、风险、验证和下一步，提升阅读效率。
- Eastaura 英文定位句：`A China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance.`
- MVP 系统建议采用 Next.js、TypeScript、Tailwind CSS、Supabase、Resend 和 Vercel。
- 一人公司模式采用 `Founder as trust owner, AI as operating system, partners as delivery network.`。
- AI 首期只做线索摘要、风险提示、购买意向评分和跟进草稿，不做医疗判断和自动接单。
- Agent 背后必须有 Skill；Skill 是方法、模板、边界、禁用词、输入输出 schema 和审核规则，避免 Agent 自由发挥。
- 获客系统可以参考 `ai-marketing-system/` 的底层工作台模式，但 Eastaura 需要重构为 Campaign、Content、Lead、Interaction、Proposal、Partner Task、Review Task 和 AI Run 等业务对象。
- 获客内容生产第一版不做全自动发布或自动群发，采用 Skill + 状态机 + provider adapter；Agent 负责生成选题、脚本、分镜、图片/视频 prompt、合规提示和复盘建议，发布、广告、开发信和医疗边界判断保留人工确认。
- 第三方 OpenClaw/Playbooks 营销 Skill 可借鉴结构和方法，但不能直接装进生产环境执行；需要重写为 Eastaura 自有 Skill，并加入医疗广告、版权、真实客户素材和品牌边界。
- 图像生成建议优先接 OpenAI GPT Image；图生视频建议先在 Luma 或 Runway 中选一个做 provider adapter；Sora 2 Videos API 已由官方标注 2026-09-24 下线，不应作为长期唯一依赖。
- 系统分层确定为获客系统、CRM 系统、运营系统、内容复购系统，中间由 Agent 编排，关键判断人工介入。
- 冷启动获客中社媒运营和短视频生成是重要入口，但目标不是泛健康涨粉，而是建立信任、解释中医康养边界并导入 Intake 表单。
- AI 指挥台需要通知中心，优先接飞书机器人 Webhook 和邮件；个人微信不作为第一版正式通道，只可作为低风险提醒的后置选项。
- 临时开发假设：首发采用“上海入境 + 杭州康养体验”，首批客群为欧美 35-60 岁高压职业人群，主产品为 5 天 4 晚 TCM Wellness Reset，Pilot 价格先假设 $2,500-3,000。
- 外部 Agent 平台如 Hermes/OpenClaw/AgentScale 可作为网页研究、浏览器自动化、部署或资料采集辅助，但不应成为 Eastaura MVP 的核心业务系统；核心仍应沉淀在 CRM、Content Studio、Skills、review_tasks 和 ai_runs 中。
- 所有开发任务开始前必须确认目标、范围、交付物和验收标准；大任务需由主控 Agent 拆分子任务、调用 gpt-5.3 系列 sub-agents、统一集成验证，并最多主动修复 3 轮后收敛或报告阻塞。
- 受 Codex/CUA 上层运行规则限制，`AGENTS.md` 不能单独视为用户对 sub-agents 的当前任务授权；后续大任务如需启用 sub-agents，用户应在任务消息中加入 `AGENTS.md` 中记录的显式授权句。
- sub-agent 模型路由更新：当用户在当前任务消息中明确授权 sub-agents/parallel agents 并允许按项目规则指定模型时，代码、工程实现、测试修复、重构、接口联调、配置、脚本和代码审查等任务优先用 `gpt-5.3-codex`；视觉方向、界面审美判断、品牌风格、设计方案、图片/视觉 prompt 和前端视觉 review 等任务优先用 `gpt-5.5`；混合任务由主控按子任务职责拆分模型。
- sub-agent 拆分原则后续应从“按页面/模块粗分”升级为“按依赖图和写入边界拆分”：可并行任务必须输入独立、输出可验证、写入文件不重叠；紧耦合/同文件/顺序依赖任务由主控或单个 worker 串行处理；每个 worker prompt 必须包含目标、范围、禁止范围、验收标准、允许修改文件、输出格式和阻塞上报格式。
- 前端原型策略：先让 Kimi 生成两个可运行、可点击的静态前端骨架，分别是公开 Website 和内部 Workbench；Codex 后续负责整理项目结构、接入 Supabase、AI Agent、Skill 文件、通知和真实表单/API。
- 后端 P0 已预留真实数据库和 LLM 接入层；未配置密钥时使用内存存储和确定性规则 mock，接口边界继续保留给 Supabase、Resend、飞书 Webhook 和真实模型。
- Skill 第一版作为仓库内版本化知识/规则资产维护，不先开发 Skill 管理后台；后端记录 `skillRefs`、`promptSnapshot` 和 `outputSchemaVersion` 用于后续审计。
- 后端 repository 层优先保持 API 响应结构稳定：Website/Workbench 后续接入不应感知底层是内存 mock 还是 Supabase。
- 真实 LLM 接入先采用 chat-completions 兼容 HTTP 接口，不绑定某一家 SDK；通过 `EASTAURA_LLM_ENABLED`、`EASTAURA_LLM_API_URL`、`EASTAURA_LLM_API_KEY` 和 `EASTAURA_LLM_MODEL` 控制。
- 内部 API guard 先采用单 token 方案，适合 MVP 早期 Workbench 保护；后续接 Supabase Auth 或正式登录后再替换。
- 通知投递采用“先写通知记录，再尝试投递”的方式，外部服务失败不影响 Intake 主链路。
- Lead 主表保留 AI triage 快照，`ai_runs` 保留完整审计输出；这样列表筛选走 lead，详情审计走 ai_runs。
- 真实案例和真实 token 接入前，后端优先补“低依赖、低返工、提升验证效率”的底座：防滥用、统计、导出、通知重试和事件日志；暂不扩张支付、供应商后台、复杂账号体系和 Skill 管理后台。
- Workbench UI 二版判断：`workbecnch-ui-2/app-old/` 已经是可运行、可构建、可接真实 API 的 Next.js App Router 后台骨架，核心工作流已覆盖冷启动内容、短视频脚本、发布排期、归因、线索、人工审核、通知、Skill 和设置；Dashboard、Leads、Lead Detail、Notifications 已进入真实 API 联调阶段，下一轮重点应转向更完整的真实交互状态、视觉资产、鉴权/部署策略和内容生产 API。
- Workbench 信息架构进一步确定为渐进披露：Dashboard/Content/Calendar/Attribution/Leads 的主界面只承载关键指标、Top 3/4 焦点和 Agent 操作入口；完整列表、表格、周视图、渠道明细和长摘要默认下沉到展开区、详情页或后续真实子页面。
- Workbench i18n 采用“系统壳层可切换、对客内容英文优先”的策略：中文用户日常操作看中文，海外宣传文案、客户原始输入和归因标识保持英文原文。
- Website UI 二轮判断：当前 Kimi Website 是 Next.js 输出，方向正确但路由不完整且视觉 token 有 bug；下一轮优先要求补齐所有页面路由、修复 Tailwind token、重做首屏可读性、用 21st.dev/shadcn 风格升级 hero、trust bento、program timeline、safety FAQ、intake form 和 insights cards。
- 公开 Website 源码决策：以根项目 `src/app` 中的 Next App Router 页面为准，不继续依赖 Kimi zip 内不可维护的 create-next-app 源码；后续真实表单接入应把 `/intake` 前端提交改为调用现有 `POST /api/intake`。
- 公开 Website 视觉决策：后续不再把桌面端当作移动端放大版；桌面端以 boutique luxury wellness editorial 为主，强调非对称图文、沉浸摄影、横向体验 rail、sticky journey 和深色 safety/trust 区块；移动端保留单列清晰阅读，并优先使用横滑模块降低长文压力。
- Eastaura logo 方向选定 01：以安静的 serif wordmark、金色半日和 aura 弧线表达东方康养、恢复感和 boutique luxury 气质；先落地为代码版可维护标识，后续如需品牌包再导出独立 SVG/PNG/favicons。

## 当前阻塞

- ENG-WB-CSV-001 完整 harness browser-flow 已收口：api-contract-tester-3 PASS；browser-flow-tester-4 使用 Playwright probe 发现不存在 lead 页面 fallback 数据误展示问题；Dev 子 Agent 修复后，browser-flow-tester-5 PASS。当前 Test Gate 已通过，GitHub Gate 已通过 SSH 完成 branch push：`codex-eng-wb-csv-real-testing -> origin/codex-eng-wb-csv-real-testing`。剩余阻塞是 PR / CI / Review / Merge 尚未完成，且 `gh` 本地 token 仍不可用，PR 需要先走 GitHub 网页创建或后续修复 `gh` 凭据；仍不得标记最终 PASS。

- 尚未确定首发城市、合作机构资质、目标客群国家和价格带。
- 尚未确定完整视觉系统、域名、支付方式和隐私政策细节；logo 方向已先选定 01。
- 后端已预留 Supabase、真实 LLM、Resend 和飞书 Webhook 接口；本地会话已验证 `persistence=supabase` 且 intake->leads 可回读，飞书外发强校验已 `DONE`。当前通知侧剩余阻塞是 Resend 邮件通道缺少真实 `RESEND_API_KEY` 与发件人配置，尚未满足 `EXPECT_NOTIFICATION_CHANNELS=email,feishu` 双通道验收。飞书自建应用事件回调已部署到 Vercel 并通过 challenge 测试，但尚未在飞书后台填入订阅方式、添加消息事件、发布版本，也尚未配置 `FEISHU_APP_ID`/`FEISHU_APP_SECRET` 到 Vercel 环境变量用于机器人主动回复。
- DeepSeek P1 聚合优化代码已落地并通过验证，但当前 Supabase 仍需手动执行 `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql` 才能真正启用数据库侧 RPC 聚合；未执行前代码会使用兼容 fallback 保持接口可用，性能优化不算完全生效。
- 本轮验证生成的 `.tmp-*` 临时日志已从版本控制清理，并通过 `.gitignore` 忽略；`docs/CODEX_CONVENTIONS.md` 已按当前阶段编码约定纳入文档。
- 本机终端到 Supabase 的 HTTPS 调用存在工具链问题：`Invoke-WebRequest` 报“基础连接已关闭（接收时发生错误）”，`curl.exe` 报 `SEC_E_NO_CREDENTIALS`；导致本地 `GET /api/leads`、`POST /api/intake` 端到端请求超时，当前不宜把超时误判为业务代码故障。
- `npm audit --omit=dev` 提示 Next 依赖链中的 PostCSS moderate 漏洞暂无修复版本，需持续关注上游。
- `workbench-ui` 当前使用独立 Vite + React Router HashRouter，与主项目建议的 Next.js App Router 尚未统一。
- `workbecnch-ui-2/app-old/` 仍是独立 Next.js 原型目录，但 Dashboard、Leads、Lead Detail、Notifications、Content Studio、POV Video Generator、Publishing Calendar、Lead Attribution 和 Review Tasks 已通过服务端代理接根项目 API；仍未制定正式部署、登录鉴权和是否合并进根项目的策略。
- Browser Use 右侧可见浏览器排查结论：`iab` runtime 初始化、选中右侧标签、读取标题/URL 均正常；用户手动在右侧浏览器打开 `https://21st.dev/home` 后，Agent 也能读取到该 URL 和页面标题，说明右侧浏览器和站点访问本身正常。失败点集中在 Agent 对外网页面的操作权限检查：无论是 `tab.goto("https://21st.dev")`，还是对已手动打开的外网页面执行 CUA 截图，都会先触发 `nodeRepl.fetch` 调用 `chatgpt.com/backend-api/aura/site_status`，并报 `nodeRepl.fetch request failed`。已确认 `127.0.0.1:8890` 由 LibCyber Desktop 的 `core-windows-amd64.exe` 监听，命令行环境代理可用；临时开启 Windows 当前用户代理并调用 WinINet 刷新后，外网 Browser Use 仍失败；WinHTTP 设置因权限不足始终为直连。复测后已恢复 Windows 当前用户代理为空/未启用。本地 `C:\Users\hp\AppData\Local\OpenAI\Codex\bin\codex.exe` 仍是 `0.125.0-alpha.3`；后台修复脚本曾成功把 bin 替换为 `0.125.0`，但 Codex Desktop 重启后会自动把本地 bin 重新铺回 alpha，说明单改 `AppData\Local` 不持久。当前判断：问题不在项目、目标站点或右侧浏览器，而在 Codex Desktop/Browser Use runtime 的 authenticated fetch 安全检查链路或 Desktop App 版本本体；下一步应更新 Codex Desktop App 本体，或等待/切换可用版本。
- 2026-04-28 复测 Browser Use 外网：按插件要求使用 `iab` runtime 打开 `https://example.com/` 和 `https://21st.dev/`，两次均在导航阶段失败，错误仍为 `nodeRepl.fetch request failed`，标签页停留在 `about:blank`；结论为当前会话 Browser Use 外网仍未恢复。
- 2026-04-28 继续诊断 Browser Use 外网：Node REPL 内 `fetch("https://chatgpt.com/")` 报 `connect EACCES 199.16.158.9:443`，系统 DNS/公共 DNS 对 `chatgpt.com` 解析到 Twitter/Facebook 等异常 IP；通过本地代理 `127.0.0.1:8890` 做 CONNECT 隧道访问 `chatgpt.com` 可返回 `HTTP/1.1 200 OK`。因此当前根因更像 Browser Use / Node REPL 内部安全检查请求未走本地代理，导致 `chatgpt.com/backend-api/aura/site_status` 链路失败。可尝试临时设置当前 Windows 用户代理和用户级 `HTTP_PROXY`/`HTTPS_PROXY` 为 `127.0.0.1:8890` 后重启 Codex Desktop；该操作会影响当前用户网络，必须由用户明确批准。
- 2026-04-28 追加诊断：确认 Browser Use 插件脚本在外网导航前调用 `globalThis.nodeRepl.fetch` 访问 `https://chatgpt.com/backend-api/aura/site_status`；该通道不是普通 `globalThis.fetch`，因此给页面/Node 全局 fetch 打代理补丁无效。当前 `~/.codex/config.toml` 已启用 `browser_use`、`in_app_browser`、`js_repl`，终端环境也已有 `HTTP_PROXY/HTTPS_PROXY=http://127.0.0.1:8890`。`node_repl` 子进程由 Codex app-server 启动，内部沙箱命令显示 `network = {enabled = false}`，Browser Use 依赖的安全检查实际由 `nodeRepl.fetch` allowlist 通道完成；当前失败点收敛为 Codex Desktop/app-server 的 `nodeRepl.fetch` 未成功通过本地代理访问 `chatgpt.com`，不是项目代码可修复问题，也不应通过修改插件跳过站点安全检查。
- 2026-04-28 已创建临时辅助脚本 `C:\tmp\start-codex-with-proxy.ps1` 并打开独立 PowerShell 窗口，用于在用户完全退出当前 Codex Desktop 后，以当前进程临时环境变量 `HTTP_PROXY/HTTPS_PROXY=http://127.0.0.1:8890` 重新启动 Codex；该脚本不修改 Windows 系统代理或用户级环境变量。
- 2026-04-28 代理启动复测：用户按 `C:\tmp\start-codex-with-proxy.ps1` 重新启动 Codex 后，当前会话环境已确认存在 `HTTP_PROXY/HTTPS_PROXY=http://127.0.0.1:8890`，但 Browser Use 打开 `https://example.com/` 仍失败，错误仍为 `nodeRepl.fetch request failed`，页面停留在 `about:blank`。结论：仅通过代理环境启动 Codex 不能修复当前 Desktop/app-server 的 `nodeRepl.fetch` 安全检查链路问题。
- 当前会话 sub-agent `@browser-use` 阻塞：插件能力未挂载到该会话，报错 `unknown MCP server 'browser-use'`，导致无法执行本轮 `/intake -> Workbench` 页面点击流验收。
- 当前会话 `@browser-use` 二次阻塞：即使端口服务已就绪，子代理仍报告无可调用 Browser Use 本地浏览器控制接口，无法完成“只用 Browser Use”的点击流验收。

## 下一步

- ENG-WB-CSV-001 下一步：在 GitHub 网页基于已推送分支 `codex-eng-wb-csv-real-testing` 创建 PR，等待 CI / Review / Merge，并更新状态文件。如 CI 或 Review 失败，回到原 Dev 修复并重跑相关 Test 岗位。`gh` 凭据可后续单独修复，不再阻塞当前 branch push。

- Browser Use 外网恢复建议：重启 Codex Desktop 或新开一次 Codex 会话，让 Node REPL MCP 重新连接并加载真实磁盘上的 `codex-cli 0.125.0`；优先验证 `https://21st.dev/`，因为该站网络可达。`land-book.com` 当前目标站自身返回 Cloudflare challenge，即使 Browser Use 前置检查恢复，也可能仍需换代理节点或使用 21st.dev 作为设计参考来源。
- Browser Use 本地验收恢复建议：先确认当前会话已挂载可用 `browser-use` MCP server（非仅插件名可见）；挂载后优先重跑 `http://127.0.0.1:3000/intake -> http://127.0.0.1:5182/workbench/` 点击流，并记录 308/console error/lead 可见性证据。
- 若 Browser Use 运行时继续不可用，可在你确认后临时降级为 Playwright/脚本验收，先保证 `/intake -> Workbench` 业务闭环可重复验证，再等待 Browser Use 运行时恢复。
- 在本地/CI 固化四条回归命令：`npm run verify:intake-flow`、`npm run verify:workbench-proxy`、`npm run verify:notification-channels`、`GET /api/health`，并记录每次结果 JSON 作为阶段验收证据。
- 按 `docs/WORKBENCH_PRODUCTIONIZATION_PLAN_2026-04-28.md` 决定 Workbench P0 发布拓扑（独立部署或并入主站），并锁定环境变量注入策略。
- 固化外发验收口径：先确保根服务跑在“最新构建 + 明确端口”（建议临时用 `:3010` 验证），再以 `EXPECT_NOTIFICATION_CHANNELS=feishu npm run verify:notification-channels` 复验；随后补 Resend 邮件通道并扩展到 `email,feishu` 双通道强校验。
- 选择一个首发城市和一个核心客群，设计 3-7 天 MVP 套餐。
- 建立合作方筛选清单：中医机构、翻译、酒店、接送、保险/应急。
- 做英文落地页和 10-20 个海外用户访谈，验证卖点、价格和顾虑。
- 首批目标是获取 3-5 个真实付费客户或 1 个 6-10 人小团，而不是追求大规模曝光。
- 在 Supabase SQL Editor 按顺序执行 migration：`supabase/migrations/202604270001_mvp_backend.sql` -> `supabase/migrations/202604280001_content_pipeline_p0.sql` -> `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql`，先恢复 `leads` 主链路，再验证内容归因链路和 Dashboard/Attribution 数据库侧聚合；当前代码在 RPC 未迁移时有兼容 fallback，但性能优化需执行第三个 migration 后才完全生效。
- 解决本机终端 HTTPS 调用 Supabase 的证书/代理问题后，再复测 `GET /api/leads` 与 `POST /api/intake`，避免把网络层超时与 schema 问题混淆。
- 配置 `EASTAURA_LLM_*` 环境变量，验证真实 LLM triage 输出，并保留医疗边界、schema 校验和人工审核规则。
- 配置 `EASTAURA_ADMIN_API_TOKEN`，让 Workbench 调用内部 API 时带 Bearer token。
- 在飞书开放平台「事件与回调」里把订阅方式配置为 `https://ai-eastaura.vercel.app/api/feishu/events`，校验通过后添加消息接收事件并发布版本；随后把 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET` 配到 Vercel 环境变量，验证群里 @Eastaura Codex 发送 `/health` 能收到回复。
- 将飞书 webhook 与 `FEISHU_BOT_SECRET` 写入本地/部署环境变量后，验证新 lead、高意向 lead 和高风险 lead 的真实通知投递；Resend 邮件通知仍需配置。
- 若启用 Cloudflare Turnstile，将公开 Website `/intake` 继续补上传入 `turnstileToken` 的前端控件和失败提示。
- 继续扩展 Workbench 真实 API：补 `GET /api/leads/export` 下载入口、Skills 管理真实化、内容 metrics 批量导入和更完整的 loading/error/empty 状态。
- 基于 `docs/AI_ONE_PERSON_COMPANY.md` 把 AI summary、risk notes、intent score 和 follow-up draft 接入 MVP 后台 UI。
- 基于 `docs/GROWTH_OPS_CRM_AGENT_SYSTEM.md` 继续实现 CRM + AI 线索筛选，再扩展获客内容工作台和运营交付工作台。
- 基于 `docs/SOCIAL_VIDEO_COLD_START.md` 设计 Content Studio：选题库、短视频脚本、合规检查、发布状态和内容到 lead 的来源追踪。
- 基于 `docs/NOTIFICATION_CENTER.md` 设计通知中心：新 lead、高意向/高风险 lead、每日早报和任务逾期提醒。
- 基于 `docs/PROJECT_SYSTEM_OVERVIEW.md` 向非技术视角解释商业定位、客户旅程、一人公司运转、系统模块、后台指挥台和通知机制。
- 基于 `docs/ASSUMED_BUSINESS_PLAN_AND_DEV_GAPS.md` 先开发不依赖最终商业细节的底层闭环：Intake -> Lead -> AI summary/risk/score -> 后台详情 -> 通知 -> 人工状态流转。
- 基于 `docs/AGENT_SKILL_DESIGN.md` 先建立 P0 Skills：品牌、线索筛选、风险筛查、内容策略、短视频脚本、医疗边界、跟进邮件和通知优先级。
- 基于 `docs/WORKBENCH_UI_SAMPLES.md` 和 `docs/assets/workbench-ui/` 的 6 张 UI 样板图，后续设计后台冷启动总览、内容工作台、POV 视频生成器、发布日历、线索归因和客户详情页。
- Workbench 下一轮前端顺序：1）补 CSV export、Skills 的真实 API 接入和内容 metrics 批量录入；2）继续补桌面宽屏与移动端关键页浏览器验收；3）补社媒平台 icons、AI Agent 标识和更多可辨识业务视觉资产；4）决定是否把新版 Workbench 合并进根项目正式前端；5）制定独立 Workbench 部署与鉴权方案。
- Workbench i18n 后续可继续把翻译 key 从英文整句迁移为稳定 key，并补齐 Lead Detail 等更深层页面的系统文案；如后续需要 SEO 级双语，再评估路由/cookie 级语言策略。
- 基于 `docs/KIMI_FRONTEND_UI_PROMPTS_2026-04-27.md` 让 Kimi 生成 Website 与 Workbench 两套前端骨架代码，再把生成结果交由 Codex 统一整理、接入真实业务数据和 AI/通知流程。
- 将 `docs/KIMI_WEBSITE_UI_REVISION_PROMPT_2026-04-27.md` 的整合 prompt 发给 Kimi，要求下一轮公开 Website 修复 404 路由、Tailwind 颜色 token、hero 可读性、移动端溢出，并用 21st.dev/shadcn 风格组件升级整体质感。
- 如需做网上竞品/情感/关键词采集，先定义 `market_research_skill` 的输入输出 schema 和合规边界，再决定使用自建抓取脚本、浏览器自动化工具或第三方服务辅助采集。
- 根据 `docs/ACQUISITION_TECH_IMPLEMENTATION_PLAN_2026-04-27.md` 的下一阶段继续做 P1：接 OpenAI GPT Image 或本地素材库，补 `generation_jobs`/`generated_assets` 实现、素材 URL 存储、成本记录和人工重跑；视频 provider 暂后置。
- 后续阶段性变化继续追加到归档或新增日期归档，避免关键商业判断散落在对话中。
- 后续大任务执行时按新版 `AGENTS.md` 使用 sub-agent 拆分协议：先输出依赖图、写入边界、fallback 策略和主控保留项，再派发 worker；高风险或多文件任务增加 spec reviewer 与 quality reviewer 双审。
- 如要清理冗余，建议按风险顺序执行：先删 `node_modules`、`dist`、`.npm-cache`、日志、PID、`tsconfig.tsbuildinfo` 和空 profile；再处理重复截图与未引用大图；最后确认是否归档/删除 `workbench-ui/` 旧原型、`workbecnch-ui-2/deploy2/`、Kimi 原型 zip，以及是否重构或删除未引用的飞书辅助模块。

