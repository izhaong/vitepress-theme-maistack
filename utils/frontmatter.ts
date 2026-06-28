/**
 * 本主题自定义首页标记。
 * 勿用 VitePress 的 `layout: home`——会走默认 VPHome，自定义 HomePage 不会渲染。
 */
export function isHomeFrontmatter(data: Record<string, unknown>): boolean {
  return data.isHome === true;
}

/** 本主题 Catalogue 目录页 */
export function isCatalogueFrontmatter(data: Record<string, unknown>): boolean {
  const pc = data.pageComponent as { name?: string } | undefined;
  return pc?.name === "Catalogue";
}

/** 分类 / 标签 / 归档索引页 */
export function isIndexSpecialPage(data: Record<string, unknown>): boolean {
  return !!(data.categoriesPage || data.tagsPage || data.archivesPage);
}

/** 非文章页（不参与首页列表、不走文章布局） */
export function isNonArticlePage(data: Record<string, unknown>): boolean {
  return (
    data.article === false ||
    isHomeFrontmatter(data) ||
    isIndexSpecialPage(data) ||
    isCatalogueFrontmatter(data)
  );
}
