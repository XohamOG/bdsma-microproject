# 🚀 Brand Reputation Monitoring — Backend REST API Service

The backend service for the Brand Reputation Monitoring System, providing data retrieval, brand management, sentiment analytics, and dataset ingestion.

---

## 🛠️ Stack & Technologies
- **Runtime**: Node.js (`v24+`)
- **Framework**: Express.js
- **Data Formats**: JSON, CSV, Apache Parquet
- **Storage Layer**: PostgreSQL schema (`database/schema.sql`) and Parquet / precomputed analytics

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Tests
```bash
npm test
```

### 3. Start API Server
```bash
# Production start (Port 5000)
npm start

# Development auto-reloading
npm run dev
```

---

## 📡 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and dataset metadata |
| `GET` | `/api/brands` | All 6 airlines with Net Sentiment Score (NSS) & Brand Reputation Index (BRI) |
| `GET` | `/api/brands/:brandId/reputation` | Detailed brand metrics, top complaints, and time-series timeline |
| `GET` | `/api/analytics/sentiment` | Global sentiment distribution with optional brand/date filtering |
| `GET` | `/api/analytics/trends` | Time-series trend analytics formatted for Recharts |
| `GET` | `/api/analytics/complaints` | Categorized negative reasons across airlines |
| `GET` | `/api/analytics/compare` | Multi-brand comparative metrics matrix |
| `GET` | `/api/analytics/anomalies` | Statistical negative surge events ($z\text{-score} > 1.75$) |
| `GET` | `/api/tweets` | Paginated raw tweet explorer with keyword search & filters |
| `GET` | `/api/analytics/benchmarks` | PySpark vs. Pandas execution benchmark results |
| `POST` | `/api/dataset/upload` | Multipart CSV dataset upload and automatic ingestion |
