<script setup lang="ts">
import { computed, onMounted, shallowRef, watchEffect } from "vue";
import { useNavigatorLanguage } from "@vueuse/core";
import { useData } from "vitepress";

const { theme, page, lang: pageLang } = useData();
const { language: browserLang } = useNavigatorLanguage();
const datetime = shallowRef("");

const show = computed(() => !!page.value.lastUpdated);
const date = computed(() => new Date(page.value.lastUpdated!));
const isoDatetime = computed(() => date.value.toISOString());
const label = computed(
  () => theme.value.lastUpdated?.text || theme.value.lastUpdatedText || "上次更新",
);

onMounted(() => {
  watchEffect(() => {
    if (!page.value.lastUpdated) return;
    const lang = theme.value.lastUpdated?.formatOptions?.forceLocale
      ? pageLang.value
      : browserLang.value;
    datetime.value = new Intl.DateTimeFormat(
      lang,
      theme.value.lastUpdated?.formatOptions ?? {
        dateStyle: "medium",
        timeStyle: "medium",
      },
    ).format(date.value);
  });
});
</script>

<template>
  <p v-if="show" class="catalogue-aside-meta">
    <span class="catalogue-aside-meta__label">{{ label }}</span>
    <time class="catalogue-aside-meta__time" :datetime="isoDatetime">{{ datetime }}</time>
  </p>
</template>
