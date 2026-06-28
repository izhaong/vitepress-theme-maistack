import { ref, watch, onMounted, onUnmounted, nextTick, type Ref } from "vue";
import { catalogueSectionId } from "../utils/catalogue-tree";
import type { VPSidebarItem } from "../types/site-data";

function readNavHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--vp-nav-height",
  );
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 64;
}

/** 与 CSS scroll-margin-top 对齐，保证锚点/程序化滚动位置一致 */
function readSectionScrollOffset(): number {
  const navH = readNavHeight();
  if (window.matchMedia("(max-width: 767px)").matches) {
    return navH + 60; // 3.75rem — 顶栏 + 横向章节目录条
  }
  return navH + 16; // 1rem
}

/** 目录正文区允许的最大 scrollY（再往下是页脚，且不应出现侧栏脱粘空白带） */
function readCatalogueMaxScroll(): number {
  const layout = document.querySelector(".catalogue-body__layout");
  if (!layout) {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  }
  const top = layout.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, top + layout.scrollHeight - window.innerHeight);
}

function isNearPageBottom(threshold = 64): boolean {
  return window.scrollY >= readCatalogueMaxScroll() - threshold;
}

/** 仅滚动章节目录列表容器，避免 scrollIntoView 带动整页回弹 */
function scrollNavListToActive() {
  const list = document.querySelector(".catalogue-nav__list");
  const active = document.querySelector(".catalogue-nav__item--active");
  if (!list || !active || !(active instanceof HTMLElement)) return;

  const isHorizontal = list.scrollWidth > list.clientWidth + 4;

  if (isHorizontal) {
    const pad = 8;
    const itemLeft = active.offsetLeft;
    const itemRight = itemLeft + active.offsetWidth;
    const viewLeft = list.scrollLeft;
    const viewRight = viewLeft + list.clientWidth;
    if (itemLeft < viewLeft + pad) {
      list.scrollTo({ left: itemLeft - pad, behavior: "smooth" });
    } else if (itemRight > viewRight - pad) {
      list.scrollTo({
        left: itemRight - list.clientWidth + pad,
        behavior: "smooth",
      });
    }
    return;
  }

  const pad = 4;
  const itemTop = active.offsetTop;
  const itemBottom = itemTop + active.offsetHeight;
  const viewTop = list.scrollTop;
  const viewBottom = viewTop + list.clientHeight;
  if (itemTop < viewTop + pad) {
    list.scrollTo({ top: itemTop - pad, behavior: "smooth" });
  } else if (itemBottom > viewBottom - pad) {
    list.scrollTo({
      top: itemBottom - list.clientHeight + pad,
      behavior: "smooth",
    });
  }
}

export function useCatalogueNav(items: Ref<VPSidebarItem[]>) {
  const activeId = ref("");
  let scrollLockId: string | null = null;
  let scrollLockTimer: ReturnType<typeof setTimeout> | null = null;

  function sectionIds(): string[] {
    return items.value.map((_, index) => catalogueSectionId(index));
  }

  function activateLastSection() {
    const ids = sectionIds();
    if (ids.length) activeId.value = ids[ids.length - 1];
  }

  function lockActive(id: string, ms = 1100) {
    scrollLockId = id;
    if (scrollLockTimer) clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => {
      scrollLockId = null;
      scrollLockTimer = null;
      syncActiveFromScroll();
    }, ms);
  }

  function syncActiveFromScroll() {
    const ids = sectionIds();
    if (!ids.length) return;

    if (scrollLockId) {
      activeId.value = scrollLockId;
      return;
    }

    if (isNearPageBottom()) {
      activateLastSection();
      return;
    }

    const offset = readSectionScrollOffset();
    let current = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - offset <= 40) {
        current = id;
      }
    }

    activeId.value = current;
  }

  function scrollToSection(index: number) {
    const ids = sectionIds();
    const id = catalogueSectionId(index);
    const el = document.getElementById(id);
    if (!el) return;

    const offset = readSectionScrollOffset();
    const isLast = index === ids.length - 1;
    let top = el.getBoundingClientRect().top + window.scrollY - offset;

    if (isLast) {
      top = Math.min(Math.max(0, top), readCatalogueMaxScroll());
    } else {
      top = Math.max(0, top);
    }

    lockActive(id);
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  watch(
    items,
    () => {
      const ids = sectionIds();
      const hash = location.hash.slice(1);
      if (hash && ids.includes(hash)) activeId.value = hash;
    },
    { flush: "post" },
  );

  onMounted(() => {
    const ids = sectionIds();
    const hash = location.hash.slice(1);
    if (hash && ids.includes(hash)) {
      activeId.value = hash;
    } else {
      syncActiveFromScroll();
    }

    window.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveFromScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", syncActiveFromScroll);
    window.removeEventListener("resize", syncActiveFromScroll);
    if (scrollLockTimer) clearTimeout(scrollLockTimer);
  });

  watch(activeId, async () => {
    await nextTick();
    scrollNavListToActive();
  });

  return { activeId, scrollToSection };
}
