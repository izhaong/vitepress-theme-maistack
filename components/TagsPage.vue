<script setup lang="ts">
import { computed } from 'vue'
import { getSiteData } from '../site-data-store'
import type { PageMeta } from '../types/site-data'

const grouped = computed(() => {
  const map = new Map<string, PageMeta[]>()
  for (const page of getSiteData().pages) {
    for (const tag of page.tags || []) {
      if (!tag) continue
      if (!map.has(tag)) map.set(tag, [])
      map.get(tag)!.push(page)
    }
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'))
})
</script>

<template>
  <div class="pb-6">
    <header v-reveal class="mb-8">
      <p class="font-display text-xs uppercase tracking-[0.25em] text-brand-600/80">Index</p>
      <h1 class="stack-section-title mt-1">标签</h1>
    </header>
    <section
      v-for="[tag, pages] in grouped"
      :key="tag"
      v-reveal="{ delay: 60 }"
      class="stack-meta-card mb-4 opacity-0"
    >
      <h2 class="font-serif text-base font-semibold text-stone-800 dark:text-stone-100">
        # {{ tag }}
        <span class="ml-1 font-sans text-sm font-normal text-stone-400">({{ pages.length }})</span>
      </h2>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li v-for="p in pages" :key="p.link">
          <a
            :href="p.link"
            class="stack-chip cursor-pointer text-xs no-underline hover:bg-brand-100"
          >
            {{ p.title }}
          </a>
        </li>
      </ul>
    </section>
    <p v-if="!grouped.length" class="text-sm text-stone-500">暂无标签数据</p>
  </div>
</template>
