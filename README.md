# TEMPO-7 v0.7.2 — PERFORMANCE OPTIMIZATION

TEMPO-7 是一个本地优先（local-first）的规律作息执行器：根据预设时间段自动判断当前任务、显示倒计时和进度、播放课程铃声，并支持 TODAY 临时修改、WEEK PLAN 周计划、外观自定义、PWA 安装和离线使用。

v0.7.2 是一轮 **无意改变现有视觉和功能表现的性能整理**。核心目标是降低长期运行时不必要的 DOM 写入、localStorage 读取和动画帧占用，让倒计时、SCHEDULE 巡航、铃声监听和 PWA 长时间运行更平稳。

v0.7.1 的 TODAY 工作流、v0.7.0 的完整备份与自托管 DINish 字体体系均保持不变。


## v0.7.2 性能优化

- **主运行循环拆分**：250 ms 运行循环只负责必须持续变化的时间、倒计时、进度条与 NEXT 倒计时；任务名称、分类色、SCHEDULE、TODAY / WEEK / AUDIO 状态等静态内容仅在状态实际变化或明确操作后刷新。
- **减少 DOM 写入**：动态文本采用“内容变化后才写入”的方式，避免相同倒计时状态和时间文字被重复写回 DOM。
- **SCHEDULE 按需巡航**：不再让 `requestAnimationFrame` 在无溢出、鼠标悬停、手动暂停或页面隐藏时永久空转；只有列表确实需要移动时才持续申请动画帧。
- **暂停阶段休眠**：SCHEDULE 顶部 / 底部停顿改为定时唤醒，停顿期间不占用 60 FPS 动画循环；手动滚动后的 5 秒等待期同样休眠。
- **页面隐藏降频**：页面不可见时，主运行循环由 250 ms 调整为 1000 ms；重新回到前台后立即完整刷新并恢复 250 ms。铃声跨时间点检测仍保留原有 90 秒 catch-up 保护。
- **铃声事件缓存**：当前日程对应的铃声事件表只在日程源发生变化时重新生成，不再每个运行 tick 重新构建。
- **铃声触发日志缓存**：当天已触发铃声记录保留内存缓存，仅在日期变化或实际新增触发记录时访问 / 写入 localStorage。
- **运行状态缓存**：`START TODAY / AUDIO ENABLED` 的运行状态不再每 250 ms 读取 localStorage；当前标签页以内存状态为主，并保留跨标签页 `storage` 事件同步。
- **响应式巡航恢复**：窗口或 SCHEDULE 容器尺寸变化时会重新检测是否需要自动巡航，避免按需动画优化后因尺寸变化漏启滚动。
- **不改变用户数据格式**：FULL BACKUP schema、模板、WEEK PLAN、TODAY Override、LOOK、音频 IndexedDB 均保持兼容，不需要迁移数据。

## v0.7.1 新增与调整

- **AUDIO ENABLED**：完成浏览器音频解锁后，顶部运行按钮显示 `AUDIO ENABLED`；绿色状态样式保持为统一的“已启用”视觉。
- **TODAY 状态改为绿色**：存在 TODAY Override 时，`TODAY` 按钮使用与 AUDIO 激活后相同的绿色状态样式，不再通过 `TODAY*` 星号提示。
- **WEEK 状态改为绿色**：启用 WEEK PLAN 后，`WEEK` 按钮同样使用绿色状态样式，不再显示 `WEEK*`。
- **EXPORT TODAY JSON**：TODAY 编辑器可把当前编辑内容（包括尚未点击 SAVE TODAY 的修改）导出为 `TEMPO-7-today-YYYY-MM-DD.json`。这是独立的单日数据导出，不等同于 FULL BACKUP。
- **SAVE AS TEMPLATE**：TODAY 当前内容可直接创建为新的长期模板，并要求输入模板名。
- **SAVE**：只创建模板，不应用到今天，也不修改 WEEK PLAN。
- **SAVE & APPLY TO TODAY**：创建模板，并把当前内容作为今天的运行日程；无论 WEEK PLAN 是否开启，都不会修改星期映射。
- **SAVE & APPLY TO WEEK PLAN**：仅在 WEEK PLAN 已启用时可用；创建模板、立即应用到今天，并把 WEEK PLAN 中“今天对应的星期”改绑到新模板。
- **WEEK 未启用提示**：第三个按钮在 WEEK PLAN 关闭时为灰色不可用，悬停显示 `WEEK is not enabled`。
- v0.7.0 的 FULL BACKUP、DINish 字体、PWA 与离线能力保持不变。

## v0.7.0 新增与调整

