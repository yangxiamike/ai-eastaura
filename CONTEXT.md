# CONTEXT

## 当前在做

2026-05-02：完成三轮商业方案研究，形成完整决策链：

1. `docs/plans/TCM_WELLNESS_CITY_AND_PRODUCT_RESEARCH_2026-05-02.md`：首发城市线索研究（上海优先、杭州第二站）。
2. `docs/plans/入境中医康养商业方案-2026-05-02.md`：**决策反转——改为以杭州为基地**。上海做入境门户+高端补充，杭州做主产品交付地。关键发现：杭州官方已发布10条中医药康养线路+30个体验点，但商业化产品完全真空。
3. `docs/plans/杭州深度产品与合作方案-2026-05-02.md`：**刚完成**。30个体验点完整清单（按上城/拱墅/西湖/滨江/桐庐等分区）+ 10条线路利用分析 + 四层价值链策略 + 3天/5天杭州版产品设计 + 方回春堂首选合作模式 + 12周MVP验证路径 + 启动预算~3万。

当前主线：杭州深度方案已就绪，下一步进入**合作洽谈 + 产品定型 + 外宣制作**阶段。

2026-05-02：项目主线从继续扩张工程能力，收敛到两个 P0 业务工作包：

1. 套餐与履约方案：明确卖什么、谁交付、怎么报价、什么情况拒单、如何交付。
2. 获客类推广：明确对谁说、说什么、在哪发、如何导入 Intake、如何 24 小时跟进。

`harness` 不再作为主线系统扩张，只保留为 MVP 验收、运营检查和试运营数据采集的辅助底座。

本轮已完成项目“大扫除”第一阶段：把超长 `CONTEXT.md` 压回当前作战板，新增后续 Agent 渐进暴露入口，整理文档索引和清理候选。清理前的完整长上下文已归档到 `docs/archive/2026-05/CONTEXT_BEFORE_CLEANUP_2026-05-02.md`。

后续 Agent 默认入口：

- `docs/entry/AGENT_ONBOARDING.md`：先读什么、怎么确认上下文、项目主体在哪、历史资料在哪、验证怎么选。
- `docs/entry/INDEX.md`：项目文档索引，按 active/reference/archive/troubleshooting 视角阅读。
- `docs/entry/LESSONS.md`：后续 Agent 可复用经验库，沉淀项目约束、工具坑、验证口径和长期判断。
- `docs/entry/CLEANUP_INVENTORY_2026-05-02.md`：缓存、旧原型、历史资产、需确认清理项。
- `docs/plans/BUSINESS_CONTENT_PLAN_2026-05-02.md` / `docs/plans/SYSTEM_PLAN_2026-05-02.md`：当前 P0 的业务主线与系统支撑线。

## 上次做到哪里

- 已完成 Eastaura 入境中医康养方向的 PRD、MVP 系统设计、AI 一人公司方案、获客/CRM/通知/内容生产线方案，并沉淀在 `docs/`。
- 根项目已落地 Next.js/TypeScript 后端 P0：公开 Website、`POST /api/intake`、Lead/AI run/Notification repository、Supabase/内存切换、LLM 适配、飞书/Resend 通知预留、内容获客 P0 API、验证脚本。
- 当前 Workbench 主线是 `workbecnch-ui-2/app-old/`：独立 Next.js App Router 后台，通过 `/api/workbench/*` 服务端代理读取根 API；旧 `workbench-ui/` Vite 原型只作为历史参考。
- 已形成验证命令：`npm run typecheck`、`npm run verify:workbench-proxy`、`npm run verify:notification-channels`、`npm run verify:content-pipeline`、`npm run verify:intake-flow`、`npm run verify:all`。

## 最近关键决定

