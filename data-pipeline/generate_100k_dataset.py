#!/usr/bin/env python3
"""
Generate a synthetic 100,000-row Twitter US Airline Sentiment dataset matching
the exact Kaggle schema, realistic airline distributions, VADER sentiments, and complaint reasons.
"""

import os
import sys
import argparse
import random
import datetime
from pathlib import Path
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW = BASE_DIR / "data" / "raw"
DATA_RAW.mkdir(parents=True, exist_ok=True)
DEFAULT_OUTPUT = DATA_RAW / "Tweets_100k.csv"

AIRLINES = [
    ("United", 0.26, "@united"),
    ("US Airways", 0.20, "@USAirways"),
    ("American", 0.19, "@AmericanAir"),
    ("Southwest", 0.17, "@SouthwestAir"),
    ("Delta", 0.15, "@JetBlue"),
    ("Virgin America", 0.03, "@VirginAmerica"),
]

# Baseline sentiment distributions
SENTIMENT_DIST = {
    "Virgin America": {"positive": 0.33, "neutral": 0.36, "negative": 0.31},
    "Delta": {"positive": 0.24, "neutral": 0.35, "negative": 0.41},
    "Southwest": {"positive": 0.24, "neutral": 0.28, "negative": 0.48},
    "United": {"positive": 0.13, "neutral": 0.18, "negative": 0.69},
    "American": {"positive": 0.12, "neutral": 0.17, "negative": 0.71},
    "US Airways": {"positive": 0.09, "neutral": 0.13, "negative": 0.78},
}

NEGATIVE_REASONS = [
    ("Customer Service Issue", 0.32),
    ("Late Flight", 0.19),
    ("Can't Tell", 0.13),
    ("Cancelled Flight", 0.10),
    ("Lost Luggage", 0.08),
    ("Bad Flight", 0.06),
    ("Flight Booking Problems", 0.05),
    ("Flight Attendant Complaints", 0.04),
    ("longlines", 0.02),
    ("Damaged Luggage", 0.01),
]

POSITIVE_TEMPLATES = [
    "Thank you {handle}! Amazing service from the flight crew today on flight {flight}.",
    "{handle} loved the smooth flight from {origin} to {dest}! Best airline experience.",
    "Shoutout to {handle} gate agents in {origin} for being so helpful and kind!",
    "{handle} your in-flight entertainment and wifi were top notch today. Keep it up!",
    "Great customer support on the phone today {handle}, solved my ticket change in 5 mins.",
    "{handle} always my first choice for domestic travel. Kudos to captain and team!",
]

NEUTRAL_TEMPLATES = [
    "{handle} what is the baggage policy for carry-ons on flight {flight}?",
    "{handle} can I change my seat assignment online for tomorrow's departure?",
    "{handle} are flights out of {origin} operating on schedule today?",
    "{handle} please check the status of ticket booking confirmation {booking}.",
    "{handle} will terminal 3 have charging stations near gate B{gate}?",
]

NEGATIVE_TEMPLATES = {
    "Customer Service Issue": [
        "{handle} on hold for 3 hours and disconnected again! Truly unacceptable service.",
        "{handle} your representative was incredibly rude at the {origin} desk. Never flying again.",
        "{handle} worst customer service experience of my life. No one is willing to assist.",
    ],
    "Late Flight": [
        "{handle} delayed another 2 hours with zero explanation. Missing my connection in {dest}!",
        "{handle} sitting on the tarmac for 90 minutes. Communication is completely lacking.",
        "{handle} flight {flight} is delayed again. 4th time this month on this route.",
    ],
    "Cancelled Flight": [
        "{handle} cancelled our flight last minute without booking us on the next available one!",
        "{handle} stranded in {origin} because you cancelled flight {flight} due to minor crew delay.",
        "{handle} cancellation notice sent 30 mins before boarding. Unbelievable negligence.",
    ],
    "Lost Luggage": [
        "{handle} lost my checked bag containing urgent business documents on flight {flight}!",
        "{handle} where is my suitcase? Landed in {dest} 5 hours ago, carousel is completely empty.",
        "{handle} baggage claim line is 100 people long and only one agent working.",
    ],
    "Bad Flight": [
        "{handle} seats were broken, no AC running, and cabin was sweltering on flight {flight}.",
        "{handle} turbulent approach and zero announcements from the flight deck. Very unsettling.",
    ],
    "Can't Tell": [
        "{handle} seriously disappointed with today's experience. You used to be so much better.",
        "{handle} awful experience today from start to finish. Sort it out.",
    ],
    "Flight Booking Problems": [
        "{handle} website crashed during checkout and charged my credit card twice for flight {flight}!",
        "{handle} mobile app won't let me check in or select boarding pass.",
    ],
    "Flight Attendant Complaints": [
        "{handle} flight attendant refused to offer water for 4 hours during our flight.",
        "{handle} crew members were visibly argumentative with passengers over overhead bins.",
    ],
    "longlines": [
        "{handle} security and bag drop line in {origin} is wrapping around the terminal building.",
    ],
    "Damaged Luggage": [
        "{handle} retrieved my bag and the wheel and zipper are completely torn off. File a claim!",
    ],
}

