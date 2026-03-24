import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart2, Newspaper, Trophy, ArrowRight, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    title: "Sentiment Analysis",
    desc: "VADER-powered NLP scoring on live news headlines. Track compound scores from -1.0 to +1.0 in real time.",
  },
  {
    icon: TrendingUp,
    title: "Price Charts",
    desc: "30-day OHLCV price history from Yahoo Finance for every tracked ticker, with interactive area charts.",
  },
  {
    icon: Newspaper,
    title: "News Intelligence",
    desc: "Per-article sentiment labeling — POSITIVE, NEUTRAL, or NEGATIVE — with source and timestamp.",
  },
  {
    icon: Trophy,
    title: "Rankings",
    desc: "Every ticker ranked by aggregate sentiment score so you can spot the market mood at a glance.",
  },
];

const tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL", "JPM"];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#2a2a38] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          SentimentIQ
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Open Dashboard
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-3 py-1 text-indigo-400 text-xs font-medium mb-6">
          <Zap size={12} />
          Powered by VADER NLP + Yahoo Finance
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Stock Sentiment
          <br />
          <span className="text-indigo-400">Democratised</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Real-time news sentiment analysis for the stocks that matter. Track market mood, spot trends, and make smarter decisions.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            View Dashboard <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/rankings")}
            className="flex items-center gap-2 border border-[#2a2a38] text-slate-300 hover:text-white hover:border-slate-500 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            See Rankings
          </button>
        </div>
      </section>

      {/* Ticker strip */}
      <div className="border-y border-[#2a2a38] bg-[#111118] py-4 overflow-hidden mb-20">
        <div className="flex gap-8 px-6 justify-center flex-wrap">
          {tickers.map((t) => (
            <span
              key={t}
              onClick={() => navigate(`/stock/${t}`)}
              className="text-slate-400 hover:text-indigo-400 text-sm font-mono font-semibold cursor-pointer transition-colors"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-12 text-white">
          Everything you need to read the market mood
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#16161f] border border-[#2a2a38] rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/15 flex items-center justify-center mb-4">
                <Icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
