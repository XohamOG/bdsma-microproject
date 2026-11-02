'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  Calendar,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { SentimentTrendChart } from '@/components/charts/SentimentTrendChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { apiService } from '@/lib/api';
import { HistoricalTrends, AnomalyEvent, Brand } from '@/types';

export default function TrendsPage() {
  const [trends, setTrends] = useState<HistoricalTrends | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [t, a, b] = await Promise.all([
          apiService.getHistoricalTrends(selectedBrand === 'all' ? undefined : selectedBrand),
          apiService.getAnomalies(selectedBrand === 'all' ? undefined : selectedBrand),
          apiService.getBrands(),
        ]);
        setTrends(t);
        setAnomalies(a);
        setBrands(b);
      } catch (err) {
        console.error('Failed to load trends data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBrand]);

  if (loading || !trends) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm">Loading Temporal Trends & Anomaly Timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <span>Statistical Volatility & Anomalies</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Historical Trends & Anomaly Detection
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Temporal analysis of sentiment trajectories and statistical outlier spikes (z-score &gt; 2.5) across February 2015.
          </p>
        </div>

        {/* Brand filter */}
        <div className="flex items-center gap-2 bg-nouveau-cream border border-nouveau-gold rounded-[12px] px-3 py-1.5 shadow-sm">
          <label htmlFor="trends-carrier-select" className="text-xs font-display text-nouveau-charcoal/70">Carrier Scope:</label>
          <select
            id="trends-carrier-select"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-transparent font-display text-xs font-semibold text-nouveau-charcoal focus:outline-none cursor-pointer"
          >
            <option value="all">All Carriers Combined</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Detected Anomalies"
          badge="Outliers (z > 2.5)"
          value={anomalies.length}
          subtitle="Statistically verified negative volume surges"
          icon={ShieldAlert}
          variant="negative"
        />

        <MetricCard
          title="Peak Volume Date"
          badge="High Influx"
          value="Feb 22, 2015"
          subtitle="2,440 passenger tweets in 24 hours"
          icon={Calendar}
          variant="gold"
        />

        <MetricCard
          title="Average Sentiment Volatility"
          badge="Std Dev σ"
          value="± 8.4 pts"
          subtitle="Daily Net Sentiment Score deviation"
          icon={Activity}
          variant="default"
        />
      </div>

      {/* Main Trendline Chart */}
      <SentimentTrendChart data={trends} />

      <WhiplashDivider label="STATISTICAL ANOMALY SURGE EVENTS" />

      {/* Anomalies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
            Detected Outlier Incidents (Z-Score &gt; 2.5)
          </h3>
          <span className="font-mono text-xs text-nouveau-charcoal/60">
            Algorithmic 3-sigma anomaly detector
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {anomalies.map((anom) => (
            <div
              key={anom.id}
              className="nouveau-card p-5 border-l-4 border-l-nouveau-burgundy flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-nouveau-gold/20 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-nouveau-burgundy" />
                    <span className="font-display font-bold text-sm text-nouveau-charcoal">
                      {anom.brand}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-nouveau-burgundy text-nouveau-ivory">
                    z = {anom.z_score.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-nouveau-charcoal/60">Incident Date:</span>
                    <strong className="text-nouveau-charcoal">
                      {new Date(anom.timestamp).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-nouveau-charcoal/60">Primary Root Cause:</span>
                    <strong className="text-nouveau-burgundy">{anom.primary_reason}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-nouveau-charcoal/60">Negative Surge Rate:</span>
                    <strong className="text-nouveau-burgundy">
                      {anom.negative_rate}% (vs {anom.baseline_rate}%)
                    </strong>
                  </div>
                </div>

                <p className="font-display text-xs text-nouveau-charcoal/80 mt-3 pt-3 border-t border-nouveau-gold/20 leading-relaxed">
                  {anom.description}
                </p>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-nouveau-charcoal/50">
                <span>Severity: {anom.severity}</span>
                <span>Incident Ref: {anom.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
