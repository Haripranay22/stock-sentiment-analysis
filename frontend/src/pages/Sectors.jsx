import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSectors } from "../lib/api";
import { sentimentColor, SECTOR_COLORS } from "../lib/utils";
import SentimentBadge from "../components/common/SentimentBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p style={{ color: sentimentColor(val >= 0.05 ? "POSITIVE" : val <= -0.05 ? "NEGATIVE" : "NEUTRAL") }}>
        Compound: {val?.toFixed(3)}
      </p>
      <p className="text-slate-400 text-xs">{payload[0].payload?.count ?? 0} articles</p>
    </div>
  );
};

export default function Sectors() {
  const [days, setDays] = useState(7);

  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["sectors", days],
    queryFn: () => fetchSectors(days),
  });

  if (isLoading) return <LoadingSpinner text="Loading sector data…" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sector Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">Aggregate sentiment grouped by market sector</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#16161f] border border-[#2a2a38] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
        >
          {[3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </div>

      {/* Bar chart */}
      <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-5 mb-6">
        <p className="text-slate-400 text-sm font-medium mb-4">Compound Score by Sector</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sectors} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" vertical={false} />
            <XAxis dataKey="sector" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[-1, 1]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
            <ReferenceLine y={0} stroke="#3a3a50" />
            <Bar dataKey="compound" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {sectors.map((s, i) => (
                <Cell key={s.sector} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sectors.map((s, i) => (
          <div key={s.sector} className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }}
                />
                <span className="text-white font-semibold text-sm">{s.sector}</span>
              </div>
              <SentimentBadge label={s.label} compound={s.compound} />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{s.count ?? 0} articles</span>
              <span className="flex gap-3">
                <span className="text-green-400">{s.positive_count ?? 0} pos</span>
                <span>{s.neutral_count ?? 0} neu</span>
                <span className="text-red-400">{s.negative_count ?? 0} neg</span>
              </span>
            </div>
            {/* Mini bar */}
            {s.count > 0 && (
              <div className="mt-3 flex gap-0.5 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500" style={{ width: `${((s.positive_count / s.count) * 100).toFixed(0)}%` }} />
                <div className="bg-slate-600" style={{ width: `${((s.neutral_count / s.count) * 100).toFixed(0)}%` }} />
                <div className="bg-red-500" style={{ width: `${((s.negative_count / s.count) * 100).toFixed(0)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
