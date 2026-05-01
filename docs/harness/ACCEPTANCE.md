# ACCEPTANCE

## 总体验收口径

`ENG-WB-CSV-001` 只有在 API 契约和浏览器流程均满足时，才可进入后续 GitHub Gate。当前 Dev 已完成，既有 `api-contract-tester` 与 `browser-flow-tester` 已 PASS；GitHub Gate 尚未启动。

2026-05-01 第二轮多 Agent 真实复验中，`api-contract-tester-2` PASS；`browser-flow-tester-2` 因子 Agent browser-use 后端不可用而 BLOCKED。Coordinator 浏览器诊断不得替代 `browser-flow-tester` 岗位验收。

## 岗位来源

本任务测试岗位来自 Eastaura Engineering Harness V1 tester card：

- `api-contract-tester`
- `browser-flow-tester`

## 功能验收

| ID | 验收项 | 通过标准 | 失败标准 | 验证方式 | 覆盖测试岗位 |
|----|--------|----------|----------|----------|--------------|
| CSV-01 | Lead Detail 页面出现 CSV export 按钮 | 页面加载目标 lead 后，Lead Actions 或等价操作区可见明确 CSV export 入口，且入口可触发下载动作 | 页面没有入口、入口只出现在列表页、入口不可点击、或入口不关联当前 lead | 浏览器打开 `/workbench/leads/{id}`，检查按钮可见性和点击状态 | `browser-flow-tester` |
| CSV-02 | 浏览器只请求 `/api/workbench/leads/{id}/export` | 点击导出时，浏览器网络请求目标为 `/api/workbench/leads/{id}/export`，不直接访问根 `/api/leads/export` | 浏览器直接请求根 `/api/leads/export`、请求非 Workbench proxy、或需要浏览器注入 admin token | 浏览器网络记录 + 客户端代码检查 | `browser-flow-tester` |
| CSV-03 | Workbench export route 返回单条 lead CSV | `GET /api/workbench/leads/{id}/export` 返回 `text/csv; charset=utf-8`，带 `Content-Disposition`，CSV header 对齐根 export 字段，数据只包含当前 lead 一条 | 返回 JSON、返回多条 lead、缺少关键 CSV header、缺少下载 header、CSV 转义明显错误、或 lead id 不匹配 | 直接调用 API route，检查状态码、headers 和 CSV 内容 | `api-contract-tester` |
| CSV-04 | admin token 不进入浏览器 | admin token 只在 Workbench 服务端 route 使用；客户端代码、浏览器请求、URL、localStorage、下载请求 header 均不包含 token | 客户端读取 `EASTAURA_ADMIN_API_TOKEN`、把 token 放入 URL/header/localStorage、或要求用户在浏览器侧提供 admin token | API route 代码检查 + 浏览器网络检查 | `api-contract-tester`, `browser-flow-tester` |
| CSV-05 | 错误状态可收敛 | lead 不存在、根 API 失败或配置缺失时，route 返回可判定非 2xx 状态；页面不永久 loading，下载失败有明确失败信号或可见错误状态 | 无限 loading、静默失败、下载空 CSV 且无错误信号、错误被吞掉、或所有失败都返回 200 | API 负向调用 + 浏览器失败路径观察 | `api-contract-tester`, `browser-flow-tester` |

## 数据验收

| ID | 验收项 | 通过标准 | 失败标准 | 验证方式 | 覆盖测试岗位 |
|----|--------|----------|----------|----------|--------------|
| CSV-DATA-01 | CSV 字段边界与根 export 对齐 | 单条 CSV 使用与根 `GET /api/leads/export` 一致或明确兼容的字段集合 | Workbench route 自定义不兼容字段，导致运营侧拿到不同 CSV 结构 | 对比根 export header 与 Workbench export response header row | `api-contract-tester` |

## UI/交互验收

| ID | 验收项 | 通过标准 | 失败标准 | 验证方式 | 覆盖测试岗位 |
|----|--------|----------|----------|----------|--------------|
| CSV-UI-01 | 下载交互不阻断页面 | 点击导出后页面仍可继续操作；失败时状态可恢复 | 点击后页面卡死、按钮永久 disabled、或导航到错误页面 | 浏览器点击流 | `browser-flow-tester` |

## 非功能验收

| ID | 验收项 | 通过标准 | 失败标准 | 验证方式 | 覆盖测试岗位 |
|----|--------|----------|----------|----------|--------------|
| CSV-SEC-01 | 权限边界不扩散 | 改动限制在 Workbench proxy 和 Lead Detail 入口，不扩散到根 auth、根数据模型或无关 API | 修改 admin auth、根数据模型、无关文件，或扩大浏览器权限 | diff 检查 + route 代码检查 | `api-contract-tester` |

## 不通过即阻塞项

- 任一验收项发现 admin token 进入浏览器，必须阻塞。
- 浏览器绕过 `/api/workbench/*` 直接访问根 admin API，必须阻塞。
- Workbench export route 返回多条 lead 或无法确认只导出当前 lead，必须阻塞。
- 缺少可用 lead id / fixture 时，真实 Test 可返回 `BLOCKED`，不得误判 PASS。
