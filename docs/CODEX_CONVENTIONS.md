# Codex Coding Conventions

别做的事，比要做的事更重要。以下是这个项目当前阶段的编码纪律。

这些规则是默认约定，不是永久禁令。只有在能明确降低复杂度、提升安全性或避免真实重复维护成本时，才偏离这些约定；偏离时要在本次任务结论里说明原因。

## 不要做的事

### 别在当前调用方式不会炸的地方加 try-catch

```ts
// ❌ 别这样
try {
  const lead = getStore().leads.get(id);
} catch { ... }

// ✅ 这样就行
const lead = getStore().leads.get(id);
if (!lead) throw new Error("Lead not found.");
```

`Map.get()` 不会抛异常，`crypto.randomUUID()` 在当前运行环境下不需要额外 catch，已被上游约束过的结构不需要重复防御。只在实际可能失败的边界 catch：外部 API 调用、文件读取、数据库操作、未受信输入解析。

`JSON.parse()` 本身会抛异常；只有当输入来源已经被强约束并且失败会被上层统一处理时，才不单独包 catch。

### 默认别抽共享工具文件

```ts
// ❌ 别创建这些东西
src/lib/utils/string.ts
src/lib/utils/math.ts
src/lib/utils/object.ts
```

`stripUndefined`、`sumBy`、`groupMetricValues` 目前在 store.ts、validation.ts 和 supabase.ts 各写各的——这是对的。几个文件还在独立演进各自的结构，强行共享会互相掣肘。三个相似的代码块 > 一个过早的抽象。

只有当重复逻辑已经稳定、跨文件语义完全一致，并且第三处以上修改开始造成真实维护成本时，再考虑抽共享 helper。

### 别给 route handler 加返回类型 annotation

```ts
// ❌ 别这样
export async function POST(request: Request): Promise<NextResponse<IntakeResponse>> {

// ✅ 就这样
export async function POST(request: Request) {
```

Next.js 自己推类型，手写返回类型只会让你在改 response shape 的时候多改一个地方。

### 当前阶段别拆 repository interface

`repositories/types.ts` 里一个 `EastauraRepository` interface 一百多个方法——别拆成七八个小 interface。一个 repo 就是一个东西，拆开了没意义，反而让新人不知道去哪找方法。

等内容、CRM、通知、运营等边界稳定，并且 memory/supabase 双实现不再需要统一入口时，再评估拆分。

### 默认少写注释

当前项目源码基本没有注释、没有 JSDoc、没有 `// TODO`。保持函数名和变量名自解释，避免用注释复述代码。

复杂 SQL/RPC、事务语义、安全边界、fallback 策略、外部服务兼容行为，可以写短注释解释“为什么这样做”。不要写会很快过期的流程旁白。

### 默认别引入工具库

不需要 lodash、ramda、date-fns（root 项目）、zod。校验逻辑手写在 `validation.ts` 里就行——每个 parser 的行为是项目特定的，通用库反而表达力不够。

如果后续 schema 数量明显膨胀、日期逻辑复杂化或手写校验开始带来真实 bug，再单独评估引入依赖；不要为一两个 helper 加包。

## 要保持的

- 每个 API route：try/catch + `NextResponse.json({ error: message }, { status: 4xx })`
- `parse*` 函数 = 校验并转换，`map*` 函数 = 类型映射，命名不混用
- helper 函数定义在使用它的文件里，不单独建文件
- 新的 entity 按 `types.ts → validation.ts → store.ts → supabase.ts → route.ts` 顺序加，不跳步
- workbench 代理模式不破：浏览器 → `/api/workbench/*` → server side `fetchRootApi()` → Root API，token 不进浏览器
- LLM 调用必须带 fallback，不假设外部服务可用
