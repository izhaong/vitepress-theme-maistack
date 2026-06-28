import type { SitePreferences } from "./types";

export const PREFERENCES_STORAGE_KEY = "izhaong-site-preferences";
export const APPEARANCE_STORAGE_KEY = "vitepress-theme-appearance";

export const DEFAULT_PREFERENCES: SitePreferences = {
  themeMode: "system",
  themeColor: "default",
  borderRadius: 0.5,
  fontSize: "md",
  colorBlindMode: false,
  grayMode: false,
  sidebarMode: "vertical",
  sidebarWidth: 240,
  outlineMinLevel: 1,
  outlineMaxLevel: 5,
  contentWidth: "fluid",
  globalSearch: true,
  fullscreen: false,
  loveMe: true,
  showFooter: false,
  footerFixed: false,
};
