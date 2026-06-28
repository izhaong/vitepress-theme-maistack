<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { usePreferences } from "../../composables/use-preferences";
import { THEME_COLOR_PRESETS } from "../../preferences/theme-colors";
import {
  normalizeOutlineLevels,
  OUTLINE_LEVEL_MAX,
  OUTLINE_LEVEL_MIN,
} from "../../preferences/outline-range";
import FullscreenButton from "./FullscreenButton.vue";
import type {
  ContentWidthMode,
  FontSizePreset,
  SidebarMode,
  ThemeMode,
} from "../../preferences/types";

type TabId = "appearance" | "layout" | "widgets" | "footer";

const TABS: { id: TabId; label: string }[] = [
  { id: "appearance", label: "外观" },
  { id: "layout", label: "布局" },
  { id: "widgets", label: "小部件" },
  { id: "footer", label: "底栏" },
];

const RADIUS_OPTIONS = [0, 0.25, 0.5, 0.75, 1] as const;
const FONT_OPTIONS: { id: FontSizePreset; label: string }[] = [
  { id: "sm", label: "小" },
  { id: "md", label: "中" },
  { id: "lg", label: "大" },
];

const OUTLINE_LEVEL_OPTIONS = Array.from(
  { length: OUTLINE_LEVEL_MAX - OUTLINE_LEVEL_MIN + 1 },
  (_, i) => OUTLINE_LEVEL_MIN + i,
);

const OUTLINE_PRESETS: {
  label: string;
  min: number;
  max: number;
}[] = [
    { label: "H1–H5", min: 1, max: 5 },
    { label: "H2–H6", min: 2, max: 6 },
    { label: "H2–H4", min: 2, max: 4 },
    { label: "仅 H2", min: 2, max: 2 },
  ];

const { prefs, patch, reset } = usePreferences();
const open = ref(false);
const activeTab = ref<TabId>("appearance");
const navReady = ref(false);

const sidebarWidthLabel = computed(() => `${prefs.sidebarWidth}px`);

const outlineLevelLabel = computed(
  () => `H${prefs.outlineMinLevel} – H${prefs.outlineMaxLevel}`,
);

function isOutlinePresetActive(min: number, max: number): boolean {
  return prefs.outlineMinLevel === min && prefs.outlineMaxLevel === max;
}

function setOutlinePreset(min: number, max: number) {
  const levels = normalizeOutlineLevels(min, max);
  patch({ outlineMinLevel: levels.min, outlineMaxLevel: levels.max });
}

function onOutlineMinChange(event: Event) {
  const min = Number((event.target as HTMLSelectElement).value);
  setOutlinePreset(min, prefs.outlineMaxLevel);
}

function onOutlineMaxChange(event: Event) {
  const max = Number((event.target as HTMLSelectElement).value);
  setOutlinePreset(prefs.outlineMinLevel, max);
}

function setThemeMode(mode: ThemeMode) {
  patch({ themeMode: mode });
}

function setThemeColor(id: string) {
  patch({ themeColor: id });
}

function setRadius(value: number) {
  patch({ borderRadius: value });
}

function setFontSize(value: FontSizePreset) {
  patch({ fontSize: value });
}

function setSidebarMode(mode: SidebarMode) {
  patch({ sidebarMode: mode });
}

function setContentWidth(mode: ContentWidthMode) {
  patch({ contentWidth: mode });
}

function onSidebarWidthInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  patch({ sidebarWidth: value });
}

function toggleBool(key: keyof typeof prefs, event: Event) {
  patch({ [key]: (event.target as HTMLInputElement).checked } as Partial<
    typeof prefs
  >);
}

function close() {
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) close();
}

