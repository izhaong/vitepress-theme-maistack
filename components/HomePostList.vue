<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PageMeta } from "../types/site-data";
import { setupRevealChildren, type MotionCleanup } from "../composables/motion";
import { isCoverOnRight } from "../utils/post-card";
import { categoryHref, formatPostDate, tagHref } from "../utils/taxonomy";

const props = defineProps<{
  posts: PageMeta[];
}>();

const listRef = ref<HTMLElement | null>(null);
let motionCleanup: MotionCleanup = () => { };

function bindReveal() {
  motionCleanup();
  motionCleanup = setupRevealChildren(
    listRef.value,
    "[data-home-post]",
    55,
    {
      y: 24,
      rootMargin: "0px 0px 160px 0px",
      threshold: 0.01,
    },
  );
}

onMounted(async () => {
  await nextTick();
  bindReveal();
});

watch(
  () => props.posts,
  async () => {
    await nextTick();
    bindReveal();
  },
);

onBeforeUnmount(() => motionCleanup());
</script>

<template>
  <div ref="listRef" class="home-post-list">
    <article v-for="post in posts" :key="post.link" data-home-post
      class="home-post stack-meta-card relative mb-4 opacity-0" :class="{
        'home-post--with-cover': !!post.cover,
        'home-post--cover-right': post.cover && isCoverOnRight(post.cover),
      }">
      <div v-if="post.cover" class="home-post__cover-wrap">
        <img :src="post.cover" alt="" class="home-post__cover no-zoom" loading="lazy" decoding="async" />
      </div>

      <div class="home-post__body">
        <h2 class="home-post__title">
          {{ post.title }}
        </h2>

        <p v-if="post.excerpt" class="home-post__excerpt">
          {{ post.excerpt }}
        </p>

        <div class="home-post__meta">
          <span v-if="post.date" class="home-post__meta-item">
            <span class="sr-only">发布日期</span>
            {{ formatPostDate(post.date) }}
          </span>
          <span v-if="post.categories?.length" class="home-post__meta-item home-post__meta-item--cats">
            <span class="sr-only">分类</span>
            <a v-for="cat in post.categories" :key="cat" :href="categoryHref(cat)" class="home-post__chip">
              {{ cat }}
            </a>
          </span>
          <span v-if="post.tags?.filter(Boolean).length" class="home-post__meta-item home-post__meta-item--tags">
            <span class="sr-only">标签</span>
            <a v-for="tag in post.tags?.filter(Boolean)" :key="tag" :href="tagHref(tag!)"
              class="home-post__chip home-post__chip--tag">
              {{ tag }}
            </a>
          </span>
        </div>
      </div>

      <a :href="post.link" class="home-post__overlay" :aria-label="`阅读：${post.title}`" />
    </article>
    <p v-if="!posts.length" class="py-8 text-center text-sm text-stone-500">
      暂无文章
    </p>
  </div>
</template>
