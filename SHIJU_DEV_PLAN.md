# Shiju (拾句) 下一阶段开发方案

> 基于 v0.2.2 代码库分析，2026-06-09
> 仓库：https://github.com/realfash/obsidian-shiju

---

## 目录

1. [必须修复的问题 — 社区提交阻塞项](#1-必须修复的问题)
2. [功能迭代建议 — 按价值/成本比排序](#2-功能迭代建议)
3. [发布流程优化](#3-发布流程优化)
4. [版本路线图建议](#4-版本路线图建议)
5. [给 Vibe Coding 用户的迭代建议](#5-给-vibe-coding-用户的迭代建议)
6. [风险提示与测试重点](#6-风险提示与测试重点)

---

## 1. 必须修复的问题

### 1.1 ✅ 已修复（v0.2.2）

| 问题 | 状态 | 说明 |
|------|------|------|
| `minAppVersion` 与 API 不匹配 | ✅ 已修 | `getAbstractFileByPath` 替代新 API |
| 设置页 HTML heading | ✅ 已修 | 改用 `new Setting().setHeading()` |
| unsafe `any` 赋值 | ✅ 已修 | 添加 `isMobileDailyCaptureSettingsData` 类型守卫 |
| `builtin-modules` 依赖 | ✅ 已修 | 改用 `node:module` |
| CSS `!important` 滥用 | ✅ 已修 | 已移除 |
| CSS 滚动条特性 | ✅ 已修 | 已移除不兼容属性 |

### 1.2 ❌ 仍需修复

#### P0 — **GitHub Artifact Attestations（缺失）**

- **问题**：Obsidian 社区审查要求发布 artifacts 附带 GitHub Artifact Attestations（构建证明）
- **建议动作**：
  1. 在 GitHub Actions workflow 中集成 [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance)
  2. 确保每次 release 的 `main.js`、`manifest.json`、`styles.css` 都有 attestation
- **参考配置**：

```yaml
# .github/workflows/release.yml（片段）
jobs:
  build:
    permissions:
      contents: read
      id-token: write
      attestations: write
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/attest-build-provenance@v1
        with:
          subject-path: |
            main.js
            manifest.json
            styles.css
```

- **预计工作量**：⏱ 30 分钟（创建 GitHub Actions workflow 文件）
- **Codex 适合度**：★★★ 非常适合，可让 Codex 直接生成完整 `.github/workflows/release.yml`

#### P1 — **`display()` API 已弃用（Warning）**

- **问题**：`src/settings.ts` 仍使用 `display()` 方法，该 API 自 Obsidian 1.13.0+ 起已弃用
- **当前状态**：`minAppVersion: 1.5.0`，所以 obsidian 版本远超 1.13.0
- **实际情况**：`display()` 依然正常工作，但社区审查可能会指出此问题
- **建议动作**：
  1. 迁移到 `display()` → `getSettingDefinitions()` 或保留 `display()` 并附上解释
  2. 实际上大部分社区插件仍在使用 `display()`，这可能不是强制要求
- **预计工作量**：⏱ 15 分钟
- **Codex 适合度**：★★ 简单修改，给明确指示即可

---

## 2. 功能迭代建议

按 **价值/成本比** 从高到低排序。标注了哪些功能「适合」或「不适合」让 Codex 实现。

### S级 — 高价值/低成本（立即可以做）

#### S1. 标签候选 UI 升级 — 带高亮和键盘选择

- **价值**：极大改善标签输入体验，且已有候选功能基础
- **当前问题**：标签候选是纯文本按钮行，无高亮匹配，无键盘上下选择
- **建议方案**：
  - 将标签候选从 ButtonComponent 行改为 dropdown 样式列表
  - 匹配字符高亮（如输入 `#pro` → 候选显示 `**pro**ject` / `**pro**ductivity`）
  - 上下箭头选择 + Enter 确认
  - 与现有 `#` 触发逻辑无缝衔接
- **工作量**：⏱ 1-2 小时
- **Codex 适合度**：★★★ 非常适合，纯前端 UI 改动，明确定义即可

#### S2. 设置页 `display()` → 清理 deprecation warning

- 见上方 1.2 节
- **Codex 适合度**：★★ 简单

#### S3. 更多写入目标模式（多标题/多路由）

- **价值**：用户可能需要写入不同标题而不只是单个目标标题
- **当前限制**：只能写入一个配置的 `targetHeading`
- **建议方案**：
  - 方案 A（简单）：在模态框底部增加一个快速切换目标标题的下拉菜单
  - 方案 B（复杂）：允许多个目标配置（如：日常笔记 → `## 日常记录`，工作笔记 → `## 工作`）
  - **推荐方案 A** — 在保存前加一个标题选择
- **工作量**：⏱ 1-3 小时（方案 A）
- **Codex 适合度**：★★★ 非常适合，但需要明确描述切换逻辑和默认值

#### S4. 截图/动图演示

- **价值**：社区插件在 README 中有动图演示的转化率明显更高
- **建议方案**：
  - 在 iPhone 模拟器或真机上录屏
  - 转为 GIF 或 WebP
  - 替换 `assets/mobile-capture-iphone.png` 静态截图
- **工作量**：⏱ 30 分钟（录屏 + 格式转换）
- **Codex 适合度**：★ 不适合，需要真机操作

### A级 — 高价值/中等成本

#### A1. 标签高亮（Mirror Layer）

- **价值**：能在 textarea 中看到 `#tag` 高亮，输入体验更接近编辑器
- **技术方案**：
  - 在 textarea 上层叠加一个透明 `div`，同步滚动
  - 将 textarea 文本用 `<span>` 着色渲染，`#tag` 用主题色高亮
  - 也称 "mirror layer" 或 "editor overlay" 方案
- **风险**：滚动同步和触摸事件处理较复杂，iOS Safari 上需大量测试
- **工作量**：⏱ 3-5 小时
- **Codex 适合度**：★★★ 非常适合，但需要明确说明 mirror layer 的 CSS 结构和滚动同步逻辑

#### A2. 保存后追加定位（打开笔记并滚动到插入位置）

- **价值**：保存后打开今日日记时自动滚动到刚才插入的内容
- **当前行为**：`openAfterSave` 打开文件但不定位
- **建议方案**：
  - 缓存插入位置的行号
  - 打开文件后调用 `editor.setCursor()` / `editor.scrollIntoView()`
- **工作量**：⏱ 1-2 小时
- **Codex 适合度**：★★★ 非常适合

#### A3. 设置页添加"恢复默认"按钮

- **价值**：用户误改设置后有回退手段
- **工作量**：⏱ 15 分钟
- **Codex 适合度**：★★★ 非常简单

### B级 — 中等价值/中等成本

#### B1. 更完整的 Markdown 工具条（斜体、代码、引用块、分割线）

- **价值**：减少用户手动输入 markdown 语法的需求
- **当前工具条**：标题、加粗、列表、有序、标签（5个按钮）
- **建议新增**：斜体 `*`、行内代码 `` ` ``、引用 `>`、分割线 `---`
- **注意**：手机端按钮空间有限，可能需要分页或折叠
- **工作量**：⏱ 1-2 小时
- **Codex 适合度**：★★★ 非常适合

#### B2. 快捷写入到多本日记（不同日记切换）

- **价值**：用户可能有多个日记库或不同的记录主题
- **方案**：设置中新增多个日记配置，模态框中可快速切换
- **工作量**：⏱ 2-4 小时
- **Codex 适合度**：★★★ 非常适合，但需要清楚定义数据结构

### C级 — 长期方向/高成本

#### C1. 完整嵌入 Obsidian 正文编辑器（CodeMirror 6）

- **价值**：获得完整的编辑器体验（语法高亮、自动补全、选区操作）
- **复杂度**：极高。Obsidian 未公开 CM6 嵌入的简化 API，需要 hack 方式
- **建议**：⚠️ 暂不建议。Obsidian 团队正在推进公开的编辑组件 API，等官方方案更稳妥
- **替代方案**：使用 mirror layer 方案（A1）获得 80% 的视觉效果，20% 的工作量

#### C2. AI 辅助速记（自动标签、摘要提取）

- **价值**：让速记更智能，自动分类和生成标签
- **复杂度**：高。需要调用外部 API 或本地模型
- **工作量**：⏱ 5-10 小时
- **建议**：可作为 v1.0 之后的独立大版本

---

## 3. 发布流程优化

### 3.1 缺失的 CI/CD 文件

当前仓库完全缺少 GitHub Actions 配置。建议创建以下文件：

#### `release.yml` — 自动构建 + Artifact Attestations

```yaml
name: Release Shiju
on:
  push:
    tags:
      - '*'

permissions:
  contents: write
  id-token: write
  attestations: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/attest-build-provenance@v1
        with:
          subject-path: |
            main.js
            manifest.json
            styles.css
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            main.js
            manifest.json
            styles.css
          generate_release_notes: true
```

#### `ci.yml` — 每次 push 自动 build 检查

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

### 3.2 社区提交检查清单

| 检查项 | 状态 | 备注 |
|--------|------|------|
| `minAppVersion` 与 Obsidian API 版本匹配 | ✅ 已确认 | v1.5.0 |
| 使用 `obsidian` 依赖的最新类型 | ✅ 已确认 | ^1.8.10 |
| 无 `innerHTML` / `outerHTML` 手动操作 | ✅ 已确认 | 使用 Obsidian API |
| 无 `eval()` 或动态代码执行 | ✅ 已确认 | |
| 无 `fs` / `path` 等 Node 模块在插件主体中使用 | ✅ 已确认 | |
| 发布 artifacts 有 `manifest.json` + `main.js` + `styles.css` | ✅ 已确认 | |
| Artifact Attestations | ❌ 缺失 | **必须补** |
| README 包含安装说明和截图 | ✅ 已确认 | |
| 插件 `id` 在社区不冲突 | ✅ 已确认 | `shiju` 唯一 |
| `isDesktopOnly: false` | ✅ 已确认 | |
| 测试过 iPhone 真机 | ✅ 已确认 | |

### 3.3 Release 工作流建议

1. **手动管理**（当前模式）：`npm run build` → commit tag → GitHub Release → 上传 3 个文件
2. **半自动**（推荐下一步）：CI push build check → 手动 tag → CI Release (含 Attestations)
3. **全自动**：PR merge → auto bump version → auto tag → auto release

建议先做到**半自动**。

---

## 4. 版本路线图建议

### v0.3.0 — 输入体验升级（建议 2-3 天开发）

**核心主题**：让速记输入更顺滑，更接近编辑器体验

| 功能 | 优先级 | 工作量 | Codex |
|------|--------|--------|-------|
| 标签候选 UI升级（高亮+键盘选择） | P0 | 1-2h | ★★★ |
| 更多 Markdown 工具按钮（斜体、代码） | P1 | 1h | ★★★ |
| 保存后滚动定位到插入位置 | P1 | 1-2h | ★★★ |
| 设置页"恢复默认"按钮 | P2 | 15min | ★★★ |
| GitHub Actions CI（build 检查） | P0 | 30min | ★★★ |

### v0.4.0 — 发布准备 + 多路由（建议 1-2 天）

**核心主题**：社区提交准备 + 多写入目标

| 功能 | 优先级 | 工作量 | Codex |
|------|--------|--------|-------|
| Artifact Attestations + Release workflow | P0 | 30min | ★★★ |
| 多目标标题切换（模态框下拉菜单） | P0 | 1-3h | ★★★ |
| 动图/截图更新 | P1 | 30min | ★ |
| 更完整的英文 README 文档 | P2 | 1h | ★★ |
| `display()` deprecation 清理 | P2 | 15min | ★★ |

### v0.5.0 — 标签高亮 + 更丰富的写入模式（建议 3-5 天）

**核心主题**：编辑器级别的视觉体验 + 更灵活的数据写入

| 功能 | 优先级 | 工作量 | Codex |
|------|--------|--------|-------|
| 标签 mirror layer 高亮 | P0 | 3-5h | ★★★ |
| 多日记/多配置切换 | P1 | 2-4h | ★★★ |
| 自定义写入模板（每条内容的格式模板） | P2 | 1-2h | ★★★ |

### v1.0.0 — 正式发布（里程碑）

**门槛条件**：
- ✅ 所有 P0 问题已修复
- ✅ 社区审查通过（已被接受）
- ✅ 至少有 1 个正式 Release
- ✅ README 有动图演示
- ✅ 至少通过 Obsidian 社区审查一轮

---

## 5. 给 Vibe Coding 用户的迭代建议

### 5.1 如何高效用 Codex 开发这个项目

#### ✅ 推荐的 Codex 使用方式

| 任务类型 | 方式 | 示例 Prompt |
|---------|------|------------|
| **纯 UI 改动** | 直接描述视觉变化 | "把标签候选从按钮行改为 dropdown 列表，上下箭头选择，Enter 确认，匹配字符高亮" |
| **新增设置项** | 先定义数据结构 | "在设置里加一个 '默认标签前缀' 文本框，保存到 settings，写入时追加到每条内容开头" |
| **新增工具条按钮** | 类比已有代码 | "在 tool bar 里加一个'斜体'按钮，行为类似加粗按钮但用 `*text*` 格式" |
| **CSS 调整** | 给出设备信息 | "iPhone 16 Pro 上底部按钮间距太挤，把 capture-footer-gap 从 0.75rem 降到 0.5rem" |
| **Bug 修复** | 重现步骤 + 截图 | "保存后打开笔记时没有滚动到刚才插入的位置，请修改 openAfterSave 逻辑" |

#### ❌ 不推荐的 Codex 使用方式

| 任务类型 | 原因 | 替代 |
|---------|------|------|
| 跨文件重构 | Codex 可能忘记同步所有文件 | 先问 AI 梳理影响面，再逐文件改 |
| 重大架构变更 | 缺乏对 Obsidian API 局限性的理解 | 先自己验证可行性，再分解成小步骤 |
| CM6 嵌入 | Obsidian 未公开 API，Codex 会编造 | 推迟到官方 API 发布 |

### 5.2 开发工作流建议

```
你 → Hermes Agent → Codex CLI
1. 你向 Hermes 描述需求
2. Hermes Agent 分析可行性、分解任务、注意 Obsidian API 限制
3. 你带着分解后的任务去找 Codex 实现
4. Codex 改完 → 你构建测试 → 反馈给 Hermes
```

### 5.3 Obsidian 插件开发的特殊注意事项

1. **API 版本陷阱**：Obsidian API 变化很快，某些方法只在特定版本后可用。Codex 可能使用比 `minAppVersion` 更新的 API → 务必每次 build 后检查
2. **移动端测试不可替代**：桌面端表现 ≠ 移动端表现。特别是输入法、键盘事件、滚动行为
3. **社区审查标准**：Obsidian 对 `innerHTML`、`eval()`、Node 文件系统调用有严格限制
4. **类型安全**：Obsidian 的类型定义文件有时与运行时行为不完全一致，用 `as` 断言时要小心
5. **热重载**：推荐使用 [Obsidian Hot Reload](https://github.com/pjeby/hot-reload) 插件，每次 build 后自动重载

---

## 6. 风险提示与测试重点

### 6.1 高风险改动

| 改动 | 风险等级 | 原因 |
|------|---------|------|
| **Mirror layer 标签高亮** | 🔴 高 | CSS 同步、滚动同步、iOS Safari 上 textarea 和 overlay 的触摸事件冲突 |
| **多目标标题切换** | 🟡 中 | 修改 `insertIntoHeading` 逻辑可能影响现有写入行为 |
| **CodeMirror 6 嵌入** | 🔴 极高 | Obsidian 未公开 API，随时可能 break |
| **保存后滚动定位** | 🟡 中 | 需要获取 editor 实例，`onFileOpen` 时机需要处理好 |
| **工具条按钮新增** | 🟢 低 | 纯新增代码，不影响现有逻辑 |

### 6.2 每次发布前必须测试的场景

```
场景 1: 今日日记已存在 → 目标标题存在
场景 2: 今日日记已存在 → 目标标题不存在 → createHeadingIfMissing=true
场景 3: 今日日记已存在 → 目标标题不存在 → createHeadingIfMissing=false → 应报错
场景 4: 今日日记不存在 → 模板存在 → 自动创建并写入
场景 5: 今日日记不存在 → 模板不存在 → 空内容创建
场景 6: 空内容保存 → 应提示并阻止
场景 7: 多行内容 → 写入格式正确（plain/bullet/task）
场景 8: 标签候选 → 输入 # 后显示、点击插入正确
场景 9: 列表续写 → 空行退出、Tab 缩进、Shift+Tab 取消缩进
场景 10: 保存并继续 → 清空后重新输入
场景 11: 所有场景在 iPhone 上复测一次
```

### 6.3 已知技术债务

| 项目 | 问题 | 建议 |
|------|------|------|
| `src/capture-modal.ts` （661行） | 过于庞大，混合了 UI、逻辑、事件处理 | 拆分为 editor 组件 + toolbar 组件 + 标签组件 |
| `getTags()` 的类型断言 | `metadataCache as unknown as { getTags?: ... }` | Obsidian 类型更新后可以移除断言 |
| 没有单元测试 | 全靠手动测试 | 可考虑加入 Jest + Obsidian API mock |
| 缺少 `hot-reload` 支持 | 每次改完需要手动 reload | 安装 hot-reload 插件 |
| i18n 非类型安全 | `Copy` 类型和 `getLocale` 之间没有编译时保证 | 可以用 zod 做运行时校验 |

---

## 总结：建议的下一步

### 立即行动（本周）

1. ✅ **创建 GitHub Actions CI** — `ci.yml` 确保每次 push 自动 build
2. ✅ **创建 Release workflow** — `release.yml` 含 Artifact Attestations
3. ✅ **升级标签候选 UI** — 高亮匹配 + 键盘选择（1-2h，高回报）
4. ✅ **截图/动图更新** — 30min

### 下周

5. ✅ **更多 Markdown 工具按钮** — 1h
6. ✅ **保存后滚动定位** — 1-2h
7. ✅ **多目标标题切换** — 1-3h

### 下月

8. ✅ **标签 mirror layer 高亮** — 3-5h
9. ✅ **社区提交** — 准备全部材料后一次提交

**总计预估开发时间**：约 10-20 小时（分散在 3-4 周），完全可以按 Vibe Coding 模式由 Codex CLI 完成 80% 以上的代码。
