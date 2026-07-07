# CLAUDE.md

高橋吳氏宗譜 (Wu Family Genealogy) — 单页 Web 应用，浏览吴氏族谱第十三卷世系图。功能包括：房支导航、层级树展开/折叠、人物搜索、详情弹窗、面包屑导航。

## 技术栈

- **前端**: Vanilla HTML/CSS/JS — 无框架，无构建步骤
- **数据处理**: Node.js (`convert-dates.cjs`) 将干支纪年转为公历
- **无测试、无 linter、无 bundler**

## 文件架构

| 文件 | 角色 |
|------|------|
| `index.html` | 入口页。硬编码 header/sidebar/modal 结构，加载 `data.js` → `app.js`，`<script>` 和 `<link>` 带缓存版本号 |
| `data.js` | **自动生成** — `const familyData = [...]`，每个房支 `{ branch, root, siblings? }`，每个人物含 `id/name/gen/zi/hao/birth/birthDisplay/wife/death/children/adoptNote/daughters/birthOrder` |
| `app.js` | 全部前端逻辑：侧边栏渲染、树展开/折叠、搜索（含索引）、详情弹窗（含子辈导航）、面包屑、统计栏、动态 header 高度 |
| `styles.css` | 深色主题（CSS 自定义属性），响应式断点 900px/600px |
| `convert-dates.cjs` | **gitignored** — Node.js 脚本，解析帝号纪年（光绪/道光等）和干支，生成 `birthYear`+`birthDisplay` 并标注 `birthOrder`，原地重写 `data.js` 中的 JSON |
| `package.json` | 仅含 `pdf-parse` 依赖（PDF 文本提取，非运行时使用） |
| `pdf_text.txt` / `pdf_merged.txt` | 源 PDF 提取的原始文本 — 上游数据源 |

## .claude 工程配置

| 路径 | 用途 |
|------|------|
| `.claude/settings.json` | 项目共享权限 + 提交前 hook（自动提醒运行 convert-dates.cjs） |
| `.claude/settings.local.json` | 个人本地配置（gitignored） |
| `.claude/agents/code-reviewer.md` | 代码审查子代理 |
| `.claude/commands/convert.md` | `/convert` 斜杠命令 |
| `.claude/hooks/pre-commit.sh` | 提交前检查脚本 |
| `.claude/skills/verify-changes/` | 验证修改技能（SKILL.md + references/examples/scripts） |
| `.claude/skills/data-pipeline/` | 数据管道技能（干支对照表 + convert.sh） |
| `.claude/workflows/review.js` | 多维度审查工作流 |

## 数据模型

```js
const familyData = [
  {
    branch: "志衍",           // 房支名 — 侧边栏展示
    root: {                   // 本房支主系祖先
      id: "m110_1",          // 唯一 ID（前缀: 名字首字母 + 世代 + 序号）
      name: "明岱",
      zi: "彩峦",            // 字
      gen: 110,              // 世代
      birth: "光绪戊寅年十一月三十日亥时",  // 原始中文日期
      birthDisplay: "1878年（戊寅）十一月三十日亥时", // 转换后显示
      birthYear: "1878",     // 转换后公历年份
      wife: "...",
      death: "...",
      adoptNote: "...",      // 嗣子/兼祧备注
      birthOrder: "长子",    // 排行 — 由 convert-dates.cjs 标注
      children: [ ... ]
    },
    siblings: [ ... ]        // 可选 — 同房支其他支系始祖
  }
]
```

- ID 前缀编码世代：`m110`=明字辈 110世, `l111`=良字辈 111世, `x112`=兴字辈, `w113`=万字辈, `b114`=邦字辈
- `convert-dates.cjs` 处理范围：道光/咸丰/同治/光绪/宣统，在帝号在位年内按干支序数查找对应公历年

## 数据管道流程

1. 编辑 `data.js` 直接修改内容
2. 运行 `node convert-dates.cjs` 重新生成计算字段（`birthDisplay`、`birthOrder`、`wifeDisplay`、`deathDisplay`），原地重写 JSON
3. 浏览器打开 `index.html` 验证 — 无需服务器

## 关键 UI 行为

- **树默认折叠** — 子辈容器初始隐藏，点击 "▸ N 子嗣展开" 展开
- **移动端侧边栏** — 汉堡菜单按钮覆盖房支列表
- **搜索** — 跨房支按 name/zi/hao 过滤，选中后自动切换房支并展开祖先链
- **弹窗** — 点击人物卡片打开详情弹窗，含子辈导航链接
- **动态 header** — JS 测量 header 高度并设置 `layout.paddingTop` + 侧边栏高度
- **去重计数** — `renderStats()` 使用 `Set<id>` 避免嗣子（同时出现在生父和嗣父下）重复计数

## 工作流规则

每次修改代码后，先用 `verify-changes` 技能端到端验证，通过后再提交。
