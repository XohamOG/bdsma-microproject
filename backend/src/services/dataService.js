const fs = require('fs');
const path = require('path');
const config = require('../config');

// In-memory cache for processed data
let cachedBrands = null;
let cachedBrandDetails = null;
let cachedSentiment = null;
let cachedTrends = null;
let cachedComplaints = null;
let cachedAnomalies = null;
let cachedBenchmarks = null;
let cachedTweets = null;

function loadJsonSafe(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[WARN] Failed to load JSON from ${filePath}:`, err.message);
  }
  return fallback;
}

function getBrands() {
  if (!cachedBrands) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'brands.json');
    cachedBrands = loadJsonSafe(file, { brands: [] }).brands;
  }
  return cachedBrands;
}

function getBrandReputation(brandId) {
  if (!cachedBrandDetails) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'brand_details.json');
    cachedBrandDetails = loadJsonSafe(file, {});
  }
  const normalizedId = brandId.toLowerCase().trim().replace(/\s+/g, '_');
  return cachedBrandDetails[normalizedId] || null;
}

function getSentimentOverview(brandFilter, startDate, endDate) {
  if (!cachedSentiment) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'sentiment.json');
    cachedSentiment = loadJsonSafe(file, { total_tweets: 0, distribution: {}, by_brand: [] });
  }

  if (!brandFilter && !startDate && !endDate) {
    return cachedSentiment;
  }

  // Filter tweets dynamically if query parameters provided
  const tweets = getTweetsList();
  let filtered = tweets;

  if (brandFilter) {
    const bLower = brandFilter.toLowerCase();
    filtered = filtered.filter(t => 
      (t.airline && t.airline.toLowerCase().includes(bLower)) || 
      (t.airline_id && t.airline_id.toLowerCase() === bLower)
    );
  }

  if (startDate) {
    filtered = filtered.filter(t => t.tweet_date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(t => t.tweet_date <= endDate);
  }

  const total = filtered.length;
  if (total === 0) {
    return {
      total_tweets: 0,
      distribution: {
        positive: { count: 0, percentage: 0 },
        neutral: { count: 0, percentage: 0 },
        negative: { count: 0, percentage: 0 }
      },
      by_brand: []
    };
  }

  let pos = 0, neu = 0, neg = 0;
  for (const t of filtered) {
    if (t.airline_sentiment === 'positive') pos++;
    else if (t.airline_sentiment === 'neutral') neu++;
    else if (t.airline_sentiment === 'negative') neg++;
  }

  return {
    total_tweets: total,
    distribution: {
      positive: { count: pos, percentage: parseFloat(((pos / total) * 100).toFixed(2)) },
      neutral: { count: neu, percentage: parseFloat(((neu / total) * 100).toFixed(2)) },
      negative: { count: neg, percentage: parseFloat(((neg / total) * 100).toFixed(2)) }
    },
    by_brand: getBrands().filter(b => !brandFilter || b.id === brandFilter.toLowerCase() || b.name.toLowerCase().includes(brandFilter.toLowerCase()))
  };
}

function getTrends(brand = 'all', interval = 'daily') {
  if (brand === 'all') {
    if (!cachedTrends) {
      const file = path.join(config.PROCESSED_DATA_DIR, 'trends.json');
      cachedTrends = loadJsonSafe(file, { interval: 'daily', brand: 'all', timeline: [] });
    }
    return cachedTrends;
  }

  // If specific brand requested, pull from brand_details
  const brandDetail = getBrandReputation(brand);
  if (!brandDetail) {
    return { interval, brand, timeline: [] };
  }

  return {
    interval,
    brand: brandDetail.brand.name,
    timeline: brandDetail.timeline
  };
}

function getComplaints(brand, limit = 10) {
  if (!cachedComplaints) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'complaints.json');
    cachedComplaints = loadJsonSafe(file, { total_negative_tweets: 0, categories: [] });
  }

  let categories = cachedComplaints.categories;

  if (brand) {
    const detail = getBrandReputation(brand);
    if (detail && detail.top_complaint_reasons) {
      categories = detail.top_complaint_reasons;
    }
  }

  const numLimit = parseInt(limit, 10) || 10;
  return {
    total_negative_tweets: cachedComplaints.total_negative_tweets,
    categories: categories.slice(0, numLimit)
  };
}

function getBrandComparison(brandNamesList = null) {
  const allBrands = getBrands();
  let selected = allBrands;

  if (brandNamesList && brandNamesList.length > 0) {
    const filterLower = brandNamesList.map(b => b.toLowerCase().trim());
    selected = allBrands.filter(b => 
      filterLower.includes(b.id.toLowerCase()) || 
      filterLower.includes(b.name.toLowerCase()) || 
      filterLower.includes(b.code.toLowerCase())
    );
  }

  if (selected.length === 0) {
    selected = allBrands;
  }

  const comparison = selected.map(b => {
    const total = b.total_tweets;
    const detail = getBrandReputation(b.id);
    const topReason = detail && detail.top_complaint_reasons && detail.top_complaint_reasons[0] 
      ? detail.top_complaint_reasons[0].reason 
      : 'N/A';

    return {
      brand: b.name,
      code: b.code,
      total_tweets: b.total_tweets,
      positive_pct: parseFloat(((b.positive / total) * 100).toFixed(2)),
      neutral_pct: parseFloat(((b.neutral / total) * 100).toFixed(2)),
      negative_pct: parseFloat(((b.negative / total) * 100).toFixed(2)),
      net_sentiment_score: b.net_sentiment_score,
      reputation_index: b.reputation_index,
      complaint_rate: b.complaint_rate,
      primary_complaint: topReason,
      rank: b.rank
    };
  });

  const sorted = [...comparison].sort((a, b) => b.reputation_index - a.reputation_index);

  return {
    comparison,
    highest_reputation: sorted[0] ? sorted[0].brand : 'N/A',
    lowest_reputation: sorted[sorted.length - 1] ? sorted[sorted.length - 1].brand : 'N/A'
  };
}

function getAnomalies(brandFilter, severityFilter) {
  if (!cachedAnomalies) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'anomalies.json');
    cachedAnomalies = loadJsonSafe(file, { anomalies: [] }).anomalies;
  }

  let results = cachedAnomalies;
  if (brandFilter) {
    const bLower = brandFilter.toLowerCase();
    results = results.filter(a => 
      a.brand.toLowerCase().includes(bLower) || 
      a.airline_id.toLowerCase() === bLower
    );
  }

  if (severityFilter && severityFilter.toLowerCase() !== 'all') {
    results = results.filter(a => a.severity.toLowerCase() === severityFilter.toLowerCase());
  }

  return { anomalies: results };
}

function getBenchmarks() {
  if (!cachedBenchmarks) {
    const file = path.join(config.PROCESSED_DATA_DIR, 'benchmarks.json');
    cachedBenchmarks = loadJsonSafe(file, { system_info: {}, benchmarks: [] });
  }
  return cachedBenchmarks;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function getTweetsList() {
  if (cachedTweets) return cachedTweets;

  const csvPath = path.join(config.PROCESSED_DATA_DIR, 'tweets_cleaned.csv');
  if (!fs.existsSync(csvPath)) return [];

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]);
  const tweets = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length >= headers.length) {
      const obj = {};
      for (let h = 0; h < headers.length; h++) {
        obj[headers[h]] = vals[h];
      }
      obj.retweet_count = parseInt(obj.retweet_count, 10) || 0;
      obj.sentiment_confidence = parseFloat(obj.airline_sentiment_confidence) || 1.0;
      tweets.push(obj);
    }
  }

  cachedTweets = tweets;
  return cachedTweets;
}

function getTweetsPaginated(options = {}) {
  const {
    page = 1,
    limit = 20,
    brand,
    sentiment,
    reason,
    search
  } = options;

  let list = getTweetsList();

  if (brand) {
    const bLower = brand.toLowerCase();
    list = list.filter(t => 
      (t.airline && t.airline.toLowerCase().includes(bLower)) || 
      (t.airline_id && t.airline_id.toLowerCase() === bLower)
    );
  }

  if (sentiment) {
    const sLower = sentiment.toLowerCase();
    list = list.filter(t => t.airline_sentiment && t.airline_sentiment.toLowerCase() === sLower);
  }

  if (reason) {
    const rLower = reason.toLowerCase();
    list = list.filter(t => t.negativereason && t.negativereason.toLowerCase().includes(rLower));
  }

  if (search) {
    const qLower = search.toLowerCase();
    list = list.filter(t => 
      (t.text && t.text.toLowerCase().includes(qLower)) || 
      (t.name && t.name.toLowerCase().includes(qLower))
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const total = list.length;
  const total_pages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedData = list.slice(offset, offset + limitNum);

  return {
    tweets: paginatedData,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      total_pages
    }
  };
}

function invalidateCache() {
  cachedBrands = null;
  cachedBrandDetails = null;
  cachedSentiment = null;
  cachedTrends = null;
  cachedComplaints = null;
  cachedAnomalies = null;
  cachedBenchmarks = null;
  cachedTweets = null;
}

module.exports = {
  getBrands,
  getBrandReputation,
  getSentimentOverview,
  getTrends,
  getComplaints,
  getBrandComparison,
  getAnomalies,
  getBenchmarks,
  getTweetsPaginated,
  invalidateCache
};
