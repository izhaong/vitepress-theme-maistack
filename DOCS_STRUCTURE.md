# docs 目录约定（麦栈主题）

使用 **vitepress-theme-maistack** 时，站点需按下列结构组织 `docs/`。主题在构建时扫描该目录生成侧栏、permalink 重写、首页/归档/标签聚合等数据；**目录名与 frontmatter 字段不匹配会导致侧栏空白、链接 404 或列表缺失**。

完整 frontmatter 说明见 [FRONTMATTER.md](./FRONTMATTER.md)。

---

## 1. 推荐目录树

```
your-project/
├── docs/                          # VitePress 内容根（pnpm vitepress dev docs）
│   ├── index.md                   # 站点首页（isHome: true）
│   ├── public/                    # 静态资源 → 站点根路径 /img/...
│   │   └── img/
│   ├── @pages/                    # 索引页（分类 / 标签 / 归档）
│   │   ├── categoriesPage.md
│   │   ├── tagsPage.md
│   │   └── archivesPage.md
│   ├── 目录页/                    # 各知识库分区「目录封面页」
│   │   └── 10.大前端.md           # permalink 指向 /web/ 等
│   ├── _posts/                    # 可选：博客随笔（不参与知识库侧栏扫描）
│   ├── 10.大前端/                 # 知识库分区（数字前缀 = 排序）
│   │   ├── 1020.JavaScript/
│   │   │   └── 1020100.xxx.md
│   │   └── 1020.xxx.md
│   ├── 20.后端&运维/
│   └── 90.hidden/                 # 可选：不参与构建（config srcExclude）
│   └── .vitepress/                # 站点配置（见下节）
│       ├── config.mts
│       ├── config/                # 站点私有配置（统计码等）
│       ├── data/
│       │   └── site-data.json     # 构建时自动生成，勿手改，建议 gitignore
│       └── theme/
│           ├── index.ts           # 固定薄包装（createMaistackTheme）
│           └── style.css          # Tailwind @source 扫描本站 md
├── package.json
└── pnpm-lock.yaml
```

**不再需要** `docs/.vitepress/utils/`：站点数据扫描已内置在主题包 `vitepress-theme-maistack/site-data`。

---

## 2. `.vitepress/` 最少文件

| 文件 | 作用 |
|------|------|
| `config.mts` | 调用 `resolveMaistackSiteData(import.meta.url)`，配置 nav / SEO / rewrites |
| `theme/index.ts` | 导入 `site-data.json`，`export default createMaistackTheme({ siteData })` |
| `theme/style.css` | `@import` 主题样式 + `@source` 扫描 `docs/**/*.md` |
| `data/site-data.json` | 由 `resolveMaistackSiteData` 写入，供主题运行时读取 |

### config.mts 要点

```ts
import { defineConfig } from "vitepress";
import type { ThemeConfig } from "vitepress-theme-maistack";
import maistackConfig from "vitepress-theme-maistack/config";
import {
  resolveMaistackSiteData,
  buildThemeSidebar,
} from "vitepress-theme-maistack/site-data";

const { siteData } = resolveMaistackSiteData(import.meta.url);

export default defineConfig<ThemeConfig>({
  extends: maistackConfig,
  rewrites(id) {
    return siteData.rewrites[id];
  },
  themeConfig: {
    sidebar: buildThemeSidebar(siteData),
    // nav、author、footer …
  },
});
```

### theme/index.ts 要点

```ts
import "./style.css";
import { createMaistackTheme } from "vitepress-theme-maistack";
import type { SiteData } from "vitepress-theme-maistack";
import siteDataJson from "../data/site-data.json";

export default createMaistackTheme({
  siteData: siteDataJson as SiteData,
});
```

### theme/style.css 要点

```css
@import "vitepress-theme-maistack/styles/style.css";
@source "../../**/*.md";
```

---

## 3. 知识库分区目录

### 命名规则

