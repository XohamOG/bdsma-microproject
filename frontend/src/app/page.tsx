'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingDown,
  Award,
  Plane,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { AnomalyAlertBanner } from '@/components/dashboard/AnomalyAlertBanner';
import { SentimentDonut } from '@/components/charts/SentimentDonut';
import { ComplaintBarChart } from '@/components/charts/ComplaintBarChart';
import { SentimentTrendChart } from '@/components/charts/SentimentTrendChart';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';

import { apiService } from '@/lib/api';
import {
  Brand,
  SentimentAnalytics,
  HistoricalTrends,
  ComplaintAnalytics,
  AnomalyEvent,
} from '@/types';

export default function OverviewPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sentiment, setSentiment] = useState<SentimentAnalytics | null>(null);
  const [trends, setTrends] = useState<HistoricalTrends | null>(null);
  const [complaints, setComplaints] = useState<ComplaintAnalytics | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bList, sData, tData, cData, aData] = await Promise.all([
          apiService.getBrands(),
          apiService.getSentimentAnalytics(),
          apiService.getHistoricalTrends(),
          apiService.getComplaints(),
          apiService.getAnomalies(),
        ]);
        setBrands(bList);
        setSentiment(sData);
        setTrends(tData);
        setComplaints(cData);
        setAnomalies(aData);
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !sentiment || !trends || !complaints) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-nouveau-charcoal">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm tracking-wide">Loading Brand Reputation Overview...</p>
      </div>
    );
  }

  const leader = brands[0] || { name: 'Virgin America', net_sentiment_score: -5.75 };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-gold text-xs font-serif uppercase tracking-widest mb-1">
            <span>♦</span>
            <span>Executive Analytics Dashboard</span>
            <span>♦</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-nouveau-charcoal tracking-tight">
            Brand Reputation & Sentiment Intelligence
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-2xl">
            Real-time analytical evaluation of 14,640 passenger tweets across 6 major US air carriers. Tracking
            reputation volatility, complaint root causes, and statistical negative spikes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/compare"
            className="px-4 py-2.5 rounded-[12px] border border-nouveau-gold bg-nouveau-cream text-nouveau-charcoal hover:bg-nouveau-ivory hover:text-nouveau-teal font-display font-semibold text-xs transition-all shadow-sm"
          >
            Compare All 6 Brands
          </Link>
          <Link
            href="/reports"
            className="px-4 py-2.5 rounded-[12px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold text-xs transition-all shadow-nouveau flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Briefing</span>
          </Link>
        </div>
      </div>

      {/* Anomaly Notification */}
      <AnomalyAlertBanner anomalies={anomalies} />

      {/* Primary KPI Cards (Asymmetric 4-column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tweets Analyzed"
          badge="100% Ingested"
          value={sentiment.total_tweets.toLocaleString()}
          subtitle="Kaggle Twitter US Airline Sentiment"
          icon={MessageSquare}
          trend={{ value: '14,640 records', isNeutral: true }}
        />

        <MetricCard
          title="Negative Complaint Share"
          badge="62.7% Dominance"
          value={`${sentiment.distribution.negative.percentage}%`}
          subtitle={`${sentiment.distribution.negative.count.toLocaleString()} negative passenger tweets`}
          icon={ThumbsDown}
          variant="negative"
          trend={{ value: 'High Discontent', isPositive: false }}
        />

        <MetricCard
          title="Net Sentiment Score (NSS)"
          badge="Industry Benchmark"
          value="-46.5"
          subtitle="Formula: ((P - N) / Total) × 100"
          icon={TrendingDown}
          variant="negative"
          trend={{ value: 'Challenged Baseline', isPositive: false }}
        />

        <MetricCard
          title="Top Ranked Carrier"
          badge="Rank #1"
          value={leader.name}
          subtitle={`NSS: ${leader.net_sentiment_score} (Least dissatisfied)`}
          icon={Award}
          variant="gold"
          trend={{ value: '+40.8 pts vs Avg', isPositive: true }}
        />
      </div>

      {/* Main Analytics Layout (Asymmetric 7:5 ratio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Trendline and Top Complaints */}
        <div className="lg:col-span-7 space-y-6">
          <SentimentTrendChart data={trends} />
          <ComplaintBarChart data={complaints} limit={6} />
        </div>

        {/* Right Column (5 cols): Donut Distribution & Carrier Leaderboard */}
        <div className="lg:col-span-5 space-y-6">
          <SentimentDonut data={sentiment} />

          {/* Quick Carrier Leaderboard Card */}
          <div className="nouveau-card p-6">
            <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-nouveau-charcoal">
                  Carrier Reputation Standings
                </h3>
                <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
                  Ranked by Net Sentiment Score (NSS)
                </p>
              </div>
              <Link
                href="/brands"
                className="text-xs font-display font-semibold text-nouveau-teal hover:underline flex items-center gap-1"
              >
                <span>Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.id}`}
                  className="group flex items-center justify-between p-2.5 rounded-[10px] hover:bg-nouveau-cream/70 transition-colors border border-transparent hover:border-nouveau-gold/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-nouveau-charcoal/50 w-4">
                      #{brand.rank}
                    </span>
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center font-display font-bold text-[10px] text-nouveau-ivory shrink-0"
                      style={{ backgroundColor: brand.color || '#008080' }}
                    >
                      {brand.code}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-nouveau-charcoal group-hover:text-nouveau-teal transition-colors">
                        {brand.name}
                      </h4>
                      <p className="font-mono text-[10px] text-nouveau-charcoal/60">
                        {brand.total_tweets.toLocaleString()} tweets
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono text-xs font-bold block ${
                        brand.net_sentiment_score >= -20
                          ? 'text-nouveau-teal'
                          : brand.net_sentiment_score >= -40
                          ? 'text-nouveau-gold'
                          : 'text-nouveau-burgundy'
                      }`}
                    >
                      {brand.net_sentiment_score.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-display text-nouveau-charcoal/50">NSS</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-nouveau-gold/20 flex items-center justify-between text-xs font-display text-nouveau-charcoal/60">
              <span>Virgin America outpaces US Airways by 62.7 NSS points</span>
            </div>
          </div>
        </div>
      </div>

      <WhiplashDivider label="CROSS-CARRIER BENCHMARK SUMMARY" />

      {/* Snapshot Comparison Table */}
      <div className="nouveau-card p-6 overflow-hidden">
        <div className="border-b border-nouveau-gold/20 pb-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-base text-nouveau-charcoal">
              Comprehensive Carrier Performance Snapshot
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
              Complete breakdown of positive, neutral, negative distributions and computed reputation indexes.
            </p>
          </div>
          <Link
            href="/compare"
            className="font-display font-semibold text-xs text-nouveau-teal hover:underline flex items-center gap-1"
          >
            <span>Open Interactive Compare Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-display">
            <thead>
              <tr className="border-b border-nouveau-gold/30 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Carrier</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Positive</th>
                <th className="py-2.5 px-3 text-right">Neutral</th>
                <th className="py-2.5 px-3 text-right">Negative</th>
                <th className="py-2.5 px-3 text-right">Net Sentiment (NSS)</th>
                <th className="py-2.5 px-3 text-right">Reputation Index (BRI)</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nouveau-gold/15 font-mono">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-nouveau-cream/60 transition-colors">
                  <td className="py-3 px-3 font-display font-bold text-nouveau-charcoal flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                    <span>{b.name}</span>
                  </td>
                  <td className="py-3 px-3 text-nouveau-charcoal/70">{b.code}</td>
                  <td className="py-3 px-3 text-right text-nouveau-charcoal font-semibold">
                    {b.total_tweets.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-teal font-medium">
                    {b.positive} ({((b.positive / b.total_tweets) * 100).toFixed(1)}%)
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-gold font-medium">
                    {b.neutral} ({((b.neutral / b.total_tweets) * 100).toFixed(1)}%)
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-burgundy font-medium">
                    {b.negative} ({((b.negative / b.total_tweets) * 100).toFixed(1)}%)
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-charcoal">
                    <span
                      className={
                        b.net_sentiment_score >= -20
                          ? 'text-nouveau-teal'
                          : b.net_sentiment_score >= -40
                          ? 'text-nouveau-gold'
                          : 'text-nouveau-burgundy'
                      }
                    >
                      {b.net_sentiment_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-charcoal">
                    {b.reputation_index.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      href={`/brands/${b.id}`}
                      className="px-2.5 py-1 rounded-[6px] bg-nouveau-cream border border-nouveau-gold/40 text-nouveau-teal hover:bg-nouveau-teal hover:text-nouveau-ivory font-display font-semibold text-[11px] transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
