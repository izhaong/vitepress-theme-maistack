<script setup lang="ts">
import { computed } from "vue";
import { getSiteData } from "../site-data-store";
import { buildTags, tagHref } from "../utils/taxonomy";

const props = withDefaults(
  defineProps<{
    limit?: number;
    activeTag?: string;
  }>(),
  { limit: 24 },
);

const TAG_COLORS = [
  "bg-brand-600/90",
  "bg-accent-500/90",
  "bg-emerald-600/85",
  "bg-rose-500/85",
  "bg-violet-600/85",
  "bg-amber-600/90",
];

const tags = computed(() => {
  const all = buildTags(getSiteData().pages);
  return props.limit > 0 ? all.slice(0, props.limit) : all;
});

const hasMore = computed(() => buildTags(getSiteData().pages).length > tags.value.length);

function tagColor(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length]!;
}
</script>

<template>
  <section v-if="tags.length" class="home-sidebar-card">
    <header class="home-sidebar-card__head">
      <a href="/tags/" class="home-sidebar-card__title stack-link no-underline">
        热门标签
      </a>
    </header>
    <div class="home-tags">
      <a v-for="(item, index) in tags" :key="item.key" :href="tagHref(item.key)" class="home-tags__chip" :class="[
        tagColor(index),
        { 'home-tags__chip--active': item.key === activeTag },
      ]">
        {{ item.key }}
      </a>
      <a v-if="hasMore" href="/tags/" class="home-tags__more">更多…</a>
    </div>
  </section>
</template>
