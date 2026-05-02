# Eastaura 获客系统技术实现梳理

更新时间：2026-04-27

## 1. 核心结论

Eastaura 的获客系统不应该做成“一个 Agent 自动从选题到发布再自动销售”的黑箱，而应该做成一条可追踪、可审核、可复用的内容生产流水线：

```text
知识库
  -> 选题/关键词/竞品研究
  -> 脚本
  -> 分镜
  -> 图片/关键帧
  -> 图生视频
  -> 字幕/旁白/剪辑
  -> 合规审核
  -> 发布记录
  -> 表现复盘
  -> Lead/CRM 归因
```

主流方向可以概括为三点：

- Skill 化：把 SEO、脚本、开发信、合规、视频 prompt、复盘等任务沉淀成可版本化的 Skill，而不是只写一次性 prompt。
- 编排化：确定性流程用状态机/队列/工作流，模糊判断才交给 Agent；每一步保留输入、输出、成本和人工审核状态。
- 人工闸门：健康、疗效、医疗边界、真实客户案例、合作方承诺和付费投放前必须人工审核。

## 2. 外部调研要点

### 2.1 Skills 已经是主流 Agent 工程形态

OpenAI Agents SDK 把 Agent 定义为会计划、调用工具、跨专家协作并保留状态的应用，并建议当应用需要自管编排、工具执行、审批和状态时使用 SDK 路径。Claude 的 Skills 文档也把 Skill 定义为按需加载的文件系统级专业知识，包含 workflow、context 和 best practices，用来把通用 Agent 变成专门角色。

这和当前项目内 `skills/*_v0_1/` 的方向一致：Skill 应该是规则资产，而不是临时提示词。

参考：

- OpenAI Agents SDK: https://developers.openai.com/api/docs/guides/agents
- Claude Agent Skills: https://platform.claude.com/docs/en/managed-agents/skills

### 2.2 获客/营销 Skill 可以借鉴，但不能直接照搬

OpenClaw/Playbooks 上已经出现大量营销类 Skill，例如 marketing、outreach-and-prospecting、seo-prospector、ai-marketing-videos、copywriting 等。它们的价值在于提供结构化方法：内容日历、跨平台改写、A/B 测试、KPI 复盘、开发信结构、视频广告模板。

但这些 Skill 面向通用营销或 B2B 外呼，不能直接作为 Eastaura 生产环境基底，原因是：

- Eastaura 是健康/康养/入境服务，合规边界比普通营销更严格。
- 通用 Skill 容易鼓励自动群发、夸张收益、强销售 CTA，不适合当前品牌信任建设。
- 第三方 Skill 可能包含脚本、外部工具调用或未知安全假设，必须当作不可信代码审查。

建议做法：复制“结构和方法”，不复制“执行权限和话术”。先把它们拆成 Eastaura 自有 Skill。

参考：

- OpenClaw marketing skill: https://playbooks.com/skills/openclaw/skills/marketing
- OpenClaw outreach/prospecting skill: https://playbooks.com/skills/openclaw/skills/outreach-and-prospecting

### 2.3 编排主流是混合模式

当前主流不是纯 Agent，也不是纯自动化平台，而是混合模式：

- LangGraph：适合复杂状态、人工介入、可暂停/恢复和审计。官方 durable execution 强调保存工作流进度，适合 human-in-the-loop 和长任务恢复。
- CrewAI Flows：适合把多个 task/crew 串成结构化、事件驱动流程。
- n8n：适合表单、邮件、飞书/Slack、CRM、Webhook、数据同步等确定性自动化，也支持 AI workflow。

Eastaura MVP 不建议一开始引入重型多 Agent 框架。当前项目已有 Next.js API、Supabase repository、`ai_runs`、Skill 文件和 Workbench 原型，第一版可以用自有状态机 + job 表 + provider adapters。等视频生产、人工审核和多渠道发布复杂后，再局部引入 LangGraph 或 n8n。

参考：

- LangGraph durable execution: https://docs.langchain.com/oss/javascript/langgraph/durable-execution
- CrewAI Flows: https://docs.crewai.com/en/concepts/flows
- n8n Advanced AI: https://docs.n8n.io/advanced-ai/

### 2.4 图像/视频 API 选择

图片生成建议优先接 OpenAI GPT Image 系列，用于品牌图、社媒图、关键帧、配图、海报草稿和图片编辑。OpenAI 文档显示 GPT Image 支持生成和编辑，成本和质量可按参数控制。

图生视频建议做 provider adapter，不绑定单平台：

