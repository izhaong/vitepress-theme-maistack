import type { SiteData, VPSidebarItem } from "../types/site-data";

/**
 * 为 VitePress `themeConfig.sidebar` 生成前缀 → 侧栏映射。
 * 多分区共用 `/pages/` 等 permalink 时，按 `pageSectionMap` 区分首段路径。
 */
export function buildThemeSidebar(
  siteData: SiteData,
): Record<string, VPSidebarItem[]> {
  const sidebar: Record<string, VPSidebarItem[]> = {};

  for (const section of Object.keys(siteData.sidebars)) {
    sidebar[`/${section}/`] = siteData.sidebars[section];
  }

  for (const [link, section] of Object.entries(siteData.pageSectionMap)) {
    const prefix = link.endsWith("/") ? link : `${link}/`;
    if (!sidebar[prefix]) {
      sidebar[prefix] = siteData.sidebars[section];
    }
  }

  return sidebar;
}
