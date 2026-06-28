<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";
import type { VPSidebarItem } from "../../types/site-data";
import { normalizeDocPath } from "../utils/section-sidebar";

const props = withDefaults(
  defineProps<{
    items: VPSidebarItem[];
    depth?: number;
  }>(),
  { depth: 0 },
);

const route = useRoute();

const currentPath = computed(() => normalizeDocPath(route.path));

function isCurrent(link?: string): boolean {
  if (!link) return false;
  const path = normalizeDocPath(link);
  return path === currentPath.value;
}

function isSeries(text: string, link?: string): boolean {
  return /\/note\//.test(link || "") || (text.startsWith("《") && text.endsWith("》"));
}

function displayText(text: string): string {
  if (!isSeries(text)) return text;
  return text.replace(/^《|》$/g, "").replace(/笔记$/g, "").trim() || text;
}
</script>

<template>
  <ul class="article-dual-sidebar__tree" :data-depth="depth">
    <li
      v-for="(item, index) in items"
      :key="`${item.link || item.text}-${index}`"
      class="article-dual-sidebar__tree-item"
      :class="{
        'article-dual-sidebar__tree-item--series': isSeries(item.text, item.link),
        'article-dual-sidebar__tree-item--group': !!item.items?.length && !item.link,
      }"
    >
      <a
        v-if="item.link"
        :href="item.link"
        class="article-dual-sidebar__link"
        :class="{ 'article-dual-sidebar__link--current': isCurrent(item.link) }"
        :style="{ paddingLeft: `${0.65 + depth * 0.55}rem` }"
      >
        <span
          v-if="isSeries(item.text, item.link)"
          class="article-dual-sidebar__series-mark"
          aria-hidden="true"
        />
        {{ displayText(item.text) }}
      </a>
      <span
        v-else-if="item.items?.length"
        class="article-dual-sidebar__group-label"
        :style="{ paddingLeft: `${0.65 + depth * 0.55}rem` }"
      >
        {{ item.text }}
      </span>
      <ArticleDualSidebarTree
        v-if="item.items?.length"
        :items="item.items"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>
