# vitepress-theme-maistack（麦栈）

VitePress 2 知识库兼博客主题，extends 默认主题。实现方式对齐 [VitePress 自定义主题 · 分发自定义主题 / 使用自定义主题](https://vitepress.dev/zh/guide/custom-theme#consuming-a-custom-theme)。

源码仓：[github.com/izhaong/vitepress-theme-maistack](https://github.com/izhaong/vitepress-theme-maistack)  
博客集成示例：[izhaong/izhaong.com](https://github.com/izhaong/izhaong.com)（monorepo `packages/vitepress-theme-maistack`）

## 安装

```bash
pnpm add vitepress-theme-maistack
```

## 1. 主题入口 `.vitepress/theme/index.ts`

官方约定：**默认导出 Theme 对象**（`Layout` + 可选 `extends` / `enhanceApp`）。

麦栈需注入本站 `siteData`，使用 `createMaistackTheme`（等价于官方 `import Theme from '…'` + `export default Theme`）：

```ts
import "./style.css";
import { createMaistackTheme } from "vitepress-theme-maistack";
import type { SiteData } from "vitepress-theme-maistack";
import siteDataJson from "../data/site-data.json";

export default createMaistackTheme({
  siteData: siteDataJson as SiteData,
});
```

站点 Markdown 的 Tailwind 扫描（`style.css`）：

```css
@import "vitepress-theme-maistack/styles/style.css";
@source "../../**/*.md";
```

## 2. 站点配置 `.vitepress/config.mts`

扩展主题 `config` 子路径，并使用 **`ThemeConfig` 类型**（官方推荐 `defineConfig<ThemeConfig>`）：

```ts
import { defineConfig } from "vitepress";
import type { ThemeConfig } from "vitepress-theme-maistack";
import maistackConfig from "vitepress-theme-maistack/config";

export default defineConfig<ThemeConfig>({
  extends: maistackConfig,
  title: "My Site",
  themeConfig: {
    nav: [{ text: "Home", link: "/" }],
    // ThemeConfig 含麦栈扩展：author、titleBadge 等
  },
});
```

## 3. 扩展主题（可选）

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

## 导出清单（对齐官方 npm 主题包）

| 导出 | 说明 |
|------|------|
| `createMaistackTheme` | 创建 Theme 对象 |
| `ThemeConfig` | `themeConfig` 类型（`defineConfig<ThemeConfig>`） |
| `vitepress-theme-maistack/config` | 可 `extends` 的基础 VitePress 配置 |
| `SiteData` / frontmatter 工具 | 站点数据层类型与工具函数 |

## 发布

```bash
npm publish --access public
```

## License

MIT
