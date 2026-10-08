# TEMPO-7 v0.4.0 — PWA

TEMPO-7 is now installable as a Progressive Web App (PWA) while remaining a normal HTML/CSS/JS project.

## v0.4.0 新增

- **PWA 安装**：在受支持的 Chromium 浏览器（Chrome / Edge）中，GitHub Pages 版可安装到 Windows。
- **Standalone 窗口**：安装后从开始菜单或桌面启动，不显示普通浏览器地址栏与标签页。
- **离线 App Shell**：首次成功加载后，核心 HTML / CSS / JS / 字体 / 图标会由 Service Worker 缓存。
- **INSTALL 按钮**：浏览器提供安装提示时，TEMPO-7 顶栏会自动出现 `INSTALL`；已安装或当前不可安装时隐藏。
- **应用图标**：加入 192×192、512×512、maskable 512×512、Apple touch icon 和 favicon。
- **GitHub Pages 友好路径**：manifest、service worker、图标和现有资源均使用相对路径，可部署在 `/TEMPO-7/` 子路径。
- 原有 v0.3.0 的日程、Today Override、铃声、模拟时间、SCHEDULE 自动巡航等功能保持不变。

## 本地测试

在项目目录运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

`localhost` 被浏览器视为安全环境，因此可用于测试 Service Worker / PWA。不要直接双击 `index.html` 使用 PWA 功能。

如果刚覆盖新版本，建议用 `Ctrl + Shift + R` 重新加载一次。

## GitHub Pages 安装

部署到 GitHub Pages 后，打开：

```text
https://unimeleo.github.io/TEMPO-7/
```

Chrome / Edge 满足安装条件后：

- 地址栏附近可能出现安装图标；
- TEMPO-7 顶栏也会出现 `INSTALL`；
- 点击安装后即可从 Windows 开始菜单 / 桌面启动。

GitHub Pages 网页版与从它安装出来的 PWA 属于同一 origin，因此会共享该站点下的 localStorage / IndexedDB 数据。`localhost:8000` 仍然是另一套独立数据。

## 更新

发布新版本后：

```powershell
git add .
git commit -m "TEMPO-7 v0.4.0"
git push
```

GitHub Pages 更新后，浏览器会检查新的 Service Worker。打开或刷新应用后会逐步切换到新缓存版本。

## 数据说明

- 日程、设置、Today Override：浏览器本地存储。
- MP3 / WAV：IndexedDB。
- JSON：用于模板、设置、Today Override 的备份与迁移。
- 音频文件仍不包含在 JSON 备份内。

## 字体

- 英文 / 数字：优先调用 Windows 本机 `Bahnschrift`。
- 中文：项目内 `SourceHanSansCN-Heavy.otf`。
