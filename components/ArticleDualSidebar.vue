<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useData, useRoute } from "vitepress";
import type { VPSidebarItem } from "../types/site-data";
import {
  normalizeDocPath,
  resolveSectionSidebar,
} from "../utils/section-sidebar";
import ArticleDualSidebarTree from "./ArticleDualSidebarTree.vue";

const { page } = useData();
const route = useRoute();

const sidebarItems = computed(() =>
  resolveSectionSidebar(route.path, page.value.filePath as string | undefined),
);

function containsPath(items: VPSidebarItem[], target: string): boolean {
  for (const item of items) {
    if (item.link && normalizeDocPath(item.link) === target) return true;
    if (item.items?.length && containsPath(item.items, target)) return true;
  }
  return false;
}

function findActiveRootIndex(items: VPSidebarItem[], path: string): number {
  const current = normalizeDocPath(path);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.link && normalizeDocPath(item.link) === current) return i;
    if (item.items?.length && containsPath(item.items, current)) return i;
  }
  return 0;
}

const selectedRootIndex = ref(0);

watch(
  [sidebarItems, () => route.path],
  () => {
    selectedRootIndex.value = findActiveRootIndex(
      sidebarItems.value,
      route.path,
    );
  },
  { immediate: true },
);

const activeRoot = computed(
  () => sidebarItems.value[selectedRootIndex.value] ?? sidebarItems.value[0],
);

const rightItems = computed(() => {
  const root = activeRoot.value;
  if (!root?.items?.length) return [];
  return root.items;
});

const showRightEmpty = computed(() => rightItems.value.length === 0);

function isRootActive(index: number): boolean {
  return selectedRootIndex.value === index;
}

function isRootCurrent(item: VPSidebarItem): boolean {
  if (!item.link) return false;
  return normalizeDocPath(item.link) === normalizeDocPath(route.path);
}

function rootLabel(text: string, link?: string): string {
  if (link && /\/note\//.test(link)) {
    return text.replace(/^《|》$/g, "").replace(/笔记$/g, "").trim() || text;
  }
  return text;
}

function selectRoot(index: number) {
  selectedRootIndex.value = index;
}
</script>

<template>
  <nav
    v-if="sidebarItems.length"
    class="article-dual-sidebar"
    aria-label="双列文档目录"
  >
    <div class="article-dual-sidebar__col article-dual-sidebar__col--roots" aria-label="二级目录">
      <ul class="article-dual-sidebar__roots">
        <li v-for="(item, index) in sidebarItems" :key="`${item.text}-${index}`">
          <a
            v-if="item.link && !item.items?.length"
            :href="item.link"
            class="article-dual-sidebar__root"
            :class="{
              'article-dual-sidebar__root--active': isRootActive(index),
              'article-dual-sidebar__root--current': isRootCurrent(item),
            }"
            @click="selectRoot(index)"
          >
            {{ rootLabel(item.text, item.link) }}
          </a>
          <button
            v-else
            type="button"
            class="article-dual-sidebar__root"
            :class="{
              'article-dual-sidebar__root--active': isRootActive(index),
            }"
            @click="selectRoot(index)"
          >
            {{ rootLabel(item.text, item.link) }}
          </button>
        </li>
      </ul>
    </div>

    <div class="article-dual-sidebar__col article-dual-sidebar__col--tree" aria-label="子级目录">
      <p v-if="showRightEmpty" class="article-dual-sidebar__empty">暂无子级目录</p>
      <ArticleDualSidebarTree v-else :items="rightItems" />
    </div>
  </nav>
</template>
