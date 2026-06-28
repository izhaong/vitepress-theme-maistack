export type ThemeMode = "light" | "dark" | "system";
export type FontSizePreset = "sm" | "md" | "lg";
export type SidebarMode = "vertical" | "dual";
export type ContentWidthMode = "fluid" | "fixed";

export interface SitePreferences {
  themeMode: ThemeMode;
  themeColor: string;
  borderRadius: number;
  fontSize: FontSizePreset;
  colorBlindMode: boolean;
  grayMode: boolean;
  sidebarMode: SidebarMode;
  sidebarWidth: number;
  outlineMinLevel: number;
  outlineMaxLevel: number;
  contentWidth: ContentWidthMode;
  globalSearch: boolean;
  fullscreen: boolean;
  loveMe: boolean;
  showFooter: boolean;
  footerFixed: boolean;
}

export interface ThemeColorPreset {
  id: string;
  label: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  rgb: string;
}
