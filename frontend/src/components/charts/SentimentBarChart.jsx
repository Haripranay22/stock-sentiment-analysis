import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { sentimentColor } from "../../lib/utils";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p style={{ color: sentimentColor(d.payload?.sentiment?.label) }}>
        Compound: {d.value?.toFixed(3)}
      </p>
      <p className="text-slate-400 text-xs">{d.payload?.sentiment?.count ?? 0} articles</p>
    </div>
  );
};

export default function SentimentBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" vertical={false} />
        <XAxis dataKey="ticker" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[-1, 1]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
        <ReferenceLine y={0} stroke="#3a3a50" />
        <Bar dataKey="sentiment.compound" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.ticker} fill={sentimentColor(entry.sentiment?.label)} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
