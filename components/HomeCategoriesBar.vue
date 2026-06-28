<script setup lang="ts">
import { computed } from "vue";
import { getSiteData } from "../site-data-store";
import { buildCategories, categoryHref } from "../utils/taxonomy";

const props = withDefaults(
  defineProps<{
    limit?: number;
    activeCategory?: string;
  }>(),
  { limit: 12 },
);

const categories = computed(() => {
  const all = buildCategories(getSiteData().pages);
  return props.limit > 0 ? all.slice(0, props.limit) : all;
});

const hasMore = computed(() => buildCategories(getSiteData().pages).length > categories.value.length);
</script>

<template>
  <section v-if="categories.length" class="home-sidebar-card">
    <header class="home-sidebar-card__head">
      <a href="/categories/" class="home-sidebar-card__title stack-link no-underline">
        文章分类
      </a>
    </header>
    <ul class="home-categories">
      <li v-for="item in categories" :key="item.key">
        <a :href="categoryHref(item.key)" class="home-categories__link"
          :class="{ 'home-categories__link--active': item.key === activeCategory }">
          <span class="home-categories__name">{{ item.key }}</span>
          <span class="home-categories__count">{{ item.count }}</span>
        </a>
      </li>
      <li v-if="hasMore">
        <a href="/categories/" class="home-categories__more">更多 …</a>
      </li>
    </ul>
  </section>
</template>
