<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import { useData } from 'vitepress'
import { findSidebarNeighbors } from '../utils/section-sidebar'
import { observeRevealChildren, type MotionCleanup } from '../composables/motion'

const { page, frontmatter, theme } = useData()
const route = useRoute()
const navRef = ref<HTMLElement | null>(null)
let motionCleanup: MotionCleanup = () => { }

const neighbors = computed(() =>
  findSidebarNeighbors(route.path, page.value.filePath as string | undefined)
)

const prev = computed(() => {
  if (frontmatter.value.prev === false) return undefined
  const fm = frontmatter.value.prev
  if (typeof fm === 'object' && fm?.link) {
    return { text: fm.text || fm.link, link: fm.link }
  }
  if (typeof fm === 'string') return { text: fm, link: neighbors.value.prev?.link }
  return neighbors.value.prev
})

const next = computed(() => {
  if (frontmatter.value.next === false) return undefined
  const fm = frontmatter.value.next
  if (typeof fm === 'object' && fm?.link) {
    return { text: fm.text || fm.link, link: fm.link }
  }
  if (typeof fm === 'string') return { text: fm, link: neighbors.value.next?.link }
  return neighbors.value.next
})

const prevLabel = computed(() => theme.value.docFooter?.prev || '上一章')
const nextLabel = computed(() => theme.value.docFooter?.next || '下一章')

onMounted(() => {
  if (navRef.value) {
    motionCleanup = observeRevealChildren(navRef.value, 'a', 120)
  }
})

onBeforeUnmount(() => motionCleanup())
</script>

<template>
  <nav ref="navRef" v-if="prev?.link || next?.link" class="article-page-nav mt-10 px-5 md:mt-12 md:px-8"
    aria-label="章节导航">
    <div class="grid gap-4 sm:grid-cols-2">
      <a v-if="prev?.link" :href="prev.link"
        class="group stack-card flex cursor-pointer flex-col no-underline opacity-0 sm:pr-8">
        <span class="font-display text-[10px] uppercase tracking-[0.2em] text-stone-400">
          ← {{ prevLabel }}
        </span>
        <span
          class="mt-2 font-serif text-base font-semibold text-stone-800 transition-colors group-hover:text-brand-700 dark:text-stone-100">
          {{ prev.text }}
        </span>
      </a>
      <div v-else class="hidden sm:block" />

      <a v-if="next?.link" :href="next.link"
        class="group stack-card flex cursor-pointer flex-col no-underline opacity-0 sm:col-start-2 sm:text-right">
        <span class="font-display text-[10px] uppercase tracking-[0.2em] text-stone-400">
          {{ nextLabel }} →
        </span>
        <span
          class="mt-2 font-serif text-base font-semibold text-stone-800 transition-colors group-hover:text-brand-700 dark:text-stone-100">
          {{ next.text }}
        </span>
      </a>
    </div>
  </nav>
</template>
