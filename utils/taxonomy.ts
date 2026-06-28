import type { PageMeta } from "../types/site-data";

export interface TaxonomyEntry {
  key: string;
  count: number;
}

export function buildCategories(pages: PageMeta[]): TaxonomyEntry[] {
  const map = new Map<string, number>();
  for (const page of pages) {
    for (const cat of page.categories?.length ? page.categories : ["未分类"]) {
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "zh-CN"));
}

export function buildTags(pages: PageMeta[]): TaxonomyEntry[] {
  const map = new Map<string, number>();
  for (const page of pages) {
    for (const tag of page.tags ?? []) {
      if (!tag) continue;
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "zh-CN"));
}

export function formatPostDate(date?: string): string {
  if (!date) return "";
  return String(date).split(" ")[0].slice(0, 10);
}

export function categoryHref(name: string): string {
  return `/categories/?category=${encodeURIComponent(name)}`;
}

export function tagHref(name: string): string {
  return `/tags/?tag=${encodeURIComponent(name)}`;
}

export function homePageHref(page: number): string {
  return page <= 1 ? "/" : `/?p=${page}`;
}