- 商业首发城市策略已定：**以杭州为基地**。上海做入境门户+高端补充（龙华/岳阳/曙光医院重症疑难病方向），杭州做主产品交付地。杭州核心优势：官方已铺好"10+30"基建（10条线路、30个体验点），但商业化落地产品为零——这是机会窗口。
- 首选合作机构：方回春堂（河坊街馆，1649年，376年历史），服务采购+品牌联名模式。备选胡庆余堂。
- 首批产品策略：先做 `3-Day TCM Reset` 和 `5-Day TCM Wellness Reset` 两档；核心结构采用“评估 -> 干预 -> 带走方案”，用睡眠、压力、疲劳、肩颈等可感知目标表达，不承诺治疗疾病。
- P0 优先级：短期必须回到“卖什么、谁交付、怎么获客、怎么成交”，不继续堆工程功能。
- 产品定位：首期不做泛旅游，不承诺治疗疾病；主打中医康养体验、文化理解、恢复型行程和透明安全边界。
- 公开 Website 以根项目 `src/app` 为准；不继续依赖 Kimi zip 内不可维护源码。
- Workbench P0 继续独立部署，浏览器只访问 Workbench `/api/workbench/*`，由服务端代理注入 root admin token，避免浏览器暴露凭据。
- 后端 repository 层保持 API 响应稳定：Website/Workbench 不应感知底层是内存 mock 还是 Supabase。
- 通知策略是“先写通知记录，再尝试外部投递”；外部服务失败不阻断 Intake 主链路。
- 文档治理新边界：`CONTEXT.md` 只保留当前状态、关键决定、阻塞和下一步；历史流水、排障过程、旧方案和经验沉到 `docs/` 索引/归档。
- 新增 `docs/entry/LESSONS.md` 作为经验库，定期自动从 `CONTEXT.md`、归档和计划文档提炼可复用 lessons，避免经验继续塞回 `CONTEXT.md`。
- 临时日志 ignore 已补充：新产生的 `.tmp-*.log` 和 `.tmp-*.err.log` 不再反复污染 `git status`。

## 当前阻塞

- 方回春堂/胡庆余堂合作意向尚未正式洽谈；医师时段、服务清单、外籍接待能力待核验。
- 精品酒店（西湖西线/龙井/灵隐）协议价未确认。
- 健康管家（中医+英文双通人才）未招聘。
- Resend 邮件通道缺少真实 `RESEND_API_KEY`、发件人和收件人配置；飞书 webhook 本地曾验证可用，但飞书自建应用事件订阅和 Vercel 环境变量仍未完整发布验证。
- 本机终端到 Supabase 的 HTTPS 调用存在证书/代理问题，不能把本地超时直接误判为业务代码故障。
- `npm audit --omit=dev` 曾提示 Next 依赖链中的 PostCSS moderate 漏洞暂无修复版本，需要关注上游。
- 项目清理仍有待确认项：旧 `workbench-ui/`、`workbecnch-ui-2/deploy2/`、Kimi zip、多轮截图资产、已跟踪的 `.npm-cache` 和历史 `.tmp` 日志是否移出 Git 或归档，需要用户确认后再做破坏性清理。

## 下一步

1. P0-1 合作洽谈：联系方回春堂河坊街馆确认合作意向、医师时段和价格；联系胡庆余堂药膳馆确认套餐供应；踩点2-3家精品酒店。
2. P0-2 产品定型：基于杭州深度方案，确认3天版Herbal City Walk和5天版桐庐模块的具体SOP。
3. P0-3 外宣制作：用coding agent完成杭州版英文产品页和获客内容（详见 `docs/plans/杭州深度产品与合作方案-2026-05-02.md` 第六节12周验证路径）。
4. 项目清理第二阶段：确认是否移出旧原型、静态导出产物、Kimi zip、重复截图和已跟踪缓存；确认后再执行删除或迁移。
5. 若进入代码开发，先读 `docs/entry/AGENT_ONBOARDING.md`，再按任务读取 `README.md`、`ARCHITECTURE.md` 和相关源码。
