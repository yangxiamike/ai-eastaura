# Eastaura Growth, Ops and CRM Agent System

## 1. 核心结论

Eastaura 需要的不是单独一个“获客系统”，而是一套面向一人公司的 AI 业务操作系统：

```text
获客系统 -> CRM 系统 -> 运营系统 -> 复购/内容系统
        \       |       /
          Agent 编排层
               |
          人工关键判断
```

系统目标不是让 AI 自动经营公司，而是让创始人只介入关键判断：

- 是否值得跟进。
- 是否适合接单。
- 是否存在健康/合规风险。
- 是否发送报价。
- 是否确认合作方和行程。
- 是否发布内容或客户案例。

## 2. 是否参考 ai-marketing-system

可以参考，但只参考底层产品设计模式，不照搬业务对象。

### 2.1 值得复用的设计

`ai-marketing-system` 中适合迁移到 Eastaura 的设计：

- 工作台式产品，而不是纯聊天机器人。
- 状态机推进业务流程，而不是让 Agent 自由判断进度。
- Agent 输出结构化 JSON，并写入数据库。
- 关键字段必须人工确认。
- 高风险字段生成 review task。
- 每次 AI 运行写入 `ai_runs`，方便复盘成本、输入、输出和错误。
- 内容、页面、用户反馈都沉淀为资产。
- 一期可以使用 Mock/占位 Agent，先把业务链路跑通。

### 2.2 不应照搬的设计

不适合直接照搬：

- 工厂项目、产品库、RFQ、包装机械 Skill。
- 文档解析作为主流程。
- 官网 JSON 生成作为核心交付。
- 面向企业客户的多组织项目管理复杂度。

Eastaura 的主对象应该是：

- lead：海外潜在客户。
- contact：联系人。
- campaign：获客活动。
- content_asset：内容资产。
- consultation：视频咨询。
- proposal：报价方案。
- booking：行程预订。
- service_case：真实交付案例。
- partner：中医机构、翻译、酒店、接送。
- review_task：人工审核任务。
- ai_run：AI 运行记录。

## 3. 系统分层

### 3.1 获客系统

目标：持续产生高质量海外线索。

核心能力：

- 内容选题库。
- 渠道管理。
- 落地页管理。
- UTM 和来源追踪。
- 表单转化。
- 内容表现记录。
- 合作渠道线索登记。

首期渠道：

- 英文官网 SEO。
- LinkedIn。
- Instagram / TikTok。
- YouTube Shorts。
- Newsletter。
- 海外瑜伽馆、冥想中心、身心教练、retreat organizer。
- 海外华人和外籍在华社群推荐。

Agent：

- Research Agent：研究目标客群、痛点、关键词、竞品表达。
- Content Agent：生成英文文章、短视频脚本、社媒帖、Newsletter。
- Compliance Copy Agent：检查 cure、treat、guarantee 等高风险表达。
- Channel Agent：记录不同渠道内容、发布时间、链接和效果。

人工介入点：

- 内容观点和品牌调性。
- 涉及疗效、安全、医学边界的表达。
- 是否发布。
- 是否与某个渠道合作。

### 3.2 CRM 系统

目标：把海外线索转成咨询、报价和定金。

核心能力：

- Lead 列表。
- Lead 详情。
- Intake 表单信息。
- AI Summary。
- 风险项提示。
- 适配度/意向度/风险评分。
- 跟进记录。
- 视频咨询记录。
- Proposal 草稿和发送状态。
- 定金和确认状态。

Agent：

- Lead Triage Agent：总结用户背景、目标、预算、时间和风险。
- Risk Flag Agent：识别怀孕、重大疾病、近期手术、抗凝药物、寻求治疗等风险提示。
- Sales Assistant Agent：生成咨询前 briefing、邮件草稿、Proposal 初稿。
- Objection Agent：生成对安全、语言、价格、行程、医疗边界的回复建议。

人工介入点：

- 是否进入视频咨询。
- 是否拒绝或建议用户先咨询当地医生。
- 报价和折扣。
- Proposal 发送。
- 是否收定金。

### 3.3 运营系统

目标：把已确认客户稳定交付到线下服务。

核心能力：

