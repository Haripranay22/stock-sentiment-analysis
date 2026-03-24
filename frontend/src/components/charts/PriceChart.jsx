import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1e2a] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">${payload[0].value?.toFixed(2)}</p>
      {payload[1] && <p className="text-slate-400 text-xs">Vol: {(payload[1].value / 1e6).toFixed(1)}M</p>}
    </div>
  );
};

export default function PriceChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
        No price data available
      </div>
    );
  }

  const formatted = data.map((p) => ({
    ...p,
    date: p.date?.slice(0, 10),
  }));

  const prices = formatted.map((p) => p.close).filter(Boolean);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3a3a50", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="close"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#priceGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#6366f1" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
