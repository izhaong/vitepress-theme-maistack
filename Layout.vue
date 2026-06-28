<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'
import { useData } from 'vitepress'
import BloggerBar from './components/BloggerBar.vue'
import CataloguePage from './components/CataloguePage.vue'
import ArchivesPage from './components/ArchivesPage.vue'
import CategoriesPage from './components/CategoriesPage.vue'
import TagsPage from './components/TagsPage.vue'
import GitalkComments from './components/GitalkComments.vue'
import HomePage from './components/HomePage.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import ArticleSidebarHead from './components/ArticleSidebarHead.vue'
import ArticlePageNav from './components/ArticlePageNav.vue'
import BackToTop from './components/BackToTop.vue'
import SidebarEnhance from './components/SidebarEnhance.vue'
import ArticleDualSidebar from './components/ArticleDualSidebar.vue'
import NavSectionHighlight from './components/NavSectionHighlight.vue'
import PreferencesPanel from './components/preferences/PreferencesPanel.vue'
import { providePreferences } from './composables/use-preferences'
import {
  isCatalogueFrontmatter,
  isHomeFrontmatter,
  isIndexSpecialPage,
} from './utils/frontmatter'

const DefaultLayout = DefaultTheme.Layout
const { prefs } = providePreferences()
const { frontmatter } = useData()

const fm = computed(
  () => frontmatter.value as unknown as Record<string, unknown>,
)

const isHome = computed(() => isHomeFrontmatter(fm.value))
const isCatalogue = computed(() => isCatalogueFrontmatter(fm.value))
const isSpecialPage = computed(
  () => isCatalogue.value || isIndexSpecialPage(fm.value),
)
const isArticle = computed(
  () =>
    frontmatter.value.article !== false &&
    !isSpecialPage.value &&
    !isHome.value,
)
const showComments = computed(
  () => isArticle.value && frontmatter.value.comment !== false
)
</script>

<template>
  <DefaultLayout :class="{
    'maistack-home': isHome,
    'special-page': isSpecialPage,
    'catalogue-page-layout': isCatalogue,
    'maistack-article': isArticle,
  }">
    <template #sidebar-nav-before>
      <BloggerBar v-if="!isArticle" />
      <ArticleSidebarHead v-else />
    </template>
    <template #sidebar-nav-after>
      <ArticleDualSidebar v-if="isArticle && prefs.sidebarMode === 'dual'" />
      <SidebarEnhance v-if="isArticle" />
    </template>
    <template #doc-top>
      <HomePage v-if="isHome" />
      <CataloguePage v-else-if="isCatalogue" />
      <CategoriesPage v-else-if="frontmatter.categoriesPage" />
      <TagsPage v-else-if="frontmatter.tagsPage" />
      <ArchivesPage v-else-if="frontmatter.archivesPage" />
    </template>
    <template #doc-before>
      <ArticleHeader v-if="isArticle" />
    </template>
    <template #doc-after>
      <template v-if="isArticle">
        <ArticlePageNav />
        <GitalkComments v-if="showComments" />
      </template>
    </template>
    <template #layout-bottom>
      <BackToTop />
    </template>
  </DefaultLayout>
  <NavSectionHighlight />
  <PreferencesPanel />
</template>
