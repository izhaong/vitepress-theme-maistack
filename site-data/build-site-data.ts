import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import type { PageMeta, SiteData, VPSidebarItem } from "../types/site-data";
import {
  DEFAULT_IGNORE_DIRS,
  type BuildSiteDataOptions,
} from "./options.ts";

export type { PageMeta, SiteData, VPSidebarItem };

type RawSidebarEntry =
  | [string, string, string?, string?]
  | { title: string; collapsable?: boolean; children: RawSidebarEntry[] };

function readTocs(
  docsRoot: string,
  ignoreDirs: ReadonlySet<string>,
): string[] {
  return fs
    .readdirSync(docsRoot)
    .map((name) => path.resolve(docsRoot, name))
    .filter(
      (file) =>
        fs.statSync(file).isDirectory() &&
        !ignoreDirs.has(path.basename(file)) &&
        path.basename(file) !== "_posts",
    );
}

function normalizeLink(permalink?: string, fallback?: string): string {
  if (permalink) {
    const p = permalink.replace(/\/$/, "") || "/";
    return p.startsWith("/") ? p : `/${p}`;
  }
  if (fallback) {
    return fallback.replace(/\.md$/, "").replace(/^\//, "/");
  }
  return "/";
}

function permalinkToTarget(permalink: string): string {
  const p = permalink.replace(/^\//, "").replace(/\/$/, "");
  return p ? `${p}/index.md` : "index.md";
}

function mapTocToSidebar(
  root: string,
  collapsable: boolean,
  prefix = "",
): RawSidebarEntry[] {
  const sidebar: RawSidebarEntry[] = [];
  const files = fs.readdirSync(root);

  for (const filename of files) {
    if (filename === ".DS_Store") continue;

    const file = path.resolve(root, filename);
    const stat = fs.statSync(file);
    const isDir = stat.isDirectory();

    const firstDot = filename.indexOf(".");
    const lastDot = filename.lastIndexOf(".");
    let order = NaN;
    let title = "";
    let type = "";

    if (!isDir && firstDot === lastDot) {
      order = parseInt(filename.slice(0, firstDot), 10);
      title = filename.slice(firstDot + 1, lastDot);
      type = filename.slice(lastDot + 1);
    } else if (isDir) {
      order = parseInt(filename.slice(0, firstDot), 10);
      title = filename.slice(firstDot + 1);
    } else {
      order = parseInt(filename.slice(0, firstDot), 10);
      title = filename.slice(firstDot + 1, lastDot);
      type = filename.slice(lastDot + 1);
    }

    if (Number.isNaN(order) || order < 0) continue;

    if (isDir) {
      sidebar[order] = {
        title,
        collapsable,
        children: mapTocToSidebar(file, collapsable, `${prefix}${filename}/`),
      };
    } else if (type === "md") {
      const contentStr = fs.readFileSync(file, "utf8");
      const { data } = matter(contentStr);
      const permalink = data.permalink as string | undefined;
      const titleTag = data.titleTag as string | undefined;
      if (data.title) title = data.title as string;

      const item: [string, string, string?, string?] = [
        `${prefix}${filename}`,
        title,
        permalink,
      ];
      if (titleTag) item.push(titleTag);
      sidebar[order] = item;
    }
  }

  return sidebar.filter((item) => item != null);
}

function toVitePressSidebar(items: RawSidebarEntry[]): VPSidebarItem[] {
  return items.map((item) => {
    if (Array.isArray(item)) {
      return {
        text: item[1],
        link: normalizeLink(item[2], item[0]),
      };
    }
    return {
      text: item.title,
      collapsed: item.collapsable !== false,
      items: toVitePressSidebar(item.children || []),
    };
  });
}

function walkMdFiles(dir: string, base = ""): string[] {
  const result: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === ".vitepress") continue;
      result.push(...walkMdFiles(full, rel));
    } else if (name.endsWith(".md")) {
      result.push(rel);
    }
  }
  return result;
}

