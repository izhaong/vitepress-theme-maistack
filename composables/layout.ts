import { inBrowser, onContentUpdated, useRoute } from "vitepress";
import { computed, shallowReadonly, shallowRef, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import {
  getSidebar,
  getSidebarGroups,
} from "vitepress/dist/client/theme-default/support/sidebar";
import { useData } from "vitepress/dist/client/theme-default/composables/data";
import { getHeaders } from "vitepress/dist/client/theme-default/composables/outline";
import { useCloseSidebarOnEscape } from "vitepress/dist/client/theme-default/composables/sidebar";
import { resolveSectionSidebar } from "../utils/section-sidebar";
import { loadPreferences } from "../preferences/storage";
import { resolvePageOutlineConfig } from "../preferences/outline-range";
import {
  isCatalogueFrontmatter,
  isHomeFrontmatter,
  isIndexSpecialPage,
} from "../utils/frontmatter";

const headers = shallowRef<
  Array<{ level: number; title: string; slug: string }>
>([]);
const sidebar = shallowRef<
  Array<{ text: string; link?: string; items?: unknown[] }>
>([]);
const is960 = shallowRef(false);

export function useLayout() {
  const { frontmatter, theme } = useData();
  const fm = computed(
    () => frontmatter.value as unknown as Record<string, unknown>,
  );
  const isHome = computed(() => isHomeFrontmatter(fm.value));
  const hasSidebar = computed(() => {
    return (
      frontmatter.value.sidebar !== false &&
      sidebar.value.length > 0 &&
      !isHome.value &&
      !isIndexSpecialPage(fm.value) &&
      !isCatalogueFrontmatter(fm.value)
    );
  });
  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value);
  const sidebarGroups = computed(() =>
    hasSidebar.value ? getSidebarGroups(sidebar.value) : [],
  );
  const hasAside = computed(() => {
    if (isHome.value) return false;
    if (isIndexSpecialPage(fm.value) || isCatalogueFrontmatter(fm.value))
      return false;
    if (frontmatter.value.aside != null) return !!frontmatter.value.aside;
    return theme.value.aside !== false;
  });
  const leftAside = computed(() => {
    if (!hasAside.value) return false;
    return frontmatter.value.aside == null
      ? theme.value.aside === "left"
      : frontmatter.value.aside === "left";
  });
  const hasLocalNav = computed(() => headers.value.length > 0);

  return {
    isHome,
    sidebar: shallowReadonly(sidebar),
    sidebarGroups,
    hasSidebar,
    isSidebarEnabled,
    hasAside,
    leftAside,
    headers: shallowReadonly(headers),
    hasLocalNav,
  };
}

export function registerWatchers({
  closeSidebar,
}: {
  closeSidebar: () => void;
}) {
  const { frontmatter, page, theme } = useData();
  const route = useRoute();

  function updateSidebar() {
    const dynamic = resolveSectionSidebar(route.path, page.value.filePath);
    const nextSidebar = dynamic?.length
      ? dynamic
      : theme.value.sidebar
        ? getSidebar(theme.value.sidebar, page.value.relativePath)
        : [];

    if (JSON.stringify(nextSidebar) !== JSON.stringify(sidebar.value)) {
      sidebar.value = nextSidebar;
    }
  }

  watch(
    () => [
      route.path,
      page.value.relativePath,
      page.value.filePath,
      theme.value.sidebar,
    ],
    updateSidebar,
    { immediate: true, deep: true, flush: "sync" },
  );

  function updateDocHeaders() {
    if (isCatalogueFrontmatter(frontmatter.value as Record<string, unknown>)) {
      headers.value = [];
      return;
    }
    const prefs = loadPreferences();
    headers.value = getHeaders(
      resolvePageOutlineConfig(
        frontmatter.value.outline,
        theme.value.outline,
        prefs,
      ),
    );
  }

  onContentUpdated(updateDocHeaders);

  if (inBrowser) {
    window.addEventListener("izhaong-outline-prefs-changed", updateDocHeaders);

    const isWide = useMediaQuery("(min-width: 960px)");
    watch(
      isWide,
      (wide) => {
        is960.value = wide;
      },
      { immediate: true },
    );
  }

  watch(() => route.path, closeSidebar);
  watch(is960, closeSidebar);
  useCloseSidebarOnEscape(closeSidebar);
}

export function refreshDocOutlineHeaders(): void {
  if (!inBrowser || typeof document === "undefined") return;
  window.dispatchEvent(new CustomEvent("izhaong-outline-prefs-changed"));
}

export const layoutInfoInjectionKey = Symbol("layout-info");
