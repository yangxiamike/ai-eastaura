# Eastaura MVP System Design

## 1. 设计目标

MVP 系统只解决一个核心问题：让海外用户理解 Eastaura、提交高质量咨询，并让内部团队完成筛查、跟进和转化。

设计原则：

- 先销售验证，后平台化。
- 先人工交付，后自动化。
- 先单套餐，后多产品。
- 先内部后台，后用户账号。
- 先收集必要数据，避免过度医疗信息采集。

## 2. 推荐技术栈

建议使用轻量但可扩展的 Web 栈：

- 前端/后端：Next.js App Router。
- 语言：TypeScript。
- 样式：Tailwind CSS。
- 数据库：Supabase Postgres。
- 认证：Supabase Auth，仅用于内部管理员。
- 邮件：Resend 或同类事务邮件服务。
- 表单防滥用：Turnstile 或 reCAPTCHA。
- 部署：Vercel。
- 数据导出：后台 CSV 导出。

MVP 不建议自建复杂 CMS、CRM 或多租户系统。

## 3. 系统边界

### 3.1 面向用户

公开网站：

- 首页。
- 套餐页。
- Safety/FAQ 页。
- Intake 表单。
- 提交成功页。

用户不需要注册登录。

### 3.2 面向内部

内部后台：

- 登录。
- 询盘列表。
- 询盘详情。
- 状态更新。
- 跟进备注。
- 风险标记。
- CSV 导出。

合作机构、翻译、酒店暂不登录系统，由运营人员线下协调。

## 4. 页面结构

```text
/
/program
/safety
/intake
/thank-you
/admin/login
/admin/leads
/admin/leads/[id]
```

## 5. 核心数据模型

### 5.1 leads

记录海外用户询盘。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |
| full_name | text | 姓名 |
| email | text | 邮箱 |
| phone_or_whatsapp | text | WhatsApp/电话 |
| country | text | 国家/地区 |
| age_range | text | 年龄段 |
| planned_travel_window | text | 计划出行时间 |
| travel_party | text | 独自/伴侣/小团 |
| primary_goals | text[] | 主要关注点 |
| risk_flags | text[] | 用户自报风险项 |
| budget_range | text | 预算 |
| message | text | 自由描述 |
| consent_privacy | boolean | 隐私同意 |
| consent_non_medical | boolean | 非诊疗声明同意 |
| source | text | 来源渠道 |
| utm_source | text | UTM |
| utm_medium | text | UTM |
| utm_campaign | text | UTM |
| status | text | 用户状态 |
| risk_level | text | low/medium/high |
| owner_id | uuid | 内部负责人 |

### 5.2 lead_notes

记录内部跟进。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| lead_id | uuid | 关联 lead |
| created_at | timestamptz | 创建时间 |
| author_id | uuid | 管理员 |
| note | text | 备注 |
| next_action | text | 下一步动作 |
| next_action_at | timestamptz | 下一步时间 |

### 5.3 lead_events

记录状态流转，方便复盘转化漏斗。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键 |
| lead_id | uuid | 关联 lead |
| created_at | timestamptz | 创建时间 |
| event_type | text | submitted/status_changed/email_sent |
| from_status | text | 原状态 |
| to_status | text | 新状态 |
| metadata | jsonb | 额外信息 |

### 5.4 admins

内部管理员资料，可与 Supabase Auth 用户关联。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | uuid | 主键，与 auth.users 对应 |
| email | text | 邮箱 |
| display_name | text | 显示名 |
| role | text | admin/operator |
| created_at | timestamptz | 创建时间 |

## 6. 状态机

```text
New
  -> Screening
  -> Qualified
  -> Consultation Booked
  -> Proposal Sent
  -> Deposit Paid
  -> Confirmed
  -> In Service
  -> Follow-up
  -> Closed

New / Screening / Qualified
  -> Not Fit
```

状态变更必须写入 `lead_events`。

## 7. API 设计

### 7.1 Public APIs

`POST /api/leads`

用途：提交 Intake 表单。

