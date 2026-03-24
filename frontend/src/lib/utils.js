import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const SENTIMENT_COLOR = {
  POSITIVE: "#22c55e",
  NEGATIVE: "#ef4444",
  NEUTRAL: "#94a3b8",
};

export const SENTIMENT_BG = {
  POSITIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  NEGATIVE: "bg-red-500/10 text-red-400 border-red-500/20",
  NEUTRAL: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export const SECTOR_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#818cf8",
  "#38bdf8", "#34d399", "#fbbf24", "#f87171",
];

export function sentimentColor(label) {
  return SENTIMENT_COLOR[label] ?? SENTIMENT_COLOR.NEUTRAL;
}

export function formatCompact(num) {
  if (num == null) return "—";
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(2);
}

export function formatPct(num) {
  if (num == null) return "—";
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}
