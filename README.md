# SentimentIQ — Stock Sentiment Dashboard

A full-stack stock sentiment analysis platform inspired by [Fastlytics](https://github.com/Fastlytics/Fastlytics). Tracks real-time news sentiment for major stocks using NLP, visualised in a polished dark-themed dashboard.

## Features

- **Sentiment Analysis** — VADER NLP scoring on live news headlines (compound score from -1.0 to +1.0)
- **Price Charts** — 30-day OHLCV history via Yahoo Finance with interactive area charts
- **Multi-page Dashboard** — Landing, Dashboard, Stock Detail, Rankings, Sectors
- **Rankings** — All tickers ranked by aggregate sentiment score with price change %
- **Sector Analysis** — Sentiment grouped by market sector with radar + bar charts
- **Stock Detail** — Per-ticker tabbed view: price chart, sentiment timeline, news feed
- **ETL Pipeline** — One-command data refresh pulling prices + news + scoring
- **REST API** — FastAPI backend with auto-generated Swagger docs

## Tech Stack

### Backend
| | |
|---|---|
| Framework | FastAPI |
| Database | SQLite via SQLAlchemy |
| Sentiment | NLTK VADER |
| Stock Prices | yfinance (Yahoo Finance) |
| News | NewsAPI |

### Frontend
| | |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM |
| Data Fetching | TanStack Query |
| Charts | Recharts |
| Icons | Lucide React |

## Project Structure

```
stock-sentiment-analysis/
├── backend/
│   ├── main.py          # FastAPI app + all endpoints
│   ├── database.py      # SQLAlchemy models (Stock, Price, Article, Sentiment)
│   ├── etl.py           # ETL pipeline (prices + news + sentiment scoring)
│   ├── sentiment.py     # VADER wrapper (analyze, aggregate)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/           # Landing, Dashboard, StockDetail, Rankings, Sectors
        ├── components/
        │   ├── charts/      # PriceChart, SentimentBarChart, SentimentTimeline
        │   ├── common/      # StockCard, SentimentBadge, LoadingSpinner
        │   └── layout/      # Navbar
        └── lib/
            ├── api.js       # All API call functions
            └── utils.js     # Helpers, color maps, formatters
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Free [NewsAPI key](https://newsapi.org/register)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\Activate.ps1        # Windows PowerShell
# source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Add your NewsAPI key
echo NEWSAPI_KEY=your_key_here > .env

# Seed database with prices + news + sentiment
python etl.py

# Start API server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
Interactive API docs at `http://localhost:8000/docs`

### 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/stocks` | List all tracked tickers |
| GET | `/stocks/{ticker}/prices?days=30` | OHLCV price history |
| GET | `/stocks/{ticker}/news?days=7` | News articles with sentiment |
| GET | `/stocks/{ticker}/sentiment?days=7` | Aggregate sentiment summary |
| GET | `/stocks/{ticker}/sentiment-history?days=30` | Daily sentiment timeline |
| GET | `/dashboard?days=7` | All tickers — sentiment + latest price |
| GET | `/rankings?days=7` | Tickers ranked by compound score |
| GET | `/sectors?days=7` | Sentiment grouped by sector |
| POST | `/etl/run` | Trigger ETL as background task |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with feature overview |
| `/dashboard` | Sentiment bar chart, sector radar, all stock cards |
| `/stock/:ticker` | Price chart, sentiment timeline, news feed |
| `/rankings` | Leaderboard sorted by sentiment score |
| `/sectors` | Sector-level sentiment analysis |

## Default Tracked Tickers

`AAPL` `MSFT` `GOOGL` `AMZN` `TSLA` `NVDA` `JPM` `META`

To add more tickers, edit `DEFAULT_TICKERS` in `backend/etl.py`.

## Refreshing Data

Either run `python etl.py` from the terminal, or click the **Refresh Data** button in the dashboard UI — it triggers the ETL pipeline as a background task via the API.

## License

MIT
