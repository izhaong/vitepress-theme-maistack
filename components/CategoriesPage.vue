<script setup lang="ts">
import { computed } from 'vue'
import { getSiteData } from '../site-data-store'
import type { PageMeta } from '../types/site-data'

const grouped = computed(() => {
  const map = new Map<string, PageMeta[]>()
  for (const page of getSiteData().pages) {
    for (const cat of page.categories || ['未分类']) {
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(page)
    }
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'))
})
</script>

<template>
  <div class="pb-6">
    <header v-reveal class="mb-8">
      <p class="font-display text-xs uppercase tracking-[0.25em] text-brand-600/80">Index</p>
      <h1 class="stack-section-title mt-1">分类</h1>
    </header>
    <section
      v-for="[cat, pages] in grouped"
      :key="cat"
      v-reveal="{ delay: 80 }"
      class="stack-meta-card mb-5 border-t-4 border-t-brand-500/60 opacity-0"
    >
      <h2 class="flex items-baseline gap-2 font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
        {{ cat }}
        <span class="font-sans text-sm font-normal text-stone-400">({{ pages.length }})</span>
      </h2>
      <ul class="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
        <li
          v-for="p in pages"
          :key="p.link"
          class="flex items-center justify-between gap-4 py-2.5"
        >
          <a :href="p.link" class="stack-link font-medium no-underline">{{ p.title }}</a>
          <span v-if="p.date" class="shrink-0 font-display text-xs text-stone-400">{{ p.date }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
