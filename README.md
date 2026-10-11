# TEMPO-7 v0.8.2 — PERSONAL CLOUD SYNC

TEMPO-7 是一个本地优先（local-first）的规律作息执行器：根据预设时间段自动判断当前任务、显示倒计时和进度、播放任务铃声，并支持 TODAY 临时修改、WEEK PLAN 周计划、外观自定义、PWA 安装、离线使用、完整 JSON 备份与跨设备 Personal Cloud Sync。

v0.8.2 在 v0.8.1a 的 START GATE、Shared Brand 动画与稳定顶栏基础上加入单用户云同步。正式运行数据仍保存在当前浏览器；Cloudflare Worker + D1 + R2 只承担跨设备同步，因此离线时 TEMPO-7 仍然可以照常运行。

## v0.8.2 新增与调整

- **Personal Cloud Sync**：DATA 面板加入 CLOUD SYNC 区域，通过 `SYNC KEY` 连接固定 Worker endpoint。
- **Local First 保持不变**：模板、TODAY、WEEK、LOOK 与铃声音频继续以当前设备的 localStorage / IndexedDB 作为运行数据源。
- **完整配置同步**：同步模板、自定义 TYPE、TASK NOTE、WEEK PLAN、TODAY Override、外观与铃声设置。
- **AUDIO 云同步**：所有 TYPE 的 ENTRY / EXIT MP3 / WAV 同步到 R2，新设备拉取后仍存入本机 IndexedDB。
- **Revision 冲突保护**：D1 中维护单调递增 revision；旧设备不能静默覆盖更新版本。
- **显式冲突选择**：检测到 CLOUD 与 THIS DEVICE 都有改动时显示 `USE CLOUD` / `USE THIS DEVICE`。
- **自动同步**：本地保存后短暂 debounce 自动同步；启动、回到前台、重新联网时检查云端；也可使用 `SYNC NOW`。
- **离线容错**：网络或 Worker 暂时不可用时只显示 OFFLINE / ERROR，不影响本机倒计时和铃声。
- **FULL BACKUP 保留**：schema v6 不变，继续提供独立于云同步的完整离线备份。
- **凭据隔离**：SYNC KEY 不写入项目源码，也不进入 FULL BACKUP。

## v0.8.1a 修复内容

- **顶栏小字固定单行**：ROUTINE CONTROL、版本号与日期时间不再允许各自在空格处折行。
- **实时时钟宽度稳定**：对该信息行启用 tabular numerals，秒数变化不再改变数字总宽度。
- **共享品牌动画兼容**：START GATE 中的同一品牌信息块仍可按 v0.8.1 逻辑缩放、位移并归位。
- **缓存更新**：CSS / JS cache-busting 与 Service Worker 缓存名升级至 `v0.8.1a`。
- **数据兼容**：不修改任何模板、WEEK PLAN、TODAY Override、TYPE、NOTE、LOOK、FULL BACKUP schema v6 或铃声音频数据。

## v0.8.1 新增与调整

- **共享品牌元素（Shared Brand）**：启动页与正式顶栏共用同一个 TEMPO-7 信息块，不再维护两份视觉上相同的品牌元素。
- **同步缩放与位移**：点击启动页后，TEMPO-7、ROUTINE CONTROL、版本和时钟作为一个整体向左上方移动，同时逐步缩小到正式顶栏尺寸。
- **真实归位**：动画终点由正式顶栏的实际布局位置动态计算，而不是写死像素路径；窗口尺寸变化后仍会落入当前响应式布局中的正确位置。
- **面板动画保持**：上下黑色启动面板继续向相反方向打开，中间状态色横条继续收拢淡出，与品牌归位动画同步进行。
- **同一 DOM 元素延续**：动画结束后不进行品牌块的视觉替换，移动中的信息块直接恢复为顶栏正常布局元素，减少开屏与主界面之间的断层感。
- **缓存更新**：CSS / JS cache-busting 与 Service Worker 缓存名升级至 `v0.8.1`。
- **数据兼容**：不修改模板、WEEK PLAN、TODAY Override、自定义 TYPE、TASK NOTE、LOOK、FULL BACKUP schema v6 或 IndexedDB 铃声音频格式。


