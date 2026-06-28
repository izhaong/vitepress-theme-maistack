export interface VPSidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: VPSidebarItem[];
}

export interface PageMeta {
  title: string;
  link: string;
  date?: string;
  categories?: string[];
  tags?: string[];
  section?: string;
  /** 正文首张图片或 frontmatter 指定封面 */
  cover?: string;
  /** 正文首句中文摘要 */
  excerpt?: string;
}

export interface SiteData {
  rewrites: Record<string, string>;
  sidebars: Record<string, VPSidebarItem[]>;
  catalogues: Record<string, VPSidebarItem[]>;
  pageSectionMap: Record<string, string>;
  pages: PageMeta[];
}
