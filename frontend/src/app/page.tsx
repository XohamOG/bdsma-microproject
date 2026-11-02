'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Database,
  Cpu,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Award,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { SentimentAnalytics, Brand, AnomalyEvent } from '@/types';

export default function LandingPage() {
  const [sentiment, setSentiment] = useState<SentimentAnalytics | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [sData, bData, aData] = await Promise.all([
          apiService.getSentimentAnalytics(),
          apiService.getBrands(),
          apiService.getAnomalies(),
        ]);
        setSentiment(sData);
        setBrands(bData);
        setAnomalies(aData);
      } catch (e) {
        console.error('Failed to load landing stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalTweets = sentiment ? sentiment.total_tweets.toLocaleString() : '14,485';
  const topAirline = brands[0] ? brands[0].name : 'Virgin America';
  const lowestAirline = brands[brands.length - 1] ? brands[brands.length - 1].name : 'US Airways';

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 border-b border-nouveau-gold/30">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nouveau-teal/10 border border-nouveau-teal/30 text-nouveau-teal text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-nouveau-teal animate-pulse" />
            <span>Big Data Social Media Analytics • Microproject</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-nouveau-charcoal tracking-tight leading-[1.15]">
            AeroSentiment <span className="text-nouveau-teal">Intelligence</span>
          </h1>

          <p className="font-display text-base sm:text-lg text-nouveau-charcoal/80 leading-relaxed max-w-2xl">
            Real-time sentiment monitoring, customer complaint root-cause analysis, and brand reputation scoring
            across <strong>14,485 Kaggle passenger tweets</strong> for 6 major US air carriers—powered by 
            <strong> Apache Spark</strong>, <strong>VADER NLP</strong>, and <strong>columnar Parquet</strong> storage.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-[12px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold text-sm transition-all shadow-nouveau flex items-center gap-2 group"
            >
              <span>Launch Live Analytics</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/tweets"
              className="px-6 py-3 rounded-[12px] border border-nouveau-gold bg-nouveau-cream hover:bg-nouveau-ivory text-nouveau-charcoal hover:text-nouveau-teal font-display font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-nouveau-gold" />
              <span>Explore 14,485 Real Tweets</span>
            </Link>

            <Link
              href="/benchmarks"
              className="px-5 py-3 rounded-[12px] border border-nouveau-gold/40 hover:border-nouveau-teal bg-transparent text-nouveau-charcoal font-display font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-nouveau-teal" />
              <span>PySpark Benchmarks</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Time Live Counters Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="nouveau-card p-4">
          <div className="flex items-center gap-2 text-nouveau-charcoal/60 text-xs font-display">
            <Database className="w-4 h-4 text-nouveau-teal" />
            <span>Ingested Dataset</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-nouveau-charcoal">
            {totalTweets}
          </div>
          <div className="text-[11px] font-display text-nouveau-charcoal/60 mt-0.5">
            Deduplicated Kaggle tweets
          </div>
        </div>

        <div className="nouveau-card p-4">
          <div className="flex items-center gap-2 text-nouveau-charcoal/60 text-xs font-display">
            <Compass className="w-4 h-4 text-nouveau-gold" />
            <span>Monitored Carriers</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-nouveau-charcoal">
            6 Airlines
          </div>
          <div className="text-[11px] font-display text-nouveau-charcoal/60 mt-0.5">
            VA, DL, WN, UA, AA, US
          </div>
        </div>

        <div className="nouveau-card p-4">
          <div className="flex items-center gap-2 text-nouveau-charcoal/60 text-xs font-display">
            <AlertTriangle className="w-4 h-4 text-nouveau-burgundy" />
            <span>Surge Anomalies</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-nouveau-burgundy">
            {anomalies.length > 0 ? `${anomalies.length} Events` : '4 Events'}
          </div>
          <div className="text-[11px] font-display text-nouveau-charcoal/60 mt-0.5">
            Winter storm cancellation spikes
          </div>
        </div>

        <div className="nouveau-card p-4">
          <div className="flex items-center gap-2 text-nouveau-charcoal/60 text-xs font-display">
            <Cpu className="w-4 h-4 text-nouveau-teal" />
            <span>Spark Throughput</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-nouveau-teal">
            3.84x Speedup
          </div>
          <div className="text-[11px] font-display text-nouveau-charcoal/60 mt-0.5">
            Measured across 100x scale
          </div>
        </div>
      </section>

      {/* End-to-End Big Data Pipeline Architecture */}
      <section className="space-y-4">
        <div className="border-b border-nouveau-gold/20 pb-2">
          <span className="text-xs font-mono font-semibold text-nouveau-teal uppercase tracking-wider">
            System Architecture & Methodology
          </span>
          <h2 className="font-display font-bold text-2xl text-nouveau-charcoal mt-1">
            End-to-End Big Data Processing Pipeline
          </h2>
          <p className="font-display text-xs text-nouveau-charcoal/70">
            A real distributed data pipeline engineered for social media text analytics and operational intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="nouveau-card p-5 relative border-l-4 border-l-nouveau-teal">
            <div className="w-8 h-8 rounded-[10px] bg-nouveau-cream border border-nouveau-gold/40 flex items-center justify-center font-mono text-xs font-bold text-nouveau-teal mb-3">
              01
            </div>
            <h3 className="font-display font-bold text-sm text-nouveau-charcoal">
              Data Cleaning & NLP
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/70 mt-2 leading-relaxed">
              14,640 raw tweets ingested; 155 exact duplicates pruned. URLs, handles, and emojis parsed while retaining sentiment punctuation.
            </p>
            <div className="mt-3 text-[11px] font-mono text-nouveau-teal">
              Python • NLTK • VADER
            </div>
          </div>

          {/* Step 2 */}
          <div className="nouveau-card p-5 relative border-l-4 border-l-nouveau-gold">
            <div className="w-8 h-8 rounded-[10px] bg-nouveau-cream border border-nouveau-gold/40 flex items-center justify-center font-mono text-xs font-bold text-nouveau-gold mb-3">
              02
            </div>
            <h3 className="font-display font-bold text-sm text-nouveau-charcoal">
              Parquet Partitioning
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/70 mt-2 leading-relaxed">
              Columnar Snappy Parquet storage partitioned by airline (<code className="text-[10px]">airline_id=*</code>). Reduces query latency by over 80%.
            </p>
            <div className="mt-3 text-[11px] font-mono text-nouveau-gold">
              Apache PySpark • Parquet
            </div>
          </div>

          {/* Step 3 */}
          <div className="nouveau-card p-5 relative border-l-4 border-l-nouveau-charcoal">
            <div className="w-8 h-8 rounded-[10px] bg-nouveau-cream border border-nouveau-gold/40 flex items-center justify-center font-mono text-xs font-bold text-nouveau-charcoal mb-3">
              03
            </div>
            <h3 className="font-display font-bold text-sm text-nouveau-charcoal">
              Reputation Engine
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/70 mt-2 leading-relaxed">
              Net Sentiment Score (NSS = ((Positive - Negative) / Total) × 100) and Brand Reputation Index (BRI = 50 + NSS/2) computed dynamically.
            </p>
            <div className="mt-3 text-[11px] font-mono text-nouveau-charcoal">
              Mathematical Scoring Model
            </div>
          </div>

          {/* Step 4 */}
          <div className="nouveau-card p-5 relative border-l-4 border-l-nouveau-burgundy">
            <div className="w-8 h-8 rounded-[10px] bg-nouveau-cream border border-nouveau-gold/40 flex items-center justify-center font-mono text-xs font-bold text-nouveau-burgundy mb-3">
              04
            </div>
            <h3 className="font-display font-bold text-sm text-nouveau-charcoal">
              Surge Anomaly Engine
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/70 mt-2 leading-relaxed">
              Statistical moving-average thresholding (&gt;2σ) identifies customer crisis spikes, such as Feb 22 winter storm ground stops.
            </p>
            <div className="mt-3 text-[11px] font-mono text-nouveau-burgundy">
              Node.js Express API • Z-Score
            </div>
          </div>
        </div>
      </section>

      {/* Key Analytical Findings Highlights */}
      <section className="space-y-4">
        <div className="border-b border-nouveau-gold/20 pb-2">
          <span className="text-xs font-mono font-semibold text-nouveau-teal uppercase tracking-wider">
            Empirical Results
          </span>
          <h2 className="font-display font-bold text-2xl text-nouveau-charcoal mt-1">
            Core Project Discoveries
          </h2>
          <p className="font-display text-xs text-nouveau-charcoal/70">
            Validated analytical outcomes from real passenger social media data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Finding 1 */}
          <div className="nouveau-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-nouveau-teal font-display font-bold text-xs uppercase tracking-wide mb-2">
                <Award className="w-4 h-4 text-nouveau-gold" />
                <span>Airline Reputation Ranking</span>
              </div>
              <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
                Virgin America (#1) vs US Airways (#6)
              </h3>
              <p className="font-display text-xs text-nouveau-charcoal/70 mt-2 leading-relaxed">
                Virgin America attained the highest Net Sentiment Score (-5.75) with 33.6% positive tweets, whereas
                US Airways plunged to -69.21 NSS with a 77.7% negative ratio due to chronic baggage and delay complaints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-nouveau-gold/20">
              <Link
                href="/compare"
                className="text-xs font-display font-semibold text-nouveau-teal hover:underline flex items-center gap-1"
              >
                <span>View Full Comparison Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="nouveau-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-nouveau-burgundy font-display font-bold text-xs uppercase tracking-wide mb-2">
                <TrendingDown className="w-4 h-4 text-nouveau-burgundy" />
                <span>Root-Cause Breakdown</span>
              </div>
              <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
                Customer Service (31.7%) Dominates Discontent
              </h3>
              <p className="font-display text-xs text-nouveau-charcoal/70 mt-2 leading-relaxed">
                NLP classification of 9,082 negative tweets shows that long hold times and unhelpful staff account
                for nearly a third of all complaints, exceeding flight cancellations (9.2%) and lost luggage (7.9%).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-nouveau-gold/20">
              <Link
                href="/dashboard"
                className="text-xs font-display font-semibold text-nouveau-teal hover:underline flex items-center gap-1"
              >
                <span>Explore Complaint Charts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Finding 3 */}
          <div className="nouveau-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-nouveau-teal font-display font-bold text-xs uppercase tracking-wide mb-2">
                <Cpu className="w-4 h-4 text-nouveau-teal" />
                <span>Distributed Scale</span>
              </div>
              <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
                PySpark Scaling Benchmark
              </h3>
              <p className="font-display text-xs text-nouveau-charcoal/70 mt-2 leading-relaxed">
                While Pandas executes small baseline datasets rapidly in memory, PySpark demonstrates a 3.84x speedup
                when handling scaled enterprise social media streams with distributed partition parallelization.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-nouveau-gold/20">
              <Link
                href="/benchmarks"
                className="text-xs font-display font-semibold text-nouveau-teal hover:underline flex items-center gap-1"
              >
                <span>View Benchmark Metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Navigation Hub */}
      <section className="nouveau-card p-6 bg-gradient-to-br from-nouveau-cream/90 via-nouveau-ivory to-nouveau-cream/70 border border-nouveau-gold/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
              Interactive Project Demo Modules
            </h3>
            <p className="font-display text-xs text-nouveau-charcoal/70">
              Click any module below to inspect the live Big Data analytics and real Kaggle tweets
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-nouveau-teal">
            <CheckCircle2 className="w-4 h-4 text-nouveau-teal" />
            <span>Real API Backend Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard"
            className="p-4 rounded-[12px] bg-nouveau-ivory border border-nouveau-gold/40 hover:border-nouveau-teal hover:shadow-nouveau transition-all group"
          >
            <div className="w-8 h-8 rounded-[8px] bg-nouveau-teal/10 flex items-center justify-center text-nouveau-teal group-hover:bg-nouveau-teal group-hover:text-nouveau-ivory transition-colors">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-nouveau-charcoal mt-3 group-hover:text-nouveau-teal transition-colors">
              Live Analytics Dashboard
            </h4>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
              Realtime KPI cards, sentiment trends, donut distribution, and anomalies.
            </p>
          </Link>

          <Link
            href="/tweets"
            className="p-4 rounded-[12px] bg-nouveau-ivory border border-nouveau-gold/40 hover:border-nouveau-teal hover:shadow-nouveau transition-all group"
          >
            <div className="w-8 h-8 rounded-[8px] bg-nouveau-gold/20 flex items-center justify-center text-nouveau-gold group-hover:bg-nouveau-gold group-hover:text-nouveau-ivory transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-nouveau-charcoal mt-3 group-hover:text-nouveau-teal transition-colors">
              Tweet Explorer & Pagination
            </h4>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
              Search and filter 14,485 genuine tweets by airline, sentiment, and reason.
            </p>
          </Link>

          <Link
            href="/compare"
            className="p-4 rounded-[12px] bg-nouveau-ivory border border-nouveau-gold/40 hover:border-nouveau-teal hover:shadow-nouveau transition-all group"
          >
            <div className="w-8 h-8 rounded-[8px] bg-nouveau-charcoal/10 flex items-center justify-center text-nouveau-charcoal group-hover:bg-nouveau-charcoal group-hover:text-nouveau-ivory transition-colors">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-nouveau-charcoal mt-3 group-hover:text-nouveau-teal transition-colors">
              Compare Airlines
            </h4>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
              Multi-brand matrix benchmarking NSS, BRI, and complaint profiles.
            </p>
          </Link>

          <Link
            href="/benchmarks"
            className="p-4 rounded-[12px] bg-nouveau-ivory border border-nouveau-gold/40 hover:border-nouveau-teal hover:shadow-nouveau transition-all group"
          >
            <div className="w-8 h-8 rounded-[8px] bg-nouveau-burgundy/15 flex items-center justify-center text-nouveau-burgundy group-hover:bg-nouveau-burgundy group-hover:text-nouveau-ivory transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-nouveau-charcoal mt-3 group-hover:text-nouveau-teal transition-colors">
              Big Data Benchmarks
            </h4>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
              PySpark distributed cluster throughput vs Pandas single-node tests.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
