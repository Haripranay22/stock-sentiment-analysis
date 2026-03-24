import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchDashboard, fetchSectors, triggerEtl } from "../lib/api";
import { sentimentColor, SECTOR_COLORS } from "../lib/utils";
import StockCard from "../components/common/StockCard";
import SentimentBarChart from "../components/charts/SentimentBarChart";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";

function StatPill({ label, value, color }) {
  return (
    <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl px-4 py-3 flex flex-col gap-1">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-bold text-lg" style={{ color }}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(7);

  const { data: dashboard = [], isLoading } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => fetchDashboard(days),
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors", days],
    queryFn: () => fetchSectors(days),
  });

  const { mutate: runEtl, isPending: etlRunning } = useMutation({
    mutationFn: triggerEtl,
  });

  if (isLoading) return <LoadingSpinner text="Loading dashboard…" />;

  const positiveCount = dashboard.filter((s) => s.sentiment?.label === "POSITIVE").length;
  const negativeCount = dashboard.filter((s) => s.sentiment?.label === "NEGATIVE").length;
  const neutralCount = dashboard.filter((s) => s.sentiment?.label === "NEUTRAL").length;
  const avgCompound =
    dashboard.length > 0
      ? (dashboard.reduce((sum, s) => sum + (s.sentiment?.compound ?? 0), 0) / dashboard.length).toFixed(3)
      : "—";

  const radarData = sectors.slice(0, 6).map((s) => ({
    sector: s.sector,
    compound: Math.max(-1, Math.min(1, s.compound)),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Sentiment</h1>
          <p className="text-slate-500 text-sm mt-1">Overview across all tracked tickers</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-[#16161f] border border-[#2a2a38] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
          >
            {[3, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
          <button
            onClick={() => runEtl({})}
            disabled={etlRunning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={etlRunning ? "animate-spin" : ""} />
            {etlRunning ? "Running…" : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatPill label="Avg Compound" value={avgCompound} color="#6366f1" />
        <StatPill label="Positive" value={positiveCount} color="#22c55e" />
        <StatPill label="Neutral" value={neutralCount} color="#94a3b8" />
        <StatPill label="Negative" value={negativeCount} color="#ef4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-[#16161f] border border-[#2a2a38] rounded-xl p-5">
          <p className="text-slate-400 text-sm font-medium mb-4">Sentiment by Ticker</p>
          <SentimentBarChart data={dashboard} />
        </div>

        {/* Sector radar */}
        <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-5">
          <p className="text-slate-400 text-sm font-medium mb-4">Sector Breakdown</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a38" />
                <PolarAngleAxis dataKey="sector" tick={{ fill: "#64748b", fontSize: 10 }} />
                <Radar dataKey="compound" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ background: "#1e1e2a", border: "1px solid #2a2a38", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No sector data</div>
          )}
        </div>
      </div>

      {/* Stock cards */}
      <div>
        <p className="text-slate-400 text-sm font-medium mb-4">All Tickers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard.map((stock) => (
            <StockCard key={stock.ticker} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
}