onMounted(() => {
  navReady.value = true;
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport v-if="navReady" to=".VPNavBar .content-body">
    <div class="site-pref-nav-cluster">
      <FullscreenButton />
      <button type="button" class="site-pref-trigger" title="偏好设置" aria-label="偏好设置" @click="open = true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </div>
  </Teleport>

  <Teleport to="body">
    <Transition name="pref-drawer">
      <div v-if="open" class="site-pref-overlay" @click.self="close">
        <aside class="site-pref-drawer" role="dialog" aria-modal="true" aria-label="偏好设置">
          <header class="site-pref-drawer__head">
            <div>
              <h2 class="site-pref-drawer__title">偏好设置</h2>
              <p class="site-pref-drawer__subtitle">自定义偏好设置 &amp; 实时预览</p>
            </div>
            <div class="site-pref-drawer__actions">
              <button type="button" class="site-pref-icon-btn" title="重置" @click="reset">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
              <button type="button" class="site-pref-icon-btn" title="关闭" @click="close">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <nav class="site-pref-tabs" aria-label="设置分类">
            <button v-for="tab in TABS" :key="tab.id" type="button" class="site-pref-tabs__item"
              :class="{ 'site-pref-tabs__item--active': activeTab === tab.id }" @click="activeTab = tab.id">
              {{ tab.label }}
            </button>
          </nav>

          <div class="site-pref-body">
            <!-- 外观 -->
            <section v-show="activeTab === 'appearance'" class="site-pref-section">
              <h3 class="site-pref-section__title">主题</h3>
              <div class="site-pref-theme-cards">
                <button type="button" class="site-pref-theme-card"
                  :class="{ 'site-pref-theme-card--active': prefs.themeMode === 'light' }"
                  @click="setThemeMode('light')">
                  <span class="site-pref-theme-card__icon">☀</span>
                  <span>浅色</span>
                </button>
                <button type="button" class="site-pref-theme-card"
                  :class="{ 'site-pref-theme-card--active': prefs.themeMode === 'dark' }" @click="setThemeMode('dark')">
                  <span class="site-pref-theme-card__icon">🌙</span>
                  <span>深色</span>
                </button>
                <button type="button" class="site-pref-theme-card"
                  :class="{ 'site-pref-theme-card--active': prefs.themeMode === 'system' }"
                  @click="setThemeMode('system')">
                  <span class="site-pref-theme-card__icon">◐</span>
                  <span>跟随系统</span>
                </button>
              </div>

              <h3 class="site-pref-section__title">内置主题</h3>
              <div class="site-pref-color-grid">
                <button v-for="color in THEME_COLOR_PRESETS" :key="color.id" type="button" class="site-pref-color-card"
                  :class="{ 'site-pref-color-card--active': prefs.themeColor === color.id }"
                  @click="setThemeColor(color.id)">
                  <span class="site-pref-color-card__swatch" :style="{ background: color.primary }" />
                  <span class="site-pref-color-card__label">{{ color.label }}</span>
                </button>
              </div>

              <h3 class="site-pref-section__title">圆角</h3>
              <div class="site-pref-segment">
                <button v-for="value in RADIUS_OPTIONS" :key="value" type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.borderRadius === value }"
                  @click="setRadius(value)">
                  {{ value }}
                </button>
              </div>

              <h3 class="site-pref-section__title">字体大小</h3>
              <div class="site-pref-segment">
                <button v-for="item in FONT_OPTIONS" :key="item.id" type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.fontSize === item.id }"
                  @click="setFontSize(item.id)">
                  {{ item.label }}
                </button>
              </div>

              <h3 class="site-pref-section__title">其他</h3>
              <label class="site-pref-switch-row">
                <span>色弱模式</span>
                <input type="checkbox" :checked="prefs.colorBlindMode" @change="toggleBool('colorBlindMode', $event)" />
              </label>
              <label class="site-pref-switch-row">
                <span>灰色模式</span>
                <input type="checkbox" :checked="prefs.grayMode" @change="toggleBool('grayMode', $event)" />
              </label>
            </section>

            <!-- 布局 -->
            <section v-show="activeTab === 'layout'" class="site-pref-section">
              <h3 class="site-pref-section__title">侧边栏 · 菜单</h3>
              <div class="site-pref-segment site-pref-segment--wide">
                <button type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.sidebarMode === 'vertical' }"
                  @click="setSidebarMode('vertical')">
                  垂直菜单
                </button>
                <button type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.sidebarMode === 'dual' }"
                  @click="setSidebarMode('dual')">
                  双列目录
                </button>
              </div>
              <p class="site-pref-hint">
                双列目录：文章页左侧浮动面板左列为二级目录，右列为该组下全部子级（含多层嵌套）；一级分区始终在顶栏导航并高亮当前所在库。
              </p>

              <h3 class="site-pref-section__title">侧边栏 · 宽度</h3>
              <div class="site-pref-range">
                <input type="range" min="200" max="320" step="4" :value="prefs.sidebarWidth"
                  @input="onSidebarWidthInput" />
                <span class="site-pref-range__value">{{ sidebarWidthLabel }}</span>
              </div>

              <h3 class="site-pref-section__title">内容</h3>
              <div class="site-pref-segment site-pref-segment--wide">
                <button type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.contentWidth === 'fluid' }"
                  @click="setContentWidth('fluid')">
                  流式
                </button>
                <button type="button" class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': prefs.contentWidth === 'fixed' }"
                  @click="setContentWidth('fixed')">
                  定宽
                </button>
              </div>

              <h3 class="site-pref-section__title">页面导航</h3>
              <p class="site-pref-hint">
                右侧浮动目录显示的标题层级，支持多层级嵌套。当前：{{ outlineLevelLabel }}
              </p>
              <div class="site-pref-segment site-pref-segment--wide">
                <button v-for="preset in OUTLINE_PRESETS" :key="preset.label" type="button"
                  class="site-pref-segment__item"
                  :class="{ 'site-pref-segment__item--active': isOutlinePresetActive(preset.min, preset.max) }"
                  @click="setOutlinePreset(preset.min, preset.max)">
                  {{ preset.label }}
                </button>
              </div>
              <div class="site-pref-outline-levels">
                <label class="site-pref-outline-levels__field">
                  <span>从</span>
                  <select class="site-pref-select" :value="prefs.outlineMinLevel" @change="onOutlineMinChange">
                    <option v-for="level in OUTLINE_LEVEL_OPTIONS" :key="`min-${level}`" :value="level">
                      H{{ level }}
                    </option>
                  </select>
                </label>
                <label class="site-pref-outline-levels__field">
                  <span>到</span>
                  <select class="site-pref-select" :value="prefs.outlineMaxLevel" @change="onOutlineMaxChange">
                    <option v-for="level in OUTLINE_LEVEL_OPTIONS" :key="`max-${level}`" :value="level">
                      H{{ level }}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <!-- 小部件 -->
            <section v-show="activeTab === 'widgets'" class="site-pref-section">
              <label class="site-pref-switch-row">
                <span>全局搜索</span>
                <input type="checkbox" :checked="prefs.globalSearch" @change="toggleBool('globalSearch', $event)" />
              </label>
              <label class="site-pref-switch-row">
                <span>启用全屏</span>
                <input type="checkbox" :checked="prefs.fullscreen" @change="toggleBool('fullscreen', $event)" />
              </label>
              <p class="site-pref-hint">开启全屏后，顶栏会出现全屏按钮。</p>
              <label class="site-pref-switch-row">
                <span>点击飘心</span>
                <input type="checkbox" :checked="prefs.loveMe" @change="toggleBool('loveMe', $event)" />
              </label>
              <p class="site-pref-hint">开启后，点击页面任意位置会出现飘心特效（love-me）。</p>
            </section>

            <!-- 底栏 -->
            <section v-show="activeTab === 'footer'" class="site-pref-section">
              <label class="site-pref-switch-row">
                <span>显示底栏</span>
                <input type="checkbox" :checked="prefs.showFooter" @change="toggleBool('showFooter', $event)" />
              </label>
              <label class="site-pref-switch-row">
                <span>固定在底部</span>
                <input type="checkbox" :checked="prefs.footerFixed" :disabled="!prefs.showFooter"
                  @change="toggleBool('footerFixed', $event)" />
              </label>
              <p class="site-pref-hint">目录页 / 文章页默认隐藏底栏，开启后可显示站点 Footer。</p>
            </section>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
