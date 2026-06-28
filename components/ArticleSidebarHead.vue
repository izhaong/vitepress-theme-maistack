<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const CATALOGUE_LINKS: Record<string, string> = {
  大前端: "/web/",
  "后端&运维": "/backend-opt/",
  其他技术: "/other-tech/",
  生活: "/tech-live/",
  收藏: "/favorite/",
};

const { page } = useData();

const sectionName = computed(() => {
  const filePath = (page.value.filePath as string) || "";
  if (!filePath || filePath.startsWith("_posts/")) return "";
  const top = filePath.split("/")[0] ?? "";
  const dot = top.indexOf(".");
  return dot >= 0 ? top.slice(dot + 1) : top;
});

const sectionLink = computed(() => {
  const name = sectionName.value;
  return name ? CATALOGUE_LINKS[name] : "";
});
</script>

<template>
  <header class="article-sidebar-head">
    <a v-if="sectionLink" :href="sectionLink" class="article-sidebar-head__back" :title="`返回${sectionName}`">
      <span aria-hidden="true">←</span>
      <span>目录</span>
    </a>
    <p v-if="sectionName" class="article-sidebar-head__title">{{ sectionName }}</p>
  </header>
</template>
