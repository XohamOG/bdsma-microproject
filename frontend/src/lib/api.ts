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
// Default to FALSE so real live Big Data backend API is queried!
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

async function fetchWithFallback<T>(endpoint: string, mockFallback: T): Promise<T> {
  if (USE_MOCK) {
    return mockFallback;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned status ${res.status}. Using fallback.`);
      return mockFallback;
    }
    const json: ApiResponse<T> = await res.json();
    return json.data !== undefined ? json.data : mockFallback;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${endpoint} (${err}). Using fallback.`);
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
        cleaned_records: 14485,
        brands_count: 6,
        date_range: { start: '2015-02-17', end: '2015-02-24' },
      },
    });
  },

  async getBrands(): Promise<Brand[]> {
    const data = await fetchWithFallback<any>('/brands', { brands: MOCK_BRANDS });
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.brands)) return data.brands;
    return MOCK_BRANDS;
  },

  async getBrandReputation(brandId: string): Promise<BrandDetail | null> {
    const fallback = MOCK_BRAND_DETAILS[brandId] || MOCK_BRAND_DETAILS['united'];
    return fetchWithFallback(`/brands/${brandId}/reputation`, fallback);
  },

  async getSentimentAnalytics(brand?: string): Promise<SentimentAnalytics> {
    const endpoint = brand && brand !== 'all' ? `/analytics/sentiment?brand=${brand}` : '/analytics/sentiment';
    return fetchWithFallback(endpoint, MOCK_GLOBAL_SENTIMENT);
  },

  async getHistoricalTrends(brand?: string): Promise<HistoricalTrends> {
    const endpoint = brand && brand !== 'all' ? `/analytics/trends?brand=${brand}` : '/analytics/trends';
    return fetchWithFallback(endpoint, MOCK_HISTORICAL_TRENDS);
  },

  async getComplaints(brand?: string, limit: number = 10): Promise<ComplaintAnalytics> {
    const endpoint = brand && brand !== 'all' 
      ? `/analytics/complaints?brand=${brand}&limit=${limit}` 
      : `/analytics/complaints?limit=${limit}`;
    return fetchWithFallback(endpoint, MOCK_COMPLAINTS);
  },

  async getBrandComparison(brandIds?: string[]): Promise<BrandComparison> {
    const brandsQuery = brandIds && brandIds.length > 0 ? `?brands=${brandIds.join(',')}` : '';
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
    const endpoint = brand && brand !== 'all' ? `/analytics/anomalies?brand=${brand}` : '/analytics/anomalies';
    try {
      const data = await fetchWithFallback<{ anomalies: AnomalyEvent[] } | AnomalyEvent[]>(endpoint, { anomalies: MOCK_ANOMALIES });
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.anomalies)) return data.anomalies;
      return MOCK_ANOMALIES;
    } catch {
      return MOCK_ANOMALIES;
    }
  },

  async getTweets(params?: { 
    brand?: string; 
    sentiment?: string; 
    reason?: string;
    search?: string;
    page?: number; 
    limit?: number 
  }): Promise<{
    tweets: Tweet[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.brand && params.brand !== 'all') query.set('brand', params.brand);
    if (params?.sentiment && params.sentiment !== 'all') query.set('sentiment', params.sentiment);
    if (params?.reason && params.reason !== 'all') query.set('reason', params.reason);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    try {
      if (!USE_MOCK) {
        const res = await fetch(`${BASE_URL}/tweets${queryString}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return {
              tweets: json.data.tweets || [],
              total: json.data.pagination?.total || 0,
              page: json.data.pagination?.page || 1,
              totalPages: json.data.pagination?.total_pages || 1,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[API] /tweets request failed, using mock data:', e);
    }

    // Local fallback filter
    let filtered = [...MOCK_TWEETS_SAMPLE];
    if (params?.brand && params.brand !== 'all') {
      filtered = filtered.filter((t) => t.airline.toLowerCase().includes(params.brand!.toLowerCase()));
    }
    if (params?.sentiment && params.sentiment !== 'all') {
      filtered = filtered.filter((t) => t.airline_sentiment === params.sentiment);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter((t) => t.text.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q));
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = 14485;
    const totalPages = Math.ceil(total / limit);

    return {
      tweets: filtered.slice(0, limit),
      total,
      page,
      totalPages,
    };
  },

  async getBenchmarks(): Promise<Benchmark[]> {
    try {
      const res = await fetchWithFallback<{ benchmarks: Benchmark[] } | Benchmark[]>(
        '/analytics/benchmarks', 
        { benchmarks: MOCK_BENCHMARKS }
      );
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.benchmarks)) return res.benchmarks;
      return MOCK_BENCHMARKS;
    } catch {
      return MOCK_BENCHMARKS;
    }
  },

  async uploadDataset(file: File): Promise<DatasetUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.data;
  },

  async load100kDataset(): Promise<DatasetUploadResult> {
    const res = await fetch(`${BASE_URL}/dataset/load-100k`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    return json.data;
  },

  async getStreamSamples(count: number = 20): Promise<Array<{
    airline: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    compound: number;
    reason: string | null;
    text: string;
  }>> {
    try {
      const res = await fetch(`${BASE_URL}/dataset/stream-sample?count=${count}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.samples) return json.data.samples;
      }
    } catch {
      // Fallback sample
    }
    return [
      { airline: 'United', sentiment: 'negative', confidence: 0.94, compound: -0.76, reason: 'Customer Service Issue', text: '@united on hold for 3 hours and disconnected again! Truly unacceptable service.' },
      { airline: 'Virgin America', sentiment: 'positive', confidence: 0.98, compound: 0.88, reason: null, text: '@VirginAmerica loved the smooth flight from SFO to JFK! Best airline experience.' },
      { airline: 'Southwest', sentiment: 'neutral', confidence: 0.72, compound: 0.05, reason: null, text: '@SouthwestAir can I change my seat assignment online for tomorrow departure?' },
      { airline: 'US Airways', sentiment: 'negative', confidence: 0.99, compound: -0.89, reason: 'Late Flight', text: '@USAirways delayed another 2 hours with zero explanation. Missing connection in CLT!' },
    ];
  },
};
