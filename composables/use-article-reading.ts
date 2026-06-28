import { computed, nextTick, onMounted, ref, shallowRef, watch } from "vue";
import { onContentUpdated, useData, useRoute } from "vitepress";
import { useWindowScroll, useWindowSize } from "@vueuse/core";
import {
  collectArticleHeadings,
  computeReadingStats,
  type ArticleHeading,
  type ReadingStats,
} from "../utils/reading-stats";

const DOC_SELECTOR = ".maistack-article .vp-doc";
const CONTENT_SELECTOR = ".maistack-article .VPDoc .content-container";

function readNavHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--vp-nav-height",
  );
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 64;
}

function getDocElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>(DOC_SELECTOR);
}

function getContentElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>(CONTENT_SELECTOR);
}

export function useArticleReading() {
  const route = useRoute();
  const { frontmatter } = useData();
  const { y: scrollY } = useWindowScroll();
  const { height: windowHeight } = useWindowSize();

  const stats = shallowRef<ReadingStats>({ wordCount: 0, minutes: 1 });
  const headings = shallowRef<ArticleHeading[]>([]);
  const progress = ref(0);
  const activeHeadingId = ref("");

  const minutes = computed(() => {
    const fm = frontmatter.value.readingTime;
    if (typeof fm === "number" && fm > 0) return fm;
    if (typeof fm === "string") {
      const parsed = parseInt(fm, 10);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return stats.value.minutes;
  });

  const sectionCount = computed(
    () => headings.value.filter((h) => h.level === 2).length,
  );

  function measureContent() {
    const doc = getDocElement();
    if (!doc) {
      stats.value = { wordCount: 0, minutes: 1 };
      headings.value = [];
      return;
    }

    stats.value = computeReadingStats(doc.textContent ?? "");
    headings.value = collectArticleHeadings(doc);
    updateProgress();
    syncActiveHeading();
  }

  function updateProgress() {
    const content = getContentElement() ?? getDocElement();
    if (!content) {
      progress.value = 0;
      return;
    }

    const navH = readNavHeight();
    const viewH = windowHeight.value || window.innerHeight;
    const scrollTop = window.scrollY;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - viewH,
    );

    const contentTop = content.getBoundingClientRect().top + scrollTop;
    const contentHeight = content.scrollHeight;
    const start = contentTop - navH - 24;
    const end = contentTop + contentHeight - viewH;
    const range = Math.max(1, end - start);
    const current = scrollTop - start;

    let pct = (current / range) * 100;
    if (scrollTop >= maxScroll - 1) pct = 100;

    progress.value = Math.min(100, Math.max(0, Math.round(pct)));
  }

  function syncActiveHeading() {
    const list = headings.value;
    if (!list.length) {
      activeHeadingId.value = "";
      return;
    }

    const offset = readNavHeight() + 48;
    let current = list[0].id;
    for (const h of list) {
      const el = document.getElementById(h.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - offset <= 8) {
        current = h.id;
      }
    }
    activeHeadingId.value = current;
  }

  watch([scrollY, windowHeight], () => {
    updateProgress();
    syncActiveHeading();
  });

  watch(
    () => route.path,
    () => {
      progress.value = 0;
      activeHeadingId.value = "";
      nextTick(measureContent);
    },
  );

  onContentUpdated(() => {
    nextTick(measureContent);
  });

  onMounted(() => {
    nextTick(() => {
      measureContent();
      requestAnimationFrame(measureContent);
    });
  });

  return {
    stats,
    minutes,
    sectionCount,
    headings,
    progress,
    activeHeadingId,
    measureContent,
  };
}
