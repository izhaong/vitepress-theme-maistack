/** 麦栈默认忽略的 docs 顶层目录（不参与侧栏扫描与分区聚合） */
export const DEFAULT_IGNORE_DIRS = [
  ".vitepress",
  "@pages",
  "目录页",
  "90.hidden",
] as const;

export interface BuildSiteDataOptions {
  /** 扫描 Markdown 时忽略的顶层目录名，默认见 {@link DEFAULT_IGNORE_DIRS} */
  ignoreDirs?: readonly string[];
}

export interface ResolveSiteDataOptions extends BuildSiteDataOptions {
  /** docs 根目录；默认 `<.vitepress>/..` */
  docsRoot?: string;
  /** 写入 `site-data.json` 的目录；默认 `<.vitepress>/data` */
  dataDir?: string;
  /** 是否写入 `site-data.json`，默认 `true` */
  writeJson?: boolean;
}
