# TEMPO-7 v0.8.5

TEMPO-7 是一个以“当前正在做什么”为核心的个人时间段式日程系统。它根据当天安排与设备时间自动显示 CURRENT、NEXT、SCHEDULE、倒计时和进度，并提供 TODAY / DAY PLAN、WEEK PLAN、SOUND、LOOK、完整备份与个人云同步等功能。

## 当前版本：v0.8.5

### TODAY / DAY PLAN

v0.8.5 对 TODAY 进行大幅改版：TODAY 不再只能修改“今天”，而是成为按具体日期管理一次性日程的 DAY PLAN 编辑器。

- 打开 TODAY 时仍默认进入今天，并可快捷切换 TODAY、TOMORROW、前一天、后一天或直接选择日期。
- 某日期没有 DATE PLAN 时，默认按照该日期的 WEEK PLAN / 当前模板生成编辑底稿。
- 可使用任意现有模板作为某一天的底稿；载入模板只复制内容到当前日期编辑器，不修改模板本身。
- 点击 `SAVE DATE` 后，会保存该日期自己的独立日程快照；即使内容与模板完全相同，也不会与模板保持引用关系。
- DATE PLAN 可单独修改任务名称、NOTE、时间、TYPE，可 INSERT、SKIP、新增任务，也可使用 DELAY DATE 整体推迟。
- 某一天的 DATE PLAN 只影响该精确日期，不会修改来源模板，不会影响后一天，也不会影响下一周的同一星期。
- 删除或修改来源模板后，已经保存的 DATE PLAN 仍保留自己的任务快照。
- `RESET DATE` 只删除该日期的一次性计划和推迟设置，使该日期重新回到 WEEK PLAN / 默认模板。
- 旧 DATE PLAN 保留 30 天，超过保留期后自动清理；自动清理只删除日期级计划，不会删除或修改任何模板。
- DATE PLAN 已纳入 FULL BACKUP 与 Personal Cloud Sync。

### 当前主要功能

- **CURRENT / NEXT / SCHEDULE**：根据真实设备时间自动判断当前任务、下一任务和当天后续安排。
- **FREE TIME**：日程空档自动显示为空闲时间，不拉伸相邻任务。
- **EDIT**：编辑长期模板，并可在第一个日程前及任意两条相邻日程之间直接 INSERT 新时间段。
- **TODAY / DAY PLAN**：按具体日期创建一次性独立日程，可从 WEEK PLAN 或任意模板出发，并单独修改名称、NOTE、时间、TYPE、INSERT、SKIP 与 DELAY。
- **DELAY DATE**：只对所选日期整体后移日程，不修改模板或其他日期。
- **WEEK PLAN**：按星期自动选择模板，也可将某天设为 OFF。
- **TYPE**：内置任务类型，并支持最多 6 个自定义 TYPE、标签与颜色。
- **TASK NOTE**：每个任务可保存最多 200 字符的单行备注，并显示在 CURRENT、NEXT 与 SCHEDULE。
- **SOUND**：每个 TYPE 可独立设置 ENTRY / EXIT 音源；PREVIEW 支持播放、暂停和继续。
- **START GATE**：进入应用时通过统一启动界面开始当天运行。
- **LOOK**：可调整界面、文字、边框和不同状态的显示颜色。
- **FULL BACKUP**：可完整导出和恢复个人配置、DATE PLAN 与铃声音频。
- **PERSONAL CLOUD SYNC**：可在多台设备之间同步日程、设置、DATE PLAN 与铃声音频，并支持手动或可关闭的自动同步。
- **PWA / OFFLINE**：可安装为独立应用，并在离线状态下继续使用已有本地日程与铃声。

## 系列版本

### 0.8 Series — Start Gate、Cloud Sync 与日期级日程控制

0.8 系列重点扩展应用启动体验、跨设备使用能力，并把 TODAY 从当天临时修改逐步发展为完整的日期级日程控制。

- 加入全屏 START GATE，并以统一用户交互完成音频启动。
- START GATE 中的 TEMPO-7 品牌信息以共享元素方式缩放、位移并归位到正式页面。
- 加入 Personal Cloud Sync，并提供显式冲突处理。
- SOUND PREVIEW 支持播放、暂停与继续。
- 修复 NOTE 输入过程中无法正常保留空格的问题。
- 加入日程整体推迟功能。
- EDIT 与 TODAY 支持首项前和行间 INSERT。
- Personal Cloud Sync 增加可关闭的 AUTO SYNC AFTER SAVE。
- v0.8.5 将 TODAY 扩展为 DATE PLAN：可提前安排明天或其他具体日期，并将每一天保存为与模板完全隔离的一次性快照。

