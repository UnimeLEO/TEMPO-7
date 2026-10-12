# TEMPO-7 v0.8.3

TEMPO-7 是一个面向日常作息执行的时间段式日程系统。它根据当天日程与设备时间自动判断当前状态，提供倒计时、进度、NEXT、SCHEDULE、任务铃声、TODAY 临时调整、WEEK PLAN、外观设置、完整备份与个人云同步。

## 当前版本：v0.8.3

### TODAY DELAY

v0.8.3 新增“推迟今天”功能，可在 TODAY 中把当日日程整体向后移动指定时长。

- 可分别输入小时和分钟，设置从数分钟到数小时的总推迟量。
- 推迟只影响当天，不修改长期模板，也不修改 WEEK PLAN。
- 所有任务的开始和结束时间同步后移，原有间隔与任务长度保持不变。
- 当任务尾部越过 `23:59` 时，越界部分直接截去；若整个任务被推到 `23:59` 之后，该任务当天不再显示。
- TODAY 编辑器中的任务时间仍显示未推迟的基准时间，推迟量独立显示和管理。
- `RESET DELAY` 可单独取消当天推迟；`RESET TODAY` 会同时清除 TODAY 临时修改和推迟设置。
- 推迟后的实际时间会同步影响 CURRENT、NEXT、SCHEDULE、倒计时、进度与 ENTRY / EXIT 铃声。
- TODAY DELAY 会跟随完整备份与个人云同步在设备之间迁移。

### 当前主要能力

- **时间段式日程**：按真实设备时间自动识别当前任务、空档 FREE TIME、NEXT 与当天后续 SCHEDULE。
- **TODAY**：当天可临时修改、跳过或新增任务，并可独立设置 TODAY DELAY，不污染长期模板。
- **WEEK PLAN**：按星期自动选择模板，也可将某天设为 OFF / NO SCHEDULE。
- **任务 TYPE**：提供内置 TYPE，并支持最多 6 个自定义 TYPE、独立名称、标签与颜色。
- **TASK NOTE**：每个任务可保存最多 200 字符的单行备注，并显示在 CURRENT、NEXT 与 SCHEDULE。
- **SOUND**：每个 TYPE 均可配置独立 ENTRY / EXIT 音源；PREVIEW 支持播放、暂停和从暂停位置继续。
- **START GATE**：进入应用时通过统一启动界面开始当天运行，并完成音频启动所需的用户交互。
- **LOOK**：可调整界面、状态色与状态切换效果。
- **FULL BACKUP**：可导出和恢复完整个人配置及铃声音频。
- **PERSONAL CLOUD SYNC**：可在多台设备之间同步日程、设置、TODAY 数据与铃声音频，并在出现版本冲突时由用户选择保留来源。
- **PWA / OFFLINE**：支持安装为独立应用，并在离线状态下继续运行已有本地日程与铃声。

## 0.x 系列

TEMPO-7 0.x 系列的目标是逐步建立一个稳定、低干扰、以“当前时间正在做什么”为核心的个人 Routine Control 界面，而不是传统待办事项列表。

整个 0.x 系列已经形成以下完整能力：

- 以时间段为核心的模板、空档识别、CURRENT / NEXT / SCHEDULE 与主倒计时。
- TODAY 单日覆盖与 WEEK PLAN 周计划，长期计划和临时调整相互独立。
- TODAY DELAY，可将当天全部日程整体后移而不改变长期模板。
- 多种任务 TYPE、自定义 TYPE、任务 NOTE 和状态色。
- 每个 TYPE 独立的 ENTRY / EXIT 铃声，以及试听、暂停、继续和音量控制。
- START GATE 与共享品牌过渡，使启动界面直接归位为正式工作界面。
- LOOK 外观系统与响应式工业风界面。
- 完整备份、个人云同步、跨设备 AUDIO 同步与显式冲突处理。
- PWA 安装、离线运行与自托管界面字体。
- 针对长期运行优化的 SCHEDULE 巡航、页面恢复和状态刷新机制。

0.x 仍属于持续迭代阶段，后续版本会继续围绕当天日程控制、交互效率和视觉过渡进行扩展。

## 版本记录

### v0.8.3 — Today Delay
新增 TODAY DELAY，可将当日日程整体后移指定小时 / 分钟；越过 `23:59` 的部分直接移除，并同步影响运行界面、铃声、备份与云同步。

### v0.8.2b — Sound Preview Pause / Resume
SOUND 的 PREVIEW 支持暂停与从暂停位置继续播放。

### v0.8.2a — Note Input Hotfix
修复 NOTE 输入过程中无法正常输入空格的问题。

### v0.8.2 — Personal Cloud Sync
加入个人多设备同步，包括日程配置与铃声音频，并提供版本冲突保护。

### v0.8.1 / v0.8.1a — Shared Brand Transition
START GATE 的品牌信息改为同一元素缩放、移动并归位到正式顶栏；随后修复顶栏小字周期性换行。

### v0.8.0 — Start Gate
加入全屏 START GATE、点击任意位置进入应用的音频启动流程，以及简化后的 AUDIO 状态控制。

### v0.7.3 / v0.7.3b — Types, Bells & Notes
加入自定义 TYPE、所有 TYPE 的独立 ENTRY / EXIT 铃声、TASK NOTE，并修复 AUDIO 状态与进度条显示问题。

### v0.7.2 — Performance
优化长期运行时的刷新、SCHEDULE 自动巡航和页面隐藏后的资源使用。

### v0.7.1 — Today Workflow
TODAY 加入单日 JSON 导出、另存为模板及应用到 TODAY / WEEK PLAN 的不同保存方式。

### v0.7.0 — Full Backup & Typography
完整备份开始包含铃声音频，并切换为项目内自托管 DINish / Source Han Sans 字体。

### v0.6.0 — Appearance
加入 LOOK 外观系统，移除模拟时间模式，并调整主倒计时视觉比例。

### v0.5.0 — Week Plan
加入按星期自动选择模板的 WEEK PLAN。

### v0.4.0 — PWA
加入安装、独立窗口与离线 App Shell。

### v0.3.0 — Today Override
加入 TODAY 单日临时修改，不再需要直接改变长期模板。

### v0.2.0 — Bell System
加入任务进入 / 离开铃声、音频导入与防重复触发机制。

### v0.1.x — Initial System
建立工业风主界面、模板编辑、CURRENT / NEXT / SCHEDULE、倒计时、FREE TIME 与 SCHEDULE 自动巡航等基础能力。
