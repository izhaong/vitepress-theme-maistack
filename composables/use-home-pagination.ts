import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { inBrowser, useRoute } from "vitepress";
import { getSiteData } from "../site-data-store";
import { homePageHref } from "../utils/taxonomy";

function readPageParam(search: string): number {
  const raw = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  ).get("p");
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function useHomePagination(perPageInput: MaybeRefOrGetter<number> = 10) {
  const route = useRoute();
  const perPage = computed(() => toValue(perPageInput));

  const currentPage = computed(() => {
    const search =
      route.query ||
      (inBrowser && typeof location !== "undefined" ? location.search : "");
    return readPageParam(search);
  });

  const total = computed(() => getSiteData().pages.length);
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / perPage.value)),
  );

  const posts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return getSiteData().pages.slice(start, start + perPage.value);
  });

  const showBanner = computed(() => currentPage.value === 1);

  function hrefFor(page: number): string {
    return homePageHref(page);
  }

  return {
    currentPage,
    total,
    totalPages,
    posts,
    showBanner,
    hrefFor,
  };
}
