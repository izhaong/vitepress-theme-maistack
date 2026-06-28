<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from "vue";
import { useDevicePixelRatio, useResizeObserver } from "@vueuse/core";
import { animate } from "animejs";
import { useReducedMotion } from "../composables/use-reduced-motion";

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const reducedMotion = useReducedMotion();
const dpr = useDevicePixelRatio({ max: 2 });

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

let width = 0;
let height = 0;
let particles: Particle[] = [];
let anim: ReturnType<typeof animate> | null = null;

function initParticles(count: number) {
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: 1 + Math.random() * 1.8,
    alpha: 0.25 + Math.random() * 0.45,
  }));
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  width = container.clientWidth;
  height = container.clientHeight;
  canvas.width = width * dpr.value;
  canvas.height = height * dpr.value;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr.value, 0, 0, dpr.value, 0, 0);

  const count = Math.min(48, Math.floor((width * height) / 12000));
  initParticles(count);
}

function drawFrame() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  const linkDist = Math.min(width, height) * 0.14;

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > width) a.vx *= -1;
    if (a.y < 0 || a.y > height) a.vy *= -1;

    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fillStyle =
      i % 2 === 0
        ? `rgba(6, 182, 212, ${a.alpha})`
        : `rgba(245, 158, 11, ${a.alpha * 0.85})`;
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist > linkDist) continue;
      const lineAlpha = (1 - dist / linkDist) * 0.22;
      ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

function startLoop() {
  stopLoop();
  const loop = { t: 0 };
  anim = animate(loop, {
    t: 1,
    duration: 1000,
    loop: true,
    ease: "linear",
    onUpdate: drawFrame,
  });
}

function stopLoop() {
  anim?.revert();
  anim = null;
}

useResizeObserver(containerRef, () => {
  resizeCanvas();
});

watchEffect(() => {
  if (reducedMotion.value || !containerRef.value || !canvasRef.value) {
    stopLoop();
    return;
  }
  resizeCanvas();
  startLoop();
});

onBeforeUnmount(stopLoop);
</script>

<template>
  <div ref="containerRef" class="pointer-events-none absolute inset-0 z-0">
    <canvas ref="canvasRef" class="h-full w-full opacity-70 mix-blend-screen" aria-hidden="true" />
  </div>
</template>
