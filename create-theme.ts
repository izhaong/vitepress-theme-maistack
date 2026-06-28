import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { inBrowser } from "vitepress";
import type { SiteData } from "./types/site-data";
import { configureSiteData } from "./site-data-store";
import Layout from "./Layout.vue";
import { vReveal } from "./composables/motion";
import { applyPreferences } from "./preferences/apply";
import { loadPreferences } from "./preferences/storage";
import "./styles/style.css";

let zoom: ReturnType<typeof mediumZoom> | null = null;

function refreshZoom() {
  if (!inBrowser) return;
  zoom?.detach();
  zoom = mediumZoom(".vp-doc img:not(.no-zoom)", {
    background: "rgba(0,0,0,0.6)",
    margin: 24,
  });
}

export interface MaistackThemeOptions {
  siteData: SiteData;
}

export function createMaistackTheme(options: MaistackThemeOptions) {
  configureSiteData(options.siteData);

  if (inBrowser) {
    applyPreferences(loadPreferences());
  }

  return {
    extends: DefaultTheme,
    Layout,
    enhanceApp({
      app,
      router,
    }: {
      app: import("vue").App;
      router: { onAfterRouteChanged?: () => void };
    }) {
      app.directive("reveal", vReveal);
      if (!inBrowser) return;
      router.onAfterRouteChanged = () => {
        requestAnimationFrame(refreshZoom);
      };
      refreshZoom();
    },
  };
}
