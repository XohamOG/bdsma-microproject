/**
 * Brand Reputation Monitoring System Types
 * Based on docs/api-contracts.md & Twitter US Airline Sentiment Dataset
 */

export type BrandId =
  | 'united'
  | 'us_airways'
  | 'american'
  | 'southwest'
  | 'delta'
  | 'virgin_america';

export interface Brand {
  id: BrandId | string;
  name: string;
  code: string;
  total_tweets: number;
  positive: number;
  neutral: number;
  negative: number;
  net_sentiment_score: number; // NSS = ((P - N) / Total) * 100
  reputation_index: number;    // BRI = ((P*1.0 + U*0.5)/Total)*100
  rank: number;
  color?: string;
}

export interface ComplaintReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface TimelinePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total?: number;
  net_sentiment_score: number;
}

export interface BrandDetail {
  brand: {
    id: string;
    name: string;
    code: string;
  };
  metrics: {
    total_tweets: number;
    sentiment_counts: {
      positive: number;
      neutral: number;
      negative: number;
    };
    net_sentiment_score: number;
    reputation_index: number;
    complaint_rate: number;
  };
  top_complaint_reasons: ComplaintReason[];
  timeline: TimelinePoint[];
}

export interface SentimentDistribution {
  count: number;
  percentage: number;
}

export interface SentimentAnalytics {
  total_tweets: number;
  distribution: {
    positive: SentimentDistribution;
    neutral: SentimentDistribution;
    negative: SentimentDistribution;
  };
  by_brand: Array<{
    brand: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

export interface HistoricalTrends {
  interval: string;
  brand: string;
  timeline: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
    net_sentiment_score: number;
  }>;
}

export interface ComplaintAnalytics {
  total_negative_tweets: number;
  categories: ComplaintReason[];
}

export interface ComparisonItem {
  brand: string;
  code?: string;
  total_tweets: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  net_sentiment_score: number;
  reputation_index: number;
  primary_complaint: string;
}

export interface BrandComparison {
  comparison: ComparisonItem[];
  highest_reputation: string;
  lowest_reputation: string;
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  brand: string;
  anomaly_type: 'NEGATIVE_SURGE' | 'VOLUME_SPIKE' | 'SENTIMENT_DROP';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  negative_rate: number;
  baseline_rate: number;
  z_score: number;
  description: string;
  primary_reason: string;
}

export interface Tweet {
  tweet_id: string;
  airline: string;
  airline_sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_confidence: number;
  negativereason: string | null;
  text: string;
  name?: string | null;
  tweet_created: string;
  tweet_location?: string | null;
  user_timezone?: string | null;
  retweet_count: number;
}

export interface Benchmark {
  workload_size: number;
  workload_label: string;
  pandas_time_ms: number;
  pyspark_time_ms: number;
  speedup: number;
}

export interface DatasetUploadResult {
  filename: string;
  total_rows_received: number;
  valid_rows: number;
  invalid_rows: number;
  ingestion_status: 'PROCESSED' | 'PENDING' | 'ERROR';
  parquet_path: string;
  brands_detected: string[];
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  timestamp?: string;
  data: T;
  error?: {
    code?: string;
    message: string;
  };
}
