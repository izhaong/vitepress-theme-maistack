<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vitepress";
import { animate, stagger } from "animejs";
import { readReducedMotion } from "../composables/use-reduced-motion";

const route = useRoute();

function normalizePath(path: string): string {
  let p = path.split("#")[0].split("?")[0];
  if (p.endsWith(".html")) p = p.slice(0, -5);
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function syncSidebarActive() {
  const current = normalizePath(route.path);

  document.querySelectorAll(".VPSidebarItem.is-link").forEach((item) => {
    const href = item.querySelector("a")?.getAttribute("href") || "";
    const path = normalizePath(href);
    const isCurrent =
      path === current ||
      (path.length > 1 && current.startsWith(`${path}/`));
    item.classList.toggle("sidebar-item--current", isCurrent);
  });

  document
    .querySelectorAll(".VPSidebarItem.sidebar-item--current")
    .forEach((item) => {
      let parent = item.closest(
        ".VPSidebarItem.collapsible",
      ) as HTMLElement | null;
      while (parent) {
        parent.classList.remove("collapsed");
        parent = parent.parentElement?.closest(
          ".VPSidebarItem.collapsible",
        ) as HTMLElement | null;
      }
    });
}

/** 小册/系列入口：去掉《》并加系列样式类 */
function normalizeSeriesLinks() {
  document
    .querySelectorAll(".maistack-article .VPSidebarItem.is-link")
    .forEach((item) => {
      const textEl = item.querySelector(".text");
      const href = item.querySelector("a")?.getAttribute("href") || "";
      const raw = textEl?.textContent?.trim() || "";

      const isSeries =
        /\/note\//.test(href) ||
        (raw.startsWith("《") && raw.endsWith("》"));

      if (!isSeries || !textEl) return;

      item.classList.add("sidebar-item--series");
      const cleaned = raw
        .replace(/^《|》$/g, "")
        .replace(/笔记$/g, "")
        .trim();
      if (cleaned && cleaned !== raw) {
        textEl.textContent = cleaned;
      }
    });
}

/** 仅滚动侧栏 .nav，把当前项滚入可视区 */
function scrollSidebarToActive() {
  const nav = document.querySelector(
    ".maistack-article .VPSidebar .nav",
  ) as HTMLElement | null;
  const active = document.querySelector(
    ".maistack-article .VPSidebarItem.sidebar-item--current",
  ) as HTMLElement | null;
  if (!nav || !active) return;

  const pad = 12;
  const itemTop =
    active.getBoundingClientRect().top -
    nav.getBoundingClientRect().top +
    nav.scrollTop;
  const itemBottom = itemTop + active.offsetHeight;
  const viewTop = nav.scrollTop;
  const viewBottom = viewTop + nav.clientHeight;
  const behavior = readReducedMotion() ? "auto" : "smooth";

  if (itemTop < viewTop + pad) {
    nav.scrollTo({ top: Math.max(0, itemTop - pad), behavior });
  } else if (itemBottom > viewBottom - pad) {
    nav.scrollTo({
      top: Math.max(0, itemBottom - nav.clientHeight + pad),
      behavior,
    });
  }
}

function pulseCurrentItem() {
  if (readReducedMotion()) return;
  const link = document.querySelector(
    ".VPSidebarItem.sidebar-item--current a",
  );
  if (!link) return;
  link.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 320, easing: "ease-out" },
  );
}

function runSidebarEnterMotion() {
  if (readReducedMotion()) return;
  const items = document.querySelectorAll<HTMLElement>(
    ".VPSidebar .VPSidebarItem.is-link:not(.sidebar-item--series)",
  );
  if (!items.length) return;

  animate(items, {
    opacity: [0, 1],
    translateX: [-10, 0],
    delay: stagger(28, { start: 80 }),
    duration: 400,
    ease: "outExpo",
  });
}

function refreshSidebar() {
  syncSidebarActive();
  normalizeSeriesLinks();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollSidebarToActive();
      pulseCurrentItem();
    });
  });
}

onMounted(() => {
  requestAnimationFrame(() => {
    syncSidebarActive();
    normalizeSeriesLinks();
    runSidebarEnterMotion();
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollSidebarToActive);
    });
  });
});

watch(
  () => route.path,
  () => {
    requestAnimationFrame(refreshSidebar);
  },
  { flush: "post" },
);
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
