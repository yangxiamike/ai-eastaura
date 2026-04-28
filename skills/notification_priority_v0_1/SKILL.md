# notification_priority v0.1

## 适用场景

判断新 lead、风险提示和高意向信号是否需要提醒创始人。

## 优先级规则

- 新 lead：创建 in-app 通知。
- intentScore >= 70：创建 high_intent 通知。
- riskLevel = high：创建 high_risk 通知。
- high risk 优先于 high intent。

## 输出要求

提醒必须简短、可行动，并引用 lead id 或 lead name。

## 后续扩展

接入飞书机器人 Webhook 和邮件发送后，通知记录仍应先入库，再尝试外部投递。
