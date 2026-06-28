import { effectScope, ref, watch, type Ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { animate, type JSAnimation } from "animejs";
import { readReducedMotion } from "./use-reduced-motion";

export type RevealOptions = {
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  /** 列表首屏补量时可放大 bottom，避免底部 1～2 条错过 intersection */
  rootMargin?: string;
  threshold?: number;
};

export type RevealCleanup = () => void;

function showInstant(el: HTMLElement) {
  el.style.opacity = "1";
  el.style.transform = "none";
}

/** 在 effectScope 内挂载，供 directive / onMounted 命令式调用 */
export function setupReveal(
  el: HTMLElement,
  options?: RevealOptions,
): RevealCleanup {
  const scope = effectScope();
  scope.run(() => useRevealElement(ref(el), options));
  return () => scope.stop();
}

/** 组合式：模板 ref 绑定元素 */
export function useRevealElement(
  target: Ref<HTMLElement | null | undefined>,
  options?: RevealOptions,
) {
  if (readReducedMotion()) {
    watch(
      target,
      (el) => {
        if (el) showInstant(el);
      },
      { immediate: true },
    );
    return;
  }

  const y = options?.y ?? 28;
  const x = options?.x ?? 0;
  let played = false;
  let anim: JSAnimation | null = null;

  watch(
    target,
    (el) => {
      if (el && !played) {
        el.style.opacity = "0";
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    { immediate: true },
  );

  useIntersectionObserver(
    target,
    ([entry]) => {
      const el = target.value;
      if (!el || !entry?.isIntersecting || played) return;
      played = true;
      anim = animate(el, {
        opacity: [0, 1],
        translateX: [x, 0],
        translateY: [y, 0],
        duration: options?.duration ?? 680,
        delay: options?.delay ?? 0,
        ease: "outExpo",
      });
    },
    {
      threshold: options?.threshold ?? 0.08,
      rootMargin: options?.rootMargin ?? "0px 0px -6% 0px",
    },
  );
}

export function setupRevealChildren(
  root: HTMLElement | null | undefined,
  selector: string,
  staggerMs = 70,
  options?: Pick<RevealOptions, "y" | "rootMargin" | "threshold">,
): RevealCleanup {
  if (!root) return () => {};
  const nodes = [...root.querySelectorAll<HTMLElement>(selector)];
  const scopes = nodes.map((node, index) =>
    setupReveal(node, {
      delay: (index % 10) * staggerMs,
      y: options?.y ?? 32,
      rootMargin: options?.rootMargin,
      threshold: options?.threshold,
    }),
  );
  return () => scopes.forEach((stop) => stop());
}
