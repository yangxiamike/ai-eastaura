# Eastaura Notification Center

## 1. 核心判断

Eastaura 的 AI 指挥台需要一个通知中心，把关键事项推送到创始人日常使用的工具里。通知中心不是替代后台，而是提醒创始人回到后台做关键判断。

推荐原则：

- 后台是事实和操作中心。
- 飞书/企业微信/邮件是提醒入口。
- 通知只推关键事项，避免噪音。
- 高风险事项只提醒，不自动处理。

## 2. 渠道优先级

### P0：飞书机器人 Webhook

适合第一版。

原因：

- 接入简单。
- 稳定性较好。
- 支持群通知和卡片消息。
- 适合日报、周报、lead 提醒和审核任务提醒。

### P0：邮件通知

适合备份。

原因：

- 海外业务天然需要邮件。
- 新 lead、proposal、follow-up 都可以邮件提醒。

### P1：企业微信机器人 Webhook

适合国内团队协作或合作方协调。

### P2：个人微信

不建议作为第一版正式通道。

原因：

- 官方接口限制多。
- 自动化稳定性和合规性较差。
- 容易变成脆弱的私人自动化。

如果必须接个人微信，建议只做低风险提醒，不承载客户隐私和健康信息。

## 3. 通知类型

### 3.1 触发型通知

用户或系统事件发生后立即推送。

首期需要：

- 新 lead 提交。
- 高意向 lead 出现。
- 高风险 lead 出现。
- 有 proposal 等待人工确认。
- 有 follow-up 邮件等待审核。
- 合作方任务逾期。
- 用户提交重要回复。

### 3.2 定时型通知

按固定时间汇总。

建议：

- 每日早报：今天要处理什么。
- 每日晚报：今天新增线索、内容、待办。
- 每周复盘：渠道、内容、lead、转化情况。

### 3.3 异常型通知

需要立即注意。

包括：

- 表单提交失败。
- 邮件发送失败。
- AI 任务失败。
- 高风险健康信息。
- 行程交付异常。

## 4. 通知内容原则

通知里不放完整敏感信息，只放摘要和后台链接。

推荐格式：

```text
New high-intent lead
Name: Sarah M.
Country: United States
Goal: sleep reset, stress recovery
Budget: $3,000-5,000
AI intent: 5/5
AI risk: 2/5
Next: Review and decide whether to send booking link
Open: /admin/leads/{id}
```

避免：

- 推送完整健康描述。
- 推送详细病史。
- 在聊天工具里做最终医疗判断。
- 自动发出客户回复。

## 5. 通知中心数据模型

建议增加：

### notification_rules

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| name | 规则名称 |
| event_type | 事件类型 |
| channel | feishu/email/wecom |
| enabled | 是否启用 |
| threshold | 触发条件 |
| quiet_hours | 免打扰时段 |

### notification_events

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| event_type | 事件类型 |
| entity_type | lead/content/proposal/task/system |
| entity_id | 关联对象 |
| channel | 推送渠道 |
| status | pending/sent/failed/skipped |
| summary | 推送摘要 |
| error_message | 错误信息 |
| sent_at | 发送时间 |

## 6. MVP 接入方式

第一版只做三类通知即可：

- 新 lead 通知。
- 高风险/high intent lead 通知。
- 每日早报。

推荐技术实现：

- Vercel Cron：每日早报。
- Supabase 业务事件：创建 lead 后触发通知任务。
- Next.js API Route：封装飞书/邮件发送。
- Resend：邮件通知。
- 飞书 Webhook：即时提醒。

## 7. 飞书消息示例

### 新 lead

```text
Eastaura New Lead

Sarah M. from United States
Goal: sleep reset, stress recovery
Budget: $3,000-5,000
AI: high intent, medium risk

Suggested next step:
Review risk notes and decide whether to invite a video consultation.
```

### 每日早报

```text
Eastaura Daily Brief

New leads: 3
High intent: 1
High risk: 1
Follow-ups due: 2
Content to review: 4
Partner tasks due: 1

Top action:
Review Sarah M. before sending consultation link.
```

## 8. 人工介入边界

通知可以提醒：

- 有新客户。
- 有高风险。
- 有任务逾期。
- 有内容待审核。

通知不应该直接执行：

- 自动同意接单。
- 自动发送报价。
- 自动给客户健康建议。
- 自动确认合作方。
- 自动发布内容。

## 9. 推荐下一步

第一版后台增加 Notification Settings：

- 飞书 Webhook URL。
- 邮件接收地址。
- 是否启用新 lead 通知。
- 是否启用每日早报。
- 是否启用高风险提醒。
- 免打扰时段。

先把提醒跑通，再考虑企业微信和个人微信。
