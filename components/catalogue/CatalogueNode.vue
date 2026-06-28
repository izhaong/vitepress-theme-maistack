<script setup lang="ts">
import type { VPSidebarItem } from "../../types/site-data";
import {
  countCatalogueArticles,
  formatCatalogueIndex,
  isCatalogueGroup,
} from "../../utils/catalogue-tree";
import CatalogueNode from "./CatalogueNode.vue";

withDefaults(
  defineProps<{
    item: VPSidebarItem;
    index: number;
    depth?: number;
    sectionId?: string;
  }>(),
  { depth: 0 }
);
</script>

<template>
  <!-- 一级：独立文章 → 整卡可点 -->
  <a v-if="!isCatalogueGroup(item) && item.link && depth === 0" :id="sectionId" :href="item.link"
    class="catalogue-section-block catalogue-section-block--link">
    <span class="catalogue-section-block__index">{{ formatCatalogueIndex(index, 0) }}</span>
    <span class="catalogue-section-block__title">{{ item.text }}</span>
    <span class="catalogue-section-block__go" aria-hidden="true">阅读 →</span>
  </a>

  <!-- 深层：文章链接 -->
  <a v-else-if="!isCatalogueGroup(item) && item.link" :href="item.link" class="catalogue-link">
    <span class="catalogue-link__index" aria-hidden="true">
      {{ formatCatalogueIndex(index, depth) }}
    </span>
    <span class="catalogue-link__text">{{ item.text }}</span>
  </a>

  <!-- 分组 -->
  <section v-else-if="isCatalogueGroup(item)" :id="depth === 0 ? sectionId : undefined" class="catalogue-group"
    :class="depth === 0 ? 'catalogue-group--top' : 'catalogue-group--nested'">
    <header class="catalogue-group__head">
      <span class="catalogue-group__index" aria-hidden="true">
        {{ formatCatalogueIndex(index, depth) }}
      </span>
      <component :is="depth === 0 ? 'h3' : 'h4'" class="catalogue-group__title"
        :class="{ 'catalogue-group__title--sub': depth >= 1 }">
        {{ item.text }}
      </component>
      <span v-if="item.items?.length" class="catalogue-group__count">
        {{ countCatalogueArticles(item.items) }} 篇
      </span>
    </header>

    <div class="catalogue-group__body">
      <CatalogueNode v-for="(child, ci) in item.items" :key="`${child.text}-${ci}`" :item="child" :index="ci"
        :depth="depth + 1" />
    </div>
  </section>
</template>

<script lang="ts">
export default { name: "CatalogueNode" };
</script>
