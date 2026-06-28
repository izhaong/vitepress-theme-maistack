# vitepress-theme-maistack（麦栈）

VitePress 2 知识库兼博客主题，extends 默认主题。

源码仓：[github.com/izhaong/vitepress-theme-maistack](https://github.com/izhaong/vitepress-theme-maistack)  
博客集成示例：[izhaong/izhaong.com](https://github.com/izhaong/izhaong.com)（monorepo `packages/vitepress-theme-maistack`）

## 安装

```bash
pnpm add vitepress-theme-maistack
```

## 使用

```ts
// docs/.vitepress/theme/index.ts
import { createMaistackTheme } from "vitepress-theme-maistack";
import type { SiteData } from "vitepress-theme-maistack";
import siteDataJson from "../data/site-data.json";

export default createMaistackTheme({
  siteData: siteDataJson as SiteData,
});
```

```ts
// docs/.vitepress/config.mts
import { defineConfig } from "vitepress";
import maistackConfig from "vitepress-theme-maistack/config";

export default defineConfig({
  extends: maistackConfig,
  // 本站 nav、sidebar、SEO…
});
```

站点 Markdown 的 Tailwind `@source` 请在消费仓追加，例如 `docs/.vitepress/theme/style.css`：

```css
@import "vitepress-theme-maistack/styles/style.css";
@source "../../**/*.md";
```

并在 `theme/index.ts` 中 `import "./style.css"`。

## 发布

```bash
pnpm publish:theme   # 在 izhaong.com 根目录
# 或
cd packages/vitepress-theme-maistack && npm publish --access public
```

## License

MIT
