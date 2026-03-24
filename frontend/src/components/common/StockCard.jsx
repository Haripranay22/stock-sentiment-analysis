import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, sentimentColor, formatPct } from "../../lib/utils";
import SentimentBadge from "./SentimentBadge";

export default function StockCard({ stock }) {
  const navigate = useNavigate();
  const { ticker, name, sector, sentiment, latest_close, change_pct } = stock;
  const label = sentiment?.label ?? "NEUTRAL";
  const up = change_pct > 0;
  const down = change_pct < 0;

  return (
    <div
      onClick={() => navigate(`/stock/${ticker}`)}
      className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-4 cursor-pointer hover:border-indigo-500/40 hover:bg-[#1a1a28] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">{ticker}</span>
            <SentimentBadge label={label} compound={sentiment?.compound} />
          </div>
          <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[160px]">{name}</p>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${sentimentColor(label)}18` }}
        >
          {label === "POSITIVE" ? (
            <TrendingUp size={16} style={{ color: sentimentColor(label) }} />
          ) : label === "NEGATIVE" ? (
            <TrendingDown size={16} style={{ color: sentimentColor(label) }} />
          ) : (
            <Minus size={16} style={{ color: sentimentColor(label) }} />
          )}
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-white font-semibold text-xl">
            {latest_close != null ? `$${latest_close.toFixed(2)}` : "—"}
          </p>
          {change_pct != null && (
            <p className={cn("text-xs font-medium", up ? "text-green-400" : down ? "text-red-400" : "text-slate-400")}>
              {formatPct(change_pct)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">{sector}</p>
          <p className="text-slate-600 text-xs mt-0.5">{sentiment?.count ?? 0} articles</p>
        </div>
      </div>

      {/* Sentiment bar */}
      {sentiment?.count > 0 && (
        <div className="mt-3 flex gap-0.5 h-1 rounded-full overflow-hidden">
          <div
            className="bg-green-500 rounded-l-full"
            style={{ width: `${((sentiment.positive_count / sentiment.count) * 100).toFixed(0)}%` }}
          />
          <div
            className="bg-slate-600"
            style={{ width: `${((sentiment.neutral_count / sentiment.count) * 100).toFixed(0)}%` }}
          />
          <div
            className="bg-red-500 rounded-r-full"
            style={{ width: `${((sentiment.negative_count / sentiment.count) * 100).toFixed(0)}%` }}
          />
        </div>
      )}
    </div>
  );
}