- 行程 checklist。
- 合作方任务。
- 翻译排班。
- 酒店和接送确认。
- 中医机构预约。
- 用户行前提醒。
- 服务中反馈。
- 异常记录。
- 离境后随访。

Agent：

- Itinerary Agent：根据套餐和用户情况生成行程草案。
- Partner Coordination Agent：生成给机构、翻译、酒店的确认信息草稿。
- Checklist Agent：生成每日交付清单和遗漏提醒。
- Follow-up Agent：生成离境后随访邮件和 Wellness Summary 初稿。

人工介入点：

- 合作方确认。
- 涉及健康风险的项目调整。
- 异常和投诉处理。
- Wellness Summary 最终审核。

### 3.4 内容与复购系统

目标：把一次咨询或交付沉淀为长期品牌资产。

核心能力：

- 用户反馈归档。
- 可公开 testimonial 管理。
- 案例故事草稿。
- FAQ 更新。
- Newsletter 用户分层。
- 线上咨询候选产品。
- 衍生产品需求记录。

Agent：

- Case Study Agent：把交付记录转成匿名客户故事草稿。
- FAQ Agent：从咨询问题中提炼 FAQ。
- Retention Agent：生成 7/14/30 天随访内容。
- Product Insight Agent：从用户反馈中提炼未来线上服务或产品机会。

人工介入点：

- 是否可公开使用客户素材。
- 案例是否匿名化充分。
- 是否触碰疗效承诺。
- 是否进入新产品设计。

## 4. Agent 编排原则

Agent 不直接改业务最终状态，只生成建议、草稿和审核任务。

推荐模式：

```text
用户动作/系统事件
  -> 创建任务
  -> Agent 读取结构化上下文
  -> 生成 JSON 输出
  -> Schema 校验
  -> 写入建议字段或草稿
  -> 创建人工 review task
  -> 创始人确认
  -> 推进业务状态
```

不要做：

- AI 自动把用户标记为适合治疗。
- AI 自动发送高风险医学回复。
- AI 自动承诺疗效。
- AI 自动确认合作方排期。
- AI 自动发布客户案例。

可以做：

- 自动生成摘要。
- 自动标记风险。
- 自动生成邮件草稿。
- 自动推荐下一步。
- 自动生成 checklist。
- 自动创建 review task。

## 5. 核心状态机

### 5.1 Lead 状态

```text
New
  -> AI Reviewed
  -> Human Screening
  -> Qualified
  -> Consultation Booked
  -> Consultation Done
  -> Proposal Drafted
  -> Proposal Sent
  -> Deposit Paid
  -> Trip Confirmed
  -> In Service
  -> Follow-up
  -> Closed

New / AI Reviewed / Human Screening
  -> Not Fit
```

### 5.2 Content 状态

```text
Idea
  -> Drafted by AI
  -> Human Review
  -> Approved
  -> Scheduled
  -> Published
  -> Measured
  -> Repurposed
```

### 5.3 Operation 状态

```text
Trip Confirmed
  -> Partners Pending
  -> Partners Confirmed
  -> Pre-arrival Ready
  -> In Service
  -> Issue Review
  -> Completed
  -> Follow-up
```

## 6. MVP 数据模型扩展

在现有 `leads` 之外，建议 MVP 增加以下轻量表。

### 6.1 campaigns

记录获客活动。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| name | 活动名称 |
| channel | LinkedIn/SEO/Instagram/Partner/Referral |
| target_segment | 目标客群 |
| offer | 主推套餐或咨询 |
| status | draft/active/paused/archived |
| start_date | 开始日期 |
| end_date | 结束日期 |
| notes | 备注 |

### 6.2 content_assets

记录内容资产。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| campaign_id | 可选关联活动 |
| content_type | blog/linkedin/short_video/newsletter/faq |
| title | 标题 |
| body | 内容 |
| channel | 发布渠道 |
| status | idea/drafted/review/approved/published |
| risk_level | low/medium/high |
| published_url | 发布链接 |
| metrics | 浏览、点击、提交等数据 |

### 6.3 interactions

记录用户互动。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| lead_id | 关联 lead |
| type | email/call/video/whatsapp/form/internal_note |
| direction | inbound/outbound/internal |
| summary | 摘要 |
| raw_content | 原始内容或引用 |
| next_action | 下一步 |
| created_at | 创建时间 |

