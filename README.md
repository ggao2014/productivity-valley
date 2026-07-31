# productivity-valley

做待办赚金币和精力，和小人交朋友、谈恋爱，有空房就能请进来住。

## 设计

- [产品设计文档（锁定 v0.4）](docs/DESIGN.md)
- [产品路线图](docs/ROADMAP.md)

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

## 在线地址（GitHub Pages）

预计地址：

**https://ggao2014.github.io/productivity-valley/**

首次需要仓库管理员开启一次 Pages（我这边的 token 无此权限）：

1. 打开 [Settings → Pages](https://github.com/ggao2014/productivity-valley/settings/pages)
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 保存后，到 [Actions](https://github.com/ggao2014/productivity-valley/actions) 里对失败的 *Deploy to GitHub Pages* 点 **Re-run all jobs**  
   （或任意再 push 一次 `main`）

开启成功后，用 iPad Safari 打开上述地址 → 分享 → **添加到主屏幕**，即可当 Web App 使用（已配 PWA）。

## 技术

- Vite + React + TypeScript
- 规则层在 `src/core/`（与 UI 分离，便于日后跨端）
- 本地 `localStorage` 持久化
- 免费部署：GitHub Pages + Actions
