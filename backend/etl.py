"""
ETL pipeline
  1. Fetch historical stock prices via yfinance
  2. Fetch news headlines via NewsAPI (requires NEWSAPI_KEY env var)
  3. Run VADER sentiment on each article
  4. Persist everything to the database
"""

import os
import logging
from datetime import datetime, timedelta

from dotenv import load_dotenv
load_dotenv()

import requests
import yfinance as yf
from sqlalchemy.orm import Session

from database import Stock, StockPrice, NewsArticle, SentimentScore, SessionLocal, init_db
from sentiment import analyze_article

logger = logging.getLogger(__name__)

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")
NEWSAPI_URL = "https://newsapi.org/v2/everything"

DEFAULT_TICKERS = [
    {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
    {"ticker": "MSFT", "name": "Microsoft Corp.", "sector": "Technology"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Cyclical"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Cyclical"},
    {"ticker": "NVDA", "name": "NVIDIA Corp.", "sector": "Technology"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial Services"},
    {"ticker": "META", "name": "Meta Platforms Inc.", "sector": "Technology"},
]


# ---------------------------------------------------------------------------
# Stock seed helpers
# ---------------------------------------------------------------------------

def seed_stocks(db: Session, tickers: list[dict] = DEFAULT_TICKERS):
    """Insert default tickers if they don't exist yet."""
    for entry in tickers:
        exists = db.query(Stock).filter(Stock.ticker == entry["ticker"]).first()
        if not exists:
            db.add(Stock(**entry))
    db.commit()
    logger.info("Stocks seeded.")


# ---------------------------------------------------------------------------
# Price ETL
# ---------------------------------------------------------------------------

def fetch_prices(ticker: str, days: int = 30) -> list[dict]:
    """Download OHLCV data from Yahoo Finance."""
    df = yf.Ticker(ticker).history(period=f"{days}d")
    if df.empty:
        return []

    rows = []
    for idx, row in df.iterrows():
        rows.append({
            "ticker": ticker,
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": float(row["Volume"]),
            "date": idx.to_pydatetime().replace(tzinfo=None),
        })
    return rows


def load_prices(db: Session, ticker: str, days: int = 30):
    rows = fetch_prices(ticker, days)
    for row in rows:
        exists = (
            db.query(StockPrice)
            .filter(StockPrice.ticker == row["ticker"], StockPrice.date == row["date"])
            .first()
        )
        if not exists:
            db.add(StockPrice(**row))
    db.commit()
    logger.info("Loaded %d price rows for %s.", len(rows), ticker)


# ---------------------------------------------------------------------------
# News + Sentiment ETL
# ---------------------------------------------------------------------------

def fetch_news(ticker: str, days: int = 7) -> list[dict]:
    """Fetch articles from NewsAPI for a given ticker symbol."""
    if not NEWSAPI_KEY:
        logger.warning("NEWSAPI_KEY not set — skipping news fetch for %s.", ticker)
        return []

    from_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    params = {
        "q": ticker,
        "from": from_date,
        "sortBy": "publishedAt",
        "language": "en",
        "apiKey": NEWSAPI_KEY,
        "pageSize": 50,
    }

    try:
        resp = requests.get(NEWSAPI_URL, params=params, timeout=10)
        resp.raise_for_status()
        articles = resp.json().get("articles", [])
    except requests.RequestException as exc:
        logger.error("NewsAPI request failed for %s: %s", ticker, exc)
        return []

    return [
        {
            "ticker": ticker,
            "title": a.get("title") or "",
            "description": a.get("description") or "",
            "url": a.get("url") or "",
            "source": (a.get("source") or {}).get("name") or "",
            "published_at": datetime.fromisoformat(
                a["publishedAt"].replace("Z", "+00:00")
            ).replace(tzinfo=None) if a.get("publishedAt") else None,
        }
        for a in articles
        if a.get("title")
    ]


def load_news_and_sentiment(db: Session, ticker: str, days: int = 7):
    articles = fetch_news(ticker, days)

    for article_data in articles:
        # Deduplicate by title + ticker
        exists = (
            db.query(NewsArticle)
            .filter(NewsArticle.ticker == ticker, NewsArticle.title == article_data["title"])
            .first()
        )
        if exists:
            continue

        article = NewsArticle(**article_data)
        db.add(article)
        db.flush()  # get article.id

        score = analyze_article(article.title, article.description)
        db.add(
            SentimentScore(
                ticker=ticker,
                article_id=article.id,
                compound=score["compound"],
                positive=score["positive"],
                neutral=score["neutral"],
                negative=score["negative"],
                label=score["label"],
            )
        )

    db.commit()
    logger.info("Loaded %d articles + sentiment for %s.", len(articles), ticker)


# ---------------------------------------------------------------------------
# Full pipeline entry point
# ---------------------------------------------------------------------------

def run_etl(tickers: list[str] | None = None, price_days: int = 30, news_days: int = 7):
    init_db()
    db = SessionLocal()
    try:
        seed_stocks(db)

        if tickers is None:
            tickers = [s.ticker for s in db.query(Stock).all()]

        for ticker in tickers:
            logger.info("Running ETL for %s …", ticker)
            load_prices(db, ticker, price_days)
            load_news_and_sentiment(db, ticker, news_days)

        logger.info("ETL complete.")
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_etl()