## v0.8.0 新增与调整

- **START GATE**：每次打开页面 / PWA 时先显示全屏启动层，包含 TEMPO-7、ROUTINE CONTROL、当前版本与实时时钟。
- **PRESS ANYWHERE**：启动横条固定显示 `>> PRESS ANYWHERE TO START YOUR DAY <<`，横条颜色跟随当前任务 TYPE / FREE / END 状态色。
- **启动即解锁音频**：点击启动层任意位置会建立当天运行会话，并在浏览器允许的情况下完成 Web Audio 解锁；不再要求额外点击专门的 ENABLE AUDIO 按钮。
- **信封式开场过渡**：启动层上下黑色面板向相反方向移出，中间状态色横条同步收拢并淡出，露出正常 TEMPO-7 主界面。
- **AUDIO 控件简化**：顶栏按钮始终只显示 `AUDIO`；绿色表示当前音频已启用，普通样式表示未启用。
- **AUDIO 悬停状态**：hover / keyboard focus 时显示小字 `ENABLED` 或 `DISABLED`。
- **手动音频控制保留**：AUDIO 可随时用于禁用音频、重新启用或在浏览器音频状态异常时手动恢复。
- **缓存更新**：CSS / JS cache-busting 与 Service Worker 缓存名升级至 `v0.8.0`。
- **数据兼容**：模板、WEEK PLAN、TODAY Override、自定义 TYPE、TASK NOTE、LOOK、FULL BACKUP schema v6 与 IndexedDB 铃声音频格式保持兼容，不需要迁移。


## v0.7.3b 修复内容

- **AUDIO 状态统一**：顶部音频按钮仅保留两个用户可见状态：未激活时为 `ENABLE AUDIO`，完成浏览器音频解锁后为绿色 `AUDIO ENABLED`。清理 `START TODAY`、`ENABLE SOUND`、`TODAY RUNNING` 等旧文案。
- **运行语义保持不变**：点击 `ENABLE AUDIO` 仍会初始化当天铃声运行状态并完成浏览器音频解锁；仅简化用户可见交互，不改变铃声触发逻辑。
- **进度条视觉修复**：移除整条高亮边框；未完成轨道改为当前前景色的低透明度版本，已完成 Fill 保持实色，因此 `41%` 等进度可直接从色条长度辨认。
- **缓存更新**：CSS / JS cache-busting 与 Service Worker 缓存名升级至 `v0.7.3b`，避免 PWA 继续使用旧版样式。
- **数据兼容**：FULL BACKUP schema、模板、WEEK PLAN、TODAY Override、自定义 TYPE、TASK NOTE 与 IndexedDB 铃声音频格式均保持 v0.7.3 兼容，不需要数据迁移。


## v0.7.3 新增与调整

