<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { getSiteData } from "../site-data-store";
import type { VPSidebarItem } from "../types/site-data";
import CatalogueNode from "./catalogue/CatalogueNode.vue";
import CatalogueNav from "./catalogue/CatalogueNav.vue";
import CatalogueLastUpdated from "./catalogue/CatalogueLastUpdated.vue";
import {
  catalogueSectionId,
  countCatalogueArticles,
  countCatalogueSections,
} from "../utils/catalogue-tree";

const { frontmatter } = useData();

const pageData = computed(() => {
  const pc = frontmatter.value.pageComponent as {
    data?: { key?: string; imgUrl?: string; description?: string };
  };
  return {
    title: frontmatter.value.title as string,
    imgUrl: pc?.data?.imgUrl,
    description: pc?.data?.description,
    key: pc?.data?.key,
  };
});

const catalogueList = computed((): VPSidebarItem[] => {
  const key = pageData.value.key;
  if (!key) return [];
  return getSiteData().catalogues[key] || [];
});

const stats = computed(() => ({
  sections: countCatalogueSections(catalogueList.value),
  articles: countCatalogueArticles(catalogueList.value),
}));

const navMeta = computed(
  () => `${stats.value.sections} 章 · ${stats.value.articles} 篇`,
);
</script>

<template>
  <div class="catalogue-page">
    <header class="catalogue-hero">
      <div v-if="pageData.imgUrl" class="catalogue-hero__icon">
        <img :src="pageData.imgUrl" :alt="pageData.title" width="64" height="64" />
      </div>
      <div class="catalogue-hero__main">
        <p class="catalogue-hero__crumb">知识库目录</p>
        <div class="catalogue-hero__title-row">
          <h1 class="catalogue-hero__title">{{ pageData.title }}</h1>
          <span v-if="catalogueList.length" class="catalogue-hero__stats">{{ navMeta }}</span>
        </div>
        <p
          v-if="pageData.description"
          class="catalogue-hero__desc"
          v-html="pageData.description"
        />
        <div class="catalogue-hero__updated lg:hidden">
          <CatalogueLastUpdated />
        </div>
      </div>
    </header>

    <section v-if="catalogueList.length" class="catalogue-body" aria-labelledby="catalogue-heading">
      <h2 id="catalogue-heading" class="sr-only">目录</h2>

      <div class="catalogue-body__layout">
        <aside class="catalogue-aside" aria-label="章节目录">
          <div class="catalogue-aside__panel">
            <CatalogueNav :items="catalogueList" :title="pageData.title" :meta="navMeta" />
            <div class="hidden lg:block">
              <CatalogueLastUpdated />
            </div>
          </div>
        </aside>

        <div class="catalogue-main">
          <div class="catalogue-sections">
            <CatalogueNode v-for="(item, index) in catalogueList" :key="`${item.text}-${index}`" :item="item"
              :index="index" :depth="0" :section-id="catalogueSectionId(index)" />
          </div>
        </div>
      </div>
    </section>

    <div v-else class="catalogue-empty" role="status">
      <p class="catalogue-empty__title">暂无目录数据</p>
      <p class="catalogue-empty__desc">
        请检查 frontmatter 中 <code>pageComponent.data.key</code> 是否与侧边栏分区一致。
      </p>
    </div>
  </div>
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
