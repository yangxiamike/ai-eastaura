# lead_triage v0.1

## 适用场景

用户提交 Intake 后，帮助创始人快速理解客户目标、购买信号、适配度和下一步。

## 输入字段

- fullName
- email
- country
- ageRange
- goals
- preferredTiming
- budgetUsd
- travelPartySize
- freeText
- source

## 输出 JSON schema

见 `output_schema.json`。

## 输出要求

- 只做运营辅助，不做医学判断。
- 摘要必须引用用户明确提交的信息，不编造病史、预算或旅行计划。
- 风险提示使用 review/clarify/check，不使用 diagnose/treat/cure。
- 高风险或高意向 lead 必须标记 humanReviewRequired。

## 失败处理

字段不足时，输出需要补问的问题；不得自行假设用户适合某项医疗服务。
