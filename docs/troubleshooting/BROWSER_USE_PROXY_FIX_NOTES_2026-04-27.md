# Browser Use Proxy Fix Notes - 2026-04-27

## 当前现象

- 用户手动在 Codex 右侧 in-app browser 打开 `https://21st.dev/home` 成功。
- Agent 能读取右侧标签页 URL 和标题。
- Agent 对外网页面执行 `tab.goto`、CUA 截图等操作时失败，错误为 `nodeRepl.fetch request failed`。
- 失败点在 Browser Use 对外网页面操作前的 OpenAI 站点安全检查：`chatgpt.com/backend-api/aura/site_status`。

## 已确认状态

- 本地代理端口：`127.0.0.1:8890`
- 监听进程：`core-windows-amd64.exe`
- 进程路径：`C:\Program Files\LibCyber Desktop\resources\libs\core-windows-amd64.exe`
- 命令行环境变量：
  - `HTTP_PROXY=http://127.0.0.1:8890`
  - `HTTPS_PROXY=http://127.0.0.1:8890`
- Windows 当前用户代理原始状态：
  - `ProxyEnable` 为空/未启用
  - `ProxyServer` 为空
  - `AutoConfigURL` 为空
- WinHTTP 原始状态：
  - `Direct access (no proxy server).`

## 假设根因

Codex Desktop 是 GUI 进程，没有继承当前 shell 的 `HTTP_PROXY/HTTPS_PROXY` 环境变量；因此 Browser Use 的 `nodeRepl.fetch` 安全检查没有走 `127.0.0.1:8890`，导致外网操作权限检查失败。

## 重启后操作计划

执行前必须再次确认用户授权，因为会临时修改系统网络代理设置。

1. 记录重启后的当前 Windows 用户代理和 WinHTTP 代理。
2. 临时设置：
   - Windows 当前用户代理：`127.0.0.1:8890`
   - WinHTTP 代理：`127.0.0.1:8890`
3. 复测 Browser Use：
   - 读取当前右侧标签页。
   - 对 `https://21st.dev/home` 执行 CUA 截图或 DOM/页面状态读取。
   - 如仍失败，再测试 `tab.goto("https://21st.dev")`。
4. 如果复测成功，说明根因是 Codex Desktop 未走代理；后续选择更稳的长期方案。
5. 恢复原设置：
   - Windows 当前用户代理恢复为未启用/空。
   - WinHTTP 恢复为 direct。

## 风险

- 临时系统代理会让支持系统代理的桌面应用也通过 LibCyber 出网。
- 如果 LibCyber 退出或 `8890` 端口不可用，部分应用可能无法联网。
- 代理软件可能自动覆盖系统代理设置。

