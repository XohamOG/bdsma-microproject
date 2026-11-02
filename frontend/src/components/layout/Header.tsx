'use client';

import React from 'react';
import { Calendar, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface Props {
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  onRefresh?: () => void;
}

export const Header: React.FC<Props> = ({ selectedBrand = 'all', onBrandChange, onRefresh }) => {
  return (
    <header className="h-16 border-b border-nouveau-gold/30 bg-nouveau-ivory/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: System Status & Scope */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono bg-nouveau-cream px-3 py-1.5 rounded-[12px] border border-nouveau-gold/40 text-nouveau-charcoal shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-nouveau-teal" />
          <span>Historical Horizon: Feb 17 – Feb 24, 2015</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-nouveau-charcoal/70 bg-nouveau-ivory px-2.5 py-1 rounded-[12px] border border-nouveau-gold/20">
          <Database className="w-3 h-3 text-nouveau-gold" />
          <span>14,640 Verified Records</span>
        </div>
      </div>

      {/* Right: Brand quick selector & refresh action */}
      <div className="flex items-center gap-3">
        {onBrandChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="brand-filter" className="text-xs font-display font-medium text-nouveau-charcoal/70 hidden sm:inline">
              Scope:
            </label>
            <select
              id="brand-filter"
              value={selectedBrand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="bg-nouveau-cream border border-nouveau-gold text-nouveau-charcoal font-display text-xs rounded-[12px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-nouveau-teal/40 cursor-pointer shadow-sm"
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
            className="p-1.5 rounded-[12px] border border-nouveau-gold/40 hover:border-nouveau-teal bg-nouveau-cream text-nouveau-charcoal hover:text-nouveau-teal transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs font-display font-semibold text-nouveau-teal bg-nouveau-teal/10 px-3 py-1.5 rounded-[12px] border border-nouveau-teal/30">
          <ShieldCheck className="w-4 h-4 text-nouveau-teal" />
          <span>Verified Dataset</span>
        </div>
      </div>
    </header>
  );
};
