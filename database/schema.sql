-- ============================================================================
-- Brand Reputation Monitoring System — PostgreSQL Schema
-- ============================================================================

-- 1. Brands (Airlines) Table
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    code VARCHAR(8) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial 6 US Airlines
INSERT INTO brands (id, name, code) VALUES
    ('virgin_america', 'Virgin America', 'VA'),
    ('united', 'United', 'UA'),
    ('delta', 'Delta', 'DL'),
    ('southwest', 'Southwest', 'WN'),
    ('american', 'American', 'AA'),
    ('us_airways', 'US Airways', 'US')
ON CONFLICT (id) DO NOTHING;

-- 2. Raw & Preprocessed Tweets Table
CREATE TABLE IF NOT EXISTS tweets (
    tweet_id VARCHAR(32) PRIMARY KEY,
    airline_id VARCHAR(32) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    airline VARCHAR(64) NOT NULL,
    airline_sentiment VARCHAR(16) NOT NULL CHECK (airline_sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_confidence NUMERIC(4, 3) NOT NULL DEFAULT 1.0,
    negativereason VARCHAR(64),
    negativereason_confidence NUMERIC(4, 3),
    airline_sentiment_gold VARCHAR(16),
    name VARCHAR(128),
    negativereason_gold VARCHAR(64),
    retweet_count INTEGER DEFAULT 0,
    text TEXT NOT NULL,
    cleaned_text TEXT,
    vader_compound NUMERIC(4, 3),
    vader_sentiment VARCHAR(16),
    tweet_coord VARCHAR(64),
    tweet_created TIMESTAMP WITH TIME ZONE NOT NULL,
    tweet_location VARCHAR(128),
    user_timezone VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes on Tweets
CREATE INDEX IF NOT EXISTS idx_tweets_airline_created ON tweets(airline_id, tweet_created DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_sentiment ON tweets(airline_sentiment);
CREATE INDEX IF NOT EXISTS idx_tweets_negativereason ON tweets(negativereason) WHERE negativereason IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tweets_created ON tweets(tweet_created);

-- 3. Daily Brand Reputation Metrics Table
CREATE TABLE IF NOT EXISTS brand_reputation_metrics (
    id SERIAL PRIMARY KEY,
    airline_id VARCHAR(32) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_tweets INTEGER NOT NULL DEFAULT 0,
    positive_count INTEGER NOT NULL DEFAULT 0,
    neutral_count INTEGER NOT NULL DEFAULT 0,
    negative_count INTEGER NOT NULL DEFAULT 0,
    net_sentiment_score NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    reputation_index NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    complaint_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    top_complaint_reason VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_brand_metric_date UNIQUE (airline_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_airline_date ON brand_reputation_metrics(airline_id, metric_date DESC);

-- 4. Customer Complaint Analysis Table
CREATE TABLE IF NOT EXISTS complaint_analysis (
    id SERIAL PRIMARY KEY,
    airline_id VARCHAR(32) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    reason VARCHAR(64) NOT NULL,
    complaint_count INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_airline_complaint_reason UNIQUE (airline_id, reason)
);

CREATE INDEX IF NOT EXISTS idx_complaints_airline ON complaint_analysis(airline_id, complaint_count DESC);

-- 5. Time-Series Sentiment Trends Table
CREATE TABLE IF NOT EXISTS sentiment_trends (
    id SERIAL PRIMARY KEY,
    interval_type VARCHAR(16) NOT NULL DEFAULT 'daily',
    trend_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    airline_id VARCHAR(32) DEFAULT 'all',
    positive INTEGER NOT NULL DEFAULT 0,
    neutral INTEGER NOT NULL DEFAULT 0,
    negative INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    net_sentiment_score NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_trend_interval UNIQUE (interval_type, trend_timestamp, airline_id)
);

CREATE INDEX IF NOT EXISTS idx_trends_lookup ON sentiment_trends(airline_id, interval_type, trend_timestamp);

-- 6. Anomaly Detection Events Table
CREATE TABLE IF NOT EXISTS anomalies (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    airline_id VARCHAR(32) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(32) NOT NULL DEFAULT 'NEGATIVE_SURGE',
    severity VARCHAR(16) NOT NULL DEFAULT 'HIGH',
    observed_negative_rate NUMERIC(5, 2) NOT NULL,
    baseline_negative_rate NUMERIC(5, 2) NOT NULL,
    z_score NUMERIC(5, 2) NOT NULL,
    description TEXT NOT NULL,
    associated_reason VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomalies_time ON anomalies(timestamp DESC, airline_id);

-- 7. Benchmark Results Table
CREATE TABLE IF NOT EXISTS benchmarks (
    id SERIAL PRIMARY KEY,
    workload_size INTEGER NOT NULL,
    workload_label VARCHAR(32) NOT NULL,
    pandas_duration_ms NUMERIC(10, 2) NOT NULL,
    pyspark_duration_ms NUMERIC(10, 2) NOT NULL,
    speedup_ratio NUMERIC(6, 2) NOT NULL,
    cpu_cores INTEGER,
    ram_gb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
