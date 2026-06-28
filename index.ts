/// <reference path="./client.d.ts" />

export { createMaistackTheme } from "./create-theme";
export type { MaistackThemeOptions } from "./create-theme";
export type { ThemeConfig } from "./types/theme-config";
export type { SiteData, PageMeta, VPSidebarItem } from "./types/site-data";
export {
  isHomeFrontmatter,
  isCatalogueFrontmatter,
  isIndexSpecialPage,
  isNonArticlePage,
} from "./utils/frontmatter";
