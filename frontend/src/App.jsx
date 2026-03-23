import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const API = "http://localhost:8000";

const sentimentColor = (label) => {
  if (label === "POSITIVE") return "#22c55e";
  if (label === "NEGATIVE") return "#ef4444";
  return "#94a3b8";
};

export default function App() {
  const [dashboard, setDashboard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etlRunning, setEtlRunning] = useState(false);
  const [days, setDays] = useState(7);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/dashboard?days=${days}`);
      setDashboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStock = async (ticker) => {
    setSelected(ticker);
    const { data } = await axios.get(`${API}/stocks/${ticker}/news?days=${days}`);
    setNews(data);
  };

  const runEtl = async () => {
    setEtlRunning(true);
    try {
      await axios.post(`${API}/etl/run`, { price_days: 30, news_days: days });
      setTimeout(() => {
        fetchDashboard();
        setEtlRunning(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      setEtlRunning(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [days]);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#f1f5f9", padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>Stock Sentiment Dashboard</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
            Window:&nbsp;
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px" }}
            >
              {[3, 7, 14, 30].map((d) => <option key={d} value={d}>{d}d</option>)}
            </select>
          </label>
          <button
            onClick={runEtl}
            disabled={etlRunning}
            style={{
              background: etlRunning ? "#334155" : "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: etlRunning ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {etlRunning ? "Running ETL…" : "Refresh Data"}
          </button>
        </div>
      </header>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "4rem" }}>Loading…</p>
      ) : (
        <>
          {/* Sentiment bar chart */}
          <section style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", marginBottom: "2rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#94a3b8" }}>
              Sentiment Overview ({days}-day window)
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dashboard} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="ticker" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis domain={[-1, 1]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                  formatter={(v, _n, props) => [
                    `${v.toFixed(3)} (${props.payload?.sentiment?.label})`,
                    "Compound",
                  ]}
                />
                <Bar dataKey="sentiment.compound" radius={[4, 4, 0, 0]}>
                  {dashboard.map((entry) => (
                    <Cell key={entry.ticker} fill={sentimentColor(entry.sentiment?.label)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Stock cards */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {dashboard.map((s) => (
              <div
                key={s.ticker}
                onClick={() => fetchStock(s.ticker)}
                style={{
                  background: selected === s.ticker ? "#312e81" : "#1e293b",
                  border: `1px solid ${selected === s.ticker ? "#6366f1" : "#334155"}`,
                  borderRadius: 10,
                  padding: "1rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{s.ticker}</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: sentimentColor(s.sentiment?.label),
                      background: "#0f172a",
                      borderRadius: 6,
                      padding: "2px 6px",
                    }}
                  >
                    {s.sentiment?.label ?? "—"}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 4 }}>{s.name}</div>
                <div style={{ marginTop: 8, fontSize: "0.875rem" }}>
                  {s.latest_close != null ? `$${s.latest_close.toFixed(2)}` : "—"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{s.sentiment?.count ?? 0} articles</div>
              </div>
            ))}
          </section>

          {/* Detail panel */}
          {selected && (
            <section style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem" }}>
              <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#94a3b8" }}>
                {selected} — Recent News
              </h2>
              {news.length === 0 ? (
                <p style={{ color: "#64748b" }}>No articles found. Try running ETL first.</p>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {news.map((a) => (
                    <li key={a.id} style={{ background: "#0f172a", borderRadius: 8, padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <a href={a.url} target="_blank" rel="noreferrer" style={{ color: "#e2e8f0", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}>
                          {a.title}
                        </a>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
                          {a.source} · {a.published_at ? a.published_at.slice(0, 10) : ""}
                        </div>
                      </div>
                      {a.sentiment_label && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: sentimentColor(a.sentiment_label), whiteSpace: "nowrap" }}>
                          {a.sentiment_label} ({a.sentiment_compound?.toFixed(2)})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
