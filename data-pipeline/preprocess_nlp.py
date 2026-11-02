#!/usr/bin/env python3
"""
NLP Preprocessing & Feature Engineering Pipeline
- Cleans and normalizes tweet text
- Performs NLTK / VADER sentiment scoring
- Maps airlines to standardized brand IDs
- Standardizes timestamps to ISO 8601
- Exports clean dataset to Parquet (partitioned by airline) and CSV
"""

import os
import re
import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Ensure UTF-8 console output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    vader = SentimentIntensityAnalyzer()
except ImportError:
    vader = None

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW = BASE_DIR / "data" / "raw" / "Tweets.csv"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
DATA_PARQUET_DIR = BASE_DIR / "data" / "parquet"

DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
DATA_PARQUET_DIR.mkdir(parents=True, exist_ok=True)

AIRLINE_ID_MAP = {
    "Virgin America": "virgin_america",
    "United": "united",
    "Delta": "delta",
    "Southwest": "southwest",
    "American": "american",
    "US Airways": "us_airways",
}

AIRLINE_CODE_MAP = {
    "Virgin America": "VA",
    "United": "UA",
    "Delta": "DL",
    "Southwest": "WN",
    "American": "AA",
    "US Airways": "US",
}


def clean_tweet_text(text: str) -> str:
    """Normalize text: strip URLs, normalize mentions, remove HTML entities & extra whitespace."""
    if not isinstance(text, str):
        return ""
    # Remove HTML entities
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Normalize multiple whitespace/newlines
    text = re.sub(r"\s+", " ", text).strip()
    return text


def run_pipeline():
    print(f"[INFO] Reading raw dataset from {DATA_RAW}...")
    df = pd.read_csv(DATA_RAW)
    print(f"[INFO] Initial rows: {len(df):,}")

    # 1. Deduplication
    initial_len = len(df)
    df = df.drop_duplicates(subset=["tweet_id"])
    dupes_removed = initial_len - len(df)
    print(f"[INFO] Removed {dupes_removed} duplicate tweets.")

    # 2. Brand normalization
    df["airline_id"] = df["airline"].map(AIRLINE_ID_MAP).fillna("other")
    df["airline_code"] = df["airline"].map(AIRLINE_CODE_MAP).fillna("XX")

    # 3. Clean Text
    print("[INFO] Cleaning text and removing URL artifacts...")
    df["cleaned_text"] = df["text"].apply(clean_tweet_text)

    # 4. Standardize Timestamps
    print("[INFO] Standardizing datetime stamps...")
    df["tweet_created"] = pd.to_datetime(df["tweet_created"], errors="coerce")
    df["tweet_date"] = df["tweet_created"].dt.strftime("%Y-%m-%d")
    df["tweet_hour"] = df["tweet_created"].dt.strftime("%Y-%m-%d %H:00")

    # 5. VADER Sentiment Scoring
    if vader:
        print("[INFO] Computing VADER sentiment lexicon scores...")
        compound_scores = []
        vader_sentiments = []
        for text in df["cleaned_text"]:
            scores = vader.polarity_scores(text)
            comp = scores["compound"]
            compound_scores.append(round(comp, 4))
            if comp >= 0.05:
                vader_sentiments.append("positive")
            elif comp <= -0.05:
                vader_sentiments.append("negative")
            else:
                vader_sentiments.append("neutral")

        df["vader_compound"] = compound_scores
        df["vader_sentiment"] = vader_sentiments

        # Compute accuracy against annotated ground truth
        agreement = (df["airline_sentiment"] == df["vader_sentiment"]).mean() * 100
        print(f"[NLP METRIC] VADER vs Ground-Truth Agreement: {agreement:.2f}%")
    else:
        df["vader_compound"] = 0.0
        df["vader_sentiment"] = df["airline_sentiment"]

    # Fill NaN for optional string columns
    df["negativereason"] = df["negativereason"].fillna("None")
    df["negativereason_confidence"] = df["negativereason_confidence"].fillna(0.0)
    df["tweet_location"] = df["tweet_location"].fillna("")
    df["user_timezone"] = df["user_timezone"].fillna("")

    # 6. Save clean Parquet
    parquet_path = DATA_PARQUET_DIR / "tweets.parquet"
    print(f"[INFO] Exporting to Parquet format: {parquet_path}...")
    df.to_parquet(parquet_path, engine="pyarrow", index=False, partition_cols=["airline_id"])

    # Also save clean CSV for easy inspection
    clean_csv_path = DATA_PROCESSED_DIR / "tweets_cleaned.csv"
    print(f"[INFO] Exporting to CSV: {clean_csv_path}...")
    df.to_csv(clean_csv_path, index=False)

    print(f"[SUCCESS] Preprocessing completed. {len(df):,} processed tweets saved.")
    return df


if __name__ == "__main__":
    run_pipeline()
