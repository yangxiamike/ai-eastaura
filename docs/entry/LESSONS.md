# LESSONS

本文件用于沉淀后续 Agent 可复用的经验，不记录开发流水。每条 lesson 应该能帮助未来任务更快判断方向、避开坑或选择验证方式。

## 收集规则

- 只记录可复用经验：项目约束、架构取舍、工具坑、验证口径、业务判断边界。
- 不记录一次性过程：端口号、runId、临时日志、已解决的逐步排查细节。
- 每条 lesson 要说明适用场景和建议动作。
- 无法确认是否长期有效时，标注“待验证”。
- 每次归纳后如发现 `CONTEXT.md` 已堆积历史流水，应建议压缩并归档。

## 模板

```markdown
## YYYY-MM-DD

### [类别] 一句话标题

- 适用场景：
- 经验：
- 建议动作：
- 来源：
- 状态：active | archived |待验证
```

## 2026-05-02

### [文档治理] CONTEXT 只做当前作战板

- 适用场景：后续 Agent 入场、阶段收口、上下文压缩。
- 经验：`CONTEXT.md` 一旦混入历史流水、排障过程和 TODO 池，后续 Agent 会难以判断当前事实。
- 建议动作：`CONTEXT.md` 只保留当前主线、关键决定、阻塞和下一步；历史快照放入 `docs/archive/`，专项资料通过 `docs/entry/INDEX.md` 暴露。
- 来源：2026-05-02 项目大扫除。
- 状态：active

### [项目边界] 工程能力服务业务验证

- 适用场景：选择下一轮开发任务或判断是否继续扩张 harness / Workbench。
- 经验：当前技术闭环已足够支撑 MVP，近期主线应回到“卖什么、谁交付、怎么获客、怎么成交”。
- 建议动作：系统侧只做直接支撑套餐、获客、线索跟进和试运营复盘的事项；`harness` 降级为 P0-support。
- 来源：`CONTEXT.md`、`docs/plans/BUSINESS_CONTENT_PLAN_2026-05-02.md`、`docs/plans/SYSTEM_PLAN_2026-05-02.md`。
- 状态：active

### [代码入口] 不要误把旧原型当主线

- 适用场景：Workbench 相关开发、清理目录、排查前端问题。
- 经验：当前 Workbench 主体是 `workbecnch-ui-2/app-old/`；`workbench-ui/` 是旧 Vite 原型，`workbecnch-ui-2/deploy2/` 是旧静态导出产物。
- 建议动作：开发优先读 `workbecnch-ui-2/app-old/`；旧原型和导出产物只作为历史参考，删除或迁移前先确认。
- 来源：`docs/entry/CLEANUP_INVENTORY_2026-05-02.md`。
- 状态：active

### [验证] 按改动风险选择最小验证

- 适用场景：文档、类型/API、功能链路和运行态问题验证。
- 经验：一上来跑全套验证会放大本地环境噪音；项目已有分层验证脚本。
- 建议动作：文档改动人工读；类型/API 改动跑 `npm run typecheck`；Workbench/通知/内容链路按目标跑对应 `npm run verify:*`。
- 来源：`docs/entry/AGENT_ONBOARDING.md`、`package.json`。
- 状态：active