- **FULL BACKUP**：备份格式升级至 schema v5，可一次导出模板、WEEK PLAN、TODAY Override、外观、铃声设置以及 MP3 / WAV 音频本体。
- **音频进入备份**：IndexedDB 中的上课铃 / 下课铃会以 Base64 形式封装进同一个 JSON，因此备份文件可独立迁移到另一台设备。
- **一键恢复音频**：导入 v0.7.0 FULL BACKUP 时，同时恢复 localStorage 配置与 IndexedDB 音频；备份中未配置的铃声槽位会同步保持为空。
- **兼容旧版 JSON**：v0.1–v0.6 以及早期 v0.7 配置备份仍可导入；旧备份没有音频本体时，不会删除当前浏览器已有铃声。
- **会话状态不迁移**：浏览器音频解锁权限、当前 START TODAY 运行会话和当天已触发铃声记录属于设备 / 会话状态，不写入迁移备份；恢复后需重新点击一次 ENABLE SOUND / START TODAY。
- **Bahnschrift → DINish**：英文与数字默认字体更换为开源 DINish。
- **项目字体优先**：CSS 优先加载 GitHub 仓库 `fonts/` 中的 DINish，不再以操作系统是否安装 Bahnschrift 为前提。
- **DINish SemiBold / 600**：英文标签、时间、普通数字与界面文字使用 `DINish-SemiBold.ttf`。
- **DINish Bold / 700**：中央主倒计时单独使用 `DINish-Bold.ttf`。
- **中文保持不变**：中文继续使用项目内 `SourceHanSansCN-Heavy.otf`。
- **PWA 离线字体缓存**：Service Worker 的 App Shell 已加入 DINish SemiBold / Bold。
- **字体许可随项目分发**：`fonts/DINish-OFL.txt` 随仓库保存；DINish 使用 SIL Open Font License 1.1。
- v0.6.0 的 LOOK 外观系统、真实时间运行、108px 起始倒计时字号及 `-0.045em` 字距保持不变。

## 当前核心功能

- 时间段式日程模板，可新建、复制、删除、编辑并长期保存在浏览器中。
- 自动识别当前任务、空档 FREE TIME、NEXT 和今日剩余 SCHEDULE。
- 主倒计时使用真实系统时间计算，不依赖逐秒递减，因此浏览器短暂降频后仍可自动校准。
- SCHEDULE 慢速自动巡航；悬停暂停；手动滚动后延迟恢复；到底后平滑回顶。
- CLASS 分类绑定上课铃 / 下课铃，可导入 MP3 / WAV，音频保存在 IndexedDB。
- TODAY Override：当天可临时 EDIT / SKIP / ADD TASK，不改变基础模板；可导出单日 JSON，并可把当前 TODAY 内容另存为长期模板。
- WEEK PLAN：按周一至周日自动选择模板，也可设为 OFF / NO SCHEDULE；启用状态以绿色按钮显示。
- LOOK：可配置界面底色、文字色、分类状态色及状态切换动画。
- FULL BACKUP 导入 / 导出：模板、周计划、设置、外观、TODAY Override 与 MP3 / WAV 铃声音频可在一个 JSON 中完整迁移。
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

启用后，顶栏 `TEMPLATE` 会锁定到当天由周计划选择的模板，`WEEK` 按钮变为绿色。`TODAY` 仍优先于基础模板，只修改当天。

## TODAY：单日导出与储存为模板

点击顶栏 `TODAY` 后，除了原有的 `ADD TASK`、`RESET TODAY` 和 `SAVE TODAY`，v0.7.1 还提供：

- `EXPORT TODAY JSON`：把编辑器中当前看到的单日日程导出为独立 JSON；不会改变本地日程状态。
- `SAVE AS TEMPLATE`：打开模板储存面板并要求输入新模板名。

储存为模板时有三种行为：

1. `SAVE`：仅创建新模板；不提交当前尚未保存的 TODAY 修改，也不影响 WEEK PLAN。
2. `SAVE & APPLY TO TODAY`：创建新模板，并把这份日程仅应用到今天。若 WEEK PLAN 已启用，其星期映射保持原样。
3. `SAVE & APPLY TO WEEK PLAN`：仅在 WEEK PLAN 已启用时可用；创建新模板、立即应用到今天，并把当前星期在 WEEK PLAN 中改绑到新模板。WEEK 关闭时该按钮灰显，悬停提示 `WEEK is not enabled`。

当 TODAY Override 实际生效时，顶部 `TODAY` 按钮使用与 `AUDIO ENABLED` 相同的绿色状态，而不再添加星号。

## 完整备份与恢复

点击顶栏 `DATA`：

1. `EXPORT FULL BACKUP` 会读取 localStorage 与 IndexedDB；
2. 所有模板、WEEK PLAN、TODAY Override、LOOK 外观、铃声设置与已导入 MP3 / WAV 会写入一个 `TEMPO-7-full-backup-YYYY-MM-DD.json`；
3. 音频以 Base64 写入 JSON，因此备份文件通常比原始音频总大小约大三分之一；
4. 在另一设备 / 浏览器中选择 `IMPORT BACKUP`，TEMPO-7 会同时恢复配置和铃声音频；
5. 浏览器的音频播放授权无法跨设备迁移，因此恢复后仍需点击一次 `ENABLE SOUND` / `START TODAY`。

