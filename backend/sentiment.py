import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from typing import Optional

# Download VADER lexicon on first use
def _ensure_vader():
    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)


_ensure_vader()
_analyzer = SentimentIntensityAnalyzer()


def analyze_text(text: str) -> dict:
    """
    Run VADER sentiment analysis on a piece of text.

    Returns a dict with keys:
        compound  : float in [-1.0, 1.0]
        positive  : float in [0.0, 1.0]
        neutral   : float in [0.0, 1.0]
        negative  : float in [0.0, 1.0]
        label     : "POSITIVE" | "NEUTRAL" | "NEGATIVE"
    """
    if not text or not text.strip():
        return {"compound": 0.0, "positive": 0.0, "neutral": 1.0, "negative": 0.0, "label": "NEUTRAL"}

    scores = _analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "POSITIVE"
    elif compound <= -0.05:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    return {
        "compound": round(compound, 4),
        "positive": round(scores["pos"], 4),
        "neutral": round(scores["neu"], 4),
        "negative": round(scores["neg"], 4),
        "label": label,
    }


def analyze_article(title: str, description: Optional[str] = None) -> dict:
    """Combine title + description for a richer sentiment signal."""
    combined = title
    if description:
        combined = f"{title}. {description}"
    return analyze_text(combined)


def aggregate_scores(scores: list[dict]) -> dict:
    """
    Aggregate a list of sentiment score dicts into a single summary.
    Returns mean compound and a dominant label.
    """
    if not scores:
        return {"compound": 0.0, "label": "NEUTRAL", "count": 0}

    total = sum(s["compound"] for s in scores)
    mean = total / len(scores)

    if mean >= 0.05:
        label = "POSITIVE"
    elif mean <= -0.05:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    return {
        "compound": round(mean, 4),
        "label": label,
        "count": len(scores),
        "positive_count": sum(1 for s in scores if s["label"] == "POSITIVE"),
        "neutral_count": sum(1 for s in scores if s["label"] == "NEUTRAL"),
        "negative_count": sum(1 for s in scores if s["label"] == "NEGATIVE"),
    }
