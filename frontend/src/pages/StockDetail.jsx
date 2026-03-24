import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { fetchPrices, fetchNews, fetchSentiment, fetchSentimentHistory } from "../lib/api";
import { sentimentColor } from "../lib/utils";
import SentimentBadge from "../components/common/SentimentBadge";
import PriceChart from "../components/charts/PriceChart";
import SentimentTimeline from "../components/charts/SentimentTimeline";
import LoadingSpinner from "../components/common/LoadingSpinner";

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl px-4 py-3">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{value ?? "—"}</p>
      {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState("price");

  const { data: prices = [], isLoading: pricesLoading } = useQuery({
    queryKey: ["prices", ticker],
    queryFn: () => fetchPrices(ticker, 30),
  });

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["news", ticker, days],
    queryFn: () => fetchNews(ticker, days),
  });

  const { data: sentiment } = useQuery({
    queryKey: ["sentiment", ticker, days],
    queryFn: () => fetchSentiment(ticker, days),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["sentiment-history", ticker],
    queryFn: () => fetchSentimentHistory(ticker, 30),
  });

  const latest = prices[prices.length - 1];
  const prev = prices[prices.length - 2];
  const changePct =
    latest && prev && prev.close
      ? (((latest.close - prev.close) / prev.close) * 100).toFixed(2)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Hero row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-white">{ticker}</h1>
            {sentiment && <SentimentBadge label={sentiment.label} compound={sentiment.compound} size="md" />}
          </div>
          <p className="text-slate-500 text-sm">{sentiment?.count ?? 0} articles analysed · {days}-day window</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#16161f] border border-[#2a2a38] text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
        >
          {[3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatBox
          label="Last Close"
          value={latest?.close != null ? `$${latest.close.toFixed(2)}` : null}
          sub={latest?.date?.slice(0, 10)}
        />
        <StatBox
          label="Day Change"
          value={
            changePct != null ? (
              <span style={{ color: changePct > 0 ? "#22c55e" : changePct < 0 ? "#ef4444" : "#94a3b8" }}>
                {changePct > 0 ? "+" : ""}{changePct}%
              </span>
            ) : null
          }
        />
        <StatBox label="Compound Score" value={sentiment?.compound?.toFixed(3)} />
        <StatBox
          label="Positive / Negative"
          value={sentiment ? `${sentiment.positive_count} / ${sentiment.negative_count}` : null}
          sub={`${sentiment?.neutral_count ?? 0} neutral`}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[#2a2a38]">
        {["price", "sentiment", "news"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {t === "news" ? `News (${news.length})` : t === "sentiment" ? "Sentiment History" : "Price Chart"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "price" && (
        <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-5">
          <p className="text-slate-400 text-sm font-medium mb-4">30-Day Price (Close)</p>
          {pricesLoading ? <LoadingSpinner text="Loading prices…" /> : <PriceChart data={prices} />}
        </div>
      )}

      {tab === "sentiment" && (
        <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-5">
          <p className="text-slate-400 text-sm font-medium mb-4">Daily Sentiment Compound Score</p>
          <SentimentTimeline data={history} />
          {/* Breakdown bars */}
          {sentiment && sentiment.count > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Positive", count: sentiment.positive_count, color: "#22c55e" },
                { label: "Neutral", count: sentiment.neutral_count, color: "#94a3b8" },
                { label: "Negative", count: sentiment.negative_count, color: "#ef4444" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                  <p className="text-slate-500 text-xs mt-1">{label}</p>
                  <div className="mt-2 h-1 bg-[#2a2a38] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / sentiment.count) * 100}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "news" && (
        <div className="bg-[#16161f] border border-[#2a2a38] rounded-xl divide-y divide-[#2a2a38]">
          {newsLoading ? (
            <LoadingSpinner text="Loading news…" />
          ) : news.length === 0 ? (
            <div className="py-16 text-center text-slate-600 text-sm">
              No articles found. Run ETL first or add a NewsAPI key.
            </div>
          ) : (
            news.map((article) => (
              <div key={article.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-[#1a1a28] transition-colors">
                <div className="flex-1 min-w-0">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-200 hover:text-white text-sm font-medium leading-snug flex items-start gap-1.5 no-underline group"
                  >
                    <span className="truncate">{article.title}</span>
                    <ExternalLink size={12} className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <p className="text-slate-600 text-xs mt-1">
                    {article.source} · {article.published_at?.slice(0, 10)}
                  </p>
                </div>
                {article.sentiment_label && (
                  <SentimentBadge
                    label={article.sentiment_label}
                    compound={article.sentiment_compound}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
