import type { VPSidebarItem } from "../types/site-data";

/** 统计目录树中的文章（叶子链接）数量 */
export function countCatalogueArticles(items: VPSidebarItem[]): number {
  return items.reduce((total, item) => {
    if (item.items?.length) return total + countCatalogueArticles(item.items);
    return item.link ? total + 1 : total;
  }, 0);
}

/** 顶层分组数量（含单独成章的叶子项） */
export function countCatalogueSections(items: VPSidebarItem[]): number {
  return items.length;
}

/** 01 / 02 序号，depth 决定宽度 */
export function formatCatalogueIndex(index: number, depth = 0): string {
  const n = index + 1;
  if (depth >= 2) return String(n);
  return n < 10 ? `0${n}` : String(n);
}

export function isCatalogueGroup(item: VPSidebarItem): boolean {
  return !!(item.items && item.items.length);
}

/** 一级章节锚点 id（左侧目录 + 右侧内容联动） */
export function catalogueSectionId(index: number): string {
  return `cat-section-${index}`;
}

export function catalogueNavLabel(item: VPSidebarItem): string {
  return item.text;
}
