"""
FastAPI entry point for the Stock Sentiment Dashboard.

Run:
    uvicorn main:app --reload
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import (
    get_db,
    init_db,
    Stock,
    StockPrice,
    NewsArticle,
    SentimentScore,
)
from sentiment import aggregate_scores
from etl import run_etl

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stock Sentiment Dashboard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ---------------------------------------------------------------------------
# Pydantic response schemas
# ---------------------------------------------------------------------------

class StockOut(BaseModel):
    ticker: str
    name: str
    sector: Optional[str]

    class Config:
        from_attributes = True


class PricePoint(BaseModel):
    date: datetime
    open: Optional[float]
    high: Optional[float]
    low: Optional[float]
    close: Optional[float]
    volume: Optional[float]

    class Config:
        from_attributes = True


class ArticleOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    url: Optional[str]
    source: Optional[str]
    published_at: Optional[datetime]
    sentiment_label: Optional[str] = None
    sentiment_compound: Optional[float] = None

    class Config:
        from_attributes = True


class SentimentSummary(BaseModel):
    ticker: str
    compound: float
    label: str
    count: int
    positive_count: int
    neutral_count: int
    negative_count: int


class ETLRequest(BaseModel):
    tickers: Optional[list[str]] = None
    price_days: int = 30
    news_days: int = 7


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "stock-sentiment-api"}


@app.get("/stocks", response_model=list[StockOut], tags=["Stocks"])
def list_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).all()


@app.get("/stocks/{ticker}/prices", response_model=list[PricePoint], tags=["Stocks"])
def get_prices(
    ticker: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(StockPrice)
        .filter(StockPrice.ticker == ticker.upper(), StockPrice.date >= cutoff)
        .order_by(StockPrice.date)
        .all()
    )
    return rows


@app.get("/stocks/{ticker}/news", response_model=list[ArticleOut], tags=["News"])
def get_news(
    ticker: str,
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    articles = (
        db.query(NewsArticle)
        .filter(NewsArticle.ticker == ticker.upper(), NewsArticle.published_at >= cutoff)
        .order_by(NewsArticle.published_at.desc())
        .limit(limit)
        .all()
    )

    result = []
    for a in articles:
        score = (
            db.query(SentimentScore)
            .filter(SentimentScore.article_id == a.id)
            .first()
        )
        result.append(
            ArticleOut(
                id=a.id,
                title=a.title,
                description=a.description,
                url=a.url,
                source=a.source,
                published_at=a.published_at,
                sentiment_label=score.label if score else None,
                sentiment_compound=score.compound if score else None,
            )
        )
    return result


@app.get("/stocks/{ticker}/sentiment", response_model=SentimentSummary, tags=["Sentiment"])
def get_sentiment(
    ticker: str,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    scores = (
        db.query(SentimentScore)
        .join(NewsArticle, SentimentScore.article_id == NewsArticle.id)
        .filter(
            SentimentScore.ticker == ticker.upper(),
            NewsArticle.published_at >= cutoff,
        )
        .all()
    )

    if not scores:
        return SentimentSummary(
            ticker=ticker.upper(),
            compound=0.0,
            label="NEUTRAL",
            count=0,
            positive_count=0,
            neutral_count=0,
            negative_count=0,
        )

    raw = [{"compound": s.compound, "label": s.label} for s in scores]
    summary = aggregate_scores(raw)
    return SentimentSummary(ticker=ticker.upper(), **summary)


@app.get("/dashboard", tags=["Dashboard"])
def dashboard(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Aggregate sentiment for all tracked stocks — used by the frontend overview."""
    stocks = db.query(Stock).all()
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = []

    for stock in stocks:
        scores = (
            db.query(SentimentScore)
            .join(NewsArticle, SentimentScore.article_id == NewsArticle.id)
            .filter(
                SentimentScore.ticker == stock.ticker,
                NewsArticle.published_at >= cutoff,
            )
            .all()
        )
        raw = [{"compound": s.compound, "label": s.label} for s in scores]
        summary = aggregate_scores(raw)

        latest_price = (
            db.query(StockPrice)
            .filter(StockPrice.ticker == stock.ticker)
            .order_by(StockPrice.date.desc())
            .first()
        )

        result.append({
            "ticker": stock.ticker,
            "name": stock.name,
            "sector": stock.sector,
            "sentiment": summary,
            "latest_close": latest_price.close if latest_price else None,
            "latest_date": latest_price.date if latest_price else None,
        })

    return result


@app.post("/etl/run", tags=["ETL"])
def trigger_etl(request: ETLRequest, background_tasks: BackgroundTasks):
    """Kick off ETL as a background task."""
    background_tasks.add_task(
        run_etl,
        tickers=request.tickers,
        price_days=request.price_days,
        news_days=request.news_days,
    )
    return {"message": "ETL job started in background."}
