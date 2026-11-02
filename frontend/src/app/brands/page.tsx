'use client';

import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Award, Plane } from 'lucide-react';
import { BrandCard } from '@/components/brands/BrandCard';
import { BrandCompareChart } from '@/components/charts/BrandCompareChart';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { apiService } from '@/lib/api';
import { Brand } from '@/types';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'tweets' | 'nss' | 'bri'>('rank');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await apiService.getBrands();
      setBrands(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = brands
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'tweets') return b.total_tweets - a.total_tweets;
      if (sortBy === 'nss') return b.net_sentiment_score - a.net_sentiment_score;
      if (sortBy === 'bri') return b.reputation_index - a.reputation_index;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
        <p className="font-display text-sm">Loading Carrier Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <span>Carrier Directory & Profiles</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Monitored Airline Brands
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Individual airline profiles, complaint distributions, and reputation score breakdowns for all 6 domestic carriers.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nouveau-charcoal/50" />
            <input
              type="text"
              placeholder="Search carrier or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-nouveau-cream border border-nouveau-gold rounded-[12px] pl-9 pr-3 py-1.5 text-xs font-display text-nouveau-charcoal placeholder:text-nouveau-charcoal/50 focus:outline-none focus:ring-2 focus:ring-nouveau-teal/30 shadow-sm w-52"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-nouveau-cream border border-nouveau-gold rounded-[12px] px-2.5 py-1 text-xs font-display text-nouveau-charcoal">
            <SlidersHorizontal className="w-3.5 h-3.5 text-nouveau-gold" />
            <span className="text-nouveau-charcoal/60">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="rank">Rank (#1 to #6)</option>
              <option value="tweets">Volume (Highest)</option>
              <option value="nss">NSS (Best first)</option>
              <option value="bri">Reputation Index</option>
            </select>
          </div>
        </div>
      </div>

      {/* Brand Grid (Asymmetric layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      <WhiplashDivider label="CROSS-CARRIER REPUTATION VISUALIZATION" />

      {/* Comparison Chart Component */}
      <BrandCompareChart brands={brands} />
    </div>
  );
}