- 顶层分区目录：`{序号}.{显示名}/`，例如 `10.大前端/`、`20.后端&运维/`
- 子目录与 Markdown 同样以 **数字前缀** 控制侧栏顺序：`1020.JavaScript/`、`1020100.入门.md`
- 序号 parse 失败（无数字前缀）的文件/目录 **不会进入侧栏**

### 扫描规则

构建时 `buildSiteData` 会：

1. 扫描 `docs/` 下 **所有顶层目录**（排除见下表）作为知识库分区
2. 递归读取分区内 `.md`，按 frontmatter `permalink` 生成 URL 重写
3. 将文章元数据写入 `pages`（供首页列表、归档、标签页）

### 默认忽略的顶层目录

| 目录 | 说明 |
|------|------|
| `.vitepress` | VitePress 配置 |
| `@pages` | 分类 / 标签 / 归档索引页 |
| `目录页` | 各分区 Catalogue 封面页 |
| `90.hidden` | 隐藏内容（另可在 config 设 `srcExclude`） |
| `_posts` | 不参与知识库侧栏（博客区，仍可通过 permalink 访问） |

自定义忽略列表：

```ts
import { DEFAULT_IGNORE_DIRS } from "vitepress-theme-maistack/site-data";

resolveMaistackSiteData(import.meta.url, {
  ignoreDirs: [...DEFAULT_IGNORE_DIRS, "草稿"],
});
```

---

## 4. 特殊页面位置

| 类型 | 路径 | 关键 frontmatter |
|------|------|------------------|
| 首页 | `docs/index.md` | `isHome: true`（勿用 `layout: home`） |
| 分区目录页 | `docs/目录页/*.md` | `pageComponent.name: Catalogue` + `permalink` |
| 分类索引 | `docs/@pages/categoriesPage.md` | `categoriesPage: true` |
| 标签索引 | `docs/@pages/tagsPage.md` | `tagsPage: true` |
| 归档索引 | `docs/@pages/archivesPage.md` | `archivesPage: true` |
| 普通文章 | 各分区目录下 `.md` | `title`、`date`、`tags`、`permalink` 等 |

`目录页/10.大前端.md` 中 `pageComponent.data.key` 必须与 `docs/10.大前端/` **目录名完全一致**。

---

## 5. permalink 与侧栏

- 文章/目录页可在 frontmatter 写 `permalink: /pages/abc/` 或 `/web/` 等，构建时写入 `siteData.rewrites`
- `themeConfig.sidebar` 由 `buildThemeSidebar(siteData)` 自动生成，**不要**在 config 手写大段 sidebar
- 多篇文章共用 `/pages/` 前缀时，主题通过 `pageSectionMap` 按文件路径首段匹配正确分区侧栏

---

## 6. 静态资源

- 放在 `docs/public/`，构建后映射到站点根路径，例如 `docs/public/img/logo.png` → `/img/logo.png`
- 首页 hero、目录页 `imgUrl`、themeConfig.logo 等引用此路径

---

## 7. 参考实现

- 主题包 README：[README.md](./README.md)
- 仲灏小栈 monorepo 示例：[izhaong/izhaong.com](https://github.com/izhaong/izhaong.com) → `docs/` 与 `docs/.vitepress/`

---

## 8. 常见问题

**Q: 侧栏为空？**  
检查分区目录是否有数字前缀、是否被 `ignoreDirs` 排除。

**Q: permalink 404？**  
确认 frontmatter `permalink` 与 `rewrites` 一致；`resolveMaistackSiteData` 是否在 config 顶层执行。

**Q: 首页没有文章？**  
确认文章 frontmatter 未设 `article: false`，且不在 `@pages/`、`目录页/`。

**Q: 能否完全自定义 docs 结构？**  
可以 fork 主题并改写 `site-data/build-site-data.ts`；默认约定与 vdoing / 本仓库迁移路径一致，偏离需自行维护扫描逻辑。
