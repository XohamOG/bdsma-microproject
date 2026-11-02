# 📡 Brand Reputation Monitoring System — API & Architecture Contract

This document establishes the architecture, folder boundaries, and REST API contracts between:
- **Backend & Big Data Agent**: `@xohamOG` (PC 1 — Windows)
- **Frontend Agent**: `@vedaXD` (PC 2 — Linux)
- **Coordination Channel**: [GitHub Issue #1](https://github.com/XohamOG/bdsma-microproject/issues/1)

---

## 1. Workspace Folder Ownership

To avoid merge conflicts and preserve agent autonomy, ownership is partitioned as follows:

| Folder | Owner | Technology | Description |
| :--- | :--- | :--- | :--- |
| `backend/` | `@xohamOG` (PC 1) | Node.js, Express, TypeScript | REST APIs, business logic, route handlers |
| `data-pipeline/` | `@xohamOG` (PC 1) | Python, PySpark, NLTK/VADER | Data cleaning, Spark SQL, NLP, benchmarks |
| `database/` | `@xohamOG` (PC 1) | PostgreSQL / SQL | Migrations, DDL schemas, seed scripts |
| `data/` | `@xohamOG` (PC 1) | CSV, Parquet | Raw Kaggle dataset and processed Parquet files |
| `frontend/` | `@vedaXD` (PC 2) | Next.js, React, Tailwind, Recharts | Interactive dashboards, UI components |
| `agent-board/` | Shared | Python | Distributed agent communication daemon & CLI |
| `docs/` | Shared | Markdown | Architecture, API specs, benchmark reports |

> **Strict Rule**: Neither agent shall edit files inside the other agent's assigned folders without explicit coordination via Issue #1 comments.

---

## 2. Dataset Context

- **Source**: Kaggle Twitter US Airline Sentiment dataset (`~14,640` historical tweets).
- **Airlines (Brands)**:
  1. `Virgin America` (VA)
  2. `United` (UA)
  3. `Delta` (DL)
  4. `Southwest` (WN)
  5. `American` (AA)
  6. `US Airways` (US)
- **Target Metrics**:
  - Positive, Neutral, Negative tweet counts and ratios
  - **Net Sentiment Score (NSS)**: `((Positive - Negative) / Total) * 100` (range: `-100` to `+100`)
  - **Brand Reputation Index (BRI)**: `((Positive * 1.0 + Neutral * 0.5) / Total) * 100` (range: `0` to `100`)
  - **Customer Complaint Breakdown**: Categorization of `negativereason`
  - **Anomaly Events**: Statistical spikes in negative sentiment volume (z-score > 2.5)

---

## 3. Standard Response & Error Format

### Success Envelope
All successful responses return HTTP `200 OK` (or `201 Created`) with JSON:
```json
{
  "success": true,
  "timestamp": "2026-11-02T15:30:00.000Z",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "timestamp": "2026-11-02T15:30:00.000Z",
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Query parameter 'brand' is invalid."
  }
}
```

---

## 4. Proposed REST API Endpoints

### 4.1 System Health & Metadata
- **`GET /api/health`**
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "dataset": {
      "name": "Twitter US Airline Sentiment",
      "total_records": 14640,
      "date_range": {
        "start": "2015-02-17",
        "end": "2015-02-24"
      }
    }
  }
}
```

---

### 4.2 Brand Overview & Reputation Ranking
- **`GET /api/brands`**
- **Response**:
```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": "virgin_america",
        "name": "Virgin America",
        "code": "VA",
        "total_tweets": 504,
        "positive": 152,
        "neutral": 171,
        "negative": 181,
        "net_sentiment_score": -5.75,
        "reputation_index": 47.12,
        "rank": 1
      },
      {
        "id": "delta",
        "name": "Delta",
        "code": "DL",
        "total_tweets": 2222,
        "positive": 544,
        "neutral": 723,
        "negative": 955,
        "net_sentiment_score": -18.50,
        "reputation_index": 40.75,
        "rank": 2
      }
    ]
  }
}
```

---

### 4.3 Brand Detail & Metrics
- **`GET /api/brands/:brandId/reputation`**
- **Params**: `:brandId` (e.g. `united`, `delta`, `virgin_america`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "brand": {
      "id": "united",
      "name": "United",
      "code": "UA"
    },
    "metrics": {
      "total_tweets": 3822,
      "sentiment_counts": {
        "positive": 492,
        "neutral": 697,
        "negative": 2633
      },
      "net_sentiment_score": -56.02,
      "reputation_index": 21.85,
      "complaint_rate": 68.89
    },
    "top_complaint_reasons": [
      { "reason": "Customer Service Issue", "count": 1024, "percentage": 38.89 },
      { "reason": "Late Flight", "count": 525, "percentage": 19.94 }
    ],
    "timeline": [
      {
        "date": "2015-02-17",
        "positive": 24,
        "neutral": 38,
        "negative": 120,
        "net_sentiment_score": -52.74
      }
    ]
  }
}
```

---

### 4.4 Global Sentiment Analytics
- **`GET /api/analytics/sentiment`**
- **Query Params**:
  - `brand` (optional): Filter by brand ID or name
  - `startDate`, `endDate` (optional): Date range (`YYYY-MM-DD`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "total_tweets": 14640,
    "distribution": {
      "positive": { "count": 2363, "percentage": 16.14 },
      "neutral": { "count": 3099, "percentage": 21.17 },
      "negative": { "count": 9178, "percentage": 62.69 }
    },
    "by_brand": [
      {
        "brand": "Virgin America",
        "positive": 152,
        "neutral": 171,
        "negative": 181
      }
    ]
  }
}
```

---

### 4.5 Historical Trends (Time-Series)
- **`GET /api/analytics/trends`**
- **Query Params**:
  - `brand` (optional, default: `all`)
  - `interval` (optional: `daily` | `hourly`, default: `daily`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "interval": "daily",
    "brand": "all",
    "timeline": [
      {
        "date": "2015-02-17",
        "positive": 150,
        "neutral": 210,
        "negative": 580,
        "total": 940,
        "net_sentiment_score": -45.74
      }
    ]
  }
}
```

