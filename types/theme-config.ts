import type { DefaultTheme } from "vitepress/theme";

/**
 * 麦栈主题 `themeConfig` 类型（对齐 VitePress 官方 {@link https://vitepress.dev/zh/guide/custom-theme#consuming-a-custom-theme ThemeConfig} 约定）。
 */
export interface ThemeConfig extends DefaultTheme.Config {
  /** 文章标题角标（系列标识等） */
  titleBadge?: boolean;
  /** 默认作者信息，可被 frontmatter.author 覆盖 */
  author?: {
    name: string;
    link?: string;
  };
}
