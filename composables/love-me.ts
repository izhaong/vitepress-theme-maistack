export interface LoveMeOptions {
  enabled?: boolean;
  color?: string;
  excludeClassName?: string;
}

interface HeartParticle {
  el: HTMLDivElement;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  color: string;
}

let enabled = true;
let color = "";
let excludeClassName = "";
let initialized = false;
const hearts: HeartParticle[] = [];

function randomColor() {
  return `rgb(${~~(255 * Math.random())},${~~(255 * Math.random())},${~~(255 * Math.random())})`;
}

function shouldSkipClick(event: MouseEvent) {
  if (!excludeClassName) return false;

  const path = event.composedPath?.() ?? [];
  for (const node of path) {
    if (!(node instanceof Element)) continue;
    if (
      typeof node.className === "string" &&
      node.className.includes(excludeClassName)
    ) {
      return true;
    }
  }

  return false;
}

function spawnHeart(event: MouseEvent) {
  const el = document.createElement("div");
  el.className = "love-me-heart";
  hearts.push({
    el,
    x: event.clientX - 5,
    y: event.clientY - 5,
    scale: 1,
    alpha: 1,
    color,
  });
  document.body.appendChild(el);
}

function onDocumentClick(event: MouseEvent) {
  if (!enabled || shouldSkipClick(event)) return;
  spawnHeart(event);
}

function tick() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    if (heart.alpha <= 0) {
      heart.el.remove();
      hearts.splice(i, 1);
      continue;
    }

    heart.y -= 1;
    heart.scale += 0.004;
    heart.alpha -= 0.013;
    heart.el.style.cssText = [
      `left:${heart.x}px`,
      `top:${heart.y}px`,
      `opacity:${heart.alpha}`,
      `transform:scale(${heart.scale},${heart.scale}) rotate(45deg)`,
      `background:${heart.color}`,
      "z-index:99999",
    ].join(";");
  }

  requestAnimationFrame(tick);
}

function ensureInitialized() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  if (!color) color = randomColor();
  document.addEventListener("click", onDocumentClick);
  requestAnimationFrame(tick);
}

export function syncLoveMe(options: LoveMeOptions = {}) {
  if (options.enabled !== undefined) enabled = options.enabled;
  if (options.color !== undefined) color = options.color;
  if (options.excludeClassName !== undefined) {
    excludeClassName = options.excludeClassName;
  }

  ensureInitialized();
}

/** @deprecated 使用 syncLoveMe({ enabled: true }) */
export function initLoveMe(options: Omit<LoveMeOptions, "enabled"> = {}) {
  syncLoveMe({ ...options, enabled: true });
}
