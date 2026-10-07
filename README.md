# TEMPO-7 v0.3.0 — Today Override

TEMPO-7 是一个本地优先的规律作息倒计时器。当前版本在 v0.2.0 Bell System 基础上加入 **TODAY OVERRIDE（今日临时修改）**。

## v0.3.0 新增

- 顶栏新增 **TODAY**，用于编辑“今天实际运行”的日程，而不改动基础模板。
- 可以直接修改今天任意时间段的开始/结束时间、名称与分类。
- 每个今日时间段都有 **SKIP**，可只在今天跳过。
- 可以 **+ ADD TASK** 插入只在今天存在的临时任务。
- **RESET TODAY** 一键恢复到当前基础模板。
- TODAY 修改按“日期 + 模板”独立保存；关闭浏览器再打开仍然存在，第二天不会污染模板。
- 主界面在存在临时修改时显示 `TODAY // MODIFIED`，顶栏 TODAY 会变为 `TODAY*`。
- 今日修改保存后，当前任务、倒计时、进度条、NEXT、SCHEDULE 会立即重算。
- 时间冲突不会自动顺延后续任务；保存时会明确提示重叠。
- 铃声现在读取“今日实际日程”。更改今天的课程时间后，铃声跟随新时间。
- 保存 TODAY 修改时会重置铃声时间游标，已经错过的铃声不会被补播。
- 每个任务现在带稳定的内部 ID，避免只修改结束时间等操作造成同一铃声重复触发。
- JSON 备份 schema 升至 v2，并一并导出/导入 TODAY OVERRIDE。

## 保留功能

- 根据真实系统时间自动恢复当前状态。
- 空档自动显示为自由时间。
- 当前任务大倒计时与实时进度条。
- NEXT 与自动巡航 SCHEDULE。
- 多日程模板与模板编辑。
- SIM TIME 测试时钟。
- CLASS 分类上课铃 / 下课铃，支持 MP3 / WAV、试听、音量和 IndexedDB 本地保存。
- 中文 Source Han Sans CN Heavy；英文和数字优先使用 Windows Bahnschrift SemiBold。
- JSON 导入/导出。

## TODAY 与 EDIT 的区别

- `EDIT`：修改基础模板，会影响以后使用该模板的日期。
- `TODAY`：只修改当天运行副本，不改基础模板。
- 如果 TODAY 最终内容与模板完全相同，TEMPO-7 会自动移除该日 override，恢复 `TODAY` 状态。

## 本地运行

在项目目录中运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

更新文件后可使用 `Ctrl + Shift + R` 强制刷新。

## 数据说明

- 模板、设置、TODAY OVERRIDE：浏览器 `localStorage`
- MP3 / WAV：浏览器 `IndexedDB`
- JSON 备份包含：模板、设置、TODAY OVERRIDE
- JSON 备份目前不包含：MP3 / WAV 音频文件
