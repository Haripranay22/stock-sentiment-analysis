import { cn, SENTIMENT_BG } from "../../lib/utils";

export default function SentimentBadge({ label, compound, size = "sm" }) {
  const bg = SENTIMENT_BG[label] ?? SENTIMENT_BG.NEUTRAL;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border rounded-full font-semibold",
        bg,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      {label ?? "NEUTRAL"}
      {compound != null && (
        <span className="opacity-70">{compound > 0 ? "+" : ""}{compound.toFixed(2)}</span>
      )}
    </span>
  );
}
