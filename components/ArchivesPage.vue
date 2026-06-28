<script setup lang="ts">
import { computed } from 'vue'
import { getSiteData } from '../site-data-store'
import type { PageMeta } from '../types/site-data'

const byYear = computed(() => {
  const pages = getSiteData().pages
  const map = new Map<string, PageMeta[]>()
  for (const page of pages) {
    const year = page.date ? String(page.date).slice(0, 4) : '未知'
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(page)
  }
  return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]))
})
</script>

<template>
  <div class="pb-6">
    <header v-reveal class="mb-8">
      <p class="font-display text-xs uppercase tracking-[0.25em] text-brand-600/80">Timeline</p>
      <h1 class="stack-section-title mt-1">归档</h1>
    </header>
    <section
      v-for="[year, pages] in byYear"
      :key="year"
      v-reveal="{ delay: 70 }"
      class="relative mb-8 pl-8 opacity-0"
    >
      <span
        class="absolute left-0 top-1 font-display text-2xl font-bold text-brand-500/30"
        aria-hidden="true"
      >
        {{ year }}
      </span>
      <div
        class="absolute bottom-0 left-[11px] top-10 w-px bg-gradient-to-b from-brand-400/60 to-transparent"
        aria-hidden="true"
      />
      <h2 class="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
        {{ year }} 年
        <span class="text-sm font-normal text-stone-400">({{ pages.length }})</span>
      </h2>
      <ul class="mt-4 space-y-2">
        <li
          v-for="p in pages"
          :key="p.link"
          class="relative flex items-baseline gap-3 pl-2"
        >
          <span
            class="absolute -left-[21px] top-2 h-2 w-2 rounded-full bg-brand-500"
            aria-hidden="true"
          />
          <span v-if="p.date" class="shrink-0 font-display text-xs text-stone-400">
            {{ String(p.date).slice(5, 10) }}
          </span>
          <a :href="p.link" class="stack-link no-underline">{{ p.title }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>
