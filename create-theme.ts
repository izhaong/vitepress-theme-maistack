import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { inBrowser, type EnhanceAppContext } from "vitepress";
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

/** 创建麦栈主题对象（符合 VitePress Theme 接口，供 `.vitepress/theme/index.ts` 默认导出）。 */
export function createMaistackTheme(options: MaistackThemeOptions) {
  configureSiteData(options.siteData);

  if (inBrowser) {
    applyPreferences(loadPreferences());
  }

  return {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app, router }: EnhanceAppContext) {
      app.directive("reveal", vReveal);
      if (!inBrowser) return;
      router.onAfterRouteChanged = () => {
        requestAnimationFrame(refreshZoom);
      };
      refreshZoom();
    },
  };
}
