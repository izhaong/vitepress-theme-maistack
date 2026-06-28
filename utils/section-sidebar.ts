import type { VPSidebarItem } from "../types/site-data";
import { getSiteData } from "../site-data-store";

export function sectionFromFilePath(filePath?: string): string | undefined {
  if (!filePath) return undefined;
  const top = filePath.split("/")[0];
  return getSiteData().sidebars[top] ? top : undefined;
}

export function resolveSectionSidebar(
  routePath: string,
  filePath?: string,
): VPSidebarItem[] {
  const siteData = getSiteData();
  const fromFile = sectionFromFilePath(filePath);
  if (fromFile) {
    return siteData.sidebars[fromFile];
  }

  const normalized = routePath.replace(/\/$/, "") || "/";
  const section =
    siteData.pageSectionMap[normalized] ||
    siteData.pageSectionMap[`${normalized}/`];
  if (section && siteData.sidebars[section]) {
    return siteData.sidebars[section];
  }
  return [];
}

/** 与 permalink / cleanUrls 对齐，避免 index.md 与无尾斜杠 link 对不上 */
export function normalizeDocPath(path: string): string {
  const p = decodeURI(path)
    .replace(/[?#].*$/, "")
    .replace(/(?:(^|\/)index)?\.(?:md|html)$/i, "$1")
    .replace(/\/$/, "");
  return p ? (p.startsWith("/") ? p : `/${p}`) : "/";
}

export function flattenSidebarLinks(items: VPSidebarItem[]) {
  const links: Array<{ text: string; link: string }> = [];
  for (const item of items) {
    if (item.items?.length) {
      links.push(...flattenSidebarLinks(item.items));
    } else if (item.link) {
      links.push({ text: item.text, link: item.link });
    }
  }
  return links;
}

export function findSidebarNeighbors(
  routePath: string,
  filePath?: string,
): {
  prev?: { text: string; link: string };
  next?: { text: string; link: string };
} {
  const sidebar = resolveSectionSidebar(routePath, filePath);
  const candidates = flattenSidebarLinks(sidebar);
  const current = normalizeDocPath(routePath);
  const index = candidates.findIndex(
    (item) => normalizeDocPath(item.link) === current,
  );

  if (index < 0) {
    return {};
  }

  return {
    prev: index > 0 ? candidates[index - 1] : undefined,
    next: index < candidates.length - 1 ? candidates[index + 1] : undefined,
  };
}
