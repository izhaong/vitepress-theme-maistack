import type { Ref } from "vue";
import { APPEARANCE_STORAGE_KEY } from "./defaults";
import { findThemeColor } from "./theme-colors";
import type { SitePreferences, ThemeMode } from "./types";
import { syncLoveMe } from "../composables/love-me";

function setDataset(
  root: HTMLElement,
  key: string,
  value: string | boolean,
): void {
  root.dataset[key] = String(value);
}

export function applyThemeMode(mode: ThemeMode, isDark?: Ref<boolean>): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (mode === "system") {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, "auto");
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", dark);
    if (isDark) isDark.value = dark;
    return;
  }

  const dark = mode === "dark";
  localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
  root.classList.toggle("dark", dark);
  if (isDark) isDark.value = dark;
}

export function applyPreferences(
  prefs: SitePreferences,
  isDark?: Ref<boolean>,
): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const preset = findThemeColor(prefs.themeColor);
  const sidebarWidthPx = `${prefs.sidebarWidth}px`;
  const railWidthPx = "3.5rem";
  const menuRadius = `${prefs.borderRadius * 0.75}rem`;

  applyThemeMode(prefs.themeMode, isDark);

  root.style.setProperty("--pref-sidebar-width", sidebarWidthPx);
  root.style.setProperty("--pref-sidebar-rail-width", railWidthPx);
  root.style.setProperty("--pref-radius", String(prefs.borderRadius));
  root.style.setProperty("--admin-menu-radius", menuRadius);
  root.style.setProperty("--vp-sidebar-width", sidebarWidthPx);
  root.style.setProperty("--wheat-cyan", preset.primary);
  root.style.setProperty("--wheat-cyan-rgb", preset.rgb);
  root.style.setProperty("--vp-c-brand-1", preset.primary);
  root.style.setProperty("--vp-c-brand-2", preset.primaryDark);
  root.style.setProperty("--vp-c-brand-3", preset.primaryDark);
  root.style.setProperty("--vp-c-brand-soft", preset.primarySoft);
  root.style.setProperty("--vp-button-brand-bg", preset.primary);
  root.style.setProperty("--vp-button-brand-hover-bg", preset.primaryDark);
  root.style.setProperty("--vp-button-brand-active-bg", preset.primaryDark);
  root.style.setProperty("--admin-menu-hover-bg", preset.primarySoft);
  root.style.setProperty("--admin-menu-active-bg", `rgba(${preset.rgb}, 0.16)`);
  root.style.setProperty("--admin-menu-active-text", preset.primaryDark);
  root.style.setProperty(
    "--admin-menu-focus-ring",
    `rgba(${preset.rgb}, 0.42)`,
  );

  setDataset(root, "prefThemeColor", prefs.themeColor);
  setDataset(root, "prefFontSize", prefs.fontSize);
  setDataset(root, "prefSidebarMode", prefs.sidebarMode);
  setDataset(root, "prefOutlineMin", String(prefs.outlineMinLevel));
  setDataset(root, "prefOutlineMax", String(prefs.outlineMaxLevel));
  setDataset(root, "prefContentWidth", prefs.contentWidth);
  setDataset(root, "prefColorBlind", prefs.colorBlindMode ? "on" : "off");
  setDataset(root, "prefGrayMode", prefs.grayMode ? "on" : "off");
  setDataset(root, "prefSearch", prefs.globalSearch ? "on" : "off");
  setDataset(root, "prefFullscreen", prefs.fullscreen ? "on" : "off");
  setDataset(root, "prefLoveMe", prefs.loveMe ? "on" : "off");
  setDataset(root, "prefFooter", prefs.showFooter ? "on" : "off");
  setDataset(root, "prefFooterFixed", prefs.footerFixed ? "on" : "off");

  const filters: string[] = [];
  if (prefs.grayMode) filters.push("grayscale(1)");
  if (prefs.colorBlindMode) filters.push("contrast(1.08)");
  document.body.style.filter = filters.length ? filters.join(" ") : "";

  document.body.classList.toggle("pref-footer-fixed", prefs.footerFixed);
  document.body.style.paddingBottom = "";

  syncLoveMe({ enabled: prefs.loveMe });
}