function getSectionKey(
  relPath: string,
  ignoreDirs: ReadonlySet<string>,
): string | undefined {
  const top = relPath.split("/")[0];
  if (ignoreDirs.has(top) || top === "index.md") return undefined;
  if (top.endsWith(".md")) return undefined;
  return top;
}

const MD_IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const HTML_IMG_RE = /<img[^>]+src=["']([^"']+)["']/i;

function normalizeCoverUrl(
  src: string,
  relPath: string,
  docsRoot: string,
): string | undefined {
  const trimmed = src.trim().replace(/^<|>$/g, "");
  if (
    !trimmed ||
    trimmed.startsWith("/Users/") ||
    trimmed.includes("placeholder.png")
  ) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;

  const abs = path.normalize(
    path.join(path.dirname(path.join(docsRoot, relPath)), trimmed),
  );
  const rel = path.relative(docsRoot, abs).replace(/\\/g, "/");
  if (rel.startsWith("..")) return undefined;
  return `/${rel}`;
}

function extractCoverImage(
  content: string,
  data: Record<string, unknown>,
  relPath: string,
  docsRoot: string,
): string | undefined {
  for (const key of ["cover", "coverImg", "thumbnail", "imgUrl", "image"]) {
    const value = data[key];
    if (typeof value === "string") {
      const normalized = normalizeCoverUrl(value, relPath, docsRoot);
      if (normalized) return normalized;
    }
  }

  const mdMatch = content.match(MD_IMAGE_RE);
  if (mdMatch?.[1]) {
    const normalized = normalizeCoverUrl(mdMatch[1], relPath, docsRoot);
    if (normalized) return normalized;
  }

  const htmlMatch = content.match(HTML_IMG_RE);
  if (htmlMatch?.[1]) {
    const normalized = normalizeCoverUrl(htmlMatch[1], relPath, docsRoot);
    if (normalized) return normalized;
  }

  return undefined;
}

function stripMarkdownForExcerpt(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\|.+\|$/gm, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\*\*[^*]+\*\*\s*$/gm, " ")
    .replace(/[*_~|]/g, "")
    .replace(/\u200b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isExcerptNoise(text: string): boolean {
  if (
    /Category|Difficulty|Likes|Dislikes|Related Topics|Companies|algorithms/i.test(
      text,
    )
  ) {
    return true;
  }
  if (/^https?:\/\//i.test(text)) return true;
  if (/^输入：|^输出：|^plain$|^示例\s*\d/i.test(text)) return true;
  const cn = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cn < 6) return true;
  if (text.length > 80 && cn / text.length < 0.12) return true;
  return false;
}

function normalizeExcerptText(text: string): string {
  return text
    .replace(/\b(Category|Difficulty|Likes|Dislikes|Tags|Companies)\b/gi, " ")
    .replace(
      /题目\s+[\u4e00-\u9fffA-Za-z0-9]+\s+(简单|中等|困难|Hard|Easy|Medium)/gi,
      " ",
    )
    .replace(/相关标签|相关企业|已解答|提示/g, " ")
    .replace(/algorithms/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimExcerptLead(text: string): string {
  const idx = text.search(
    /(?:给定|本文|介绍|首先|最近|这篇|本文将|本文主要|基本)/,
  );
  if (idx > 0) return text.slice(idx).trim();
  return text.trim();
}

const EXCERPT_MAX_LEN = 500;

function truncateExcerpt(text: string, max = EXCERPT_MAX_LEN): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function findExcerptStart(text: string): number {
  const leadIdx = text.search(
    /(?:给定|本文|介绍|在|当|首先|最近|这篇|本文将|本文主要|基本)/,
  );
  if (leadIdx >= 0) return leadIdx;

  const sentences = text.split(/(?<=[。！？；.!?;])\s*/);
  let searchFrom = 0;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!isExcerptNoise(trimmed)) {
      const idx = text.indexOf(trimmed, searchFrom);
      if (idx >= 0) return idx;
    }
    searchFrom += sentence.length;
  }

  const cnIdx = text.search(/[\u4e00-\u9fff]/);
  return cnIdx >= 0 ? cnIdx : 0;
}

function clipExcerptBoilerplate(text: string): string {
  const stopPatterns = [
    /\s*n\s*==/,
    /\s*\d+\s*<=/,
    /\s*-{3,}/,
    /\bDiscussion\b/i,
    /\bSolution\b/i,
    /\bCompanies\b/i,
    /\bRelated Topics\b/i,
    /\bDifficulty\b/i,
    /\bCategory\b/i,
  ];
  let end = text.length;
  for (const pat of stopPatterns) {
    const m = pat.exec(text);
    if (m && m.index > 0 && m.index < end) end = m.index;
  }
  return text.slice(0, end).trim();
}

function pickExcerptText(text: string): string | undefined {
  const normalized = normalizeExcerptText(text);
  if (!/[\u4e00-\u9fff]/.test(normalized)) return undefined;

  let excerpt = clipExcerptBoilerplate(
    trimExcerptLead(normalized.slice(findExcerptStart(normalized))),
  ).trim();
  if (
    !excerpt ||
    isExcerptNoise(excerpt.slice(0, Math.min(80, excerpt.length)))
  ) {
    return undefined;
  }

  return truncateExcerpt(excerpt);
}

function extractExcerpt(
  content: string,
  data: Record<string, unknown>,
): string | undefined {
  for (const key of ["description", "excerpt", "summary"]) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return truncateExcerpt(value.trim());
    }
  }

  const text = stripMarkdownForExcerpt(content);
  if (!/[\u4e00-\u9fff]/.test(text)) return undefined;

  return pickExcerptText(text);
}

