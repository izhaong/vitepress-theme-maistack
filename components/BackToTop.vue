<script setup lang="ts">
import { computed } from "vue";
import { useWindowScroll } from "@vueuse/core";
import { useData } from "vitepress";
import { useReducedMotion } from "../composables/use-reduced-motion";

const { theme } = useData();
const { y } = useWindowScroll();
const reducedMotion = useReducedMotion();

const label = computed(() => theme.value.returnToTopLabel || "回到顶部");
const visible = computed(() => y.value > 360);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.value ? "auto" : "smooth",
  });
}
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-show="visible"
      type="button"
      class="back-to-top"
      :aria-label="label"
      :title="label"
      @click="scrollToTop"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: calc(var(--vp-z-index-local-nav) + 1);
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--wheat-cyan-rgb), 0.45);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  color: #0e7490;
  box-shadow:
    0 4px 14px rgba(28, 25, 23, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.back-to-top:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--wheat-amber-rgb), 0.55);
  background: rgba(255, 251, 235, 0.96);
  color: #b45309;
  box-shadow:
    0 8px 22px rgba(var(--wheat-amber-rgb), 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.7) inset;
}

.back-to-top:focus-visible {
  outline: 2px solid var(--wheat-cyan);
  outline-offset: 3px;
}

.dark .back-to-top {
  border-color: rgba(var(--wheat-cyan-rgb), 0.35);
  background: rgba(28, 25, 23, 0.88);
  color: #67e8f9;
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

.dark .back-to-top:hover {
  background: rgba(22, 78, 99, 0.45);
  border-color: rgba(var(--wheat-amber-rgb), 0.45);
  color: #fcd34d;
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}

@media (min-width: 960px) {
  .back-to-top {
    right: 1.5rem;
    bottom: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .back-to-top:hover {
    transition: none;
    transform: none;
  }
}
</style>
