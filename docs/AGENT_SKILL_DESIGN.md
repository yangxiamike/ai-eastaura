# Eastaura Agent and Skill Design

## 1. 核心判断

Eastaura 的 Agent 不能只是“会聊天的大模型”。每个 Agent 背后都应该有对应 Skill，也就是一套明确的方法、规则、模板、禁用表达、输入输出格式和审核标准。

简单理解：

```text
Agent = 干活的人
Skill = 它干活时用的手册、模板和规矩
```

如果没有 Skill，Agent 很容易变成自由发挥；如果有 Skill，Agent 才能稳定产出可审核、可复用、可迭代的结果。

## 2. 第一版必须有的 Agent

### 2.1 Lead Triage Agent

作用：帮创始人快速看懂新客户。

输入：

- Intake 表单。
- 来源渠道。
- 用户自由描述。

输出：

- 客户摘要。
- 主要目标。
- 购买信号。
- 风险提示。
- 适配度评分。
- 意向度评分。
- 风险评分。
- 建议下一步。

背后 Skill：

- `lead_triage_skill`
- `risk_screening_skill`
- `buyer_intent_scoring_skill`

### 2.2 Content Agent

作用：生成冷启动内容选题、短视频脚本、LinkedIn 帖子和 FAQ 草稿。

输入：

- 本周主推客群。
- 本周主题。
- CTA。
- 品牌边界。

输出：

- 选题。
- Hook。
- 短视频脚本。
- LinkedIn 改写。
- FAQ 草稿。

背后 Skill：

- `content_strategy_skill`
- `short_video_script_skill`
- `pov_video_prompt_skill`
- `repurpose_skill`

### 2.3 Compliance Review Agent

作用：检查文案、邮件、Proposal 是否有医疗和广告风险。

输入：

- 官网文案。
- 社媒文案。
- 邮件草稿。
- Proposal 草稿。

输出：

- 高风险词。
- 可能误导表达。
- 建议改写。
- 是否需要人工审核。

背后 Skill：

- `medical_boundary_skill`
- `health_claim_review_skill`
- `forbidden_words_skill`

### 2.4 Sales Assistant Agent

作用：帮你准备跟进，不替你成交。

输入：

- Lead 信息。
- AI 摘要。
- 预算。
- 计划时间。
- 用户顾虑。

输出：

- Follow-up 邮件草稿。
- 视频咨询问题清单。
- Proposal 初稿。
- 常见异议回复。

背后 Skill：

- `follow_up_email_skill`
- `consultation_brief_skill`
- `proposal_draft_skill`
- `objection_handling_skill`

### 2.5 Notification Agent

作用：判断哪些事情该提醒你。

输入：

- 新 lead。
- 高意向/高风险评分。
- 待审核内容。
- 任务截止时间。

输出：

- 飞书/邮件提醒摘要。
- 每日早报。
- 每周复盘。

背后 Skill：

- `daily_brief_skill`
- `notification_priority_skill`

## 3. 第二阶段再加的 Agent

### 3.1 Research Agent

作用：研究海外用户、竞品表达、平台内容趋势。

背后 Skill：

- `market_research_skill`
- `tiktok_creative_research_skill`
- `seo_keyword_research_skill`

### 3.2 Partner Research Agent

作用：整理国内合作方候选资料。

背后 Skill：

- `partner_screening_skill`
- `clinic_profile_skill`
- `hotel_fit_skill`
- `translator_fit_skill`

### 3.3 Ops Checklist Agent

作用：客户付定金后，生成履约清单。

背后 Skill：

- `trip_checklist_skill`
- `partner_coordination_skill`
- `pre_arrival_reminder_skill`
- `follow_up_summary_skill`

### 3.4 Case Study Agent

作用：把真实服务反馈转成匿名案例和 FAQ。

背后 Skill：

- `case_study_skill`
- `testimonial_review_skill`
- `faq_update_skill`

## 4. Skill 应该长什么样

每个 Skill 至少包含：

- 适用场景。
- 输入字段。
- 输出 JSON schema。
- 推荐表达。
- 禁止表达。
- 示例输入。
- 示例输出。
- 人工审核规则。
- 失败时怎么处理。

