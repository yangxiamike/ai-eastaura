# ARCHITECTURE

## 模块划分

- 海外获客：英文品牌叙事、内容营销、社媒/SEO、合作渠道。
- 产品设计：3-7 天中医康养套餐、服务流程、定价、用户筛选。
- 国内履约：中医机构、翻译、酒店、接送、客服和应急响应。
- 合规与风控：医疗广告边界、执业资质、用户知情同意、保险和隐私。
- 品牌延展：线上咨询、复购计划、中医药衍生产品。
- MVP 系统：英文官网、套餐页、Intake 表单、内部询盘后台、邮件通知和基础漏斗数据。
- 公开 Website 前端：根 Next.js App Router 内实现 `/`、`/program`、`/safety`、`/insights`、`/insights/[slug]`、`/intake`、`/thank-you`，使用项目内容数据和本地图片资产，作为 Kimi Website 骨架的可维护版本。首页桌面端采用 boutique luxury wellness 方向的沉浸式 hero、editorial collage、横向 retreat moments、sticky program journey 和深色 safety 区块；移动端保持单列可读和横滑内容优先。
- Workbench UI v2 原型：`workbecnch-ui-2/app-old/` 是独立 Next.js App Router 后台骨架，覆盖 Dashboard、Content Studio、POV Video Generator、Publishing Calendar、Lead Attribution、Leads、Lead Detail、Review Tasks、Notifications、Skills、Settings 和 Partners & Assets；Dashboard、Leads、Lead Detail、Notifications、Content Studio、POV Video Generator、Publishing Calendar、Lead Attribution 和 Review Tasks 已通过 Workbench 服务端代理接入根项目 API，API 不可用时保留 mock fallback。Workbench 内部通过 `LanguageProvider`、`src/lib/workbench/i18n.ts` 和顶栏语言控件提供系统级中英文切换。核心页面采用渐进披露结构，主界面只展示关键指标、Top 3/4 焦点和右侧 Agent 操作，完整表格、周视图、渠道明细和长摘要下沉到展开区或详情页。
- Workbench 发布策略（P0 已定）：继续独立部署 Workbench，浏览器只访问 Workbench `/api/workbench/*`，由 Workbench 服务端代理转发至 Root API；Root 侧内部 API 继续由 admin token 保护，避免浏览器侧暴露凭据。
- AI 运营层：线索摘要、风险提示、购买意向评分、跟进草稿、内容草稿和运营复盘。
- 获客内容生产流水线：根项目已新增 `campaigns`、`content_assets`、`storyboards`、`review_tasks`、`publish_posts` 和 `content_metrics`，P0 跑通选题/草稿、规则脚本、分镜、合规审核、人工批准、手工发布记录、表现录入和 Lead 归因；图片/图生视频 provider 仍保留为后续扩展，不做自动发布。
- 一人公司业务系统：获客系统、CRM 系统、运营系统和内容复购系统，中间由 Agent 编排层连接，关键判断由创始人介入。
- MVP 后端骨架：Next.js API Routes、Lead/AI run/Notification repository 层、Supabase 持久化适配、内存 fallback、Intake 校验、状态流转和备注记录。
- Skill 资产层：仓库内 `skills/*_v0_1/` 存放 Agent 使用的规则、schema、禁用词、示例和审核边界；第一版不做 Skill 管理后台。
- LLM 适配层：通过 chat-completions 兼容接口预留真实模型接入；缺少环境变量或调用失败时回退到确定性规则 mock。
- Admin API Guard：Intake 和 health 保持公开；Lead、Notification、Skill 等内部 API 在配置 `EASTAURA_ADMIN_API_TOKEN` 后要求 Bearer token。
- 通知投递层：in-app 通知始终入库；配置 Resend/飞书后创建外部通知并尝试投递，回写 delivered、delivered_at 和 delivery_error。
- Lead 查询层：Lead 列表支持状态、风险等级、来源、国家、关键词、limit 和 offset；AI triage 后会把风险等级、fit/intent/risk 分数和摘要快照写回 lead 主记录。
- Intake 防滥用层：公开表单默认启用内存限流和重复提交防护；配置 Turnstile secret 后进行 Cloudflare Turnstile 校验。
- 运营统计与导出层：Dashboard stats API 汇总 lead、风险、来源、通知失败；Content Attribution API 汇总内容表现和归因；Supabase 环境优先通过 `get_dashboard_stats()` 与 `get_content_attribution(...)` RPC 在数据库侧聚合，RPC 未迁移时保留兼容 fallback，避免接口中断。CSV export API 支持按 lead 列表筛选条件导出。
- 验收自动化层：`verify:workbench-proxy`、`verify:notification-channels`、`verify:intake-flow` 与 `verify:all` 构成回归管道；`/api/health` 返回通知配置布尔态，便于快速定位“配置未加载”与“外发失败”。
- Lead 事件日志层：lead 创建、triage、状态变更、备注、通知创建/投递/失败会写入 `lead_events`，用于漏斗复盘和审计。

