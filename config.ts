import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { ThemeConfig } from "./types/theme-config";

const __packageDir = dirname(fileURLToPath(import.meta.url));
const layoutPath = resolve(__packageDir, "./composables/layout.ts");
const prevNextPath = resolve(__packageDir, "./composables/prev-next.ts");

function vitepressThemeComposablesAlias() {
  return {
    name: "vitepress-theme-maistack-composables-alias",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (
        id.includes("theme-default/composables/layout") &&
        !id.includes("vitepress-theme-maistack")
      ) {
        return layoutPath;
      }
      if (
        id.includes("theme-default/composables/prev-next") &&
        !id.includes("vitepress-theme-maistack")
      ) {
        return prevNextPath;
      }
    },
  };
}

export default defineConfig<ThemeConfig>({
  markdown: {
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    config(md) {
      md.set({ html: false });
      const defaultText =
        md.renderer.rules.text ||
        ((tokens, idx, options, env, self) =>
          self.renderToken(tokens, idx, options));
      md.renderer.rules.text = (tokens, idx, options, env, self) => {
        tokens[idx].content = tokens[idx].content.replace(
          /<(?![a-zA-Z!/])/g,
          "&lt;",
        );
        return defaultText(tokens, idx, options, env, self);
      };
    },
  },
  vite: {
    plugins: [tailwindcss(), vitepressThemeComposablesAlias()],
    resolve: {
      alias: [
        {
          find: /vitepress\/dist\/client\/theme-default\/composables\/layout(\.js)?$/,
          replacement: layoutPath,
        },
        {
          find: /vitepress\/dist\/client\/theme-default\/composables\/prev-next(\.js)?$/,
          replacement: prevNextPath,
        },
      ],
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => /^[A-Z]/.test(tag) || tag.includes("-"),
        },
      },
    },
  },
});
export type { ThemeConfig } from "./types/theme-config";