/** 扫描 docs 目录，生成麦栈 `SiteData`。详见 DOCS_STRUCTURE.md */
export function buildSiteData(
  docsRoot: string,
  options: BuildSiteDataOptions = {},
): SiteData {
  const ignoreDirs = new Set(options.ignoreDirs ?? DEFAULT_IGNORE_DIRS);

  const rewrites: Record<string, string> = {};
  const sidebars: Record<string, VPSidebarItem[]> = {};
  const catalogues: Record<string, VPSidebarItem[]> = {};
  const pageSectionMap: Record<string, string> = {};
  const pages: PageMeta[] = [];

  for (const toc of readTocs(docsRoot, ignoreDirs)) {
    const sectionKey = path.basename(toc);
    const raw = mapTocToSidebar(toc, true);
    if (raw.length) {
      sidebars[sectionKey] = toVitePressSidebar(raw);
      catalogues[sectionKey] = sidebars[sectionKey];
    }
  }

  for (const rel of walkMdFiles(docsRoot)) {
    const abs = path.join(docsRoot, rel);
    const content = fs.readFileSync(abs, "utf8");
    const { data, content: body } = matter(content);
    const permalink = data.permalink as string | undefined;

    if (permalink && rel !== "index.md") {
      rewrites[rel] = permalinkToTarget(permalink);
    }

    const link = normalizeLink(permalink, rel);
    const section = getSectionKey(rel, ignoreDirs);

    if (section && link !== "/") {
      pageSectionMap[link] = section;
      pageSectionMap[`${link}/`] = section;
    }

    if (data.article === false) continue;
    if (data.home || data.categoriesPage || data.tagsPage || data.archivesPage)
      continue;
    if (rel.startsWith("目录页/") || rel.startsWith("@pages/")) continue;

    pages.push({
      title: (data.title as string) || path.basename(rel, ".md"),
      link,
      date: data.date as string | undefined,
      categories: data.categories as string[] | undefined,
      tags: (data.tags as string[] | undefined)?.filter(Boolean),
      section,
      cover: extractCoverImage(body, data as Record<string, unknown>, rel, docsRoot),
      excerpt: extractExcerpt(body, data as Record<string, unknown>),
    });
  }

  pages.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  return { rewrites, sidebars, catalogues, pageSectionMap, pages };
}
