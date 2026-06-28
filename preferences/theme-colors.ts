import type { ThemeColorPreset } from "./types";

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  {
    id: "default",
    label: "默认",
    primary: "#06b6d4",
    primaryDark: "#0891b2",
    primarySoft: "rgba(6, 182, 212, 0.16)",
    rgb: "6, 182, 212",
  },
  {
    id: "violet",
    label: "紫罗兰",
    primary: "#8b5cf6",
    primaryDark: "#7c3aed",
    primarySoft: "rgba(139, 92, 246, 0.16)",
    rgb: "139, 92, 246",
  },
  {
    id: "pink",
    label: "樱花粉",
    primary: "#ec4899",
    primaryDark: "#db2777",
    primarySoft: "rgba(236, 72, 153, 0.16)",
    rgb: "236, 72, 153",
  },
  {
    id: "yellow",
    label: "柠檬黄",
    primary: "#eab308",
    primaryDark: "#ca8a04",
    primarySoft: "rgba(234, 179, 8, 0.16)",
    rgb: "234, 179, 8",
  },
  {
    id: "sky",
    label: "天蓝色",
    primary: "#0ea5e9",
    primaryDark: "#0284c7",
    primarySoft: "rgba(14, 165, 233, 0.16)",
    rgb: "14, 165, 233",
  },
  {
    id: "green",
    label: "浅绿色",
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primarySoft: "rgba(34, 197, 94, 0.16)",
    rgb: "34, 197, 94",
  },
  {
    id: "zinc",
    label: "锌色灰",
    primary: "#71717a",
    primaryDark: "#52525b",
    primarySoft: "rgba(113, 113, 122, 0.16)",
    rgb: "113, 113, 122",
  },
  {
    id: "teal",
    label: "深绿色",
    primary: "#14b8a6",
    primaryDark: "#0d9488",
    primarySoft: "rgba(20, 184, 166, 0.16)",
    rgb: "20, 184, 166",
  },
  {
    id: "blue",
    label: "深蓝色",
    primary: "#3b82f6",
    primaryDark: "#2563eb",
    primarySoft: "rgba(59, 130, 246, 0.16)",
    rgb: "59, 130, 246",
  },
  {
    id: "orange",
    label: "橙黄色",
    primary: "#f97316",
    primaryDark: "#ea580c",
    primarySoft: "rgba(249, 115, 22, 0.16)",
    rgb: "249, 115, 22",
  },
  {
    id: "rose",
    label: "玫瑰红",
    primary: "#f43f5e",
    primaryDark: "#e11d48",
    primarySoft: "rgba(244, 63, 94, 0.16)",
    rgb: "244, 63, 94",
  },
  {
    id: "neutral",
    label: "中性色",
    primary: "#737373",
    primaryDark: "#525252",
    primarySoft: "rgba(115, 115, 115, 0.16)",
    rgb: "115, 115, 115",
  },
];

export function findThemeColor(id: string): ThemeColorPreset {
  return (
    THEME_COLOR_PRESETS.find((item) => item.id === id) ?? THEME_COLOR_PRESETS[0]
  );
}
