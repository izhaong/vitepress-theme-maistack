import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
} from "./defaults";
import type { SitePreferences } from "./types";
import { normalizeOutlineLevels } from "./outline-range";

function readStoredThemeMode(): ThemeMode {
  if (typeof localStorage === "undefined") return "system";
  const value = localStorage.getItem(APPEARANCE_STORAGE_KEY);
  if (value === "dark") return "dark";
  if (value === "light") return "light";
  return "system";
}

export function loadPreferences(): SitePreferences {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_PREFERENCES,
        themeMode: readStoredThemeMode(),
      };
    }
    const parsed = JSON.parse(raw) as Partial<SitePreferences>;
    const outline = normalizeOutlineLevels(
      parsed.outlineMinLevel ?? DEFAULT_PREFERENCES.outlineMinLevel,
      parsed.outlineMaxLevel ?? DEFAULT_PREFERENCES.outlineMaxLevel,
    );
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      outlineMinLevel: outline.min,
      outlineMaxLevel: outline.max,
      themeMode: parsed.themeMode ?? readStoredThemeMode(),
    };
  } catch {
    return { ...DEFAULT_PREFERENCES, themeMode: readStoredThemeMode() };
  }
}

export function savePreferences(prefs: SitePreferences): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): SitePreferences {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    localStorage.setItem(APPEARANCE_STORAGE_KEY, "auto");
  }
  return { ...DEFAULT_PREFERENCES };
}