- Runway API：支持 image-to-video、text-to-video、video-to-video、image generation、音频等任务，适合品牌短片和高质感素材。
- Luma Dream Machine / Ray：支持 text-to-video、image-to-video、camera control、extend、loop；图生视频要求使用自有 CDN 图片 URL。
- Google Veo on Vertex AI：适合企业云集成，可用文本或图片生成视频，也支持扩展和首尾帧等能力。
- OpenAI Sora Videos API：当前文档显示可从文本或图片生成视频、支持异步轮询/ webhooks，但 Sora 2 相关 Videos API 已标注将在 2026-09-24 下线，因此不建议作为核心长期依赖，除非后续确认新替代 API。
- fal.ai/Kling/Seedance 等聚合层：适合快速试模型，但生产依赖要评估版权、地区、稳定性、输出权利和服务条款。

参考：

- OpenAI image generation: https://developers.openai.com/api/docs/guides/image-generation
- OpenAI Sora video generation: https://developers.openai.com/api/docs/guides/video-generation
- Runway API: https://docs.dev.runwayml.com/api/
- Luma video generation: https://docs.lumalabs.ai/docs/video-generation
- Google Veo on Vertex AI: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/overview

### 2.5 SEO 与平台内容不应只追流量

Google Search Central 强调 helpful, reliable, people-first content，不鼓励为了操纵排名而生产内容。TikTok Creative Insights 可以看广告创意模式和行业表现，但官方也说明指标是近似值，不能直接当作预测表现。

对 Eastaura 来说，SEO/短视频的目标不是泛健康流量，而是筛出高信任、高意向、能接受入境康养服务的人。

参考：

- Google helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- TikTok Creative Insights: https://ads.us.tiktok.com/help/article/creative-insights?lang=en

### 2.6 健康广告合规必须前置

FTC Health Products Compliance Guidance 的核心原则是：健康相关广告必须真实、不误导，所有明示或暗示的客观主张在发布前都要有充分依据。对传统使用、替代医学或健康体验的表达，也不能让用户误以为有未经证实的疗效。

这意味着 Eastaura 所有内容生产链路都要先过 `medical_boundary`，尤其是：

- 不说 cure/treat/guarantee/reverse disease。
- 不暗示中医体验能替代医生或治疗疾病。
- 对针灸、中药、处方、疾病管理等高风险内容进入人工审核。
- AI 生成视频不能伪装成真实客户治疗记录。

参考：

- FTC Health Products Compliance Guidance: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- NCCIH safety: https://www.nccih.nih.gov/health/safety

## 3. Eastaura 推荐系统形态

### 3.1 核心对象

建议在现有 `lead`、`ai_runs`、`skills` 基础上扩展这些对象：

- `knowledge_sources`：品牌定位、FAQ、安全边界、产品、合作资源、竞品、用户访谈、素材说明。
- `campaigns`：获客活动，绑定目标客群、渠道、CTA、预算、时间段。
- `content_assets`：文章、短视频脚本、LinkedIn 帖、Newsletter、FAQ、广告素材。
- `storyboards`：每条视频的镜头、旁白、字幕、画面 prompt、合规标记。
- `generation_jobs`：图片、图生视频、配音、字幕、剪辑等异步任务。
- `generated_assets`：图片、关键帧、视频、音频、字幕文件，记录 provider、model、prompt、成本、状态。
- `publish_posts`：发布平台、发布时间、URL、UTM、人工备注。
- `content_metrics`：播放、点击、表单开始、表单提交、有效线索、高意向线索。
- `review_tasks`：内容、视频、邮件、Proposal、案例的人工审核任务。

### 3.2 P0 Agent

第一版建议只做 8 个 Agent，每个 Agent 背后必须有 Skill：

| Agent | 作用 | 关键输出 |
| --- | --- | --- |
| Knowledge Curator | 整理品牌、产品、FAQ、安全边界、素材说明 | structured knowledge cards |
| Research Agent | 研究客群表达、关键词、竞品、平台趋势 | topic opportunities |
| Content Strategy Agent | 生成本周主题、内容支柱、渠道计划 | campaign brief |
| Script Agent | 生成短视频/文章/LinkedIn/Newsletter 草稿 | script draft |
| Storyboard Agent | 把脚本拆成镜头、字幕、旁白、视觉 prompt | storyboard JSON |
| Visual Prompt Agent | 生成图片关键帧和图生视频 prompt | image/video prompts |
| Compliance Review Agent | 检查医疗、广告、版权和虚假真实感风险 | risk flags + rewrite |
| Performance Agent | 复盘内容表现并建议下周迭代 | experiment learnings |

注意：发布、邮件发送、广告投放不交给 Agent 自动执行。Agent 只生成草稿、建议和审核任务。

### 3.3 P0 Skill 清单

当前已有：

