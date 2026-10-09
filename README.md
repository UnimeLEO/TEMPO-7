# TEMPO-7 v0.7.0 — SELF-HOSTED DINish TYPOGRAPHY

TEMPO-7 是一个本地优先（local-first）的规律作息执行器：根据预设时间段自动判断当前任务、显示倒计时和进度、播放课程铃声，并支持 TODAY 临时修改、WEEK PLAN 周计划、外观自定义、PWA 安装和离线使用。

v0.7.0 的重点是完成英文 / 数字字体的可分发化：不再依赖 Windows 本机 Bahnschrift，改为由项目 `fonts/` 目录自托管开源 DINish，并让 PWA 离线缓存字体资源。主倒计时单独使用 DINish Bold，其余英文与数字界面使用 DINish SemiBold。

## v0.7.0 新增与调整

- **Bahnschrift → DINish**：英文与数字默认字体更换为开源 DINish。
- **项目字体优先**：CSS 优先加载 GitHub 仓库 `fonts/` 中的 DINish，不再以操作系统是否安装 Bahnschrift 为前提。
- **DINish SemiBold / 600**：TEMPO-7 的英文标签、时间、普通数字与界面文字使用 `DINish-SemiBold.ttf`。
- **DINish Bold / 700**：中央主倒计时单独使用 `DINish-Bold.ttf`，与普通界面数字建立更清楚的层级。
- **中文保持不变**：中文继续使用项目内 `SourceHanSansCN-Heavy.otf`。
- **混排自动回退**：同一段文本中，拉丁字母与数字优先由 DINish 渲染；DINish 不包含的中文字形自动回退到思源黑体。
- **PWA 离线字体缓存**：Service Worker 的 App Shell 已加入 DINish SemiBold / Bold，安装版离线启动时仍可保持一致字形。
- **字体许可随项目分发**：`fonts/DINish-OFL.txt` 随仓库保存。DINish 使用 SIL Open Font License 1.1，可作为 Web Font 自托管与随软件分发。
- 版本号、HTML cache-busting 与 PWA cache 名称同步更新至 `0.7.0`。
- v0.6.0 的 LOOK 外观系统、真实时间运行、108px 起始倒计时字号及 `-0.045em` 字距保持不变。

## 当前核心功能

- 时间段式日程模板，可新建、复制、删除、编辑并长期保存在浏览器中。
- 自动识别当前任务、空档 FREE TIME、NEXT 和今日剩余 SCHEDULE。
- 主倒计时使用真实系统时间计算，不依赖逐秒递减，因此浏览器短暂降频后仍可自动校准。
- SCHEDULE 慢速自动巡航；悬停暂停；手动滚动后延迟恢复；到底后平滑回顶。
- CLASS 分类绑定上课铃 / 下课铃，可导入 MP3 / WAV，音频保存在 IndexedDB。
- TODAY Override：当天可临时 EDIT / SKIP / ADD TASK，不改变基础模板。
- WEEK PLAN：按周一至周日自动选择模板，也可设为 OFF / NO SCHEDULE。
- LOOK：可配置界面底色、文字色、分类状态色及状态切换动画。
- JSON 导入 / 导出：用于模板、周计划、设置、外观、TODAY Override 的备份与迁移。
- PWA：可从 GitHub Pages 安装为独立窗口应用，并支持 App Shell 离线启动。
- 自托管字体：英文 / 数字使用 DINish，中文使用 Source Han Sans CN Heavy。

## 外观系统使用

点击顶栏 `LOOK`：

1. 在 `SURFACES` 中调整界面底色、面板、边框和文字颜色；
2. 在 `STATE PALETTE` 中调整不同任务分类的主区域颜色；
3. 在 `STATE TRANSITION` 中选择 FLASH / SOFT / NONE；
4. 修改过程中主界面实时预览；
5. 点击 `SAVE APPEARANCE` 保存，或 `CANCEL` 放弃本次修改；
6. `RESET DEFAULTS` 只恢复默认预览，仍需点击 SAVE 才会写入长期设置。

## WEEK PLAN

点击顶栏 `WEEK`：

1. 勾选 `ENABLE WEEK PLAN`；
2. 为 MON–SUN 分别选择模板或 `OFF / NO SCHEDULE`；
3. 点击 `SAVE WEEK PLAN`。

启用后，顶栏 `TEMPLATE` 会锁定到当天由周计划选择的模板。`TODAY` 仍优先于基础模板，只修改当天。

## 本地测试

在项目目录运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

覆盖新版本后可用 `Ctrl + Shift + R` 强制重新加载。若已安装 PWA 且仍显示旧版本，可完全退出 TEMPO-7 后重新打开，让新的 Service Worker 接管。

## GitHub 更新

测试通过后：

```powershell
git add .
git commit -m "TEMPO-7 v0.7.0"
git push
```

