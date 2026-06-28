import { useMediaQuery } from "@vueuse/core";

/** 响应式：用户是否开启「减少动效」 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** 命令式一次性读取（onMounted / 非 setup 场景） */
export function readReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** @deprecated 使用 useReducedMotion / readReducedMotion */
export function prefersReducedMotion(): boolean {
  return readReducedMotion();
}
