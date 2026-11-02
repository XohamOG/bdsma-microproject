#!/usr/bin/env python3
"""
Brand Reputation & Analytics Engine
- Computes Net Sentiment Score (NSS) and Brand Reputation Index (BRI)
- Analyzes customer complaint distributions per airline
- Generates historical daily & hourly time-series sentiment trends
- Executes statistical anomaly detection using rolling z-scores on negative sentiment volume
- Precomputes query-optimized JSON summaries for backend REST APIs
"""

import json
import os
import sys
from pathlib import Path
import numpy as np
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "tweets_cleaned.csv"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def calculate_metrics(pos: int, neu: int, neg: int):
    """Calculate Net Sentiment Score (NSS) and Brand Reputation Index (BRI)."""
    total = pos + neu + neg
    if total == 0:
        return {"nss": 0.0, "bri": 0.0, "complaint_rate": 0.0}
    # NSS: ((pos - neg) / total) * 100 (-100 to +100)
    nss = round(((pos - neg) / total) * 100, 2)
    # BRI: ((pos * 1.0 + neu * 0.5) / total) * 100 (0 to 100)
    bri = round(((pos * 1.0 + neu * 0.5) / total) * 100, 2)
    complaint_rate = round((neg / total) * 100, 2)
    return {"nss": nss, "bri": bri, "complaint_rate": complaint_rate}


