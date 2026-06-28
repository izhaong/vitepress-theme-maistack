<script setup lang="ts">
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { inBrowser, useData, useRoute } from "vitepress";
import HeroParticles from "./HeroParticles.vue";
import HomePostList from "./HomePostList.vue";
import HomePagination from "./HomePagination.vue";
import HomeCategoriesBar from "./HomeCategoriesBar.vue";
import HomeTagsBar from "./HomeTagsBar.vue";
import BloggerBar from "./BloggerBar.vue";
import {
  runHomeHeroMotion,
  showHomeHeroInstant,
  type MotionCleanup,
} from "../composables/motion";
import { useHomePagination } from "../composables/use-home-pagination";

type HomeHero = {
  name?: string;
  text?: string;
  tagline?: string;
  image?: string | { src?: string; alt?: string };
  actions?: Array<{ theme?: string; text: string; link: string }>;
};

const { frontmatter } = useData();
const route = useRoute();
const perPage = computed(() => Number(frontmatter.value.perPage) || 10);
const hideRightBar = computed(() => !!frontmatter.value.hideRightBar);
const { currentPage, totalPages, posts, showBanner, hrefFor } =
  useHomePagination(perPage);
const heroRoot = ref<HTMLElement | null>(null);
let motionCleanup: MotionCleanup = () => { };
let motionFallbackTimer: ReturnType<typeof setTimeout> | undefined;

function clearMotionFallback() {
  if (motionFallbackTimer) clearTimeout(motionFallbackTimer);
  motionFallbackTimer = undefined;
}

function initHeroMotion() {
  motionCleanup();
  clearMotionFallback();
  if (!inBrowser || !heroRoot.value || !showBanner.value) return;

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!heroRoot.value || !showBanner.value) return;
        motionCleanup = runHomeHeroMotion(heroRoot.value);
        motionFallbackTimer = setTimeout(() => {
          if (heroRoot.value) showHomeHeroInstant(heroRoot.value);
        }, 2200);
      });
    });
  });
}

const hero = computed(() => frontmatter.value.hero as HomeHero | undefined);
const heroParts = computed(() => {
  if (hero.value?.name || hero.value?.text) {
    return {
      lead: hero.value?.name?.trim() || "仲灏",
      accent: hero.value?.text?.trim() || "小栈",
    };
  }
  const legacy = (frontmatter.value.heroText as string) || "";
  if (legacy) {
    const i = legacy.indexOf("·");
    if (i === -1) return { lead: legacy.trim(), accent: "" };
    return {
      lead: legacy.slice(0, i).trim(),
      accent: legacy.slice(i + 1).trim(),
    };
  }
  return { lead: "仲灏", accent: "小栈" };
});
const tagline = computed(
  () =>
    hero.value?.tagline?.trim() ||
    ((frontmatter.value.tagline as string) || "").trim(),
);
const bannerBg = computed(() => {
  const custom = frontmatter.value.bannerBg as string | undefined;
  if (custom) return custom;
  const image = hero.value?.image;
  if (typeof image === "string") return image;
  if (image && typeof image === "object") return image.src;
  return undefined;
});
const features = computed(
  () =>
    (frontmatter.value.features as Array<{
      title: string;
      details: string;
      link?: string;
      imgUrl?: string;
    }>) || []
);

