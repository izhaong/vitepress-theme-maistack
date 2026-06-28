import { computed } from "vue";
import { useRoute } from "vitepress";
import { useData } from "vitepress/dist/client/theme-default/composables/data";
import { findSidebarNeighbors } from "../utils/section-sidebar";

export function usePrevNext() {
  const { page, theme, frontmatter } = useData();
  const route = useRoute();

  return computed(() => {
    const { prev: sidebarPrev, next: sidebarNext } = findSidebarNeighbors(
      route.path,
      page.value.filePath,
    );

    const hidePrev =
      (theme.value.docFooter?.prev === false && !frontmatter.value.prev) ||
      frontmatter.value.prev === false;
    const hideNext =
      (theme.value.docFooter?.next === false && !frontmatter.value.next) ||
      frontmatter.value.next === false;

    return {
      prev: hidePrev
        ? undefined
        : {
            text:
              (typeof frontmatter.value.prev === "string"
                ? frontmatter.value.prev
                : typeof frontmatter.value.prev === "object"
                  ? frontmatter.value.prev.text
                  : undefined) ?? sidebarPrev?.text,
            link:
              (typeof frontmatter.value.prev === "object"
                ? frontmatter.value.prev.link
                : undefined) ?? sidebarPrev?.link,
          },
      next: hideNext
        ? undefined
        : {
            text:
              (typeof frontmatter.value.next === "string"
                ? frontmatter.value.next
                : typeof frontmatter.value.next === "object"
                  ? frontmatter.value.next.text
                  : undefined) ?? sidebarNext?.text,
            link:
              (typeof frontmatter.value.next === "object"
                ? frontmatter.value.next.link
                : undefined) ?? sidebarNext?.link,
          },
    };
  });
}
