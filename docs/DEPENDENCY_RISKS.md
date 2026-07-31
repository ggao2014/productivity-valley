# 依赖风险记录

更新时间：2026-07-30

## 当前状态

- `npm audit --omit=dev`：0 个生产依赖漏洞。
- 完整 `npm audit`：8 个高危开发依赖告警。
- 告警链路：`vite-plugin-pwa → workbox-build → rollup-plugin-off-main-thread → ejs → jake → filelist → minimatch → brace-expansion`。
- 风险类型：构建工具处理恶意模式时可能出现拒绝服务；不会进入浏览器生产包。

## 当前决定

暂不运行 `npm audit fix --force`。npm 当前建议强制回退 `vite-plugin-pwa`，会产生破坏性版本变化。CI 会阻止生产依赖漏洞进入，同时继续运行完整构建和测试。

后续在 `vite-plugin-pwa` 或其 Workbox 依赖发布兼容修复后升级，并重新运行完整审计。
