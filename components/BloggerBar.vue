<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { runBloggerBarMotion, type MotionCleanup } from "../composables/motion";

const root = ref<HTMLElement | null>(null);
let motionCleanup: MotionCleanup = () => {};

onMounted(() => {
  if (root.value) motionCleanup = runBloggerBarMotion(root.value);
});

onBeforeUnmount(() => motionCleanup());
</script>

<template>
  <div
    ref="root"
    class="relative mb-5 hidden overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-50/90 via-white/80 to-accent-50/50 p-4 opacity-0 shadow-sm backdrop-blur-md md:block dark:from-brand-500/10 dark:via-stone-900/80 dark:to-accent-500/10"
  >
    <div
      class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-400/20 blur-2xl motion-float-soft"
      aria-hidden="true"
    />
    <div class="relative flex items-start gap-3">
      <img
        src="https://cdn.jsdelivr.net/gh/izhaong/izhaong.com-oss/site-data/avatar/avatar-wx.jpg"
        alt="仲灏"
        class="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-md ring-2 ring-white/80 dark:ring-stone-700"
      />
      <div class="min-w-0 flex-1">
        <p class="font-display text-[10px] uppercase tracking-[0.2em] text-brand-600/80">
          Author
        </p>
        <h3 class="font-serif text-base font-semibold text-stone-900 dark:text-stone-50">
          仲灏
        </h3>
        <p class="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          诚意 · 正心 · 格物 · 致知
        </p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <a
            href="mailto:izhaong@outlook.com"
            title="发邮件"
            class="stack-chip cursor-pointer px-2.5 py-0.5 text-[11px] hover:bg-brand-100"
          >
            邮件
          </a>
          <a
            href="https://github.com/izhaong"
            title="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            class="stack-chip cursor-pointer px-2.5 py-0.5 text-[11px] hover:bg-brand-100"
          >
            GitHub
          </a>
          <a
            href="https://music.163.com/#/playlist?id=755597173"
            title="听音乐"
            target="_blank"
            rel="noopener noreferrer"
            class="stack-chip cursor-pointer px-2.5 py-0.5 text-[11px] hover:bg-brand-100"
          >
            ♫ 音乐
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