---

### 4.6 Customer Complaint Breakdown
- **`GET /api/analytics/complaints`**
- **Query Params**: `brand` (optional), `limit` (default: 10)
- **Response**:
```json
{
  "success": true,
  "data": {
    "total_negative_tweets": 9178,
    "categories": [
      { "reason": "Customer Service Issue", "count": 2910, "percentage": 31.71 },
      { "reason": "Late Flight", "count": 1665, "percentage": 18.14 },
      { "reason": "Can't Tell", "count": 1190, "percentage": 12.97 },
      { "reason": "Cancelled Flight", "count": 847, "percentage": 9.23 },
      { "reason": "Lost Luggage", "count": 724, "percentage": 7.89 },
      { "reason": "Bad Flight", "count": 580, "percentage": 6.32 },
      { "reason": "Flight Booking Problems", "count": 529, "percentage": 5.76 },
      { "reason": "Flight Attendant Complaints", "count": 481, "percentage": 5.24 },
      { "reason": "longlines", "count": 178, "percentage": 1.94 },
      { "reason": "Damaged Luggage", "count": 74, "percentage": 0.81 }
    ]
  }
}
```

---

### 4.7 Brand Comparison Matrix
- **`GET /api/analytics/compare`**
- **Query Params**: `brands` (comma-separated brand IDs, e.g. `brands=united,delta,southwest`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "brand": "Southwest",
        "total_tweets": 2420,
        "positive_pct": 23.55,
        "neutral_pct": 27.44,
        "negative_pct": 49.01,
        "net_sentiment_score": -25.46,
        "reputation_index": 37.27,
        "primary_complaint": "Customer Service Issue"
      }
    ],
    "highest_reputation": "Virgin America",
    "lowest_reputation": "US Airways"
  }
}
```

---

### 4.8 Anomaly Detection Events
- **`GET /api/analytics/anomalies`**
- **Query Params**: `brand` (optional), `severity` (optional: `high`, `medium`, `all`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "anom_001",
        "timestamp": "2015-02-22T14:00:00Z",
        "brand": "US Airways",
        "anomaly_type": "NEGATIVE_SURGE",
        "severity": "HIGH",
        "negative_rate": 88.4,
        "baseline_rate": 62.1,
        "z_score": 3.42,
        "description": "Abnormal surge in negative sentiment due to flight cancellations",
        "primary_reason": "Cancelled Flight"
      }
    ]
  }
}
```

---

### 4.9 Raw Tweets Explorer (Paginated)
- **`GET /api/tweets`**
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 20, max: 100)
  - `brand` (optional)
  - `sentiment` (optional: `positive` | `neutral` | `negative`)
  - `search` (optional: keyword search)
- **Response**:
```json
{
  "success": true,
  "data": {
    "tweets": [
      {
        "tweet_id": "570306133677760513",
        "airline": "Virgin America",
        "airline_sentiment": "neutral",
        "sentiment_confidence": 1.0,
        "negativereason": null,
        "text": "@VirginAmerica What @dhepburn said.",
        "tweet_created": "2015-02-24T11:35:52Z",
        "tweet_location": null,
        "user_timezone": "Eastern Time (US & Canada)",
        "retweet_count": 0
      }
    ],
    "pagination": {
      "total": 14640,
      "page": 1,
      "limit": 20,
      "total_pages": 732
    }
  }
}
```

---

### 4.10 Big Data Benchmarks (PySpark vs Pandas)
- **`GET /api/analytics/benchmarks`**
- **Response**:
```json
{
  "success": true,
  "data": {
    "benchmarks": [
      {
        "workload_size": 14640,
        "workload_label": "1x (Original)",
        "pandas_time_ms": 420,
        "pyspark_time_ms": 1150,
        "speedup": 0.36
      },
      {
        "workload_size": 146400,
        "workload_label": "10x Scaled",
        "pandas_time_ms": 4850,
        "pyspark_time_ms": 3200,
        "speedup": 1.51
      }
    ]
  }
}
```

---

### 4.11 Dataset Upload & Ingestion Trigger
- **`POST /api/dataset/upload`**
- **Content-Type**: `multipart/form-data` (`file`: CSV file)
- **Response**:
```json
{
  "success": true,
  "data": {
    "filename": "Tweets.csv",
    "total_rows_received": 14640,
    "valid_rows": 14640,
    "invalid_rows": 0,
    "ingestion_status": "PROCESSED",
    "parquet_path": "data/parquet/tweets.parquet",
    "brands_detected": [
      "Virgin America", "United", "Delta", "Southwest", "American", "US Airways"
    ],
    "message": "Dataset successfully validated and ingested into analytics engine."
  }
}
```

---

## 5. Development Phases

```text
[Phase 1: Architecture & API Alignment] ──> (CURRENT STEP)
    │
    ▼
[Phase 2: Database Schemas & Migrations] (database/)
    │
    ▼
[Phase 3: Dataset Ingestion & Parquet Pipeline] (data/, data-pipeline/)
    │
    ▼
[Phase 4: PySpark Big Data & NLP Processing] (data-pipeline/)
    │
    ▼
[Phase 5: Anomaly Detection & Benchmarking] (data-pipeline/)
    │
    ▼
[Phase 6: Node.js & Express REST APIs] (backend/)
    │
    ▼
[Phase 7: End-to-End Frontend Integration] (frontend/ <-> backend/)
```
