# Eastaura 当前流程归档

归档日期：2026-04-27

## 1. 当前项目一句话

Eastaura 是一个面向海外高压、睡眠差、疲惫、恢复力不足人群的中国中医康养体验品牌。

它不是传统旅行社，也不是医疗机构，而是：

```text
海外信任入口 + 国内资源整合 + AI 驱动一人公司操作系统
```

核心模型：

```text
海外内容获客
-> 官网和 Intake 表单
-> CRM 接住线索
-> AI Agent 总结、评分、提示风险
-> 创始人关键判断
-> 整合国内中医机构、翻译、酒店、接送
-> 来华康养体验交付
-> 离境后随访、案例、FAQ、复购
```

## 2. 商业定位

### 已定方向

- 不与传统入境游拼景点、低价团和泛旅游服务。
- 主打中医康养体验和品牌化服务。
- 对外不直接用“亚健康”作为核心表达。
- 用西方用户更容易理解的表达：
  - stress recovery
  - sleep reset
  - energy restoration
  - whole-person balance
  - wellness retreat

### 英文定位句

```text
A China-based TCM wellness retreat for stress recovery, sleep reset, and whole-person balance.
```

### 临时业务假设

用于推动 MVP 设计和开发，不代表最终商业结论：

- 首发城市：上海入境 + 杭州康养体验。
- 首批客群：欧美 35-60 岁高压职业人群。
- 主产品：5 天 4 晚 TCM Wellness Reset。
- Pilot 价格：USD 2,500-3,000 / 人。
- 首期目标：3-5 个真实付费客户，或 1 个 6-10 人小团。

## 3. 一人公司模式

核心原则：

```text
Founder as trust owner, AI as operating system, partners as delivery network.
```

### 创始人负责

- 品牌判断。
- 是否接单。
- 是否报价。
- 是否拒绝高风险客户。
- 是否确认合作方。
- 是否发布内容和案例。
- 投诉、异常和健康风险处理。

### AI Agent 负责

- 选题和短视频脚本。
- 客户摘要。
- 意向评分。
- 风险提示。
- follow-up 邮件草稿。
- Proposal 草稿。
- 行程 checklist。
- 飞书/邮件通知。

### 合作方负责

- 中医服务。
- 翻译陪同。
- 酒店住宿。
- 接送服务。
- 应急支持。

## 4. 系统整体结构

系统分成两套 UI：

### 对外官网

面向海外客户，用于获客和建立信任。

第一版页面：

- Home：首页。
- Program：5 天 4 晚套餐页。
- Safety/FAQ：安全和边界说明。
- Intake：咨询表单。
- Thank You：提交成功页。

### 内部 AI 指挥台

面向创始人，用于日常运营。

第一版核心页面：

- Dashboard：冷启动总览。
- Content Studio：选题、脚本、合规检查。
- POV Video Generator：体验视频脚本和镜头提示词。
- Calendar：发布日历。
- Attribution：内容到询盘归因。
- Leads：客户线索列表。
- Lead Detail：客户详情和 AI 辅助。
- Review Tasks：人工审核任务。
- Notification Settings：飞书/邮件提醒配置。

## 5. 冷启动获客判断

当前判断：

```text
冷启动后台应先围绕“内容获客”设计，而不是先做完整行程运营系统。
```

原因：

- 现在最缺的是高质量海外询盘，不是复杂交付系统。
- 社媒和短视频是建立信任的入口。
- 内容必须能追踪到官网点击、Intake 提交和高意向客户。
- 不应只看播放量或涨粉。

首期渠道：

- Instagram Reels。
- TikTok。
- YouTube Shorts。
- LinkedIn。

内容方向：

- Experience POV 视频。
- Safety/FAQ 内容。
- Founder/Curator 解释。
- 5 天 4 晚套餐说明。
- 适合/不适合人群。

核心指标：

- Website click。
- Intake form start。
- Intake form submit。
- 高意向 lead。
- 视频咨询预约。
- Proposal 发送。

## 6. POV 短视频方向

首期短视频重点做“体验感”，不是普通健康科普。

可做主题：

- POV: You arrive in China for a 5-day TCM wellness reset.
- POV: Your first calm morning at a Chinese wellness retreat.
- POV: A translator helps you understand your TCM wellness consultation.
- POV: Tea, breath, bodywork, and rest after months of burnout.
- POV: You came for stress recovery, not another packed tourist trip.

原则：

- 可以用 AI 生成体验画面。
- 不能伪装成真实客户案例。
- 不能承诺治疗效果。
- 每条视频导向 Safety FAQ 或 Intake 表单。

成本估算：

- 低成本测试：USD 50-150/月。
- 稳定冷启动：USD 200-500/月。
- 品牌质感版：USD 800-2,000/月。

## 7. Agent 设计

第一版只做 5 个 Agent：

