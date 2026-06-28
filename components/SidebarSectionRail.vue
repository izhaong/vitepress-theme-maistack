<script setup lang="ts">
import { computed } from "vue";
import { useData, useRoute } from "vitepress";
import { usePreferences } from "../composables/use-preferences";

const SECTIONS = [
  { name: "大前端", link: "/web/", abbr: "前" },
  { name: "后端&运维", link: "/backend-opt/", abbr: "后" },
  { name: "其他技术", link: "/other-tech/", abbr: "他" },
  { name: "生活", link: "/tech-live/", abbr: "生" },
  { name: "收藏", link: "/favorite/", abbr: "藏" },
] as const;

const { prefs } = usePreferences();
const { page } = useData();
const route = useRoute();

const currentSection = computed(() => {
  const filePath = (page.value.filePath as string) || "";
  if (filePath.startsWith("_posts/")) return "";
  const top = filePath.split("/")[0] ?? "";
  const dot = top.indexOf(".");
  return dot >= 0 ? top.slice(dot + 1) : top;
});

const isActive = (name: string, link: string) => {
  if (currentSection.value === name) return true;
  return route.path === link || route.path.startsWith(`${link}`);
};
</script>

<template>
  <nav v-if="prefs.sidebarMode === 'dual'" class="sidebar-section-rail" aria-label="分区导航">
    <a v-for="item in SECTIONS" :key="item.link" :href="item.link" class="sidebar-section-rail__item"
      :class="{ 'sidebar-section-rail__item--active': isActive(item.name, item.link) }" :title="item.name">
      <span class="sidebar-section-rail__abbr">{{ item.abbr }}</span>
    </a>
  </nav>
</template>
