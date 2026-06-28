# 主题 Frontmatter 约定

本站 Markdown 的 frontmatter **优先使用 [VitePress 官方字段](https://vitepress.dev/reference/frontmatter-config)**；下列 **本主题扩展** 仅在本仓库自定义 Layout / 组件中使用，不在 VitePress 默认主题中生效。

## VitePress 标准字段（正文页通用）

| 字段                  | 说明                                           |
| --------------------- | ---------------------------------------------- |
| `title`               | 页面标题                                       |
| `description`         | 描述（SEO / 部分组件）                         |
| `layout`              | 布局：`doc`（默认）、`home`（首页）、`page` 等 |
| `sidebar`             | `false` 关闭侧栏                               |
| `aside`               | `false` 关闭右侧大纲                           |
| `outline`             | `false` 关闭大纲；或 `[2, 3]` 控制层级         |
| `editLink`            | `false` 隐藏编辑链接                           |
| `lastUpdated`         | 是否显示上次更新                               |
| `tags` / `categories` | 标签、分类（数组）                             |
| `date`                | 发布日期                                       |

文章页未写 `article: false` 时，走 `ArticleHeader`、侧栏增强、Gitalk 评论等文章布局。

---

## 首页 `docs/index.md`

使用 **`isHome: true`**（本主题扩展）+ VitePress 风格的 **`hero`** 对象。**不要写 `layout: home`**：VitePress 会渲染默认 `VPHome`，自定义 `HomePage.vue` 不会出现，页面会与迁移前不一致。

```yaml
---
isHome: true
sidebar: false
aside: false
article: false
comment: false
hero:
  name: 仲灏
  text: 小栈
  tagline: 一句话介绍
bannerBg: "https://..." # 本主题扩展，见下
features: # 结构同 VP home；字段见下
  - title: 大前端
    details: ...
    link: /web/ # 扩展：卡片跳转
    imgUrl: /img/web.png # 扩展：卡片图标（非 VP 的 icon）
---
```

| 扩展字段            | 说明                                                               |
| ------------------- | ------------------------------------------------------------------ |
| `isHome: true`      | 启用自定义首页（旧版 `home: true` 的替代，避免 VP 默认 home 布局） |
| `bannerBg`          | Hero 背景图 URL；未设置时可回退到 `hero.image`                     |
| `features[].link`   | 分区卡片链接                                                       |
| `features[].imgUrl` | 卡片图标（PNG）；官方 home 使用 `icon`（emoji / SVG）              |
| `article: false`    | 不参与首页文章列表聚合                                             |
| `comment: false`    | 不显示评论                                                         |
| `perPage`           | 首页列表每页条数，默认 `10`                                        |
| `hideRightBar`      | `true` 隐藏首页右侧 Blogger / 分类 / 标签栏                        |

渲染组件：`theme/components/HomePage.vue`。

---

## 知识库目录页 `docs/目录页/*.md`

布局控制用 **VitePress 标准字段**；目录数据用 **本主题扩展**：

```yaml
---
title: 大前端
permalink: /web # 见「路由重写」
sidebar: false
aside: false
outline: false
editLink: false
article: false
comment: false
pageComponent: # 本主题扩展
  name: Catalogue
  data:
    key: 10.大前端 # 与 docs 下分区目录名一致
    imgUrl: /img/web.png
    description: 分区简介 HTML 可选
---
```

子系列目录（如《前端项目基础建设》）将 `data.key` 换为 `data.path`（相对 `docs/` 的路径）：

```yaml
pageComponent:
  name: Catalogue
  data:
    path: 《前端项目基础建设》笔记
```

渲染组件：`theme/components/CataloguePage.vue`。

---

## 索引页 `docs/@pages/*.md`

布局用 VitePress 标准字段 + 下列 **页面类型标记**（三选一）：

| 文件                | 扩展字段               | 路由           |
| ------------------- | ---------------------- | -------------- |
| `categoriesPage.md` | `categoriesPage: true` | `/categories/` |
| `tagsPage.md`       | `tagsPage: true`       | `/tags/`       |
| `archivesPage.md`   | `archivesPage: true`   | `/archives/`   |

示例：

```yaml
---
title: 分类
permalink: /categories/
sidebar: false
aside: false
outline: false
article: false
categoriesPage: true
---
```

---

## 路由重写 `permalink`

VitePress 默认按文件路径生成 URL。本站为兼容旧 VuePress / vdoing 链接，在 frontmatter 中保留：

```yaml
permalink: /pages/abc123/
```

构建时由 `utils/site-data.mts` 写入 `config.mts` 的 `rewrites`，**属于站点数据层约定**，非 VP 内置字段。

---

## 文章页常用扩展

| 字段                               | 说明                      |
| ---------------------------------- | ------------------------- |
| `titleTag`                         | 标题旁徽章文案            |
| `comment: false`                   | 关闭 Gitalk               |
| `cover` / `coverImg` / `thumbnail` | 封面图（首页列表卡片）    |
| `author`                           | `{ name, link }` 作者信息 |

---

## 判定逻辑（维护用）

共享工具：`vitepress-theme-maistack/utils/frontmatter.ts`

- `isHomeFrontmatter` → `isHome: true`（**非** `layout: home`）
- `isCatalogueFrontmatter` → `pageComponent.name === 'Catalogue'`
- `isIndexSpecialPage` → `categoriesPage` / `tagsPage` / `archivesPage`

主题 `Layout.vue`、`composables/layout.ts`、`site-data.mts` 均引用上述工具，避免字段散落重复判断。
