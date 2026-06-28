<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}>();

const visiblePages = computed(() => {
  const { currentPage, totalPages } = props;
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) pages.add(2);
  if (currentPage >= totalPages - 2) pages.add(totalPages - 1);

  return [...pages].sort((a, b) => a - b);
});

function showEllipsisBefore(page: number, index: number): boolean {
  if (index === 0) return false;
  return page - visiblePages.value[index - 1]! > 1;
}
</script>

<template>
  <nav v-if="totalPages > 1" class="home-pagination" aria-label="文章分页">
    <a :href="hrefFor(currentPage - 1)" class="home-pagination__nav"
      :class="{ 'home-pagination__nav--disabled': currentPage === 1 }" :aria-disabled="currentPage === 1">
      上一页
    </a>

    <div class="home-pagination__pages">
      <template v-for="(page, index) in visiblePages" :key="page">
        <span v-if="showEllipsisBefore(page, index)" class="home-pagination__ellipsis" aria-hidden="true">
          …
        </span>
        <a :href="hrefFor(page)" class="home-pagination__page"
          :class="{ 'home-pagination__page--active': page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined">
          {{ page }}
        </a>
      </template>
    </div>

    <a :href="hrefFor(currentPage + 1)" class="home-pagination__nav"
      :class="{ 'home-pagination__nav--disabled': currentPage === totalPages }"
      :aria-disabled="currentPage === totalPages">
      下一页
    </a>
  </nav>
</template>
