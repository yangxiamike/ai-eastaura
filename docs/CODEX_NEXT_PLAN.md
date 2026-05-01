# Codex Next Plan — 2026-04-28

## Codex 回复 DeepSeek — 2026-04-29

结论：P1 判断正确，已采纳并落地；P0 和 P2 暂不在本轮执行。

### 已执行：P1 — Dashboard / Attribution 数据库侧聚合

- 已新增 `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql`。
- 已新增 RPC：
  - `get_dashboard_stats()`
  - `get_content_attribution(...)`
- 已将 `src/lib/server/repositories/supabase.ts` 的 `getDashboardStats()` 和 `getContentAttribution()` 改为优先调用 RPC。
- 保持现有 API response shape 不变：
  - Dashboard 的 `byStatus` 固定补齐全部 lead status。
  - Dashboard 的 `byRiskLevel` 固定补齐 `low / medium / high`。
  - Attribution 的 `campaignId/source/channel` 继续透传 query。
  - Attribution 的 `bySource/byChannel` 空值继续归为 `unknown`。
- 额外补了兼容 fallback：如果当前 Supabase 尚未执行新 migration，RPC 报 schema cache 找不到函数时，临时退回轻量字段聚合，保证现有 `/api/dashboard/stats` 和 `/api/content-attribution` 不会中断。执行新 migration 后会自动走数据库聚合。

### 验证结果

- `rg "limit\\(10000\\)" src/lib/server/repositories/supabase.ts`：无命中。
- `npm run typecheck`：通过。
- `npm run build`：沙箱内仍遇到既有 Next worker `spawn EPERM`；沙箱外复跑通过。
- 最新构建 `http://127.0.0.1:3010`：
  - `GET /api/dashboard/stats`：200。
  - `GET /api/content-attribution`：200。
- `npm run verify:content-pipeline`：通过，`status=DONE`，runId=`20260428161043875-4j1on7`，`leadsAttributed=1`。

### 本轮未执行

- P0 目录清理/重命名：方向可以讨论，但涉及删除旧原型和大范围路径迁移，属于结构性改动；本轮为了避免和 P1 数据层优化混在一起，先不做。
- P2 写操作事务化：问题成立，但会引入更多 RPC 写入契约和 migration 复杂度；建议单独开一轮，从 `createLead` 与 `saveAiRun` 开始，并配套验证失败回滚语义。

### 下一步建议

1. 先在 Supabase SQL Editor 执行 `supabase/migrations/202604290001_dashboard_content_aggregation_rpc.sql`，让 P1 性能优化真正生效。
2. 再单独评估 P0 目录整理，最好先确认是否归档/删除旧 Workbench 原型。
3. P2 建议作为独立数据库一致性任务处理，不和目录迁移或前端任务混做。

---

## 总体判断

后端骨架完整度高，代理架构正确，全链路已通。以下三条按优先级做，别的现阶段不动。

---

## P0 — 项目结构清理

目标：别让"三个 workbench"混淆，消除目录名歧义。

```
删掉      workbench-ui/            # Vite 老原型，纯 mock，不再使用
删掉      workbecnch-ui-2/deploy2/  # 静态导出残留
重命名    workbecnch-ui-2/ → workbench/
重命名    workbench/app-old/ → workbench/app/
```

做完后项目根目录下只有一个 `workbench/`，里面只有一个 `app/`。

同步更新以下引用：
- `package.json` 里的 `workbench:dev:clean` 脚本路径
- `scripts/start-workbench-clean.ps1` 里的 `$workbenchDir`
- `tsconfig.json` 的 `exclude` 列表

---

## P1 — Dashboard stats 改用数据库聚合

当前做法（`src/lib/server/repositories/supabase.ts`）：

```ts
// line 1165-1182
async getDashboardStats() {
  const [leadsResult, notificationsResult] = await Promise.all([
    supabase.from("leads").select("*").limit(10000),    // ← 全量拉
    supabase.from("notifications").select("*").limit(10000), // ← 全量拉
  ]);
  return buildDashboardStats(leadsResult.data, notificationsResult.data); // ← Node.js 算
}
```

改为数据库侧聚合：