- **自定义 TYPE**：在 EDIT 与 TODAY 中均可通过 `+ ADD NEW TYPE` 打开 TYPE CONTROL；除 6 个内置任务 TYPE 外，最多可额外创建 6 个自定义 TYPE。
- **TYPE 属性**：每个自定义 TYPE 包含 NAME、LABEL 与 COLOR；NAME 用于自然语言显示，LABEL 用于状态标签，COLOR 直接驱动当前任务主区域颜色。
- **TYPE 管理**：自定义 TYPE 可修改或删除。删除仍被模板 / TODAY Override 使用的 TYPE 时，会先提示；确认后相关任务迁移到内置 `CUSTOM / 其他`。
- **所有 TYPE 可配置铃声**：SOUND 不再只服务 CLASS。每个内置或自定义任务 TYPE 都有独立的 `ENTRY` 与 `EXIT` 音频槽位，可导入 MP3 / WAV、试听或清除。
- **CLASS 旧铃声兼容**：原有 `class-start` / `class-end` 音频 ID 保留，因此升级到 v0.7.3 后既有上课铃 / 下课铃不会因为新铃声架构而丢失。
- **TASK NOTE**：模板编辑器与 TODAY 编辑器的每个任务行，在 TYPE 与删除 / SKIP 之间新增 `✎`；点击后展开单行 NOTE 编辑框。
- **NOTE 限制**：NOTE 可为空，最多 200 字符，不支持换行；笔图标在已有 NOTE 时显示绿色提示。
- **CURRENT NOTE**：当前任务有 NOTE 时，显示在任务大标题下方；空 NOTE 不占空间。
- **NEXT / SCHEDULE NOTE**：下一任务和 SCHEDULE 中也显示更小的一行 NOTE。
- **NOTE 跑马灯**：只有 NOTE 实际超过可用宽度时才启动横向滚动；到末端短暂停留后平滑返回，鼠标悬停时暂停。
- **NOTE 随数据流转**：TODAY Override、TODAY JSON、SAVE AS TEMPLATE、模板复制、FULL BACKUP / IMPORT 都会保留 NOTE。
- **FULL BACKUP schema v6**：完整备份新增自定义 TYPE 定义，并可备份所有 TYPE 的动态铃声音频；旧版无自定义 TYPE 的备份继续可导入。
- **PWA 缓存更新**：Service Worker 缓存名与 CSS / JS cache-busting 升级至 v0.7.3。

## v0.7.2 性能优化

- **主运行循环拆分**：250 ms 运行循环只负责必须持续变化的时间、倒计时、进度条与 NEXT 倒计时；任务名称、分类色、SCHEDULE、TODAY / WEEK / AUDIO 状态等静态内容仅在状态实际变化或明确操作后刷新。
- **减少 DOM 写入**：动态文本采用“内容变化后才写入”的方式，避免相同倒计时状态和时间文字被重复写回 DOM。
- **SCHEDULE 按需巡航**：不再让 `requestAnimationFrame` 在无溢出、鼠标悬停、手动暂停或页面隐藏时永久空转；只有列表确实需要移动时才持续申请动画帧。
- **暂停阶段休眠**：SCHEDULE 顶部 / 底部停顿改为定时唤醒，停顿期间不占用 60 FPS 动画循环；手动滚动后的 5 秒等待期同样休眠。
- **页面隐藏降频**：页面不可见时，主运行循环由 250 ms 调整为 1000 ms；重新回到前台后立即完整刷新并恢复 250 ms。铃声跨时间点检测仍保留原有 90 秒 catch-up 保护。
- **铃声事件缓存**：当前日程对应的铃声事件表只在日程源发生变化时重新生成，不再每个运行 tick 重新构建。
- **铃声触发日志缓存**：当天已触发铃声记录保留内存缓存，仅在日期变化或实际新增触发记录时访问 / 写入 localStorage。
- **运行状态缓存**：`ENABLE AUDIO / AUDIO ENABLED` 的运行状态不再每 250 ms 读取 localStorage；当前标签页以内存状态为主，并保留跨标签页 `storage` 事件同步。
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
- **会话状态不迁移**：浏览器音频解锁权限、当前音频运行会话和当天已触发铃声记录属于设备 / 会话状态，不写入迁移备份；恢复后需重新点击一次 ENABLE AUDIO。
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
- 所有任务 TYPE 均可配置独立 ENTRY / EXIT 铃声，可导入 MP3 / WAV，音频保存在 IndexedDB。
- TODAY Override：当天可临时 EDIT / SKIP / ADD TASK，不改变基础模板；支持 TASK NOTE、自定义 TYPE、单日 JSON 导出与另存为长期模板。
- WEEK PLAN：按周一至周日自动选择模板，也可设为 OFF / NO SCHEDULE；启用状态以绿色按钮显示。
- 自定义 TYPE：除内置分类外最多新增 6 个，每个 TYPE 自带 NAME / LABEL / COLOR。
- TASK NOTE：每个任务可保存最多 200 字符的单行备注，并显示在 CURRENT / NEXT / SCHEDULE。
- LOOK：可配置界面底色、文字色、内置分类状态色及状态切换动画；自定义 TYPE 颜色在 TYPE CONTROL 中管理。
- FULL BACKUP 导入 / 导出：模板、自定义 TYPE、TASK NOTE、周计划、设置、外观、TODAY Override 与全部 TYPE 的 MP3 / WAV 铃声音频可在一个 JSON 中完整迁移。
- PWA：可从 GitHub Pages 安装为独立窗口应用，并支持 App Shell 离线启动。
- 自托管字体：英文 / 数字使用 DINish，中文使用 Source Han Sans CN Heavy。

