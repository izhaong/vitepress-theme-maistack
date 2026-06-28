<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { usePreferences } from "../../composables/use-preferences";

const { prefs } = usePreferences();
const isFullscreen = ref(false);

async function toggleFullscreen() {
  if (!prefs.fullscreen) return;
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
    } else {
      await document.exitFullscreen();
      isFullscreen.value = false;
    }
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  document.addEventListener("fullscreenchange", onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}
</script>

<template>
  <button v-if="prefs.fullscreen" type="button" class="site-fullscreen-btn" :title="isFullscreen ? '退出全屏' : '进入全屏'"
    :aria-label="isFullscreen ? '退出全屏' : '进入全屏'" @click="toggleFullscreen">
    <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  </button>
</template>
