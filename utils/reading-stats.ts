export type ReadingStats = {
  /** 正文字数（中文按字、英文按词） */
  wordCount: number;
  /** 预估阅读分钟，至少 1 分钟 */
  minutes: number;
};

export type ArticleHeading = {
  level: number;
  text: string;
  id: string;
};

/** 中文 ~400 字/分钟，英文 ~200 词/分钟 */
export function computeReadingStats(rawText: string): ReadingStats {
  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text) return { wordCount: 0, minutes: 1 };

  const cjkMatches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  const cjkCount = cjkMatches?.length ?? 0;
  const latinPart = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, " ");
  const latinWords = latinPart
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;

  const wordCount = cjkCount + latinWords;
  const minutes = Math.max(1, Math.ceil(cjkCount / 400 + latinWords / 200));

  return { wordCount, minutes };
}

export function collectArticleHeadings(root: ParentNode): ArticleHeading[] {
  return [...root.querySelectorAll<HTMLElement>("h2, h3, h4, h5, h6")]
    .map((el) => ({
      level: Number(el.tagName.slice(1)),
      text: el.textContent?.trim() ?? "",
      id: el.id,
    }))
    .filter((h) => h.text && h.id);
}

export function formatWordCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)} 万`;
  return count.toLocaleString("zh-CN");
}