例如 `risk_screening_skill`：

```text
适用场景：用户提交 Intake 后，对健康和合规风险做运营提醒。
输入：年龄段、目标、风险勾选、自由描述。
输出：risk_level、risk_notes、questions_to_ask、human_review_required。
禁止：给医学诊断、判断是否适合治疗、承诺疗效。
人工审核：high risk 必须由创始人确认，必要时建议用户先咨询医生。
```

## 5. 哪些 Skill 可以从网上找第一版原型

可以，但要分清楚：网上能找到的是资料和模板，不是可以直接照搬的 Eastaura Skill。

### 5.1 可以公开资料原型化的 Skill

| Skill | 可参考来源 | 用途 |
| --- | --- | --- |
| `medical_boundary_skill` | NCCIH、FTC 健康广告指导 | 明确不能承诺治疗、不能误导 |
| `health_claim_review_skill` | FTC 健康产品广告合规资料 | 检查 cure、guarantee、proven 等高风险表达 |
| `content_strategy_skill` | TikTok Creative Center、Instagram creator best practices | 找内容格式、hook、短视频结构 |
| `pov_video_prompt_skill` | Runway/Kling/Luma 等视频生成提示词案例 | 生成 POV 镜头提示词 |
| `seo_keyword_research_skill` | Google Search Central、公开 SEO 方法 | 写 FAQ、搜索型内容 |
| `follow_up_email_skill` | 销售邮件模板、旅游咨询邮件模板 | 生成英文跟进邮件草稿 |
| `proposal_draft_skill` | retreat/concierge travel proposal 模板 | 生成套餐方案草稿 |
| `partner_screening_skill` | 医疗旅游、酒店、翻译服务筛选清单 | 筛合作方 |

### 5.2 不能直接网上照搬的 Skill

这些必须结合 Eastaura 自己的真实业务沉淀：

- 首发城市资源标准。
- 合作机构筛选标准。
- Eastaura 的品牌语气。
- 价格和套餐结构。
- 用户风险拒单规则。
- 服务中异常处理规则。
- 真实客户 FAQ。
- 真实转化数据。

## 6. 第一版 Skill 优先级

### P0：开发 MVP 必须先有

- `eastaura_brand_skill`
- `lead_triage_skill`
- `risk_screening_skill`
- `content_strategy_skill`
- `short_video_script_skill`
- `medical_boundary_skill`
- `follow_up_email_skill`
- `notification_priority_skill`

### P1：有真实询盘后补

- `proposal_draft_skill`
- `consultation_brief_skill`
- `objection_handling_skill`
- `pov_video_prompt_skill`
- `campaign_review_skill`

### P2：有真实付费客户后补

- `partner_screening_skill`
- `trip_checklist_skill`
- `case_study_skill`
- `retention_skill`

## 7. 推荐开发方式

第一版不要做复杂 Agent 平台。建议先在仓库中维护 Skill 文件：

```text
skills/
  eastaura_brand_v0_1/
    SKILL.md
    forbidden_words.json
    voice_examples.md
  lead_triage_v0_1/
    SKILL.md
    output_schema.json
    examples.json
  content_strategy_v0_1/
    SKILL.md
    topic_pillars.json
    script_templates.md
  medical_boundary_v0_1/
    SKILL.md
    forbidden_claims.json
    safe_rewrites.json
```

系统调用 Agent 时，只做三件事：

1. 读取对应 Skill。
2. 把结构化业务数据传给模型。
3. 要求模型输出固定 JSON。

然后由后台显示结果，创始人确认后才推进状态。

## 8. 第一条可开发链路

```text
Intake 表单
  -> Lead Triage Agent
  -> 读取 lead_triage_skill + risk_screening_skill
  -> 输出 summary / risk_notes / scores / next_step
  -> 创建 review task
  -> 飞书通知
  -> 创始人在后台确认
```

第二条可开发链路：

```text
Content Studio
  -> Content Agent
  -> 读取 content_strategy_skill + medical_boundary_skill
  -> 输出短视频脚本 / 合规提示 / CTA
  -> 创始人审核
  -> 记录发布状态和来源归因
```