为避免产生错误的铃声行为，以下临时运行状态不会写入迁移备份：`runState`、当天铃声已触发记录、Web Audio 的解锁状态。它们会在目标设备上按新的运行会话重新建立。

旧版本 JSON 仍可导入。若检测到旧备份没有 `media.audioAssets`，TEMPO-7 只恢复其中存在的配置数据，并保留目标浏览器当前已有的铃声音频。

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
git commit -m "TEMPO-7 v0.7.2"
git push
```

GitHub Pages 会随 `main` 分支更新。

## 数据与存储

- 日程模板：`localStorage`
- WEEK PLAN：`localStorage`
- TODAY Override：`localStorage`
- 外观与铃声设置：`localStorage`
- MP3 / WAV 音频本体：`IndexedDB`
- FULL BACKUP：把上述可迁移用户数据与 IndexedDB 音频共同封装到单个 JSON（schema v5）
- 不迁移：当前运行会话、浏览器音频授权状态、当天已触发铃声日志

同一设备、同一浏览器、同一网站来源会继续读取这些本地数据。`localhost:8000` 与 GitHub Pages 属于不同来源，因此二者的浏览器本地数据互不自动共享；v0.7.0 FULL BACKUP 可以用于二者之间迁移。

## 字体

TEMPO-7 v0.7.0 起不再依赖 Windows 本机 Bahnschrift。字体优先从项目自身的 `fonts/` 目录加载，因此 GitHub Pages、PWA 与不同设备之间更容易保持一致视觉。

- **英文 / 普通数字 / UI**：`fonts/DINish-SemiBold.ttf`，CSS weight `600`。
- **主倒计时数字**：`fonts/DINish-Bold.ttf`，CSS weight `700`。
- **中文**：`fonts/SourceHanSansCN-Heavy.otf`。
- **DINish 许可**：SIL Open Font License 1.1；许可文本见 `fonts/DINish-OFL.txt`。
- **DINish 上游项目**：`playbeing/dinish`。上游明确允许桌面、电子书及 Web Font 使用，并推荐网站自行托管字体文件。

项目 CSS 中 DINish 排在字体栈首位；因此只要仓库字体资源加载成功，就不会再调用用户设备上的 Bahnschrift。中文因 DINish 无对应 CJK 字形而自然回退到项目内思源黑体。


## v0.7.3 前瞻

计划中的下一轮功能版本：

- TODAY 支持 `ADD NEW TYPE`，最多新增 10 个自定义分类；
- 铃声系统扩展为所有 TYPE 均可配置自定义铃声，包括用户自定义分类；
- STATE TRANSITION 扩展为更复杂的状态过渡动画，具体视觉方案待定。

## 版本记录

### v0.7.2 — Performance Optimization
- 拆分动态时钟刷新与静态状态刷新，减少长期运行中的重复 DOM 操作。
- SCHEDULE 改为按需 requestAnimationFrame；无滚动需求、悬停、手动暂停、页面隐藏与边缘停顿时停止持续动画帧。
- 页面隐藏时主 tick 降至 1000 ms，返回前台立即恢复并完整校准。
- 缓存铃声事件表、当天触发日志和 START TODAY 运行状态，减少重复计算与 localStorage 访问。
- 保持 v0.7.1 的所有可见功能、交互、数据格式和备份兼容性。

### v0.7.1 — Interaction Refinement
- 音频完成激活后顶部按钮显示 `AUDIO ENABLED`。
- TODAY Override 与 WEEK PLAN 的启用状态统一改为绿色按钮，不再使用星号。
- TODAY 支持导出独立单日 JSON。
- TODAY 支持另存为长期模板，并提供 `SAVE`、`SAVE & APPLY TO TODAY`、`SAVE & APPLY TO WEEK PLAN` 三种明确行为。
- WEEK 关闭时，应用到 WEEK PLAN 的按钮不可用，并提供悬停提示。

### v0.7.0 — Complete Backup + Self-hosted DINish Typography
- 完整备份 schema 升级至 v5，MP3 / WAV 音频本体与配置一并导出。
- FULL BACKUP 支持在新设备 / 新浏览器一键恢复模板、WEEK PLAN、TODAY Override、外观、铃声设置和 IndexedDB 音频。
- 保持对旧版 JSON 的向后兼容；旧备份不含音频时不会清除目标浏览器已有铃声。
- 用开源 DINish 替换对 Windows Bahnschrift 的运行时依赖。
- DINish SemiBold 用于英文、时间与普通数字；主倒计时单独使用 DINish Bold。
- DINish 字体文件放入仓库 `fonts/` 并加入 PWA 离线缓存。
- 随项目加入 DINish 的 SIL Open Font License 1.1 文本。
- README 补充完整备份、字体加载、分发和许可说明。

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
