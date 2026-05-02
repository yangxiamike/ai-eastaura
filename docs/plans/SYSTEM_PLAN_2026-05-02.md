# SYSTEM PLAN (2026-05-02)

## 目标

系统侧只服务商业内容主线：让官网能收线索，Workbench 能跟进，通知能触达，内容能归因，验证能复跑。

本 plan 不定义新商业方向，不扩张独立平台能力。

## 当前原则

- 商业内容 plan 决定优先级。
- 系统只做直接支撑套餐、获客、线索跟进和试运营复盘的事项。
- `harness` 降级为 P0-support：用于验收链路、运营检查和试运营数据记录，不作为独立产品、新 runtime 或复杂平台扩张。
- Workbench 继续作为内部指挥台，不做合作方后台、用户账号或复杂权限体系。

## S0 已具备能力

- 公开官网 `/intake` 可提交真实 lead。
- Root API 已支持 lead、AI triage、notification、dashboard、CSV export、content pipeline 和 attribution。
- Workbench 通过服务端代理读取真实 Root API。
- 飞书通知已验证可用。
- `verify:intake-flow`、`verify:workbench-proxy`、`verify:notification-channels`、`verify:content-pipeline` 和 `verify:all` 已形成回归基础。

## S1 试运营前必须收口

核心问题：线上链路能不能稳定支撑真实线索。

必须完成：

- 生产环境 Supabase migration 确认。
- 生产环境 `EASTAURA_ADMIN_API_TOKEN`、`EASTAURA_LLM_*`、飞书变量确认。
- Resend 邮件通道配置并通过 `EXPECT_NOTIFICATION_CHANNELS=email,feishu` 验收。
- Intake 防滥用：接入 Turnstile 前端控件和失败提示。
- Workbench 访问保护：至少有明确的部署访问策略，不让内部后台裸奔。
- 发布前固定执行 `npm run verify:all`；必要时追加 `npm run verify:intake-flow`。

验收标准：

- 新 lead 可在生产环境创建、通知、查看、跟进。
- 双通道通知可用，失败有记录。
- 内部 API fail-close，不暴露管理数据。

## S2 支撑商业 P0 的系统事项

按商业优先级处理：

- 套餐与履约方案定稿后，同步更新官网 Program / Safety / Intake 文案和字段。
- 获客计划定稿后，同步检查 UTM 字段、campaign、content attribution 是否满足复盘。
- 线索 SOP 定稿后，同步检查 Workbench Lead Detail、备注、状态流转、通知优先级是否够用。
- Proposal、行前须知、Wellness Summary 暂时先用文档模板，不急着做自动生成系统。

验收标准：

- 商业文案变更可以反映到官网。
- 内容推广可以归因到 lead。
- 运营每天能在 Workbench 完成新线索跟进。

## S3 暂停或后置

以下事项暂不作为近期主线：

- 继续扩张 harness 新功能。
- 自动报价。
- 在线支付。
- 用户登录中心。
- 合作方后台。
- 自动发布社媒。
- 图片/图生视频 provider 接入。
- 多城市、多套餐管理。
- Skill 管理后台。

后置条件：

- 已获得稳定有效线索。
- 至少完成真实咨询或付费样本。
- 明确这些系统能力会直接提升成交或履约效率。

## S4 系统复盘指标

- Intake 成功率。
- 通知送达率。
- Workbench fallback 次数。
- 内容归因完整率。
- 首次响应是否在 24 小时内发生。
- 验证脚本是否能在发布前稳定通过。
