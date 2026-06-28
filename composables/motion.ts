import {
  animate,
  createTimeline,
  stagger,
  type JSAnimation,
  type Timeline,
} from "animejs";
import type { Directive, DirectiveBinding } from "vue";
import { readReducedMotion } from "./use-reduced-motion";
import {
  setupReveal,
  setupRevealChildren,
  type RevealCleanup,
  type RevealOptions,
} from "./use-reveal";

export type MotionCleanup = RevealCleanup;

export { readReducedMotion, useReducedMotion } from "./use-reduced-motion";
export { useRevealElement, setupReveal, setupRevealChildren } from "./use-reveal";
export { useCatalogueNav } from "./use-catalogue-nav";

/** @deprecated 使用 readReducedMotion */
export const prefersReducedMotion = readReducedMotion;

/** @deprecated 使用 setupReveal */
export const observeReveal = setupReveal;

/** @deprecated 使用 setupRevealChildren */
export const observeRevealChildren = setupRevealChildren;

function showInstant(el: HTMLElement) {
  el.style.opacity = "1";
  el.style.transform = "none";
}

/** 跳过动效或动效失败时的兜底，避免 SPA 回首页元素一直 opacity-0 */
export function showHomeHeroInstant(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>("[data-motion], [data-feature-card]")
    .forEach(showInstant);
}

function resetMotionTargets(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>("[data-motion], [data-feature-card]")
    .forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
}

export function runHomeHeroMotion(root: HTMLElement): MotionCleanup {
  if (readReducedMotion()) {
    showHomeHeroInstant(root);
    return () => {};
  }

  resetMotionTargets(root);

  const cleanups: MotionCleanup[] = [];
  const blobs = root.querySelectorAll<HTMLElement>("[data-hero-blob]");
  blobs.forEach((blob, index) => {
    const anim = animate(blob, {
      translateY: ["0%", "-10%"],
      scale: [1, 1.08],
      duration: 4200 + index * 900,
      ease: "inOutSine",
      alternate: true,
      loop: true,
    });
    cleanups.push(() => anim.revert());
  });

  const chip = root.querySelector("[data-hero-chip]");
  const title = root.querySelector("[data-hero-title]");
  const tagline = root.querySelector("[data-hero-tagline]");
  const actions = root.querySelector("[data-hero-actions]");
  const aside = root.querySelector("[data-hero-aside]");

  const tl: Timeline = createTimeline({ defaults: { ease: "outExpo" } });

  if (chip) {
    tl.add(chip, { opacity: [0, 1], translateY: [18, 0], duration: 520 });
  }
  if (title) {
    tl.add(
      title,
      { opacity: [0, 1], translateY: [40, 0], duration: 820 },
      "-=260",
    );
  }
  if (tagline) {
    tl.add(
      tagline,
      { opacity: [0, 1], translateY: [22, 0], duration: 620 },
      "-=480",
    );
  }
  if (actions) {
    tl.add(
      [...actions.children],
      {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 520,
        delay: stagger(90),
      },
      "-=360",
    );
  }
  if (aside) {
    tl.add(
      aside,
      { opacity: [0, 1], translateX: [48, 0], duration: 760 },
      "-=520",
    );
  }

  cleanups.push(() => tl.revert());

  const features = root.querySelector("[data-hero-features]");
  cleanups.push(setupRevealChildren(features, "[data-feature-card]", 85));

  return () => cleanups.forEach((fn) => fn());
}

export function runArticleHeaderMotion(root: HTMLElement): MotionCleanup {
  if (readReducedMotion()) {
    showInstant(root);
    return () => {};
  }

  root.style.opacity = "0";
  root.style.transform = "translateY(20px)";

  const bar = root.querySelector("[data-header-bar]");
  const anim = animate(root, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 720,
    ease: "outExpo",
  });

  if (bar) {
    const barAnim = animate(bar, {
      scaleY: [0, 1],
      duration: 900,
      ease: "outExpo",
      delay: 120,
    });
    return () => {
      anim.revert();
      barAnim.revert();
    };
  }

  return () => anim.revert();
}

export function runBloggerBarMotion(root: HTMLElement): MotionCleanup {
  return setupReveal(root, { y: 16, duration: 560 });
}

export const vReveal: Directive<HTMLElement, RevealOptions | undefined> = {
  mounted(el, binding: DirectiveBinding<RevealOptions | undefined>) {
    (el as HTMLElement & { __motionCleanup?: MotionCleanup }).__motionCleanup =
      setupReveal(el, binding.value || {});
  },
  unmounted(el) {
    (
      el as HTMLElement & { __motionCleanup?: MotionCleanup }
    ).__motionCleanup?.();
  },
};