## 自定义 TYPE

在 `EDIT` 或 `TODAY` 中点击 `+ ADD NEW TYPE`：

1. 最多创建 6 个用户自定义 TYPE；
2. `NAME` 为自然语言名称，`LABEL` 为短状态标签，`COLOR` 为该 TYPE 的主状态色；
3. 保存后，新 TYPE 会立即出现在模板编辑器与 TODAY 的 TYPE 下拉框中；
4. 删除正在使用的自定义 TYPE 时，TEMPO-7 会提示引用数量，确认后相关任务迁移到 `CUSTOM / 其他`；
5. 自定义 TYPE 与其定义会写入 localStorage，并纳入 FULL BACKUP。

## TASK NOTE

- 模板编辑器与 TODAY 中，每一行 TYPE 右侧的 `✎` 用于展开 / 收起 NOTE；
- NOTE 为单行文本，最多 200 字符；
- 空 NOTE 不显示；
- CURRENT 显示在任务大标题下方，NEXT 与 SCHEDULE 使用较小字号显示；
- 超出可用宽度时自动横向滚动，末端停顿后平滑回到起点，悬停暂停；
- NOTE 跟随任务进入模板复制、TODAY Override、TODAY JSON、SAVE AS TEMPLATE 与 FULL BACKUP。

## 铃声系统

点击顶栏 `SOUND`：

- 每个任务 TYPE 均有 `ENTRY` 与 `EXIT` 两个独立音频槽位；
- 未配置的事件保持静音；
- 支持 MP3 / WAV、试听与清除；
- 所有音频本体保存在 IndexedDB，并由 FULL BACKUP 以 Base64 一并迁移；
- 每次重新打开页面 / PWA 时，通过启动页任意点击建立当天运行会话并尝试解锁音频；顶栏 `AUDIO` 可用于手动禁用、重新启用或故障恢复。

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

当 TODAY Override 实际生效时，顶部 `TODAY` 按钮使用与已启用 `AUDIO` 相同的绿色状态，而不再添加星号。

## 完整备份与恢复

点击顶栏 `DATA`：

1. `EXPORT FULL BACKUP` 会读取 localStorage 与 IndexedDB；
2. 所有模板、自定义 TYPE、TASK NOTE、WEEK PLAN、TODAY Override、LOOK 外观、铃声设置与已导入 MP3 / WAV 会写入一个 `TEMPO-7-full-backup-YYYY-MM-DD.json`；
3. 音频以 Base64 写入 JSON，因此备份文件通常比原始音频总大小约大三分之一；
4. 在另一设备 / 浏览器中选择 `IMPORT BACKUP`，TEMPO-7 会同时恢复配置和铃声音频；
5. 浏览器的音频播放授权无法跨设备迁移，因此恢复后需重新经过启动页点击或手动点击 `AUDIO` 完成音频解锁。

为避免产生错误的铃声行为，以下临时运行状态不会写入迁移备份：`runState`、当天铃声已触发记录、Web Audio 的解锁状态。它们会在目标设备上按新的运行会话重新建立。

旧版本 JSON 仍可导入。若检测到旧备份没有 `media.audioAssets`，TEMPO-7 只恢复其中存在的配置数据，并保留目标浏览器当前已有的铃声音频。

## Personal Cloud Sync（v0.8.2）

