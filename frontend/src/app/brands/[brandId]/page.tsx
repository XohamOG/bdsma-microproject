'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  ThumbsDown,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { NOUVEAU_CHART_THEME } from '@/lib/theme';
import { apiService } from '@/lib/api';
import { BrandDetail, Tweet } from '@/types';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = (params?.brandId as string) || 'united';

  const [detail, setDetail] = useState<BrandDetail | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, tRes] = await Promise.all([
          apiService.getBrandReputation(brandId),
          apiService.getTweets({ brand: brandId, limit: 10 }),
        ]);
        setDetail(d);
        setTweets(tRes.tweets);
      } catch (err) {
        console.error('Failed to load brand detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brandId]);

  if (loading || !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm">Loading Carrier Analytics Profile...</p>
      </div>
    );
  }

  const { brand, metrics, top_complaint_reasons, timeline } = detail;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Navigation and Carrier Hero */}
      <div>
        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-nouveau-charcoal/70 hover:text-nouveau-teal transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Monitored Carriers</span>
        </Link>

        <div className="nouveau-card p-6 bg-gradient-to-r from-nouveau-ivory via-nouveau-cream/40 to-nouveau-ivory border-nouveau-gold/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[14px] bg-nouveau-teal text-nouveau-ivory flex items-center justify-center font-display font-bold text-xl shadow-nouveau-lift border border-nouveau-gold">
                {brand.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-nouveau-charcoal">
                    {brand.name}
                  </h1>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-gold/20 text-nouveau-charcoal font-semibold border border-nouveau-gold/40">
                    Carrier Code: {brand.code}
                  </span>
                </div>
                <p className="text-xs font-display text-nouveau-charcoal/70 mt-1">
                  Individual profile based on {metrics.total_tweets.toLocaleString()} passenger tweets recorded in the Twitter US Airline Sentiment Dataset.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-nouveau-cream px-4 py-2.5 rounded-[12px] border border-nouveau-gold/40 text-right">
                <span className="text-[10px] font-display text-nouveau-charcoal/60 uppercase tracking-widest block">
                  Net Sentiment Score
                </span>
                <span
                  className={`font-mono text-2xl font-bold ${
                    metrics.net_sentiment_score >= -20
                      ? 'text-nouveau-teal'
                      : metrics.net_sentiment_score >= -40
                      ? 'text-nouveau-gold'
                      : 'text-nouveau-burgundy'
                  }`}
                >
                  {metrics.net_sentiment_score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards for this Airline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Recorded Tweets"
          badge="Kaggle Dataset"
          value={metrics.total_tweets.toLocaleString()}
          subtitle="Total passenger mentions"
          icon={MessageSquare}
        />

        <MetricCard
          title="Complaint Rate"
          badge="Negative Share"
          value={`${metrics.complaint_rate.toFixed(1)}%`}
          subtitle={`${metrics.sentiment_counts.negative.toLocaleString()} dissatisfied passengers`}
          icon={ThumbsDown}
          variant="negative"
        />

        <MetricCard
          title="Positive Satisfaction"
          badge="P-Ratio"
          value={`${((metrics.sentiment_counts.positive / metrics.total_tweets) * 100).toFixed(1)}%`}
          subtitle={`${metrics.sentiment_counts.positive.toLocaleString()} complimentary tweets`}
          icon={ThumbsUp}
          variant="positive"
        />

        <MetricCard
          title="Brand Reputation Index (BRI)"
          badge="Score [0-100]"
          value={metrics.reputation_index.toFixed(1)}
          subtitle="Formula: ((P + 0.5U) / Total) × 100"
          icon={Award}
          variant="gold"
        />
      </div>

      {/* Charts Grid: Timeline & Top Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Timeline */}
        <div className="lg:col-span-7 nouveau-card p-6 flex flex-col justify-between">
          <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-nouveau-charcoal">
                Daily Sentiment Horizon for {brand.name}
              </h3>
              <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
                February 17 to February 24, 2015
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-cream text-nouveau-charcoal border border-nouveau-gold/30">
              Daily Volume
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E4D8" />
                <XAxis
                  dataKey="date"
                  stroke="#CFB53B"
                  tickFormatter={(d) => d.replace('2015-', '')}
                  tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                />
                <YAxis stroke="#CFB53B" tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={NOUVEAU_CHART_THEME.tooltip.contentStyle}>
                          <p style={NOUVEAU_CHART_THEME.tooltip.labelStyle}>Date: {label}</p>
                          {payload.map((e: any, idx: number) => (
                            <p key={idx} className="font-mono text-xs flex justify-between gap-4 py-0.5">
                              <span style={{ color: e.color }}>{e.name}:</span>
                              <strong>{e.value}</strong>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke={NOUVEAU_CHART_THEME.sentiment.negative}
                  fill={NOUVEAU_CHART_THEME.sentiment.negative}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke={NOUVEAU_CHART_THEME.sentiment.neutral}
                  fill={NOUVEAU_CHART_THEME.sentiment.neutral}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke={NOUVEAU_CHART_THEME.sentiment.positive}
                  fill={NOUVEAU_CHART_THEME.sentiment.positive}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Complaints for this Brand */}
        <div className="lg:col-span-5 nouveau-card p-6 flex flex-col justify-between">
          <div className="border-b border-nouveau-gold/20 pb-3 mb-4">
            <h3 className="font-display font-bold text-base text-nouveau-charcoal">
              Root Cause Complaint Drivers
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
              Specific dissatisfaction categories for {brand.name}
            </p>
          </div>

          <div className="space-y-3 py-2">
            {top_complaint_reasons.map((c, i) => (
              <div key={c.reason} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-display">
                  <span className="font-semibold text-nouveau-charcoal">
                    {i + 1}. {c.reason}
                  </span>
                  <span className="font-mono text-nouveau-burgundy font-bold">
                    {c.percentage}% ({c.count})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-nouveau-cream overflow-hidden border border-nouveau-gold/20">
                  <div
                    className="h-full bg-nouveau-burgundy rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-nouveau-gold/20 text-xs font-display text-nouveau-charcoal/60">
            Primary driver: <strong className="text-nouveau-charcoal">{top_complaint_reasons[0]?.reason}</strong>
          </div>
        </div>
      </div>

      <WhiplashDivider label="AUTHENTIC SAMPLE TWEETS FEED" />

      {/* Tweet Sample Feed */}
      <div className="nouveau-card p-6">
        <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-nouveau-charcoal">
              Passenger Tweets Sample ({brand.name})
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
              Raw tweets extracted from the dataset with sentiment classifications and confidence scores.
            </p>
          </div>
          <Link
            href="/tweets"
            className="text-xs font-display font-semibold text-nouveau-teal hover:underline"
          >
            Open Full Explorer
          </Link>
        </div>

        <div className="divide-y divide-nouveau-gold/15">
          {tweets.map((t) => (
            <div key={t.tweet_id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-display text-xs text-nouveau-charcoal leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-nouveau-charcoal/50">
                  <span>ID: {t.tweet_id}</span>
                  <span>{new Date(t.tweet_created).toLocaleDateString()}</span>
                  {t.negativereason && (
                    <span className="text-nouveau-burgundy font-semibold">Reason: {t.negativereason}</span>
                  )}
                </div>
              </div>

              <span
                className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-[6px] shrink-0 self-start uppercase ${
                  t.airline_sentiment === 'positive'
                    ? 'bg-nouveau-teal/15 text-nouveau-teal border border-nouveau-teal/30'
                    : t.airline_sentiment === 'negative'
                    ? 'bg-nouveau-burgundy/15 text-nouveau-burgundy border border-nouveau-burgundy/30'
                    : 'bg-nouveau-gold/20 text-nouveau-charcoal border border-nouveau-gold/40'
                }`}
              >
                {t.airline_sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
