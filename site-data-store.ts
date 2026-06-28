import type { SiteData } from "./types/site-data";

let siteDataRef: SiteData | undefined;

export function configureSiteData(data: SiteData): void {
  siteDataRef = data;
}

export function getSiteData(): SiteData {
  if (!siteDataRef) {
    throw new Error(
      "vitepress-theme-maistack: siteData 未配置。请在 docs/.vitepress/theme/index.ts 中调用 createMaistackTheme({ siteData })。",
    );
  }
  return siteDataRef;
}

export type { SiteData, PageMeta, VPSidebarItem } from "./types/site-data";