`DATA` 面板新增 Personal Cloud Sync。TEMPO-7 仍保持 Local First：日常运行继续直接读取当前设备的 `localStorage` 与 `IndexedDB`；云端只作为跨设备同步副本，因此 Worker / 网络临时不可用时不会影响倒计时、模板或本地铃声播放。

当前云端结构：

```text
GitHub Pages / PWA
        │
        │ HTTPS + Bearer SYNC_KEY
        ▼
Cloudflare Worker
        │
        ├── D1  // config snapshot + revision + audio manifest
        └── R2  // MP3 / WAV audio objects
```

- Worker endpoint：`https://tempo7.njsukleo.workers.dev`。
- `SYNC_KEY` 由使用者在新设备首次连接时输入；它保存在该浏览器的本地连接设置中，不写入项目源码，也不会进入 FULL BACKUP。
- 配置同步包含模板、自定义 TYPE、TASK NOTE、WEEK PLAN、TODAY OVERRIDE、LOOK 与铃声设置。
- AUDIO 同步覆盖所有任务 TYPE 的 ENTRY / EXIT MP3 / WAV；文件仍会落回本机 IndexedDB，因此离线时照常播放。
- 云端使用单调递增 `revision` 防止旧设备静默覆盖新数据；检测到双方都有改动时进入 `SYNC CONFLICT`，由使用者明确选择 `USE CLOUD` 或 `USE THIS DEVICE`。
- 本地保存后会进行短暂 debounce 自动同步；重新打开应用、恢复前台或重新联网时也会检查云端；`SYNC NOW` 可手动立即同步。
- 首次连接时，如果云端还是空的，会把当前设备完整上传；如果云端已经有数据，则不会猜测，而是要求选择 CLOUD 或 THIS DEVICE。
- `DISCONNECT` 只停止这台设备的同步并清除本机保存的 SYNC KEY，不删除 D1 / R2 中的云端数据。