关键逻辑：

- 校验必填字段。
- 校验 consent。
- 验证防滥用 token。
- 基于风险项计算初始 risk_level。
- 创建 leads 记录。
- 创建 lead_events 记录。
- 发送用户确认邮件。
- 发送内部通知邮件。

### 7.2 Admin APIs

`GET /api/admin/leads`

用途：查询询盘列表。

支持筛选：

- status
- risk_level
- country
- source
- created_at range

`GET /api/admin/leads/:id`

用途：查看询盘详情。

`PATCH /api/admin/leads/:id`

用途：更新状态、负责人、风险等级。

`POST /api/admin/leads/:id/notes`

用途：新增跟进备注。

`GET /api/admin/leads/export`

用途：导出 CSV。

## 8. 权限设计

MVP 只设置两个角色：

- admin：可查看、编辑、导出所有数据。
- operator：可查看和编辑询盘，不可管理管理员。

公开表单只能写入 lead，不可读取任何用户数据。

Supabase Row Level Security 建议：

- `leads`：仅 service role 或已登录管理员可读；公开提交通过服务端 API 写入。
- `lead_notes`：仅管理员可读写。
- `lead_events`：仅管理员可读，服务端写入。
- `admins`：仅 admin 管理。

## 9. 风险评分规则

MVP 使用简单规则，不做医疗判断。

初始 `risk_level`：

- high：怀孕、近期手术、严重心血管疾病、抗凝药物、严重过敏、免疫抑制、明确寻求疾病治疗。
- medium：慢性病、长期疼痛、睡眠障碍严重、正在服药、年龄较高。
- low：无明显风险，仅压力、睡眠、疲劳、一般康养兴趣。

系统只做运营提醒，不自动给医学结论。

## 10. 邮件触发

### 10.1 用户确认邮件

触发：提交 Intake 后。

内容：

- 确认收到咨询。
- 说明 Eastaura 团队会在 1-2 个工作日内联系。
- 重申项目不是紧急医疗服务。
- 如有急症或重大健康问题，应联系当地医生。

### 10.2 内部通知邮件

触发：新 lead 创建后。

内容：

- 用户姓名、国家、目标、预算、风险等级。
- 后台详情链接。

### 10.3 后续邮件

V0.2 再加入：

- 咨询预约确认。
- Proposal 发送。
- 行前提醒。
- 离境后随访。

## 11. 隐私与合规设计

MVP 需要做到：

- 表单只采集服务匹配所需信息，不要求上传病历。
- 明确隐私同意和非诊疗声明。
- 管理后台必须登录访问。
- 日志不打印完整健康描述。
- 导出 CSV 仅限 admin。
- 数据库定期备份。

隐私政策至少说明：

- 收集哪些信息。
- 用于什么目的。
- 谁可以访问。
- 是否会分享给合作机构。
- 用户如何请求删除。

## 12. 开发里程碑

### Milestone 1：公开网站与询盘提交

交付：

- 首页。
- Program 页面。
- Safety/FAQ 页面。
- Intake 表单。
- Thank You 页面。
- `POST /api/leads`。
- 邮件通知。

验收：

- 用户可提交表单。
- 数据写入数据库。
- 用户和内部均收到邮件。

### Milestone 2：内部后台

交付：

- 管理员登录。
- 询盘列表。
- 询盘详情。
- 状态修改。
- 跟进备注。

验收：

- 未登录不能访问后台。
- 状态变更写入事件。
- 备注可追溯。

### Milestone 3：运营复盘

交付：

- 来源渠道记录。
- 漏斗统计基础视图。
- CSV 导出。

验收：

- 可按来源、状态、风险等级筛选。
- 可导出询盘数据用于人工复盘。

## 13. 后续扩展

MVP 验证后再考虑：

- Stripe 定金支付。
- 用户行程页。
- Proposal 在线生成。
- 合作方排期。
- 多套餐管理。
- 内容 CMS。
- 多语言版本。
- CRM 自动化。
- 离境后线上会员系统。