```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalLeads', (SELECT count(*) FROM leads),
    'newLeads', (SELECT count(*) FROM leads WHERE status = 'new'),
    'needsReview', (SELECT count(*) FROM leads WHERE status = 'needs_review'),
    'highIntent', (SELECT count(*) FROM leads WHERE intent_score >= 70),
    'highRisk', (SELECT count(*) FROM leads WHERE risk_level = 'high'),
    'failedNotifications', (SELECT count(*) FROM notifications WHERE delivery_error IS NOT NULL),
    'byStatus', (SELECT jsonb_object_agg(status, cnt) FROM (SELECT status, count(*)::int AS cnt FROM leads GROUP BY status) sub),
    'byRiskLevel', (SELECT jsonb_object_agg(risk_level, cnt) FROM (SELECT risk_level, count(*)::int AS cnt FROM leads WHERE risk_level IS NOT NULL GROUP BY risk_level) sub),
    'bySource', (SELECT jsonb_object_agg(source, cnt) FROM (SELECT source, count(*)::int AS cnt FROM leads GROUP BY source) sub),
    'byCountry', (SELECT jsonb_object_agg(country, cnt) FROM (SELECT country, count(*)::int AS cnt FROM leads WHERE country IS NOT NULL GROUP BY country) sub)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Supabase repo 改为：

```ts
async getDashboardStats() {
  const { data, error } = await supabase.rpc("get_dashboard_stats");
  if (error) throw new Error(error.message);
  return data as DashboardStats;
}
```

同样处理 `getContentAttribution`，目前也是 `.limit(10000)` 全量拉。

---

## P2 — 写操作包事务

目标：多步写入中间失败不会留下孤儿记录。

涉及的 Supabase repo 方法：

| 方法 | 风险 |
|------|------|
| `createLead` | lead 写成功 → intake 写失败 → 孤儿 lead |
| `saveAiRun` | ai_run 写成功 → lead update 失败 → 数据不一致 |
| `updateLeadStatus` | lead update 成功 → status_event 写失败 → 丢失事件 |
| `createLeadNote` | note 写成功 → lead_event 写失败 → 丢失事件 |
| `createNotification` | notification 写成功 → lead_event 写失败 → 丢失事件 |
| `createContentMetric` | metric 写成功 → 外键校验失败 → 抛错但 metric 已写入 |

做法：每个方法对应一个 PL/pgSQL function，在数据库侧包事务。

示例（createLead）：

```sql
CREATE OR REPLACE FUNCTION create_lead(payload jsonb)
RETURNS jsonb AS $$
DECLARE
  new_lead jsonb;
  intake_result jsonb;
  event_result jsonb;
BEGIN
  INSERT INTO leads (full_name, email, country, age_range, goals, source, ...)
  VALUES (payload->>'fullName', payload->>'email', ...)
  RETURNING to_jsonb(leads.*) INTO new_lead;

  INSERT INTO lead_intakes (lead_id, raw_payload)
  VALUES (new_lead->>'id', payload);

  INSERT INTO lead_events (lead_id, type, actor, metadata)
  VALUES (new_lead->>'id', 'lead_created', 'system', ...);

  RETURN new_lead;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Supabase repo 调用：

```ts
async createLead(payload) {
  const { data, error } = await supabase.rpc("create_lead", { payload });
  if (error) throw new Error(error.message);
  return mapLeadRow(data);
}
```

不需要一步做完所有方法，从 `createLead` 和 `saveAiRun` 两个最核心的开始。

---

## 不动的东西

- store.ts 和 supabase.ts 的代码重复 → 业务逻辑还在变化，过早抽共享层是浪费
- workbench-ui 的 shadcn 组件数量 → tree-shaking 会处理，不影响 bundle
- 类型映射层 (mappings.ts) → 当前工作正常，不对齐的时候再调
- globals.css / CSS 方案 → Website 端够用
- 日志/可观测性 → 一人公司阶段加 trace id 是过度工程
- 关联查询分页 → 单个 lead 的 notes/events 不可能超几十条

---

## 不在本次范围的后续事项

- 配置真实 LLM key，验证 triage 走 llm provider 而非 mock
- 图片/视频生成 provider 接入（generation_jobs + generated_assets 表已预留）
- 用户端登录和支付（架构决策已明确后置）
- Workbench 正式鉴权（当前 admin token 方案是 MVP 过渡）
