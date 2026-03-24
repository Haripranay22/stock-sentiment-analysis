import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchRankings } from "../lib/api";
import { sentimentColor, formatPct } from "../lib/utils";
import SentimentBadge from "../components/common/SentimentBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Rankings() {
  const [days, setDays] = useState(7);
  const navigate = useNavigate();

  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["rankings", days],
    queryFn: () => fetchRankings(days),
  });

  if (isLoading) return <LoadingSpinner text="Loading rankings…" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Rankings</h1>
          <p className="text-slate-500 text-sm mt-1">Sorted by aggregate sentiment score</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#16161f] border border-[#2a2a38] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
        >
          {[3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-slate-500 text-xs font-medium border-b border-[#2a2a38]">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Ticker</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Change</div>
          <div className="col-span-2 text-right">Compound</div>
          <div className="col-span-2 text-right">Sentiment</div>
        </div>

        {/* Rows */}
        {rankings.map((stock, idx) => {
          const { ticker, name, sentiment, latest_close, change_pct } = stock;
          const up = change_pct > 0;
          const down = change_pct < 0;
          const label = sentiment?.label ?? "NEUTRAL";

          return (
            <div
              key={ticker}
              onClick={() => navigate(`/stock/${ticker}`)}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-[#2a2a38] last:border-0 hover:bg-[#1a1a28] cursor-pointer transition-colors items-center"
            >
              {/* Rank */}
              <div className="col-span-1">
                <span
                  className={`text-sm font-bold ${idx < 3 ? "text-indigo-400" : "text-slate-600"}`}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Ticker + name */}
              <div className="col-span-3">
                <p className="text-white font-semibold text-sm">{ticker}</p>
                <p className="text-slate-600 text-xs truncate">{name}</p>
              </div>

              {/* Price */}
              <div className="col-span-2 text-right">
                <p className="text-white text-sm font-medium">
                  {latest_close != null ? `$${latest_close.toFixed(2)}` : "—"}
                </p>
              </div>

              {/* Change */}
              <div className="col-span-2 text-right">
                <span
                  className={`text-sm font-medium flex items-center justify-end gap-1 ${
                    up ? "text-green-400" : down ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {up ? <TrendingUp size={12} /> : down ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {formatPct(change_pct)}
                </span>
              </div>

              {/* Compound */}
              <div className="col-span-2 text-right">
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: sentimentColor(label) }}
                >
                  {sentiment?.compound != null
                    ? `${sentiment.compound > 0 ? "+" : ""}${sentiment.compound.toFixed(3)}`
                    : "—"}
                </span>
              </div>

              {/* Badge */}
              <div className="col-span-2 flex justify-end">
                <SentimentBadge label={label} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