FULL BACKUP 与 Cloud Sync 互相独立：前者仍是可离线保存的单文件完整备份，后者负责日常多设备同步。

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
git commit -m "TEMPO-7 v0.8.2"
git push
```

GitHub Pages 会随 `main` 分支更新。

## 数据与存储

- 日程模板：`localStorage`
- 自定义 TYPE：`localStorage`
- TASK NOTE：随模板 / TODAY Override 中的任务对象保存在 `localStorage`
- WEEK PLAN：`localStorage`
- TODAY Override：`localStorage`
- 外观与铃声设置：`localStorage`
- MP3 / WAV 音频本体：`IndexedDB`
- FULL BACKUP：把上述可迁移用户数据与 IndexedDB 音频共同封装到单个 JSON（schema v6）
- Personal Cloud Sync 连接状态 / device ID / last revision / SYNC KEY：单独保存在当前浏览器 `localStorage`，不会进入 FULL BACKUP
- 云端配置 snapshot / revision / AUDIO manifest：Cloudflare D1
- 云端 MP3 / WAV 本体：Cloudflare R2
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


## 后续前瞻

后续版本可继续讨论更复杂的 `STATE TRANSITION` 过渡动画，以及在云同步基础上的进一步多设备体验优化。

## 版本记录

### v0.8.2 — Personal Cloud Sync
- 新增单用户 Personal Cloud Sync：通过 Cloudflare Worker + D1 + R2 在多设备之间同步 TEMPO-7。
- DATA 面板加入 CONNECT / SYNC NOW / DISCONNECT、revision、last sync、设备状态与同步状态显示。
- 配置 snapshot 覆盖模板、自定义 TYPE、TASK NOTE、WEEK PLAN、TODAY OVERRIDE、LOOK 与铃声设置，同时继续保持 Local First。
- 所有 TYPE 的 ENTRY / EXIT MP3 / WAV 纳入云同步；R2 保存二进制音频，本机继续使用 IndexedDB 播放。
- 加入 SHA-256 AUDIO 完整性校验与内容去重，未变化的铃声不会重复上传。
- 加入 revision 冲突保护；当 CLOUD 与 THIS DEVICE 都有改动时要求手动选择保留来源，避免静默覆盖。
- 本地保存后 debounce 自动同步，并在启动、恢复前台及重新联网时检查云端；断网不影响本机运行。
- FULL BACKUP schema v6 保持不变，并继续作为独立于云同步的完整离线备份机制。
- Service Worker 与静态资源版本升级至 `0.8.2`。

### v0.8.1a — Microline Stability Hotfix
- 修复顶栏 `ROUTINE CONTROL / V0.8.1a / 日期时间` 因实时时钟字符宽度变化而周期性换行的问题。
- 品牌信息小字中的各字段固定为不可折行，并启用 tabular numerals 保持时钟更新时的几何宽度稳定。
- Service Worker 与静态资源版本升级至 `0.8.1a`；现有数据与 FULL BACKUP schema v6 无需迁移。

### v0.8.1 — Shared Brand Transition
- 启动页与正式顶栏改为复用同一个 TEMPO-7 品牌信息块。
- 点击开始后，品牌信息与附属信息同步缩小、向左上方移动，并归位到正式顶栏的实际响应式位置。
- 上下启动面板与状态色横条的原有退出动画继续保留，并与品牌归位同步执行。
- Service Worker 与静态资源版本升级至 `0.8.1`；现有数据与 FULL BACKUP schema v6 无需迁移。

### v0.8.0 — Start Gate / Audio Interaction
- 新增全屏 START GATE，以 `>> PRESS ANYWHERE TO START YOUR DAY <<` 作为统一进入动作。
- 启动页横条跟随当前任务状态色，点击后以面板上下分离的开场动画进入主界面。
- 启动点击同时建立当天运行会话并尝试完成浏览器 Web Audio 解锁。
- 顶栏音频按钮简化为固定文案 `AUDIO`，通过绿色 / 普通颜色表示启用状态，并在悬停时显示 `ENABLED` / `DISABLED`。
- AUDIO 继续保留手动禁用、重新启用与故障恢复能力。
- Service Worker 与静态资源版本升级至 `0.8.0`；现有数据与 FULL BACKUP schema v6 无需迁移。

### v0.7.3b — Regression / UI Hotfix
- 顶部音频按钮统一为 `ENABLE AUDIO` / `AUDIO ENABLED` 两态，移除旧版 `START TODAY` / `ENABLE SOUND` / `TODAY RUNNING` 用户可见文案。
- 修复进度条整条高亮边框导致“看起来始终满格”的视觉问题；轨道改为低透明度，Fill 保持实色。
- Service Worker 与静态资源版本升级至 `0.7.3b`，确保 PWA 能获取修复后的 CSS / JS。
- 不改变 v0.7.3 数据结构与备份 schema。

### v0.7.3 — Custom Types / Per-Type Bells / Task Notes
- 最多新增 6 个用户自定义 TYPE，并提供 NAME / LABEL / COLOR 管理。
- SOUND 重构为所有任务 TYPE 均支持独立 ENTRY / EXIT 铃声。
- TASK 新增可选 NOTE：单行、最多 200 字符，模板与 TODAY 均可编辑。
- NOTE 显示于 CURRENT / NEXT / SCHEDULE，溢出时自动横向滚动并支持悬停暂停。
- FULL BACKUP 升级至 schema v6，加入自定义 TYPE 与动态铃声音频备份，同时保持旧版导入兼容。

### v0.7.2 — Performance Optimization
- 拆分动态时钟刷新与静态状态刷新，减少长期运行中的重复 DOM 操作。
- SCHEDULE 改为按需 requestAnimationFrame；无滚动需求、悬停、手动暂停、页面隐藏与边缘停顿时停止持续动画帧。
- 页面隐藏时主 tick 降至 1000 ms，返回前台立即恢复并完整校准。
- 缓存铃声事件表、当天触发日志和 音频运行状态，减少重复计算与 localStorage 访问。
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
