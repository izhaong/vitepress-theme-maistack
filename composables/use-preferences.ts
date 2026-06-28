import { useData } from "vitepress";
import { inject, onMounted, onUnmounted, provide, reactive, watch } from "vue";
import { applyPreferences, applyThemeMode } from "../preferences/apply";
import { DEFAULT_PREFERENCES } from "../preferences/defaults";
import { loadPreferences, savePreferences } from "../preferences/storage";
import type { SitePreferences } from "../preferences/types";
import { refreshDocOutlineHeaders } from "../composables/layout";

export const preferencesInjectionKey = Symbol("site-preferences");

export function providePreferences() {
  const { isDark } = useData();
  const prefs = reactive<SitePreferences>(loadPreferences());

  function sync() {
    applyPreferences(prefs, isDark);
    savePreferences(prefs);
  }

  function reset() {
    Object.assign(prefs, { ...DEFAULT_PREFERENCES });
    sync();
  }

  function patch(partial: Partial<SitePreferences>) {
    Object.assign(prefs, partial);
  }

  let media: MediaQueryList | null = null;
  const onSystemThemeChange = () => {
    if (prefs.themeMode === "system") {
      applyThemeMode("system", isDark);
    }
  };

  onMounted(() => {
    sync();
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", onSystemThemeChange);
  });

  onUnmounted(() => {
    media?.removeEventListener("change", onSystemThemeChange);
  });

  watch(
    prefs,
    () => {
      sync();
      refreshDocOutlineHeaders();
    },
    { deep: true },
  );

  const api = { prefs, patch, reset, sync };
  provide(preferencesInjectionKey, api);
  return api;
}

export function usePreferences() {
  const ctx = inject<ReturnType<typeof providePreferences>>(
    preferencesInjectionKey,
  );
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesRoot");
  }
  return ctx;
}
