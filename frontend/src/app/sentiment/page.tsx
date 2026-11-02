'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart as PieIcon,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  BarChart2,
} from 'lucide-react';
import { SentimentDonut } from '@/components/charts/SentimentDonut';
import { ComplaintBarChart } from '@/components/charts/ComplaintBarChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { apiService } from '@/lib/api';
import { SentimentAnalytics, ComplaintAnalytics, Brand } from '@/types';

export default function SentimentPage() {
  const [sentiment, setSentiment] = useState<SentimentAnalytics | null>(null);
  const [complaints, setComplaints] = useState<ComplaintAnalytics | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, c, b] = await Promise.all([
          apiService.getSentimentAnalytics(selectedBrand === 'all' ? undefined : selectedBrand),
          apiService.getComplaints(selectedBrand === 'all' ? undefined : selectedBrand),
          apiService.getBrands(),
        ]);
        setSentiment(s);
        setComplaints(c);
        setBrands(b);
      } catch (err) {
        console.error('Failed to load sentiment data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBrand]);

  if (loading || !sentiment || !complaints) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm">Loading Sentiment & Complaint Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <span>Customer Perception Diagnostics</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Sentiment & Complaint Analytics
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            In-depth natural language sentiment classification and root cause categorization across 14,640 passenger tweets.
          </p>
        </div>

        {/* Carrier Filter */}
        <div className="flex items-center gap-2 bg-nouveau-cream border border-nouveau-gold rounded-[12px] px-3 py-1.5 shadow-sm">
          <Filter className="w-4 h-4 text-nouveau-gold" />
          <label htmlFor="sentiment-carrier-select" className="text-xs font-display text-nouveau-charcoal/70">Carrier:</label>
          <select
            id="sentiment-carrier-select"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-transparent font-display text-xs font-semibold text-nouveau-charcoal focus:outline-none cursor-pointer"
          >
            <option value="all">All Carriers Combined (6)</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Positive Passenger Sentiment"
          badge={`${sentiment.distribution.positive.percentage}%`}
          value={sentiment.distribution.positive.count.toLocaleString()}
          subtitle="Commendations, praise, and smooth experiences"
          icon={ThumbsUp}
          variant="positive"
        />

        <MetricCard
          title="Neutral Sentiment"
          badge={`${sentiment.distribution.neutral.percentage}%`}
          value={sentiment.distribution.neutral.count.toLocaleString()}
          subtitle="Informational, schedule inquiries, flight status"
          icon={PieIcon}
          variant="gold"
        />

        <MetricCard
          title="Negative Passenger Complaints"
          badge={`${sentiment.distribution.negative.percentage}%`}
          value={sentiment.distribution.negative.count.toLocaleString()}
          subtitle="Flight cancellations, lost luggage, customer service issues"
          icon={ThumbsDown}
          variant="negative"
        />
      </div>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <SentimentDonut data={sentiment} title="Sentiment Ratio Breakdown" />
        </div>
        <div className="lg:col-span-7">
          <ComplaintBarChart data={complaints} limit={8} title="Ranked Dissatisfaction Drivers" />
        </div>
      </div>

      <WhiplashDivider label="ALL COMPLAINT CATEGORIES DATA TABLE" />

      {/* Detailed Complaint Table */}
      <div className="nouveau-card p-6">
        <div className="border-b border-nouveau-gold/20 pb-3 mb-4">
          <h3 className="font-display font-bold text-base text-nouveau-charcoal">
            Complete Root Cause Taxonomy (10 Verified Reasons)
          </h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Frequency and proportional severity of negative tweets extracted from the dataset.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-display">
            <thead>
              <tr className="border-b border-nouveau-gold/30 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Complaint Reason</th>
                <th className="py-2.5 px-3 text-right">Tweet Count</th>
                <th className="py-2.5 px-3 text-right">Complaint Share</th>
                <th className="py-2.5 px-3">Relative Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nouveau-gold/15 font-mono">
              {complaints.categories.map((c, i) => (
                <tr key={c.reason} className="hover:bg-nouveau-cream/60 transition-colors">
                  <td className="py-3 px-3 text-nouveau-charcoal/50 font-bold">{i + 1}</td>
                  <td className="py-3 px-3 font-display font-semibold text-nouveau-charcoal">
                    {c.reason}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-charcoal">
                    {c.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-burgundy">
                    {c.percentage}%
                  </td>
                  <td className="py-3 px-3 w-48">
                    <div className="w-full h-2 rounded-full bg-nouveau-cream border border-nouveau-gold/30 overflow-hidden">
                      <div
                        className="h-full bg-nouveau-burgundy rounded-full transition-all duration-500"
                        style={{ width: `${(c.count / complaints.categories[0].count) * 100}%` }}
                      />
                    </div>
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
