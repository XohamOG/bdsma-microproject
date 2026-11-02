'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X, Flame } from 'lucide-react';
import { AnomalyEvent } from '@/types';
import Link from 'next/link';

interface Props {
  anomalies: AnomalyEvent[];
}

export const AnomalyAlertBanner: React.FC<Props> = ({ anomalies }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !anomalies || anomalies.length === 0) return null;

  const topAnomaly = anomalies[0];

  return (
    <div className="bg-nouveau-cream/90 border-l-4 border-l-nouveau-burgundy border-y border-r border-nouveau-burgundy/30 rounded-[12px] p-4 shadow-nouveau relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[10px] bg-nouveau-burgundy/10 text-nouveau-burgundy border border-nouveau-burgundy/20 mt-0.5 sm:mt-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-nouveau-burgundy tracking-wide">
                Historical Anomaly Detected: {topAnomaly.brand}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-[6px] bg-nouveau-burgundy text-nouveau-ivory font-semibold">
                z = {topAnomaly.z_score.toFixed(2)}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-[6px] bg-nouveau-gold/20 text-nouveau-charcoal border border-nouveau-gold/40">
                {topAnomaly.primary_reason}
              </span>
            </div>
            <p className="font-display text-xs text-nouveau-charcoal/80 mt-1 max-w-3xl">
              {topAnomaly.description} (Negative rate spiked to{' '}
              <strong className="font-mono text-nouveau-burgundy">{topAnomaly.negative_rate}%</strong> vs baseline of{' '}
              <span className="font-mono text-nouveau-charcoal/70">{topAnomaly.baseline_rate}%</span>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <Link
            href="/trends"
            className="flex items-center gap-1 font-display font-semibold text-xs text-nouveau-burgundy hover:text-nouveau-charcoal hover:underline transition-colors"
          >
            <span>Inspect All Anomalies ({anomalies.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-nouveau-charcoal/40 hover:text-nouveau-charcoal p-1 rounded-md transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