| Agent | 作用 |
| --- | --- |
| Lead Triage Agent | 总结新客户、评分、提示风险 |
| Content Agent | 生成选题、短视频脚本、社媒内容 |
| Compliance Review Agent | 检查医疗承诺和高风险表达 |
| Sales Assistant Agent | 写 follow-up、咨询问题、Proposal 草稿 |
| Notification Agent | 生成飞书/邮件提醒和日报 |

第二阶段再考虑：

- Research Agent。
- Partner Research Agent。
- Ops Checklist Agent。
- Case Study Agent。

## 8. Skill 设计

每个 Agent 背后必须有 Skill。

简单理解：

```text
Agent = 干活的人
Skill = 它干活时用的手册、模板和规矩
```

P0 Skills：

- `eastaura_brand_skill`
- `lead_triage_skill`
- `risk_screening_skill`
- `content_strategy_skill`
- `short_video_script_skill`
- `medical_boundary_skill`
- `follow_up_email_skill`
- `notification_priority_skill`

Skill 应包含：

- 适用场景。
- 输入字段。
- 输出 JSON schema。
- 推荐表达。
- 禁止表达。
- 示例输入。
- 示例输出。
- 人工审核规则。

## 9. 通知中心

通知中心用于提醒创始人回后台处理关键事项，不替代后台。

优先渠道：

1. 飞书机器人 Webhook。
2. 邮件通知。
3. 企业微信机器人。
4. 个人微信后置，不作为第一版正式通道。

第一版通知：

- 新 lead。
- 高意向 lead。
- 高风险 lead。
- 每日早报。
- 任务逾期。
- AI 任务失败。

原则：

- 通知里只放摘要和后台链接。
- 不放完整健康信息。
- 不自动发送客户回复。
- 不自动接单、报价或确认行程。

## 10. 技术栈判断

推荐 MVP 技术栈：

```text
Next.js + TypeScript + Tailwind CSS
Supabase Postgres + Supabase Auth
Vercel
Vercel AI SDK / OpenAI API
Resend
飞书 Webhook
```

暂不建议：

- 微服务。
- Kubernetes。
- 多端 App。
- 复杂自动化营销平台。
- 重型 Agent 编排平台。
- 自动发布社媒。
- 自动报价。
- 用户登录中心。
- 合作方登录。

Hermes/OpenClaw/AgentScale 等外部 Agent 平台：

- 可作为研究、浏览器自动化、资料采集辅助。
- 不应成为 Eastaura MVP 的核心业务系统。
- 核心数据应沉淀在 CRM、Content Studio、Skills、review_tasks 和 ai_runs 中。

## 11. 第一条开发竖切

最推荐先开发：

```text
官网 Intake 表单
-> Lead 入库
-> AI 生成 summary / risk / score
-> 后台 Lead Detail 展示
-> 飞书/邮件通知
-> 创始人修改状态
```

第二条开发竖切：

```text
Content Studio
-> AI 生成短视频脚本
-> 合规检查
-> 发布状态记录
-> 关联 campaign/source
-> lead 归因展示
```

## 12. 距离正式开发还差什么

### 业务决策

- 首发城市是否最终采用上海 + 杭州。
- 首批客群是否锁定欧美高压职业人群。
- Pilot 价格是否采用 USD 2,500-3,000。
- 是否先不接高医疗风险客户。
- 是否先不卖中药产品和线上诊疗。

### 内容与品牌

- 英文首页文案。
- Program 页面文案。
- Safety FAQ。
- Intake 表单问题。
- 隐私政策草案。
- 非医疗服务声明。
- 10-20 个短视频选题。
- 3-5 个 POV 脚本样例。

### 资源履约

- 1 家合规中医机构。
- 1-2 名英文翻译。
- 2 家酒店备选。
- 接送服务商。
- 应急医院或国际门诊。
- 合作方报价和取消规则。

### 系统设计

- 数据表最终字段。
- Lead 状态流转。
- AI 输出 JSON schema。
- 通知规则。
- 管理员权限。
- 是否先 mock AI。

### 视觉素材

- 品牌色。
- Logo 是否先用文字版。
- 官网视觉方向。
- 后台 UI 风格。
- AI 生成 POV 视频画面风格。

## 13. 当前已有核心文档

- `docs/PRD.md`
- `docs/MVP_SYSTEM_DESIGN.md`
- `docs/AI_ONE_PERSON_COMPANY.md`
- `docs/GROWTH_OPS_CRM_AGENT_SYSTEM.md`
- `docs/SOCIAL_VIDEO_COLD_START.md`
- `docs/NOTIFICATION_CENTER.md`
- `docs/PROJECT_SYSTEM_OVERVIEW.md`
- `docs/ASSUMED_BUSINESS_PLAN_AND_DEV_GAPS.md`
- `docs/AGENT_SKILL_DESIGN.md`

## 14. 下一步建议

优先做三件事：

1. 定首发城市、首批客群、Pilot 价格。
2. 写第一版英文官网和 Safety FAQ 文案。
3. 开始第一条开发竖切：`Intake -> Lead -> AI summary/risk/score -> Notification -> Human status update`。