### 6.4 proposals

记录报价和方案。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| lead_id | 关联 lead |
| version | 版本 |
| package_name | 套餐名 |
| price_amount | 金额 |
| currency | 币种 |
| inclusions | 包含项 |
| exclusions | 不包含项 |
| status | draft/sent/accepted/rejected/expired |
| ai_draft | AI 草稿 |
| human_final | 人工确认版 |

### 6.5 partner_tasks

记录合作方协调任务。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| lead_id | 关联 lead |
| partner_type | clinic/translator/hotel/transfer/emergency |
| partner_name | 合作方名称 |
| task | 任务 |
| status | pending/confirmed/failed/cancelled |
| due_at | 截止时间 |
| notes | 备注 |

### 6.6 review_tasks

记录人工审核任务。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| entity_type | lead/content/proposal/operation/case |
| entity_id | 关联对象 |
| reason | 审核原因 |
| risk_level | low/medium/high |
| status | open/resolved/ignored |
| assigned_to | 负责人 |

### 6.7 ai_runs

沿用 `ai-marketing-system` 的 AI 运行记录思想。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| run_type | lead_triage/content_draft/risk_review/proposal_draft/follow_up |
| provider | 模型供应商 |
| model | 模型 |
| input | 输入摘要或结构化输入 |
| output | 结构化输出 |
| status | queued/running/succeeded/failed |
| cost | 成本估算 |
| created_at | 创建时间 |

## 7. MVP 开发顺序

### Milestone 1：CRM + AI 线索筛选

先做最短赚钱链路：

- Intake 表单。
- Lead 列表和详情。
- AI Summary。
- 风险提示。
- 适配度/意向度/风险评分。
- Follow-up 邮件草稿。
- Review task。

### Milestone 2：获客内容工作台

再做持续获客：

- Campaign 列表。
- Content asset 列表。
- AI 内容草稿。
- 合规词检查。
- 发布状态和链接记录。
- 内容到 lead 的来源追踪。

### Milestone 3：运营交付工作台

等有真实付费客户再做：

- Trip checklist。
- Partner tasks。
- 行前提醒。
- 服务中反馈。
- 离境后 follow-up。

### Milestone 4：复购与案例资产

交付后再做：

- Testimonial 管理。
- 匿名案例草稿。
- FAQ 自动更新建议。
- Newsletter 分层。
- 线上咨询产品机会记录。

## 8. 一人公司工作台首页

首页不应该是传统 Dashboard，而应该是创始人的每日控制台：

- 今日高优先级 lead。
- 待人工判断的风险任务。
- 待发送 follow-up。
- 本周内容发布计划。
- 需要确认的合作方任务。
- 漏斗指标：访问、提交、咨询、报价、定金。
- AI 节省时间和运行成本。

## 9. 关键取舍

### 9.1 先 CRM，后获客自动化

原因：没有 CRM 和人工判断闭环，获客越多只会制造混乱。先保证每个 lead 能被正确分流、跟进和记录。

### 9.2 先辅助，不自动执行

AI 先生成草稿和建议，不自动发消息、不自动接单、不自动承诺。

### 9.3 先记录渠道，不做复杂归因

早期只需要 UTM、source、campaign 和人工备注，不需要复杂广告归因系统。

### 9.4 先做一套 Eastaura Skill

参考 `ai-marketing-system` 的行业 Skill 思想，但 Eastaura 的 Skill 应包含：

- 品牌定位。
- 目标客群。
- 推荐表达。
- 禁止表达。
- 套餐结构。
- FAQ。
- 风险筛查规则。
- Follow-up 模板。
- Proposal 模板。

## 10. 推荐下一步

下一步应把 `docs/MVP_SYSTEM_DESIGN.md` 升级为 AI-first CRM 版本：

- 在 `leads` 表加入 AI 辅助字段。
- 增加 `campaigns`、`content_assets`、`interactions`、`proposals`、`partner_tasks`、`review_tasks`、`ai_runs`。
- 设计 `/admin` 工作台首页。
- 先实现 `lead_triage` Agent。

