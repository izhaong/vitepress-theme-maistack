import type { SitePreferences } from "./types";

export const OUTLINE_LEVEL_MIN = 1;
export const OUTLINE_LEVEL_MAX = 6;

export function clampOutlineLevel(value: number): number {
  return Math.min(OUTLINE_LEVEL_MAX, Math.max(OUTLINE_LEVEL_MIN, value));
}

export function normalizeOutlineLevels(
  min: number,
  max: number,
): { min: number; max: number } {
  const a = clampOutlineLevel(min);
  const b = clampOutlineLevel(max);
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

export function resolveOutlineLevels(prefs: SitePreferences): [number, number] {
  const { min, max } = normalizeOutlineLevels(
    prefs.outlineMinLevel,
    prefs.outlineMaxLevel,
  );
  return [min, max];
}

export type OutlineThemeConfig =
  | false
  | number
  | "deep"
  | { label?: string; level?: number | "deep" | [number, number] };

export function resolvePageOutlineConfig(
  frontmatterOutline: unknown,
  themeOutline: unknown,
  prefs: SitePreferences,
): false | { label: string; level: [number, number] } {
  const source = (frontmatterOutline ?? themeOutline) as OutlineThemeConfig;
  if (source === false) return false;

  const [min, max] = resolveOutlineLevels(prefs);
  const label =
    (typeof source === "object" &&
      source !== null &&
      !Array.isArray(source) &&
      source.label) ||
    "页面导航";

  return { label, level: [min, max] };
}