GitHub Pages 会随 `main` 分支更新。

## 数据与存储

- 日程模板：`localStorage`
- WEEK PLAN：`localStorage`
- TODAY Override：`localStorage`
- 外观与铃声设置：`localStorage`
- MP3 / WAV 音频本体：`IndexedDB`
- JSON：备份模板、周计划、外观/铃声设置和 TODAY Override
- JSON **不包含** MP3 / WAV 音频文件本体

同一设备、同一浏览器、同一网站来源会继续读取这些本地数据。`localhost:8000` 与 GitHub Pages 属于不同来源，因此二者的浏览器本地数据互不自动共享。

## 字体

TEMPO-7 v0.7.0 起不再依赖 Windows 本机 Bahnschrift。字体优先从项目自身的 `fonts/` 目录加载，因此 GitHub Pages、PWA 与不同设备之间更容易保持一致视觉。

- **英文 / 普通数字 / UI**：`fonts/DINish-SemiBold.ttf`，CSS weight `600`。
- **主倒计时数字**：`fonts/DINish-Bold.ttf`，CSS weight `700`。
- **中文**：`fonts/SourceHanSansCN-Heavy.otf`。
- **DINish 许可**：SIL Open Font License 1.1；许可文本见 `fonts/DINish-OFL.txt`。
- **DINish 上游项目**：`playbeing/dinish`。上游明确允许桌面、电子书及 Web Font 使用，并推荐网站自行托管字体文件。

项目 CSS 中 DINish 排在字体栈首位；因此只要仓库字体资源加载成功，就不会再调用用户设备上的 Bahnschrift。中文因 DINish 无对应 CJK 字形而自然回退到项目内思源黑体。

## 版本记录

### v0.7.0 — Self-hosted DINish Typography
- 用开源 DINish 替换对 Windows Bahnschrift 的运行时依赖。
- DINish SemiBold 用于英文、时间与普通数字；主倒计时单独使用 DINish Bold。
- DINish 字体文件放入仓库 `fonts/` 并加入 PWA 离线缓存。
- 随项目加入 DINish 的 SIL Open Font License 1.1 文本。
- README 补充字体加载、分发和许可说明。

### v0.6.0 — Appearance System
- 新增 LOOK 外观系统、界面底色与分类状态色自定义、切换动画模式。
- 外观设置纳入 JSON 备份。
- 移除模拟时间模式。
- 主倒计时最小字号提升至 108px，字距由 -0.075em 放宽至 -0.045em。
- 清理 v0.5.0 CSS 追加样式中的转义换行残留。

### v0.5.0 — Week Plan
- 新增 WEEK PLAN，可按星期自动绑定模板。
- 支持 OFF / NO SCHEDULE；OFF 日仍可使用 TODAY 临时添加任务。
- 启用周计划时锁定顶栏模板选择，避免与自动映射冲突。

### v0.4.0 — PWA
- 加入 Web App Manifest、Service Worker、离线 App Shell 和应用图标。
- 支持从 Chrome / Edge 安装为独立窗口应用。
- 增加 INSTALL 入口并补齐 favicon。

### v0.3.0 — Today Override
- 引入“模板”与“今日运行副本”双层结构。
- TODAY 支持临时 EDIT、SKIP、ADD TASK 和 RESET TODAY。
- 今日修改按日期保存，不污染长期模板。
- 倒计时、SCHEDULE、NEXT 与铃声跟随今日实际日程重新计算。

### v0.2.0 — Bell System
- CLASS 分类绑定进入 / 离开铃声。
- 支持导入 MP3 / WAV、试听、音量控制和清除。
- 音频存储于 IndexedDB。
- 增加跨时间点检测与已触发记录，避免重复补响。

### v0.1.4 — Typography Split
- 英文和数字切换为本机 Bahnschrift SemiBold。
- 中文切换为 Source Han Sans CN Heavy。
- 中英文字体可在同一界面内自动分流。

### v0.1.3 — Schedule Cruise Fix
- 修复部分浏览器对亚像素 `scrollTop` 取整导致 SCHEDULE 不滚动的问题。
- 改用浮点位置累计，自动巡航稳定运行。

### v0.1.2 — Typography Update
- 首次接入自定义字体资源并建立独立字体目录结构。

### v0.1.1 — Schedule Cruise
- SCHEDULE 加入慢速自动巡航、悬停暂停、手动滚动后恢复、到底平滑回顶。
- 列表只有内容变化时才重新渲染，以保留滚动位置。

### v0.1.0 — Initial Prototype
- 建立工业风主界面。
- 完成当前任务、倒计时、进度条、NEXT、SCHEDULE、空档识别。
- 完成日程模板编辑、本地保存和 JSON 导入 / 导出。
- 建立基于真实系统时间的自动恢复与倒计时基础架构。