## 数据流/调用关系

海外用户通过内容或合作渠道进入咨询，完成健康意向筛查和风险提示后，进入套餐选择、预订、入境接待、线下体验、离境后随访和复购转化。

MVP 系统数据流：海外用户访问官网后提交 Intake 表单，系统写入 lead 数据并发送邮件通知；内部运营在后台完成筛查、状态流转、备注记录和人工跟进。

AI 辅助数据流：lead 创建后生成用户摘要、风险提示、购买信号和下一步建议；创始人只把 AI 输出作为运营辅助，最终接单、拒单、报价和合规判断仍由人负责。

获客/运营/CRM 数据流：Campaign 和 Content 带来访问与 Intake，Lead 进入 CRM 后由 Agent 生成摘要、评分和跟进草稿；人工确认后进入 Consultation、Proposal、Deposit 和 Trip 运营流程；交付后的反馈再沉淀为 FAQ、案例和复购内容。

获客内容生产 P0 数据流：Workbench Content Studio 创建 campaign/content asset -> 根 API 用规则生成脚本和 short video storyboard -> compliance review 始终创建 open review task -> 人工批准后 asset 进入 approved -> Publishing Calendar 记录手工排期或发布 URL -> content_metrics 录入 click/lead_submit 等指标 -> `GET /api/content-attribution` 按 campaign/source/channel 汇总；Lead 通过 `source`、`campaign`、`utmSource`、`utmMedium`、`utmCampaign`、`utmContent` 保留内容来源。

当前 P0 后端数据流：`POST /api/intake` 校验表单 -> repository 创建 lead -> 读取 `eastaura_brand`、`lead_triage`、`risk_screening`、`medical_boundary` 和 `notification_priority` Skill -> 调用 LLM 适配层或规则 mock 生成 triage 输出 -> 写入 ai run -> 创建通知记录 -> 后台可查询详情、更新状态、添加备注或手动重新触发 triage。

Lead 查询数据流：Workbench 调用 `GET /api/leads` -> admin guard 校验 -> repository 根据查询参数筛选/分页 -> 返回 `leads`、`total`、`limit` 和 `offset`，便于后台做列表、筛选和分页。

通知数据流：业务事件 -> 创建 in-app notification -> 如果配置 Resend/飞书则创建对应 channel notification -> 调用外部 webhook/API -> repository 回写投递结果。外部投递失败不阻断 lead 创建和后台流转。

运营复盘数据流：业务动作 -> 写入 `lead_events` -> lead 详情可查看事件流 -> Dashboard stats/CSV export 用于早期人工运营分析。

当前公开 Website 数据流：访客浏览首页/Program/Safety/Insights -> 在首页通过 retreat moments、program journey 和 safety boundary 建立理解 -> 进入 `/intake` 真实表单 -> 调用 `POST /api/intake` -> 创建 lead、AI run 和通知记录 -> 成功后跳转 `/thank-you?leadId=...`。表单只收集服务匹配所需信息，风险自报合并进 `freeText`，不扩张医疗诊疗 schema。

Workbench 真实数据流：浏览器访问 `workbecnch-ui-2/app-old` 的 `/api/workbench/*` -> Workbench 服务端读取 `EASTAURA_API_BASE_URL` 与 `EASTAURA_ADMIN_API_TOKEN` -> 调用根项目内部 API -> 将根 Lead/Notification/Dashboard/Content/Review/Publish/Attribution 数据映射为 Workbench 既有 UI shape。根 API 不可用时返回 `usingFallback: true` 和 mock 数据，避免本地原型不可用。