const heroBg = computed(() => {
  if (!bannerBg.value) return {};
  return {
    backgroundImage: `linear-gradient(105deg, rgba(12,10,9,0.88) 0%, rgba(12,10,9,0.55) 45%, rgba(12,10,9,0.75) 100%), url(${bannerBg.value})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});

const cardAccent = [
  "from-brand-400/20 to-brand-500/5",
  "from-accent-400/20 to-accent-500/5",
  "from-brand-400/15 to-accent-400/10",
];

const HOME_NAV_SOLID = "data-home-nav-solid";

function syncHomeNavSolid() {
  if (!inBrowser) return;
  const solid = !showBanner.value || window.scrollY > 360;
  document.documentElement.toggleAttribute(HOME_NAV_SOLID, solid);
}

onMounted(() => {
  initHeroMotion();
  syncHomeNavSolid();
  window.addEventListener("scroll", syncHomeNavSolid, { passive: true });
});

onActivated(() => {
  initHeroMotion();
  syncHomeNavSolid();
});

watch(
  () => route.path,
  () => {
    initHeroMotion();
    syncHomeNavSolid();
  },
);

watch(showBanner, (banner) => {
  if (banner) initHeroMotion();
  syncHomeNavSolid();
});

watch(currentPage, (page, prev) => {
  if (!inBrowser || page === prev) return;
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    syncHomeNavSolid();
  });
});

onBeforeUnmount(() => {
  motionCleanup();
  clearMotionFallback();
  if (inBrowser) {
    window.removeEventListener("scroll", syncHomeNavSolid);
    document.documentElement.removeAttribute(HOME_NAV_SOLID);
  }
});
</script>

<template>
  <div ref="heroRoot" class="home-page mb-0" :class="showBanner ? 'home-page--banner' : 'home-page--list'">
    <section v-if="showBanner" class="home-hero stack-dot-grid relative overflow-hidden px-6 pb-16 md:px-10 md:pb-20"
      :style="heroBg" :class="bannerBg ? 'text-white' : 'bg-stone-900 text-white'">
      <HeroParticles />

      <div data-hero-blob
        class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden="true" />
      <div data-hero-blob
        class="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-accent-400/18 blur-3xl"
        aria-hidden="true" />
      <div data-hero-blob
        class="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl"
        aria-hidden="true" />

      <div class="relative z-[1] mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
        <header class="text-left">
          <p data-hero-chip data-motion class="stack-chip mb-5 border-white/20 bg-white/10 text-brand-100 opacity-0">
            全栈 · 笔记 · 沉淀
          </p>
          <h1 id="main-title" data-hero-title data-motion
            class="font-serif text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight opacity-0">
            {{ heroParts.lead }}
            <span v-if="heroParts.accent" class="block md:ml-2 md:inline">
              <span class="stack-gradient-text motion-shimmer">{{ heroParts.accent }}</span>
            </span>
          </h1>
          <p v-if="tagline" data-hero-tagline data-motion
            class="mt-5 max-w-lg text-base leading-relaxed text-stone-200/90 opacity-0 md:text-lg">
            {{ tagline }}
          </p>
          <div data-hero-actions class="mt-8 flex flex-wrap gap-3">
            <a href="/web/" data-motion
              class="cursor-pointer rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-stone-900 opacity-0 shadow-lg shadow-accent-500/30 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              开始阅读
            </a>
            <a href="/archives/" data-motion
              class="cursor-pointer rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white opacity-0 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              全部归档
            </a>
          </div>
        </header>

        <div data-hero-aside data-motion
          class="hidden rounded-2xl border border-white/15 bg-white/5 p-5 opacity-0 backdrop-blur-md lg:block">
          <p class="font-display text-xs uppercase tracking-[0.25em] text-accent-200/90">
            Stack / 2026
          </p>
          <ul class="mt-4 space-y-3 text-sm text-stone-200/90">
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-brand-400 motion-pulse-dot" />
              结构化知识库 + 随笔博客
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-accent-400 motion-pulse-dot [animation-delay:0.4s]" />
              按文件名序号组织章节
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-brand-300 motion-pulse-dot [animation-delay:0.8s]" />
              前端 · 后端 · 生活笔记
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="features.length && showBanner" data-hero-features
      class="relative -mt-8 px-6 pb-4 md:-mt-10 md:px-10">
      <div class="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a v-for="(feature, index) in features" :key="index" data-feature-card :href="feature.link || '#'"
          class="stack-card group cursor-pointer no-underline opacity-0"
          :class="index === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-1' : ''">
          <div
            class="pointer-events-none absolute -right-4 -top-6 font-display text-7xl font-bold text-stone-200/80 transition-colors group-hover:text-brand-500/20 dark:text-stone-700/80"
            aria-hidden="true">
            0{{ index + 1 }}
          </div>
          <div
            class="mb-4 inline-flex rounded-xl bg-gradient-to-br p-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            :class="cardAccent[index % cardAccent.length]">
            <img v-if="feature.imgUrl" :src="feature.imgUrl" :alt="feature.title" class="h-11 w-11 object-contain" />
          </div>
          <h2
            class="font-serif text-xl font-semibold text-stone-900 transition-colors group-hover:text-brand-700 dark:text-stone-50">
            {{ feature.title }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {{ feature.details }}
          </p>
          <span
            class="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-600 opacity-80 transition-all group-hover:gap-2 group-hover:opacity-100">
            Explore
            <span aria-hidden="true" class="motion-arrow-nudge inline-block">→</span>
          </span>
        </a>
      </div>
    </section>

    <section class="home-main px-6 pb-16 md:px-10 scroll-mt-[calc(var(--vp-nav-height)+0.75rem)]"
      :class="showBanner ? 'pt-8 md:pt-10' : 'pt-0'">
      <div class="mx-auto grid max-w-6xl gap-8" :class="hideRightBar ? '' : 'lg:grid-cols-[minmax(0,1fr)_17.5rem]'">
        <div class="min-w-0">
          <HomePostList :posts="posts" />
          <HomePagination :current-page="currentPage" :total-pages="totalPages" :href-for="hrefFor" />
        </div>

        <aside v-if="!hideRightBar" class="home-aside">
          <BloggerBar class="home-aside__blogger" />
          <div class="home-aside__sticky">
            <HomeCategoriesBar :limit="12" />
            <HomeTagsBar :limit="24" />
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
