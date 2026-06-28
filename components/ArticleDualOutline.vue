<script setup lang="ts">
import { computed } from "vue";
import { useArticleReading } from "../composables/use-article-reading";
import { useReducedMotion } from "../composables/use-reduced-motion";

const { headings, activeHeadingId } = useArticleReading();
const reducedMotion = useReducedMotion();

const h2Items = computed(() => headings.value.filter((h) => h.level === 2));

const deepItems = computed(() => headings.value.filter((h) => h.level > 2));

const activeH2Id = computed(() => {
  const active = activeHeadingId.value;
  if (!active) return h2Items.value[0]?.id ?? "";

  let lastH2 = "";
  for (const h of headings.value) {
    if (h.level === 2) lastH2 = h.id;
    if (h.id === active) break;
  }
  return lastH2;
});

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--vp-nav-height",
      ),
      10,
    ) || 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 20;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: reducedMotion.value ? "auto" : "smooth",
  });
  history.replaceState(null, "", `#${id}`);
}

function belongsToActiveH2(itemId: string): boolean {
  if (!activeH2Id.value) return true;

  let inSection = false;
  for (const h of headings.value) {
    if (h.level === 2) {
      inSection = h.id === activeH2Id.value;
    }
    if (h.id === itemId) return inSection;
  }
  return false;
}
</script>

<template>
  <nav v-if="h2Items.length" aria-labelledby="article-dual-outline-label"
    class="VPDocAsideOutline article-dual-outline has-outline">
    <div class="article-dual-outline__head">
      <div id="article-dual-outline-label" class="outline-title" role="heading" aria-level="2">
        页面导航
      </div>
    </div>

    <div class="article-dual-outline__grid">
      <div class="article-dual-outline__col" aria-label="二级目录">
        <ul class="article-dual-outline__list">
          <li v-for="h in h2Items" :key="h.id">
            <a :href="`#${h.id}`" class="outline-link article-dual-outline__h2" :class="{ active: activeH2Id === h.id }"
              @click.prevent="scrollToHeading(h.id)">
              {{ h.text }}
            </a>
          </li>
        </ul>
      </div>

      <div class="article-dual-outline__col" aria-label="子级目录">
        <ul v-if="deepItems.length" class="article-dual-outline__list">
          <li v-for="h in deepItems" :key="h.id">
            <a :href="`#${h.id}`" class="outline-link article-dual-outline__deep" :class="[
              `article-dual-outline__deep--l${h.level}`,
              {
                active: activeHeadingId === h.id,
                'article-dual-outline__deep--muted':
                  !belongsToActiveH2(h.id),
              },
            ]" @click.prevent="scrollToHeading(h.id)">
              {{ h.text }}
            </a>
          </li>
        </ul>
        <p v-else class="article-dual-outline__empty">暂无子级标题</p>
      </div>
    </div>
  </nav>
</template>