Workbench i18n 数据流：管理员进入 Workbench -> `LanguageProvider` 默认使用中文并读取本地 `localStorage` 语言偏好 -> 顶栏切换中文/英文后写回本地偏好 -> 侧栏、顶栏、状态标签和主要操作页面通过字典渲染系统文案；客户原始输入、AI 摘要、营销素材和归因标识保持英文原文。

## 关键设计决策

- 首期不做泛旅游，不内置景点项目，避免与传统入境游正面竞争。
- 首期以“康养体验 + 文化理解 + 恢复型行程”定位，避免承诺治疗疾病。
- 医疗诊疗、针灸、处方、中药等高合规要求环节由有资质机构承接，品牌方负责筛选、翻译、流程和服务体验。
- MVP 不做复杂用户账号和供应商入驻，优先做公开网站、询盘收集和内部运营后台。
- Kimi Website zip 内源码接近 create-next-app 起步页，静态导出版不可维护；公开 Website 现在以内聚在根项目的源码为准，保留单张 full-bleed retreat hero 方向，并进一步区分桌面/移动设计：桌面强调非对称 editorial、低亮背景和滚动叙事，移动端强调单列阅读、可触控 CTA 和横滑内容。
- 用户端先不登录，管理员端使用认证保护；合作方排期、在线支付和用户行程页后置。
- 一人公司模式下，AI 是操作系统而不是负责人；医疗判断、合规承诺、关键销售和异常处理必须由创始人或合规合作方确认。
- 可以参考 `ai-marketing-system/` 的工作台、状态机、结构化 Agent 输出、人工审核、AI 运行日志和反馈事件设计，但 Eastaura 不照搬制造业产品库、RFQ 和行业模板业务对象。
- 第一版后端通过 repository 自动选择 Supabase 或内存 mock。未配置 Supabase 时保持本地可跑；配置 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 后切换到 Supabase。
- AI triage 通过 `EASTAURA_LLM_*` 环境变量接入 chat-completions 兼容模型；默认或失败时使用确定性规则 mock。`ai_runs` 中保留 `provider`、`model`、`skillRefs`、`promptSnapshot` 和 `outputSchemaVersion`，用于后续审计。
- 获客内容生成第一版采用 Skill + 状态机 + 人工审核，不把第三方营销 Skill 直接装进生产环境执行；P0 只用 deterministic/rule_based 生成脚本、分镜和合规提示，图片和图生视频供应商后续再通过统一 `generation_jobs`/`generated_assets` 抽象隔离。
- 内部 API guard 采用轻量 token 方案作为 MVP 过渡。后续如果引入正式 Workbench 登录，再替换为 Supabase Auth 或专门认证方案。
- Workbench token 不进入浏览器端；浏览器只请求 Workbench 自身 `/api/workbench/*`，由服务端代理注入 Bearer token。
- 生产构建下内部 API 默认 fail-close：未配置 `EASTAURA_ADMIN_API_TOKEN` 且未显式设置 `EASTAURA_ALLOW_OPEN_ADMIN_API=true` 时返回 503，避免部署后管理接口裸奔。
- 通知投递采用“先记录、后投递、失败留痕”的策略，不让外部服务失败影响 Intake 主链路。
- Public Intake 在真实上线前必须保留防滥用层：即使未配置 Turnstile，也保留本地限流和重复提交防护；配置 Turnstile 后再进入强校验。
- Workbench 双语策略只翻译系统操作界面，不默认翻译面向海外客人的宣传内容、客户输入、AI 输出和 UTM/sourceCode 等归因标识，避免影响对外语境和数据一致性。

## 已知约束

- 海外市场对中医既有兴趣也有安全和证据顾虑，传播需要强调资质、透明和边界。
- 中国境内医疗服务、医疗广告、线上诊疗和中药产品出海均存在合规要求。
- 首发城市和合作机构选择会显著影响品牌可信度、成本和履约稳定性。
- 当前内存存储只适合本地开发和接口验证，服务重启后数据会丢失；真实使用前需要先应用 `supabase/migrations/202604270001_mvp_backend.sql`、`supabase/migrations/202604280001_content_pipeline_p0.sql` 和 `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql`。
- `npm audit --omit=dev` 当前提示 Next 依赖链中的 PostCSS 有 moderate 漏洞且暂无修复版本，需要等待上游或评估版本策略。
