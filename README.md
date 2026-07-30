# productivity-valley

绘本风生产力乙游：完成待办获得金币与心意，与中式小人培养友情/爱情，有空房时可邀请伴侣同住。

## 设计

- [产品设计文档（锁定 v0.4）](docs/DESIGN.md)

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## iPad 测试（PWA）

部署后用 Safari 打开站点 → 分享 → **添加到主屏幕**。支持离线缓存（vite-plugin-pwa）。

## 技术

- Vite + React + TypeScript
- 规则层在 `src/core/`（与 UI 分离，便于日后跨端）
- 本地 `localStorage` 持久化