### 0.7 Series — 数据完整性、编辑流程与任务表达

0.7 系列重点完善日程数据迁移、TODAY 工作流、运行性能，以及 TYPE / NOTE / SOUND 的表达能力。

- FULL BACKUP 扩展为完整备份，可包含模板、WEEK、TODAY、外观、设置、自定义类型及铃声音频。
- 英文与主要数字界面改用项目内字体，并进一步统一主倒计时和工业风信息显示。
- TODAY 增加独立 JSON 导出，以及保存为模板和应用到 TODAY / WEEK PLAN 的不同操作路径。
- 对长期运行进行性能优化，减少不必要的界面更新、存储读取和 SCHEDULE 动画资源占用。
- 支持最多 6 个自定义 TYPE，每种 TYPE 都可以设置独立颜色和 ENTRY / EXIT 铃声。
- 每个任务加入 NOTE，可在 CURRENT、NEXT 和 SCHEDULE 中显示。
- 修复 AUDIO 状态显示和进度条等界面回归问题。

### 0.6 Series — LOOK 与正式运行模式

- 加入 LOOK 外观系统，可调整背景、顶栏、面板、边框、文字及不同任务状态的颜色。
- 支持不同状态切换效果。
- 移除开发阶段使用的模拟时间模式，正式运行完全依据设备本地时间。
- 调整主倒计时的尺寸、字距和响应式表现。

### 0.5 Series — WEEK PLAN

- 可为星期一至星期日分别指定模板。
- 某一天可以设置为 OFF / NO SCHEDULE。
- WEEK PLAN 启用后会自动根据当天星期选择对应模板。
- TODAY 可在当日基础上独立覆盖。

### 0.4 Series — PWA

- 加入 PWA manifest、应用图标和独立窗口体验。
- 支持基础离线运行与页面资源缓存。

### 0.3 Series — TODAY Override

- 建立 TODAY 单日覆盖机制。
- 支持当天任务编辑、跳过和新增。
- 当日修改按日期保存，到下一天自动回到正常模板 / WEEK PLAN 逻辑。

### 0.2 Series — Bell System

- 支持任务进入与离开铃声。
- 支持导入本地 MP3 / WAV 音源和试听。
- 增加铃声触发记录，避免同一事件重复播放。

### 0.1 Series — Core Routine Control

- 建立 CURRENT、NEXT、SCHEDULE 和大尺寸主倒计时。
- 以时间段而不是待办事项作为日程基本单位。
- 支持模板编辑与本地保存。
- 日程空档自动识别为 FREE TIME。
- 加入 SCHEDULE 自动巡航及其暂停 / 恢复行为。

## 历史更新

- **v0.8.5** — TODAY 大幅改版为日期级 DAY PLAN，可提前安排具体日期；DATE PLAN 与模板及其他日期完全隔离，并自动清理超过 30 天的旧日期计划。
- **v0.8.4** — EDIT / TODAY 支持首项前与行间 INSERT；Personal Cloud Sync 增加可开关的 AUTO SYNC AFTER SAVE。
- **v0.8.3** — 加入 TODAY DELAY。
- **v0.8.2b** — SOUND PREVIEW 支持暂停与继续。
- **v0.8.2a** — 修复 NOTE 输入空格问题。
- **v0.8.2** — 加入 Personal Cloud Sync，包括 AUDIO 跨设备同步与冲突处理。
- **v0.8.1 / v0.8.1a** — START GATE 品牌信息改为共享元素归位动画，并修复顶栏小字换行跳动。
- **v0.8.0** — 加入 START GATE 与新的 AUDIO 启动交互。
- **v0.7.3 / v0.7.3b** — 加入自定义 TYPE、TYPE 独立铃声和 TASK NOTE，并修复 AUDIO / 进度条显示问题。
- **v0.7.2** — 优化长期运行、刷新与 SCHEDULE 巡航性能。
- **v0.7.1** — 扩展 TODAY 导出、保存为模板及应用流程。
- **v0.7.0** — 完整备份开始包含 AUDIO，并更新界面字体系统。
- **v0.6.0** — 加入 LOOK，移除模拟时间模式。
- **v0.5.0** — 加入 WEEK PLAN。
- **v0.4.0** — 加入 PWA 与离线支持。
- **v0.3.0** — 加入 TODAY Override。
- **v0.2.0** — 加入 Bell System。
- **v0.1.x** — 建立核心日程、倒计时、FREE TIME 与 SCHEDULE 巡航。
