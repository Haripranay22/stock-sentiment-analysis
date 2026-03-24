import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { sentimentColor } from "../../lib/utils";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p style={{ color: sentimentColor(val >= 0.05 ? "POSITIVE" : val <= -0.05 ? "NEGATIVE" : "NEUTRAL") }} className="font-semibold">
        {val > 0 ? "+" : ""}{val?.toFixed(3)}
      </p>
      <p className="text-slate-500 text-xs">{payload[0].payload?.count ?? 0} articles</p>
    </div>
  );
};

export default function SentimentTimeline({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        No sentiment history available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis domain={[-1, 1]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3a3a50" }} />
        <ReferenceLine y={0} stroke="#3a3a50" strokeDasharray="4 4" />
        <ReferenceLine y={0.05} stroke="#22c55e" strokeOpacity={0.2} strokeDasharray="2 4" />
        <ReferenceLine y={-0.05} stroke="#ef4444" strokeOpacity={0.2} strokeDasharray="2 4" />
        <Line
          type="monotone"
          dataKey="compound"
          stroke="#6366f1"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            return (
              <circle
                key={`dot-${payload.date}`}
                cx={cx}
                cy={cy}
                r={3}
                fill={sentimentColor(payload.label)}
                stroke="none"
              />
            );
          }}
          activeDot={{ r: 5, fill: "#6366f1" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