- `eastaura_brand_v0_1`
- `lead_triage_v0_1`
- `risk_screening_v0_1`
- `medical_boundary_v0_1`
- `notification_priority_v0_1`

建议新增：

- `knowledge_curator_v0_1`：把资料整理为可检索知识卡。
- `seo_keyword_research_v0_1`：英文 SEO / GEO 关键词、FAQ、搜索意图。
- `content_strategy_v0_1`：内容支柱、渠道、CTA、实验设计。
- `short_video_script_v0_1`：Reels/TikTok/Shorts 脚本模板。
- `storyboard_v0_1`：镜头拆解、旁白、字幕、时长、构图。
- `visual_prompt_v0_1`：图片/关键帧/图生视频 prompt 规范。
- `channel_repurpose_v0_1`：一条主题改写为 Blog、LinkedIn、Reels、Newsletter。
- `performance_review_v0_1`：从指标总结内容方向和下一轮实验。
- `outreach_email_v0_1`：合作方/身心教练/retreat organizer 开发信草稿。

每个 Skill 至少包含：

- 适用场景。
- 输入字段。
- 输出 JSON schema。
- 禁止表达。
- 推荐表达。
- 审核规则。
- 示例输入输出。
- 失败处理。

## 4. 推荐技术架构

### 4.1 MVP 架构

```text
Workbench Content Studio
  -> Next.js API
  -> Supabase tables
  -> Skill loader
  -> LLM adapter
  -> Generation provider adapter
  -> Review tasks
  -> Publish records
  -> Metrics / attribution
```

第一版建议继续沿用项目现有技术栈：

- Next.js API Routes：提供内容、分镜、生成任务、审核、发布记录接口。
- Supabase：保存知识库、内容资产、生成任务、素材、指标。
- `skills/`：版本化 Skill 文件。
- `ai_runs`：记录每次 Agent 输入输出、模型、成本和 schema 版本。
- `generation_jobs`：记录异步图片/视频生成状态。
- Provider adapters：`openai_image`、`runway`、`luma`、`veo`，输出统一资产格式。
- Workbench：Content Studio、POV Video Generator、Publishing Calendar、Lead Attribution 接真实 API。

### 4.2 状态机

内容状态：

```text
idea
  -> briefed
  -> drafted
  -> storyboarded
  -> visual_prompted
  -> image_generated
  -> video_generated
  -> compliance_review
  -> human_approved
  -> scheduled
  -> published
  -> measured
  -> repurposed
```

生成任务状态：

```text
queued -> running -> succeeded
queued -> running -> failed -> retry_requested -> running
```

人工审核状态：

```text
open -> approved
open -> needs_revision
open -> rejected
```

## 5. 内容生产流程

### 5.1 知识库

输入资料：

- 品牌定位和禁用词。
- 5-Day TCM Wellness Reset 套餐。
- Safety FAQ。
- 目标客群：欧美 35-60 岁高压职业人群。
- 常见顾虑：安全、语言、医疗边界、中国旅行、价格、时间。
- 现有图片/视频素材说明。
- 竞品 retreat、TCM wellness、medical tourism、sleep retreat、burnout retreat 表达。

输出：

- `knowledge_cards`：每张卡包含 topic、audience、claim_boundary、source、last_reviewed_at。
- 可直接给 Agent 使用的 compressed context。

### 5.2 选题和脚本

每周输入：

- 本周目标：stress recovery / sleep reset / energy restoration。
- 本周 CTA：Intake / Safety FAQ / Pilot spots。
- 目标平台：Instagram Reels、TikTok、YouTube Shorts、LinkedIn。

输出：

- 10 个选题。
- 每个选题的 hook、angle、CTA、风险等级。
- 5 条短视频脚本。
- 2 条 LinkedIn 帖。
- 1 篇 SEO/Newsletter 草稿。

### 5.3 分镜

短视频脚本转成结构化分镜：

```json
{
  "contentId": "content_001",
  "format": "vertical_short_video",
  "durationSec": 30,
  "scenes": [
    {
      "sceneNo": 1,
      "durationSec": 4,
      "visual": "arrival at a quiet Chinese retreat entrance",
      "voiceover": "You did not come for another packed vacation.",
      "onScreenText": "Stress recovery, not rush.",
      "imagePrompt": "...",
      "videoPrompt": "...",
      "riskNotes": []
    }
  ],
  "cta": "Start with the Eastaura intake.",
  "humanReviewRequired": true
}
```

### 5.4 图片和图生视频

建议优先采用 image-to-video，而不是直接 text-to-video：

