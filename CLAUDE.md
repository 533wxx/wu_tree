# CLAUDE.md

高橋吳氏宗譜 (Wu Family Genealogy) — 单页 Web 应用，浏览吴氏族谱第十三卷世系图。

## 技术栈

- **前端**: Vue 3 (Composition API) + Vite
- **数据处理**: Node.js (`convert-dates.cjs`) 将干支纪年转为公历
- **部署**: GitHub Pages (`peaceiris/actions-gh-pages`)

## 文件架构

| 路径 | 角色 |
|------|------|
| `index.html` | Vite 入口，挂载 `#app` |
| `vite.config.js` | Vite 配置（Vue 插件、`base: './'`、GitHub Pages） |
| `src/main.js` | `createApp(App).mount('#app')`，导入全局 CSS |
| `src/App.vue` | 根组件：header + sidebar + main + modal 编排 |
| `src/components/layout/AppHeader.vue` | 固定顶栏：标题、汉堡菜单、SearchBox |
| `src/components/layout/AppSidebar.vue` | 房支导航列表 + 移动端抽屉 |
| `src/components/layout/MainContent.vue` | 主内容区：面包屑 + 统计栏 + 树图 |
| `src/components/search/SearchBox.vue` | 搜索输入 + 下拉结果 |
| `src/components/tree/TreeView.vue` | 树图容器（按房支渲染 gen-row） |
| `src/components/tree/TreeNode.vue` | **递归组件**：人物卡片 + 折叠式子辈 |
| `src/components/modal/PersonModal.vue` | Teleport 弹窗：详细信息 + 子辈导航 |
| `src/components/ui/Breadcrumb.vue` | 面包屑导航 |
| `src/components/ui/StatsBar.vue` | 统计栏（房支名、总人数、世代跨度，Set 去重） |
| `src/composables/useBranch.js` | 房支状态：`currentBranch`、`branches`（含人数）、`selectBranch` |
| `src/composables/useSearch.js` | 搜索索引 + 过滤：`query`、`results`（最多 20 条） |
| `src/composables/useModal.js` | 弹窗状态：`selectedPerson`、`isOpen`、`open`/`close` |
| `src/composables/useHeader.js` | 动态 header 高度：测量 → `--header-height` CSS 变量 |
| `src/data/familyData.js` | **数据文件** — `export const familyData = [...]`，232KB |
| `src/styles/variables.css` | CSS 自定义属性（暗色主题，13 个变量） |
| `src/styles/base.css` | 全局 reset、body、滚动条样式 |
| `src/styles/transitions.css` | `@keyframes fadeIn`、`@keyframes modalIn` |
| `convert-dates.cjs` | **gitignored** — Node.js 脚本，解析干支纪年生成 `birthYear`/`birthDisplay`/`birthOrder`，读写 `src/data/familyData.js` |
| `.github/workflows/deploy.yml` | GitHub Actions：push master → build → deploy to Pages |

## 数据管道

```
编辑 src/data/familyData.js
    ↓
node convert-dates.cjs        # 更新 birthDisplay/birthOrder/wifeDisplay/deathDisplay
    ↓
npm run dev                   # 浏览器验证 (http://localhost:3000)
    ↓
git commit && git push        # Actions 自动部署到 Pages
```

## 常用命令

```bash
npm run dev        # Vite dev server (HMR)
npm run build      # 生产构建 → dist/
npm run preview    # 预览生产构建
node convert-dates.cjs  # 运行日期转换
```

## 数据模型

```js
export const familyData = [
  {
    branch: "志衍",           // 房支名
    root: {                   // 本房支主系祖先
      id: "m110_1",          // 唯一 ID（前缀: 名字首字母 + 世代 + 序号）
      name: "明岱",
      zi: "彩峦",
      gen: 110,
      birth: "光绪戊寅年十一月三十日亥时",     // 原始中文日期
      birthDisplay: "1878年（戊寅）十一月三十日亥时", // convert-dates.cjs 生成
      birthYear: "1878",
      wife: "詹氏来莲（出離）",
      wifeDisplay: "...",     // convert-dates.cjs 生成
      death: "公歿葬未详",
      deathDisplay: "...",    // convert-dates.cjs 生成
      adoptNote: "入继堂弟明浚长子良蔚为嗣",
      birthOrder: "长子",    // convert-dates.cjs 生成
      children: [ ... ],
      daughters: [ ... ]
    },
    siblings: [ ... ]        // 可选
  }
]
```

- ID 前缀编码世代：`m110`=明字辈 110世, `l111`=良字辈 111世, `x112`=兴字辈, `w113`=万字辈, `b114`=邦字辈
- `convert-dates.cjs` 处理范围：道光/咸丰/同治/光绪/宣统，在帝号在位年内按干支序数查找对应公历年

## 关键 UI 行为

- **树默认折叠** — 子辈容器初始隐藏，点击 "▸ N 子嗣展开" 展开（同级手风琴）
- **移动端侧边栏** — ≤900px 变为固定抽屉（translateX 滑入），汉堡菜单切换
- **搜索** — 跨房支按 name/zi/hao 过滤，选中后自动切换房支、展开祖先链、滚动定位、2s 高亮
- **弹窗** — 点击卡片打开 Teleport 弹窗，含子辈导航链接，Escape/点击遮罩关闭
- **动态 header** — `useHeader` 测量 `.header` 高度，写入 `--header-height` 驱动 layout padding
- **去重计数** — StatsBar 使用 `Set<id>` 避免嗣子重复计数

## 工作流规则

每次修改代码后，先 `npm run build` 验证构建通过，再提交。
