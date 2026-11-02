'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { NOUVEAU_CHART_THEME } from '@/lib/theme';
import { HistoricalTrends } from '@/types';

interface Props {
  data: HistoricalTrends;
  title?: string;
}

export const SentimentTrendChart: React.FC<Props> = ({
  data,
  title = 'Historical Sentiment Volume (Feb 17–24, 2015)',
}) => {
  return (
    <div className="nouveau-card p-6 flex flex-col justify-between">
      <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base text-nouveau-charcoal">{title}</h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Daily tweet volume across all 6 airlines. Notice Feb 22 winter storm surge.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-cream text-nouveau-charcoal border border-nouveau-gold/40">
            Interval: Daily
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NOUVEAU_CHART_THEME.sentiment.positive} stopOpacity={0.4} />
                <stop offset="95%" stopColor={NOUVEAU_CHART_THEME.sentiment.positive} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NOUVEAU_CHART_THEME.sentiment.neutral} stopOpacity={0.4} />
                <stop offset="95%" stopColor={NOUVEAU_CHART_THEME.sentiment.neutral} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NOUVEAU_CHART_THEME.sentiment.negative} stopOpacity={0.4} />
                <stop offset="95%" stopColor={NOUVEAU_CHART_THEME.sentiment.negative} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E4D8" />
            <XAxis
              dataKey="date"
              stroke="#CFB53B"
              tickFormatter={(date) => date.replace('2015-', '')}
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <YAxis
              stroke="#CFB53B"
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={NOUVEAU_CHART_THEME.tooltip.contentStyle}>
                      <p style={NOUVEAU_CHART_THEME.tooltip.labelStyle}>Date: {label}</p>
                      {payload.map((entry: any, idx: number) => (
                        <p key={idx} className="font-mono text-xs flex justify-between gap-4 py-0.5">
                          <span style={{ color: entry.color }} className="font-semibold">
                            {entry.name}:
                          </span>
                          <strong className="text-nouveau-charcoal">{entry.value.toLocaleString()}</strong>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="font-display text-xs text-nouveau-charcoal font-semibold mx-2">
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="negative"
              name="Negative"
              stroke={NOUVEAU_CHART_THEME.sentiment.negative}
              fillOpacity={1}
              fill="url(#colorNeg)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="neutral"
              name="Neutral"
              stroke={NOUVEAU_CHART_THEME.sentiment.neutral}
              fillOpacity={1}
              fill="url(#colorNeu)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="positive"
              name="Positive"
              stroke={NOUVEAU_CHART_THEME.sentiment.positive}
              fillOpacity={1}
              fill="url(#colorPos)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-nouveau-gold/20 flex flex-wrap items-center justify-between gap-2 text-xs font-display text-nouveau-charcoal/70">
        <span>February 22 peak: 2,440 total tweets with 1,650 negative complaints</span>
        <span className="font-mono text-nouveau-burgundy font-semibold">Spike: +65% vs Baseline</span>
      </div>
    </div>
  );
};
