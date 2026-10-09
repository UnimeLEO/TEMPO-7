# TEMPO-7 v0.5.0 — WEEK PLAN

TEMPO-7 v0.5.0 adds automatic weekday-to-template routing on top of the existing PWA, TODAY override, sound, and local-first schedule system.

## v0.5.0 新增

- **WEEK PLAN / 周计划**：可把周一至周日分别绑定到不同日程模板。
- **自动模板切换**：启用 WEEK PLAN 后，TEMPO-7 根据当天星期自动选择基础模板，无需每天手动切换。
- **OFF / NO SCHEDULE**：某一天可以不绑定基础模板；当天显示为自由时间。
- **OFF 日仍支持 TODAY**：即使周计划把当天设为 OFF，也可以通过 TODAY 临时添加当天任务。
- **手动模式保留**：关闭 WEEK PLAN 后，顶栏 TEMPLATE 下拉框恢复原来的手动模板选择。
- **防误操作**：WEEK PLAN 启用时，顶栏 TEMPLATE 选择框只显示今天自动选中的模板并锁定；通过 WEEK 修改映射。
- **模板删除联动**：若删除了周计划正在引用的模板，对应星期自动改为 OFF / NO SCHEDULE。
- **JSON 备份升级**：周计划映射随模板、设置和 TODAY OVERRIDE 一并导入/导出；旧版备份仍可导入。
- 原有 PWA、离线 App Shell、铃声、模拟时间、SCHEDULE 自动巡航等功能保持不变。

## 使用 WEEK PLAN

点击顶栏 `WEEK`：

1. 勾选 `ENABLE WEEK PLAN`；
2. 为 MON–SUN 分别选择模板或 `OFF / NO SCHEDULE`；
3. 点击 `SAVE WEEK PLAN`。

启用后顶栏按钮显示 `WEEK*`，TEMPLATE 下拉框会锁定并显示今天由周计划自动选中的模板。

`TODAY` 始终优先于基础模板：周计划决定“今天通常用哪个模板”，TODAY 负责“今天临时怎么改”。

## 本地测试

在项目目录运行：

```powershell
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

覆盖新版本后，建议用 `Ctrl + Shift + R` 重新加载一次。PWA 安装版若仍显示旧版本，可完全关闭应用后重新打开一次，让新的 Service Worker 接管。

## GitHub 更新

测试通过后：

```powershell
git add .
git commit -m "TEMPO-7 v0.5.0"
git push
```

GitHub Pages 会随 `main` 分支更新。

## 数据说明

- 日程模板、WEEK PLAN、Today Override、设置：localStorage。
- MP3 / WAV：IndexedDB。
- JSON：用于模板、WEEK PLAN、设置、Today Override 的备份与迁移。
- 音频文件仍不包含在 JSON 备份内。

## 字体

- 英文 / 数字：优先调用 Windows 本机 `Bahnschrift`。
- 中文：项目内 `SourceHanSansCN-Heavy.otf`。
