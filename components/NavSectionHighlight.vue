<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useData, useRoute } from "vitepress";
import { resolveSiteSectionLink } from "../utils/site-sections";

const { page } = useData();
const route = useRoute();

function syncNavSectionActive() {
  if (typeof document === "undefined") return;

  const activeLink = resolveSiteSectionLink(
    route.path,
    page.value.filePath as string | undefined,
  );

  document.querySelectorAll<HTMLElement>(".VPNavBarMenuLink").forEach((el) => {
    const href = el.getAttribute("href")?.replace(/\/$/, "") || "";
    const normalized = activeLink?.replace(/\/$/, "") || "";
    const on = Boolean(normalized && href === normalized);
    el.classList.toggle("nav-section-active", on);
    el.classList.toggle("active", on);
  });
}

let observer: MutationObserver | null = null;

onMounted(() => {
  syncNavSectionActive();
  observer = new MutationObserver(syncNavSectionActive);
  const nav = document.querySelector(".VPNavBarMenu");
  if (nav) {
    observer.observe(nav, { childList: true, subtree: true });
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

watch(
  () => [route.path, page.value.filePath],
  () => syncNavSectionActive(),
  { flush: "post" },
);
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
