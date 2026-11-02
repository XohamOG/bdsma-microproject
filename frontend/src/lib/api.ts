import {
  Brand,
  BrandDetail,
  SentimentAnalytics,
  HistoricalTrends,
  ComplaintAnalytics,
  BrandComparison,
  AnomalyEvent,
  Tweet,
  Benchmark,
  DatasetUploadResult,
  ApiResponse,
} from '@/types';

import {
  MOCK_BRANDS,
  MOCK_GLOBAL_SENTIMENT,
  MOCK_COMPLAINTS,
  MOCK_HISTORICAL_TRENDS,
  MOCK_ANOMALIES,
  MOCK_BRAND_DETAILS,
  MOCK_TWEETS_SAMPLE,
  MOCK_BENCHMARKS,
} from '@/mock/data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

async function fetchWithFallback<T>(endpoint: string, mockFallback: T): Promise<T> {
  if (USE_MOCK) {
    // Simulated realistic network latency
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockFallback;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned ${res.status}. Falling back to mock data.`);
      return mockFallback;
    }
    const json: ApiResponse<T> = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${endpoint} (${err}). Falling back to mock data.`);
    return mockFallback;
  }
}

export const apiService = {
  async getHealth() {
    return fetchWithFallback('/health', {
      status: 'healthy',
      version: '1.0.0',
      dataset: {
        name: 'Twitter US Airline Sentiment',
        total_records: 14640,
        date_range: { start: '2015-02-17', end: '2015-02-24' },
      },
    });
  },

  async getBrands(): Promise<Brand[]> {
    return fetchWithFallback('/brands', MOCK_BRANDS);
  },

  async getBrandReputation(brandId: string): Promise<BrandDetail | null> {
    const fallback = MOCK_BRAND_DETAILS[brandId] || MOCK_BRAND_DETAILS['united'];
    return fetchWithFallback(`/brands/${brandId}/reputation`, fallback);
  },

  async getSentimentAnalytics(brand?: string): Promise<SentimentAnalytics> {
    const endpoint = brand ? `/analytics/sentiment?brand=${brand}` : '/analytics/sentiment';
    return fetchWithFallback(endpoint, MOCK_GLOBAL_SENTIMENT);
  },

  async getHistoricalTrends(brand?: string): Promise<HistoricalTrends> {
    const endpoint = brand ? `/analytics/trends?brand=${brand}` : '/analytics/trends';
    return fetchWithFallback(endpoint, MOCK_HISTORICAL_TRENDS);
  },

  async getComplaints(brand?: string): Promise<ComplaintAnalytics> {
    const endpoint = brand ? `/analytics/complaints?brand=${brand}` : '/analytics/complaints';
    return fetchWithFallback(endpoint, MOCK_COMPLAINTS);
  },

  async getBrandComparison(brandIds?: string[]): Promise<BrandComparison> {
    const brandsQuery = brandIds ? `?brands=${brandIds.join(',')}` : '';
    const fallback: BrandComparison = {
      comparison: MOCK_BRANDS.map((b) => ({
        brand: b.name,
        code: b.code,
        total_tweets: b.total_tweets,
        positive_pct: Number(((b.positive / b.total_tweets) * 100).toFixed(2)),
        neutral_pct: Number(((b.neutral / b.total_tweets) * 100).toFixed(2)),
        negative_pct: Number(((b.negative / b.total_tweets) * 100).toFixed(2)),
        net_sentiment_score: b.net_sentiment_score,
        reputation_index: b.reputation_index,
        primary_complaint: 'Customer Service Issue',
      })),
      highest_reputation: 'Virgin America',
      lowest_reputation: 'US Airways',
    };
    return fetchWithFallback(`/analytics/compare${brandsQuery}`, fallback);
  },

  async getAnomalies(brand?: string): Promise<AnomalyEvent[]> {
    const endpoint = brand ? `/analytics/anomalies?brand=${brand}` : '/analytics/anomalies';
    return fetchWithFallback(endpoint, MOCK_ANOMALIES);
  },

  async getTweets(params?: { brand?: string; sentiment?: string; page?: number; limit?: number }): Promise<{
    tweets: Tweet[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let filtered = [...MOCK_TWEETS_SAMPLE];
    if (params?.brand && params.brand !== 'all') {
      filtered = filtered.filter((t) => t.airline.toLowerCase().includes(params.brand!.toLowerCase()));
    }
    if (params?.sentiment && params.sentiment !== 'all') {
      filtered = filtered.filter((t) => t.airline_sentiment === params.sentiment);
    }

    return {
      tweets: filtered,
      total: 14640,
      page: params?.page || 1,
      totalPages: Math.ceil(14640 / (params?.limit || 20)),
    };
  },

  async getBenchmarks(): Promise<Benchmark[]> {
    return fetchWithFallback('/analytics/benchmarks', MOCK_BENCHMARKS);
  },

  async uploadDataset(file: File): Promise<DatasetUploadResult> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        filename: file.name,
        total_rows_received: 14640,
        valid_rows: 14640,
        invalid_rows: 0,
        ingestion_status: 'PROCESSED',
        parquet_path: 'data/parquet/tweets.parquet',
        brands_detected: ['Virgin America', 'United', 'Delta', 'Southwest', 'American', 'US Airways'],
        message: 'Dataset successfully validated and ingested into analytics engine.',
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.data;
  },
};
