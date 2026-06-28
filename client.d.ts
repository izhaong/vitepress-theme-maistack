import type { ThemeConfig as MaistackThemeConfig } from "./types/theme-config";

declare module "vitepress" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThemeConfig extends MaistackThemeConfig {}
}
