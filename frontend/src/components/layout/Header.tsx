'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  onRefresh?: () => void;
}

export const Header: React.FC<Props> = ({ selectedBrand = 'all', onBrandChange, onRefresh }) => {
  return (
    <header className="h-16 border-b border-nouveau-gold/30 bg-nouveau-ivory/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Clean, minimal title */}
      <div className="flex items-center gap-2 text-xs font-display text-nouveau-charcoal/70">
        <span className="font-semibold text-nouveau-teal">BDSMA</span>
        <span className="text-nouveau-charcoal/40">/</span>
        <span className="text-nouveau-charcoal/80">Social Media Analytics Platform</span>
      </div>

      {/* Right: Brand quick selector & refresh action */}
      <div className="flex items-center gap-3">
        {onBrandChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="brand-filter" className="text-xs font-display font-medium text-nouveau-charcoal/70 hidden sm:inline">
              Carrier:
            </label>
            <select
              id="brand-filter"
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="bg-nouveau-cream border border-nouveau-gold text-nouveau-charcoal font-display text-xs rounded-[10px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-nouveau-teal/40 cursor-pointer shadow-sm"
            >
              <option value="all">All Monitored Carriers (6)</option>
              <option value="virgin_america">Virgin America (VA)</option>
              <option value="delta">Delta (DL)</option>
              <option value="southwest">Southwest (WN)</option>
              <option value="united">United (UA)</option>
              <option value="american">American (AA)</option>
              <option value="us_airways">US Airways (US)</option>
            </select>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Analytics"
            className="p-1.5 rounded-[10px] border border-nouveau-gold/40 hover:border-nouveau-teal bg-nouveau-cream text-nouveau-charcoal hover:text-nouveau-teal transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
