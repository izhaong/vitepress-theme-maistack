import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSiteData } from "./build-site-data.ts";
import type { SiteData } from "../types/site-data";
import type { ResolveSiteDataOptions } from "./options.ts";

export interface ResolveSiteDataResult {
  siteData: SiteData;
  vitepressDir: string;
  docsRoot: string;
  dataFile: string;
}

/**
 * 在 `config.mts` 中调用：扫描 docs、写入 `data/site-data.json`、返回 `siteData`。
 *
 * @param configFileUrl 传入 `import.meta.url`（config.mts 所在路径）
 */
export function resolveMaistackSiteData(
  configFileUrl: string | URL,
  options: ResolveSiteDataOptions = {},
): ResolveSiteDataResult {
  const vitepressDir = path.dirname(fileURLToPath(configFileUrl));
  const docsRoot = options.docsRoot ?? path.resolve(vitepressDir, "..");
  const dataDir = options.dataDir ?? path.resolve(vitepressDir, "data");
  const dataFile = path.resolve(dataDir, "site-data.json");

  const siteData = buildSiteData(docsRoot, options);

  if (options.writeJson !== false) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(siteData));
  }

  return { siteData, vitepressDir, docsRoot, dataFile };
}