CITIES = ["BOS", "JFK", "LAX", "ORD", "DFW", "SFO", "DEN", "ATL", "SEA", "MIA", "PHX", "CLT"]
USERNAMES = ["traveler_dan", "sarah_flyer", "mike_consulting", "jess_wander", "david_k", "sky_walker", "biz_travel_pro", "wanderlust99", "alex_m", "elena_r", "chris_c", "aviation_geek"]
TIMEZONES = ["Eastern Time (US & Canada)", "Central Time (US & Canada)", "Pacific Time (US & Canada)", "Mountain Time (US & Canada)", "Quito", "Atlantic Time (Canada)"]


def weighted_choice(choices):
    total = sum(w for c, w in choices)
    r = random.uniform(0, total)
    upto = 0
    for c, w in choices:
        if upto + w >= r:
            return c
        upto += w
    return choices[-1][0]


def generate_dataset(num_rows: int = 100000, output_file: Path = DEFAULT_OUTPUT):
    print(f"[INFO] Generating {num_rows:,} synthetic airline tweets...")
    start_date = datetime.datetime(2015, 2, 17, 8, 0, 0)
    end_date = datetime.datetime(2015, 2, 28, 22, 0, 0)
    total_seconds = int((end_date - start_date).total_seconds())

    rows = []
    base_id = 570300000000000000

    airline_weights = [(a, w) for a, w, _ in AIRLINES]
    airline_handles = {a: h for a, _, h in AIRLINES}

    for i in range(num_rows):
        tweet_id = base_id + i + random.randint(100, 999999)
        airline = weighted_choice(airline_weights)
        handle = airline_handles[airline]

        # Pick sentiment
        s_probs = SENTIMENT_DIST[airline]
        sent_weights = [("positive", s_probs["positive"]), ("neutral", s_probs["neutral"]), ("negative", s_probs["negative"])]
        sentiment = weighted_choice(sent_weights)

        # Confidence
        if sentiment == "negative":
            conf = round(random.uniform(0.65, 1.0), 4)
        elif sentiment == "positive":
            conf = round(random.uniform(0.60, 1.0), 4)
        else:
            conf = round(random.uniform(0.50, 0.95), 4)

        neg_reason = ""
        neg_conf = ""
        flight_num = random.randint(102, 3890)
        origin = random.choice(CITIES)
        dest = random.choice([c for c in CITIES if c != origin])
        gate = random.randint(1, 45)
        booking = f"{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')}{random.randint(10000, 99999)}"

        if sentiment == "negative":
            neg_reason = weighted_choice(NEGATIVE_REASONS)
            neg_conf = round(random.uniform(0.60, 1.0), 4)
            templates = NEGATIVE_TEMPLATES.get(neg_reason, NEGATIVE_TEMPLATES["Can't Tell"])
            template = random.choice(templates)
        elif sentiment == "positive":
            template = random.choice(POSITIVE_TEMPLATES)
        else:
            template = random.choice(NEUTRAL_TEMPLATES)

        text = template.format(handle=handle, flight=flight_num, origin=origin, dest=dest, gate=gate, booking=booking)

        # Timestamp
        offset = random.randint(0, total_seconds)
        # Add winter storm surge on Feb 22
        if random.random() < 0.25:
            # Shift towards Feb 22 storm
            storm_start = int((datetime.datetime(2015, 2, 22, 0, 0, 0) - start_date).total_seconds())
            offset = storm_start + random.randint(0, 86400)

        created_dt = start_date + datetime.timedelta(seconds=offset)
        created_str = created_dt.strftime("%Y-%m-%d %H:%M:%S -0800")

        name = random.choice(USERNAMES) + str(random.randint(1, 999))
        tz = random.choice(TIMEZONES)
        retweets = random.choices([0, 1, 2, 5, 12], weights=[0.85, 0.09, 0.04, 0.015, 0.005])[0]

        rows.append({
            "tweet_id": tweet_id,
            "airline_sentiment": sentiment,
            "airline_sentiment_confidence": conf,
            "negativereason": neg_reason,
            "negativereason_confidence": neg_conf,
            "airline": airline,
            "airline_sentiment_gold": "",
            "name": name,
            "negativereason_gold": "",
            "retweet_count": retweets,
            "text": text,
            "tweet_coord": "",
            "tweet_created": created_str,
            "tweet_location": origin,
            "user_timezone": tz,
        })

        if (i + 1) % 25000 == 0:
            print(f"  - Progress: {i + 1:,} / {num_rows:,} rows synthesized")

    df = pd.DataFrame(rows)
    df.to_csv(output_file, index=False)
    file_size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"\n[SUCCESS] Generated {len(df):,} tweets saved to:")
    print(f"  Path: {output_file}")
    print(f"  Size: {file_size_mb:.2f} MB")
    print(f"\n[BREAKDOWN BY CARRIER]:")
    print(df["airline"].value_counts())
    print(f"\n[BREAKDOWN BY SENTIMENT]:")
    print(df["airline_sentiment"].value_counts(normalize=True).round(3))
    return output_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate 100k synthetic tweets dataset.")
    parser.add_argument("--rows", type=int, default=100000, help="Number of rows to generate (default 100,000)")
    parser.add_argument("--output", type=str, default=str(DEFAULT_OUTPUT), help="Output CSV path")
    args = parser.parse_args()

    generate_dataset(num_rows=args.rows, output_file=Path(args.output))
