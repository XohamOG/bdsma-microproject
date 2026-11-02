#!/usr/bin/env python3
"""
Download and validate the Kaggle Twitter US Airline Sentiment dataset.
"""

import os
import sys
import urllib.request
from pathlib import Path
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW = BASE_DIR / "data" / "raw"
DATA_RAW.mkdir(parents=True, exist_ok=True)
TARGET_CSV = DATA_RAW / "Tweets.csv"

DATA_URLS = [
    "https://raw.githubusercontent.com/chawit/data-Airline/master/TweetsAirline.csv",
    "https://raw.githubusercontent.com/Cadarn/PyData-Prefect-Workshop/main/streamlit_app/Tweets.csv",
]


def download_and_validate():
    print(f"[INFO] Target path: {TARGET_CSV}")
    needs_download = not TARGET_CSV.exists() or TARGET_CSV.stat().st_size < 1000000
    if needs_download:
        downloaded = False
        for url in DATA_URLS:
            try:
                print(f"[INFO] Attempting download from {url}...")
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp, open(TARGET_CSV, "wb") as out_file:
                    out_file.write(resp.read())
                downloaded = True
                print(f"[INFO] Download succeeded from {url}.")
                break
            except Exception as e:
                print(f"[WARN] Failed to download from {url}: {e}")

        if not downloaded:
            raise RuntimeError("All download URLs failed. Please verify internet connection.")
    else:
        print(f"[INFO] File already exists at {TARGET_CSV}. Skipping download.")

    size_mb = TARGET_CSV.stat().st_size / (1024 * 1024)
    print(f"[INFO] File size: {size_mb:.2f} MB")

    df = pd.read_csv(TARGET_CSV)
    print(f"\n[VALIDATION] Successfully loaded dataset:")
    print(f"  - Total Rows:    {len(df):,}")
    print(f"  - Total Columns: {len(df.columns)}")
    print(f"  - Column Names:  {list(df.columns)}")
    print("\n[AIRLINE BREAKDOWN]:")
    for airline, count in df["airline"].value_counts().items():
        print(f"  - {airline:<18}: {count:,} tweets")

    print("\n[SENTIMENT BREAKDOWN]:")
    for sentiment, count in df["airline_sentiment"].value_counts().items():
        pct = (count / len(df)) * 100
        print(f"  - {sentiment:<12}: {count:,} ({pct:.2f}%)")

    return df


if __name__ == "__main__":
    download_and_validate()
