# vitepress-theme-maistack（麦栈）

VitePress 2 知识库兼博客主题，extends 默认主题。实现方式对齐 [VitePress 自定义主题 · 分发自定义主题 / 使用自定义主题](https://vitepress.dev/zh/guide/custom-theme#consuming-a-custom-theme)。

源码仓：[github.com/izhaong/vitepress-theme-maistack](https://github.com/izhaong/vitepress-theme-maistack)  
博客集成示例：[izhaong/izhaong.com](https://github.com/izhaong/izhaong.com)（monorepo `packages/vitepress-theme-maistack`）

> **重要**：麦栈依赖固定的 **`docs/` 目录约定**（分区命名、目录页、索引页、permalink 等）。使用前请阅读 **[DOCS_STRUCTURE.md](./DOCS_STRUCTURE.md)**，并按相同结构组织你的内容；否则侧栏、重写路由、首页列表会异常。

## 安装

```bash
pnpm add vitepress-theme-maistack gray-matter
```

## 快速接入

### 1. 按约定创建 `docs/` 目录

见 [DOCS_STRUCTURE.md](./DOCS_STRUCTURE.md)。至少需要：

```
docs/
├── index.md
├── @pages/          # categoriesPage / tagsPage / archivesPage
├── 目录页/          # 各分区 Catalogue 封面
├── 10.某分区/       # 数字前缀的知识库目录
└── .vitepress/
    ├── config.mts
    ├── data/        # site-data.json 构建时生成
    └── theme/
        ├── index.ts
        └── style.css
```

### 2. `.vitepress/config.mts`

扩展主题 `config`，使用 **`ThemeConfig`** 类型与 **`resolveMaistackSiteData`**（替代自建 `utils/`）：

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
  title: "My Site",
  rewrites(id) {
    return siteData.rewrites[id];
  },
  themeConfig: {
    nav: [{ text: "Home", link: "/" }],
    sidebar: buildThemeSidebar(siteData),
    author: { name: "You", link: "https://github.com/you" },
    titleBadge: true,
  },
});
```

`resolveMaistackSiteData(import.meta.url)` 会扫描 `docs/`、写入 `.vitepress/data/site-data.json`。

### 3. `.vitepress/theme/index.ts`

官方约定：**默认导出 Theme 对象**。站点只需固定薄包装（**勿复制主题组件到本地**）：

```ts
import "./style.css";
import { createMaistackTheme } from "vitepress-theme-maistack";
import type { SiteData } from "vitepress-theme-maistack";
import siteDataJson from "../data/site-data.json";

export default createMaistackTheme({
  siteData: siteDataJson as SiteData,
});
```

### 4. `.vitepress/theme/style.css`

Tailwind 需扫描**本站** Markdown：

```css
@import "vitepress-theme-maistack/styles/style.css";
@source "../../**/*.md";
```

### 5. `.gitignore` 建议

```
docs/.vitepress/data/site-data.json
docs/.vitepress/dist/
docs/.vitepress/.temp/
docs/.vitepress/cache/
```

## 扩展主题（可选）

```ts
import { createMaistackTheme } from "vitepress-theme-maistack";
import type { SiteData } from "vitepress-theme-maistack";
import siteData from "../data/site-data.json";

export default {
  extends: createMaistackTheme({ siteData: siteData as SiteData }),
  enhanceApp(ctx) {
    // 站点级 Vue 插件
  },
};
```

## 导出清单

| 导出 | 说明 |
|------|------|
| `createMaistackTheme` | 创建 Theme 对象 |
| `ThemeConfig` | `themeConfig` 类型（`defineConfig<ThemeConfig>`） |
| `vitepress-theme-maistack/config` | 可 `extends` 的基础 VitePress 配置 |
| `vitepress-theme-maistack/site-data` | `resolveMaistackSiteData`、`buildSiteData`、`buildThemeSidebar` |
| `SiteData` / frontmatter 工具 | 站点数据类型与判定函数 |
| [DOCS_STRUCTURE.md](./DOCS_STRUCTURE.md) | **docs 目录结构约定（必读）** |
| [FRONTMATTER.md](./FRONTMATTER.md) | frontmatter 字段说明 |

## 发布

```bash
npm publish --access public
```

## License

MIT