- 先生成统一风格关键帧，保证品牌视觉一致。
- 再用 Runway/Luma/Veo 做 5-8 秒镜头。
- 每条 20-40 秒短视频由 4-8 个镜头拼接。
- 生成结果必须标记 AI generated，不伪装真实客户实拍。

### 5.5 发布与归因

第一版不自动发布，只记录：

- 平台。
- 发布时间。
- 发布 URL。
- UTM。
- 内容 ID。
- campaign ID。
- 手工录入或导入的表现数据。

Lead 进入 Intake 后，通过 `source`、`campaign`、`utm_content` 关联内容资产，优先看有效线索和高意向线索，不只看播放量。

## 6. API 平台建议

### 6.1 推荐组合

P0 推荐：

- 图片：OpenAI GPT Image。
- 图生视频：Luma 或 Runway 二选一先接。
- 存储：Supabase Storage 或 S3/R2，用于给图生视频平台提供可访问图片 URL。
- 剪辑：第一版先人工剪辑或脚本化拼接，暂不做复杂在线编辑器。
- 发布：第一版手工发布，系统只记录链接和指标。

P1 再加：

- Google Veo：当需要更稳定企业云、Google Cloud 账号和高质量视频时。
- n8n：当需要把发布记录、飞书、邮件、Google Sheet、Meta/TikTok/LinkedIn 数据同步起来时。
- LangGraph：当人工审核、重试、长任务恢复和多分支状态复杂后。

暂不建议：

- 直接把 OpenClaw/第三方 marketing skill 装进生产环境执行。
- 第一版接自动群发开发信或自动 DM。
- 第一版做多平台自动发布。
- 第一版把 Sora 作为唯一视频 provider，因为官方已给 Sora 2 Videos API 标注下线日期。

## 7. 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| 医疗/疗效承诺越界 | `medical_boundary` + human review |
| AI 伪造真实客户/真实机构 | 素材标记 AI generated，不编造客户案例 |
| 第三方 Skill 安全风险 | 只借鉴结构，重写为仓库内 Skill |
| 视频 API 成本失控 | 先低清/短镜头/小批量，记录每个 job 成本 |
| 画风不一致 | 先图片关键帧，保存 style guide 和 reference |
| 平台 API 变动 | provider adapter + job 状态统一 |
| 只涨粉不转化 | 内容绑定 UTM/Intake/Lead 归因 |
| 自动化误发 | 发布、广告、开发信保留人工确认 |

## 8. 90 天落地路线

### 第 1-2 周：知识库和 Skill 基底

- 新增 `knowledge_sources` / `content_assets` / `review_tasks` 设计。
- 新增 `content_strategy`、`short_video_script`、`storyboard`、`visual_prompt` Skill。
- Workbench Content Studio 接真实保存和 AI 草稿。

### 第 3-4 周：脚本到分镜闭环

- 实现选题 -> 脚本 -> 合规检查 -> 分镜。
- 生成结构化 storyboard JSON。
- 在 Workbench POV Video Generator 展示每个镜头。

### 第 5-6 周：图片生成和素材库

- 接 OpenAI GPT Image provider。
- 保存 prompt、图片、成本、审核状态。
- 形成首批 20-50 张品牌关键帧。

### 第 7-8 周：图生视频

- 接 Luma 或 Runway provider。
- `generation_jobs` 支持异步轮询、失败重试、人工重跑。
- 每周生产 3-5 条 20-40 秒 POV 视频素材。

### 第 9-10 周：发布日历和归因

- Publishing Calendar 接真实 content/publish 数据。
- Intake 表单带 UTM 参数。
- Lead Attribution 页面展示 content -> lead 的链路。

### 第 11-12 周：复盘和优化

- Performance Agent 汇总每周表现。
- 保留有效选题、淘汰只带播放不带线索的内容。
- 将高频问题回写 FAQ 和知识库。

## 9. 现在最值得做的下一步

建议下一阶段开发顺序：

1. 先补 `content_strategy_v0_1`、`short_video_script_v0_1`、`storyboard_v0_1`、`visual_prompt_v0_1` 四个 Skill。
2. 给 Supabase migration 增加 `campaigns`、`content_assets`、`storyboards`、`generation_jobs`、`generated_assets`、`review_tasks`。
3. 把 Workbench 的 Content Studio / POV Video Generator 从 mock 改成调用真实 API。
4. 先接 OpenAI GPT Image；视频 provider 先在 Luma 和 Runway 中选一个做 adapter。
5. 第一版只做到“生成草稿和素材 + 人工审核 + 手工发布记录”，不要自动发布。

这条路线能把获客系统从“想法很多”收敛成一个可验证闭环：每周稳定产出内容 -> 导入 Intake -> 追踪 lead 质量 -> 反哺知识库和下一轮内容。
