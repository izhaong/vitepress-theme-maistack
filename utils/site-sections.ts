/** 站点一级分区：始终出现在 navbar，用于聚焦当前所在知识库 */
export const SITE_SECTIONS = [
  { name: "大前端", link: "/web/", dirPrefix: "10.大前端" },
  { name: "后端&运维", link: "/backend-opt/", dirPrefix: "20.后端&运维" },
  { name: "其他技术", link: "/other-tech/", dirPrefix: "30.其他技术" },
  { name: "生活", link: "/tech-live/", dirPrefix: "40.生活" },
  { name: "收藏", link: "/favorite/", dirPrefix: "60.收藏" },
] as const;

export function resolveSiteSectionLink(
  routePath: string,
  filePath?: string,
): string | undefined {
  if (filePath) {
    const match = SITE_SECTIONS.find(
      (s) =>
        filePath === s.dirPrefix ||
        filePath.startsWith(`${s.dirPrefix}/`) ||
        filePath.startsWith(`${s.dirPrefix}\\`),
    );
    if (match) return match.link;
  }

  const path = routePath.replace(/\/$/, "") || "/";
  for (const section of SITE_SECTIONS) {
    const base = section.link.replace(/\/$/, "");
    if (path === base || path.startsWith(`${base}/`)) {
      return section.link;
    }
  }
  return undefined;
}
