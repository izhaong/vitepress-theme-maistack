<script setup lang="ts">
import { toRef } from "vue";
import {
  catalogueSectionId,
  countCatalogueArticles,
  formatCatalogueIndex,
  isCatalogueGroup,
} from "../../utils/catalogue-tree";
import { useCatalogueNav } from "../../composables/use-catalogue-nav";
import type { VPSidebarItem } from "../../types/site-data";

const props = defineProps<{
  items: VPSidebarItem[];
  title: string;
  meta: string;
}>();

const { activeId, scrollToSection } = useCatalogueNav(toRef(props, "items"));

function articleCount(item: VPSidebarItem): number | null {
  if (!isCatalogueGroup(item)) return null;
  return countCatalogueArticles(item.items || []);
}
</script>

<template>
  <div class="catalogue-nav">
    <header class="catalogue-nav__head">
      <p class="catalogue-nav__head-label">章节</p>
      <p class="catalogue-nav__head-title">{{ title }}</p>
      <p class="catalogue-nav__head-meta">{{ meta }}</p>
    </header>
    <nav class="catalogue-nav__list" aria-label="章节目录">
      <a v-for="(item, index) in items" :key="`${item.text}-${index}`" :href="`#${catalogueSectionId(index)}`"
        class="catalogue-nav__item" :class="{ 'catalogue-nav__item--active': activeId === catalogueSectionId(index) }"
        @click.prevent="scrollToSection(index)">
        <span class="catalogue-nav__index">{{ formatCatalogueIndex(index) }}</span>
        <span class="catalogue-nav__text">{{ item.text }}</span>
        <span v-if="articleCount(item)" class="catalogue-nav__count">
          {{ articleCount(item) }}
        </span>
      </a>
    </nav>
  </div>
</template>
