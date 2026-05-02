# CLEANUP INVENTORY 2026-05-02

本文件记录本轮“大扫除”的项目主体判断、缓存/废弃候选和后续执行边界。当前阶段以“建入口、压上下文、列清单”为主，不直接删除高风险历史资产。

## 项目主体

必须视为当前主线并保留：

- 根项目源码：`src/`
- 官网资源：`public/`
- 验证和运维脚本：`scripts/`
- 数据库结构：`supabase/migrations/`
- 版本化 Skill：`skills/`
- 当前 Workbench：`workbecnch-ui-2/app-old/`
- 项目文档入口：`README.md`、`ARCHITECTURE.md`、`CONTEXT.md`、`docs/entry/AGENT_ONBOARDING.md`、`docs/entry/INDEX.md`

## 低风险缓存候选

这些内容可重建，后续可以在确认无进程占用时清理：

- `.next/`：Next 构建缓存。
- `node_modules/`：根依赖目录，可通过 `npm install` 恢复。
- `workbecnch-ui-2/app-old/node_modules/`：Workbench 依赖目录，可在子目录 `npm install` 恢复。
- `.npm-cache/`：npm 本地缓存。
- `tsconfig.tsbuildinfo`：TypeScript 增量缓存。
- `.tmp-*.log`、`.tmp-*.err.log`：本地临时运行日志。
- `.codex-*.log`、`.codex-*.pid`：本地工具日志和 PID。

注意：部分缓存/日志已被 Git 跟踪，`.gitignore` 不会自动移出历史；若要真正从版本库移除，需要单独确认后执行。

## 需确认再处理

- `workbench-ui/`：旧 Vite Workbench 原型。建议作为历史资产归档或移出主仓，但不直接删除。
- `workbecnch-ui-2/deploy2/`：旧静态导出产物。当前主线是 `workbecnch-ui-2/app-old/` 动态 Next Workbench。
- `Kimi_Agent_Eastaura Wellness Retreat Prototype.zip`：外部原型压缩包，约 122MB。建议确认无唯一未迁移资产后移出仓库。
- `docs/assets/` 多轮截图：保留最终状态和关键对照，过程截图可归档或移出。
- `docs/BROWSER_USE_PROXY_FIX_RUN.log`：一次性排障日志，可归档或删除。
- `public/images/brand/eastaura-logo-concept-01.png`：曾被标为未引用候选；删除前必须确认当前品牌资产是否仍需要。
- `src/lib/server/feishu-app.ts`：曾被标为未引用候选；删除前必须确认飞书自建应用路线是否保留。

## 建议忽略规则

本轮已补充临时日志 ignore 规则，减少新日志反复出现在 `git status`：

- `.tmp-*.log`
- `.tmp-*.err.log`

后续如确认 `deploy2/` 和 `.npm-cache/` 不应进入版本库，可以再补充更强 ignore，并配合从 Git 索引移除。

## 建议验证

- 仅文档整理：人工阅读 `CONTEXT.md`、`docs/entry/AGENT_ONBOARDING.md`、`docs/entry/INDEX.md`。
- 删除缓存后：`npm install`、`npm run typecheck`。
- 删除 Workbench 相关缓存后：进入 `workbecnch-ui-2/app-old/` 执行 `npm install` 和 `npm run lint`。
- 删除旧原型/导出产物前：先用 `rg "workbench-ui|deploy2|Kimi_Agent"` 确认引用只剩历史说明。

## 当前结论

项目并不是业务源码膨胀，而是“当前入口、历史资料、缓存、旧原型和截图资产”混在同一层导致后续 Agent 难以判断优先级。第一阶段先建立渐进暴露入口；第二阶段再按用户确认执行物理清理。
