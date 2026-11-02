'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, CheckSquare, Square, Award, ArrowRight } from 'lucide-react';
import { BrandCompareChart } from '@/components/charts/BrandCompareChart';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { apiService } from '@/lib/api';
import { Brand, BrandComparison } from '@/types';

export default function ComparePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<BrandComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const bList = await apiService.getBrands();
      setBrands(bList);
      const allIds = bList.map((b) => b.id);
      setSelectedIds(allIds);
      const c = await apiService.getBrandComparison(allIds);
      setComparison(c);
      setLoading(false);
    }
    load();
  }, []);

  const toggleBrand = async (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // Maintain at least 2 for comparison
      next = selectedIds.filter((b) => b !== id);
    } else {
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    const updated = await apiService.getBrandComparison(next);
    setComparison(updated);
  };

  if (loading || !comparison) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm">Building Multi-Brand Comparison Matrix...</p>
      </div>
    );
  }

  const selectedBrands = brands.filter((b) => selectedIds.includes(b.id));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <span>Comparative Benchmarking</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Multi-Carrier Comparison Matrix
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Side-by-side comparative benchmarking of Net Sentiment Scores, complaint proportions, and satisfaction indexes.
          </p>
        </div>

        {/* Brand Selector Checkboxes */}
        <div className="flex flex-wrap items-center gap-2">
          {brands.map((b) => {
            const isSelected = selectedIds.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBrand(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-display font-semibold transition-all border ${
                  isSelected
                    ? 'bg-nouveau-teal text-nouveau-ivory border-nouveau-gold shadow-sm'
                    : 'bg-nouveau-cream text-nouveau-charcoal/70 border-nouveau-gold/30 hover:bg-nouveau-ivory'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-nouveau-gold" />
                ) : (
                  <Square className="w-3.5 h-3.5 opacity-40" />
                )}
                <span>{b.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <BrandCompareChart brands={selectedBrands} title="Carrier Differential: NSS vs BRI" />

      <WhiplashDivider label="HEAD-TO-HEAD MATRIX" />

      {/* Comparison Table */}
      <div className="nouveau-card p-6 overflow-hidden">
        <div className="border-b border-nouveau-gold/20 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-nouveau-charcoal">
              Metric-by-Metric Comparison ({selectedBrands.length} Selected Carriers)
            </h3>
            <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
              Comparative analysis based on 14,640 verified tweets.
            </p>
          </div>
          <div className="text-right">
            <span className="font-display text-xs text-nouveau-teal font-semibold">
              Leader: {comparison.highest_reputation}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-display">
            <thead>
              <tr className="border-b border-nouveau-gold/30 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Carrier</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Positive %</th>
                <th className="py-2.5 px-3 text-right">Neutral %</th>
                <th className="py-2.5 px-3 text-right">Negative %</th>
                <th className="py-2.5 px-3 text-right">Net Sentiment (NSS)</th>
                <th className="py-2.5 px-3 text-right">Reputation (BRI)</th>
                <th className="py-2.5 px-3">Primary Complaint Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nouveau-gold/15 font-mono">
              {comparison.comparison.map((c) => (
                <tr key={c.brand} className="hover:bg-nouveau-cream/60 transition-colors">
                  <td className="py-3 px-3 font-display font-bold text-nouveau-charcoal">
                    {c.brand}
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-charcoal font-semibold">
                    {c.total_tweets.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-teal font-medium">
                    {c.positive_pct}%
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-gold font-medium">
                    {c.neutral_pct}%
                  </td>
                  <td className="py-3 px-3 text-right text-nouveau-burgundy font-medium">
                    {c.negative_pct}%
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-charcoal">
                    <span
                      className={
                        c.net_sentiment_score >= -20
                          ? 'text-nouveau-teal'
                          : c.net_sentiment_score >= -40
                          ? 'text-nouveau-gold'
                          : 'text-nouveau-burgundy'
                      }
                    >
                      {c.net_sentiment_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-nouveau-charcoal">
                    {c.reputation_index.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-display text-nouveau-charcoal/80">
                    <span className="px-2 py-0.5 rounded-[6px] bg-nouveau-burgundy/10 text-nouveau-burgundy border border-nouveau-burgundy/20 font-semibold text-[11px]">
                      {c.primary_complaint}
                    </span>
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
