<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useData, useRoute } from "vitepress";

const { title, isDark } = useData();
const route = useRoute();
const root = ref<HTMLElement | null>(null);

function loadStyle(href: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

onMounted(async () => {
  if (!root.value) return;

  try {
    await loadStyle("https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css");
    await loadScript("https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js");
    const Gitalk = (
      window as typeof window & {
        Gitalk?: new (options: Record<string, unknown>) => {
          render: (el: HTMLElement) => void;
        };
      }
    ).Gitalk;
    if (!Gitalk) return;

    const id = String(route.path).slice(-16).replace(/\W/g, "") || "default";
    const gitalk = new Gitalk({
      clientID: "8f72bf936f4ec9b1ebc6",
      clientSecret: "eb8b93c48ba8f81aa7c1cfccc11e32b2a689a827",
      repo: "zh04.com-gitalk",
      owner: "izhaong",
      admin: ["izhaong"],
      id,
      title: `「评论」${title.value}`,
      labels: ["Gitalk", "Comment"],
      body: `页面：${window.location.origin}${route.path}`,
      theme: isDark.value ? "dark" : "light",
    });
    gitalk.render(root.value);
  } catch {
    // 评论加载失败时不阻塞页面
  }
});
</script>

<template>
  <section v-reveal class="article-comments mt-10 border-t border-stone-200/80 pt-8 opacity-0 dark:border-stone-700/55"
    aria-labelledby="comments-heading">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 id="comments-heading" class="font-serif text-xl font-semibold text-stone-900 dark:text-stone-50">
          讨论区
        </h2>
        <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">
          欢迎留下想法与补充
        </p>
      </div>
      <span class="hidden font-display text-[10px] uppercase tracking-[0.16em] text-brand-600/70 sm:inline">
        Gitalk
      </span>
    </div>
    <div ref="root" id="gitalk-container" class="gitalk-wrap" />
  </section>
</template>

<style scoped>
.gitalk-wrap :deep(.gt-container) {
  border: none;
  font-family: inherit;
}

.gitalk-wrap :deep(.gt-header-textarea) {
  border-radius: 0.75rem;
  border: 1px solid var(--color-line, #e7e5e4);
  background: rgba(250, 250, 249, 0.8);
}

.dark .gitalk-wrap :deep(.gt-header-textarea) {
  border-color: #57534e;
  background: rgba(41, 37, 36, 0.5);
}

.gitalk-wrap :deep(.gt-btn) {
  border-radius: 0.5rem;
  border: 1px solid rgba(var(--wheat-cyan-rgb), 0.3);
  background: var(--wheat-cyan);
  color: #1c1917;
  transition: background-color 0.2s ease;
}

.gitalk-wrap :deep(.gt-btn:hover) {
  background: #0891b2;
}

.dark .gitalk-wrap :deep(.gt-btn) {
  background: rgba(var(--wheat-cyan-rgb), 0.9);
}

.dark .gitalk-wrap :deep(.gt-btn:hover) {
  background: #22d3ee;
}
</style>