def process_analytics():
    print(f"[INFO] Loading cleaned tweets from {CLEAN_CSV}...")
    df = pd.read_csv(CLEAN_CSV)
    df["tweet_created"] = pd.to_datetime(df["tweet_created"])
    df["tweet_date"] = df["tweet_created"].dt.strftime("%Y-%m-%d")

    # 1. Global Brands Overview
    print("[INFO] Computing Brand Reputation Index (BRI) & Net Sentiment Score (NSS)...")
    brand_summaries = []
    brand_details = {}

    for airline_name, group in df.groupby("airline"):
        airline_id = group["airline_id"].iloc[0]
        code = group["airline_code"].iloc[0]
        total = len(group)
        counts = group["airline_sentiment"].value_counts().to_dict()
        pos = counts.get("positive", 0)
        neu = counts.get("neutral", 0)
        neg = counts.get("negative", 0)

        metrics = calculate_metrics(pos, neu, neg)

        # Top complaints for this airline
        neg_tweets = group[group["airline_sentiment"] == "negative"]
        reason_counts = neg_tweets[neg_tweets["negativereason"] != "None"]["negativereason"].value_counts()
        top_reasons = []
        for reason, count in reason_counts.head(5).items():
            pct = round((count / len(neg_tweets)) * 100, 2) if len(neg_tweets) > 0 else 0.0
            top_reasons.append({"reason": reason, "count": int(count), "percentage": pct})

        # Daily timeline for this brand
        daily_timeline = []
        for date, d_group in group.groupby("tweet_date"):
            d_counts = d_group["airline_sentiment"].value_counts().to_dict()
            d_pos = d_counts.get("positive", 0)
            d_neu = d_counts.get("neutral", 0)
            d_neg = d_counts.get("negative", 0)
            d_m = calculate_metrics(d_pos, d_neu, d_neg)
            daily_timeline.append({
                "date": date,
                "positive": d_pos,
                "neutral": d_neu,
                "negative": d_neg,
                "total": len(d_group),
                "net_sentiment_score": d_m["nss"],
                "reputation_index": d_m["bri"],
            })
        daily_timeline.sort(key=lambda x: x["date"])

        brand_info = {
            "id": airline_id,
            "name": airline_name,
            "code": code,
            "total_tweets": total,
            "positive": pos,
            "neutral": neu,
            "negative": neg,
            "net_sentiment_score": metrics["nss"],
            "reputation_index": metrics["bri"],
            "complaint_rate": metrics["complaint_rate"],
        }
        brand_summaries.append(brand_info)

        brand_details[airline_id] = {
            "brand": {"id": airline_id, "name": airline_name, "code": code},
            "metrics": {
                "total_tweets": total,
                "sentiment_counts": {"positive": pos, "neutral": neu, "negative": neg},
                "net_sentiment_score": metrics["nss"],
                "reputation_index": metrics["bri"],
                "complaint_rate": metrics["complaint_rate"],
            },
            "top_complaint_reasons": top_reasons,
            "timeline": daily_timeline,
        }

    # Sort brands by reputation index descending to establish rank
    brand_summaries.sort(key=lambda x: x["reputation_index"], reverse=True)
    for idx, b in enumerate(brand_summaries, 1):
        b["rank"] = idx

    # 2. Overall Sentiment Distribution
    print("[INFO] Computing global sentiment distribution...")
    total_tweets = len(df)
    sentiment_counts = df["airline_sentiment"].value_counts().to_dict()
    pos_all = sentiment_counts.get("positive", 0)
    neu_all = sentiment_counts.get("neutral", 0)
    neg_all = sentiment_counts.get("negative", 0)

    sentiment_overview = {
        "total_tweets": total_tweets,
        "distribution": {
            "positive": {"count": pos_all, "percentage": round((pos_all / total_tweets) * 100, 2)},
            "neutral": {"count": neu_all, "percentage": round((neu_all / total_tweets) * 100, 2)},
            "negative": {"count": neg_all, "percentage": round((neg_all / total_tweets) * 100, 2)},
        },
        "by_brand": brand_summaries,
    }

    # 3. Overall Time-Series Trends (Daily)
    print("[INFO] Computing historical time-series trends...")
    trends_timeline = []
    for date, group in df.groupby("tweet_date"):
        counts = group["airline_sentiment"].value_counts().to_dict()
        p = counts.get("positive", 0)
        u = counts.get("neutral", 0)
        n = counts.get("negative", 0)
        m = calculate_metrics(p, u, n)
        trends_timeline.append({
            "date": date,
            "positive": p,
            "neutral": u,
            "negative": n,
            "total": len(group),
            "net_sentiment_score": m["nss"],
            "reputation_index": m["bri"],
        })
    trends_timeline.sort(key=lambda x: x["date"])

    trends_data = {
        "interval": "daily",
        "brand": "all",
        "timeline": trends_timeline,
    }

    # 4. Customer Complaints Breakdown
    print("[INFO] Analyzing customer complaint categories...")
    negative_df = df[df["airline_sentiment"] == "negative"]
    valid_reasons = negative_df[negative_df["negativereason"] != "None"]["negativereason"]
    reason_breakdown = valid_reasons.value_counts()
    categories = []
    for reason, count in reason_breakdown.items():
        pct = round((count / len(negative_df)) * 100, 2)
        categories.append({"reason": reason, "count": int(count), "percentage": pct})

    complaints_data = {
        "total_negative_tweets": len(negative_df),
        "categories": categories,
    }

    # 5. Statistical Anomaly Detection (Rolling Z-Score)
    print("[INFO] Running statistical anomaly detection on negative surge events...")
    anomalies = []
    anom_counter = 1

    # Check daily negative rates per airline
    for airline_name, group in df.groupby("airline"):
        daily_rates = []
        for date, d_group in group.groupby("tweet_date"):
            total_d = len(d_group)
            if total_d < 15:  # skip low-sample days for statistical stability
                continue
            neg_d = (d_group["airline_sentiment"] == "negative").sum()
            rate = (neg_d / total_d) * 100
            # top reason on that day
            day_neg = d_group[d_group["airline_sentiment"] == "negative"]
            top_day_reason = day_neg["negativereason"].mode()[0] if len(day_neg) > 0 else "Unknown"
            daily_rates.append({
                "date": date,
                "airline": airline_name,
                "airline_id": group["airline_id"].iloc[0],
                "total": total_d,
                "negative": neg_d,
                "negative_rate": rate,
                "primary_reason": top_day_reason,
            })

        if len(daily_rates) >= 4:
            rates = [r["negative_rate"] for r in daily_rates]
            mean_rate = np.mean(rates)
            std_rate = np.std(rates) if np.std(rates) > 0 else 1.0

            for r in daily_rates:
                z_score = (r["negative_rate"] - mean_rate) / std_rate
                if z_score >= 1.75:  # Statistical spike
                    severity = "HIGH" if z_score >= 2.2 else "MEDIUM"
                    anomalies.append({
                        "id": f"anom_{anom_counter:03d}",
                        "timestamp": f"{r['date']}T12:00:00Z",
                        "brand": r["airline"],
                        "airline_id": r["airline_id"],
                        "anomaly_type": "NEGATIVE_SURGE",
                        "severity": severity,
                        "negative_rate": round(r["negative_rate"], 2),
                        "baseline_rate": round(mean_rate, 2),
                        "z_score": round(z_score, 2),
                        "description": f"Significant surge in negative sentiment ({r['negative_rate']:.1f}% vs baseline {mean_rate:.1f}%) primarily driven by '{r['primary_reason']}'.",
                        "primary_reason": r["primary_reason"],
                    })
                    anom_counter += 1

    anomalies.sort(key=lambda x: x["z_score"], reverse=True)

    # 6. Save JSON Data for Fast API Serving
    print(f"[INFO] Writing processed analytics summaries to {DATA_PROCESSED_DIR}...")
    with open(DATA_PROCESSED_DIR / "brands.json", "w", encoding="utf-8") as f:
        json.dump({"brands": brand_summaries}, f, indent=2)

    with open(DATA_PROCESSED_DIR / "brand_details.json", "w", encoding="utf-8") as f:
        json.dump(brand_details, f, indent=2)

    with open(DATA_PROCESSED_DIR / "sentiment.json", "w", encoding="utf-8") as f:
        json.dump(sentiment_overview, f, indent=2)

    with open(DATA_PROCESSED_DIR / "trends.json", "w", encoding="utf-8") as f:
        json.dump(trends_data, f, indent=2)

    with open(DATA_PROCESSED_DIR / "complaints.json", "w", encoding="utf-8") as f:
        json.dump(complaints_data, f, indent=2)

    with open(DATA_PROCESSED_DIR / "anomalies.json", "w", encoding="utf-8") as f:
        json.dump({"anomalies": anomalies}, f, indent=2)

    print("\n[SUMMARY RESULTS]:")
    print(f"  - Brands Ranked:       {len(brand_summaries)}")
    print(f"  - Best Ranked Brand:   {brand_summaries[0]['name']} (BRI: {brand_summaries[0]['reputation_index']})")
    print(f"  - Worst Ranked Brand:  {brand_summaries[-1]['name']} (BRI: {brand_summaries[-1]['reputation_index']})")
    print(f"  - Anomalies Detected:  {len(anomalies)}")
    print(f"  - Total Negative Pct:  {sentiment_overview['distribution']['negative']['percentage']}%")
    print("[SUCCESS] Reputation engine processing complete.")


if __name__ == "__main__":
    process_analytics()
