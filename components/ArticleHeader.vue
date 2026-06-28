<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useData } from "vitepress";
import {
  runArticleHeaderMotion,
  type MotionCleanup,
} from "../composables/motion";
import { useArticleReading } from "../composables/use-article-reading";
import { formatWordCount } from "../utils/reading-stats";
import { useReducedMotion } from "../composables/use-reduced-motion";

const CATALOGUE_LINKS: Record<string, string> = {
  大前端: "/web/",
  "后端&运维": "/backend-opt/",
  其他技术: "/other-tech/",
  生活: "/tech-live/",
  收藏: "/favorite/",
};

const { frontmatter, title, page, theme } = useData();
const headerRef = ref<HTMLElement | null>(null);
let motionCleanup: MotionCleanup = () => { };

const {
  stats,
  minutes,
  sectionCount,
  headings,
  progress,
  activeHeadingId,
} = useArticleReading();

const reducedMotion = useReducedMotion();
const tocOpen = ref(false);
const hasWideOutline = useMediaQuery("(min-width: 1280px)");

const showMobileToc = computed(
  () => headings.value.length > 0 && !hasWideOutline.value,
);

const displayTitle = computed(() => {
  const raw = String(title.value || "");
  const site = String(theme.value.siteTitle || theme.value.title || "仲灏小栈");
  const suffix = ` | ${site}`;
  return raw.endsWith(suffix) ? raw.slice(0, -suffix.length) : raw;
});

const titleTag = computed(() => frontmatter.value.titleTag as string | undefined);

const date = computed(() => {
  const raw = frontmatter.value.date as string | undefined;
  if (!raw) return "";
  return String(raw).split("T")[0].split(" ")[0];
});

const author = computed(() => {
  const fm = frontmatter.value.author as
    | string
    | { name?: string; link?: string }
    | undefined;
  if (fm) return typeof fm === "string" ? { name: fm } : fm;
  const cfg = theme.value.author as { name?: string; link?: string } | undefined;
  return cfg?.name ? cfg : null;
});

const classifyList = computed(() => {
  const filePath = (page.value.filePath as string) || "";
  if (!filePath || filePath.startsWith("_posts/")) return [];
  const parts = filePath.split("/");
  parts.pop();
  return parts.map((item) => {
    const dot = item.indexOf(".");
    return dot >= 0 ? item.slice(dot + 1) : item;
  });
});

const metaItems = computed(() => {
  const items: Array<{ type: "author" | "text"; value: string; link?: string }> =
    [];
  if (author.value?.name) {
    items.push({
      type: "author",
      value: author.value.name,
      link: author.value.link,
    });
  }
  if (date.value) items.push({ type: "text", value: date.value });
  if (stats.value.wordCount > 0) {
    items.push({
      type: "text",
      value: `${formatWordCount(stats.value.wordCount)} 字`,
    });
  }
  items.push({ type: "text", value: `约 ${minutes.value} 分钟` });
  if (sectionCount.value > 0) {
    items.push({ type: "text", value: `${sectionCount.value} 节` });
  }
  return items;
});

function crumbLink(name: string, index: number): string {
  if (index === 0 && CATALOGUE_LINKS[name]) return CATALOGUE_LINKS[name];
  return `/categories/?category=${encodeURIComponent(name)}`;
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--vp-nav-height",
      ),
      10,
    ) || 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 20;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: reducedMotion.value ? "auto" : "smooth",
  });
  history.replaceState(null, "", `#${id}`);
}

onMounted(() => {
  if (headerRef.value) motionCleanup = runArticleHeaderMotion(headerRef.value);
  tocOpen.value = headings.value.length > 0 && headings.value.length <= 6;
});

onBeforeUnmount(() => motionCleanup());
</script>

<template>
  <header ref="headerRef" class="article-masthead" aria-label="文章信息">
    <Teleport to="body">
      <div v-show="progress > 2" class="article-reading-progress" role="progressbar" :aria-valuenow="progress"
        aria-valuemin="0" aria-valuemax="100" :aria-label="`阅读进度 ${progress}%`">
        <div class="article-reading-progress__bar" :class="{ 'article-reading-progress__bar--instant': reducedMotion }"
          :style="{ width: `${progress}%` }" />
      </div>
    </Teleport>

    <nav v-if="classifyList.length" aria-label="面包屑" class="article-masthead__crumbs">
      <a href="/" title="首页" class="stack-link no-underline">首页</a>
      <template v-for="(item, index) in classifyList" :key="`${item}-${index}`">
        <span class="article-masthead__sep" aria-hidden="true">›</span>
        <a :href="crumbLink(item, index)" class="stack-link no-underline">{{
          item
          }}</a>
      </template>
    </nav>

    <h1 class="article-masthead__title">
      {{ displayTitle }}
      <span v-if="titleTag" class="article-masthead__tag">{{ titleTag }}</span>
    </h1>

    <p class="article-masthead__meta">
      <template v-for="(item, index) in metaItems" :key="`${item.value}-${index}`">
        <span v-if="index > 0" class="article-masthead__dot" aria-hidden="true">·</span>
        <a v-if="item.type === 'author' && item.link" :href="item.link" target="_blank" rel="noopener noreferrer"
          class="article-masthead__author no-underline">
          {{ item.value }}
        </a>
        <span v-else-if="item.type === 'author'" class="article-masthead__author">
          {{ item.value }}
        </span>
        <span v-else class="article-masthead__meta-item">{{ item.value }}</span>
      </template>
    </p>

    <details v-if="showMobileToc" class="article-masthead__toc" :open="tocOpen"
      @toggle="tocOpen = ($event.target as HTMLDetailsElement).open">
      <summary class="article-masthead__toc-toggle">
        <span>本章目录</span>
        <span class="article-masthead__toc-hint">{{ headings.length }} 项</span>
      </summary>
      <nav aria-label="章节概览">
        <ul class="article-masthead__toc-list">
          <li v-for="h in headings" :key="h.id" class="article-masthead__toc-item" :class="{
            'article-masthead__toc-item--h3': h.level === 3,
            'article-masthead__toc-item--active': activeHeadingId === h.id,
          }">
            <a :href="`#${h.id}`" class="article-masthead__toc-link" @click.prevent="scrollToHeading(h.id)">
              {{ h.text }}
            </a>
          </li>
        </ul>
      </nav>
    </details>
  </header>
</template>
