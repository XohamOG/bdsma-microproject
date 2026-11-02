'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { NOUVEAU_CHART_THEME } from '@/lib/theme';
import { Brand } from '@/types';

interface Props {
  brands: Brand[];
  title?: string;
}

export const BrandCompareChart: React.FC<Props> = ({
  brands,
  title = 'Brand Net Sentiment & Reputation Ranking',
}) => {
  const chartData = brands.map((b) => ({
    name: b.name,
    code: b.code,
    net_sentiment_score: b.net_sentiment_score,
    reputation_index: b.reputation_index,
    positive_rate: Number(((b.positive / b.total_tweets) * 100).toFixed(1)),
    negative_rate: Number(((b.negative / b.total_tweets) * 100).toFixed(1)),
  }));

  return (
    <div className="nouveau-card p-6 flex flex-col justify-between">
      <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-bold text-base text-nouveau-charcoal">{title}</h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Net Sentiment Score: ((P - N) / Total) × 100 (Scale -100 to +100)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-teal/10 text-nouveau-teal border border-nouveau-teal/30 font-semibold">
            Virgin America #1 (NSS -5.75)
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E4D8" />
            <XAxis
              dataKey="name"
              stroke="#CFB53B"
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'Quattrocento, serif', fontWeight: 600 }}
            />
            <YAxis
              stroke="#CFB53B"
              domain={[-80, 60]}
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <ReferenceLine y={0} stroke="#1A1A18" strokeWidth={1.5} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div style={NOUVEAU_CHART_THEME.tooltip.contentStyle}>
                      <p style={NOUVEAU_CHART_THEME.tooltip.labelStyle}>
                        {label} ({item.code})
                      </p>
                      <p className="font-mono text-xs text-nouveau-charcoal py-0.5">
                        Net Sentiment Score (NSS):{' '}
                        <strong
                          className={
                            item.net_sentiment_score >= -20
                              ? 'text-nouveau-teal font-bold'
                              : 'text-nouveau-burgundy font-bold'
                          }
                        >
                          {item.net_sentiment_score}
                        </strong>
                      </p>
                      <p className="font-mono text-xs text-nouveau-charcoal py-0.5">
                        Reputation Index (BRI):{' '}
                        <strong className="text-nouveau-gold font-bold">{item.reputation_index}</strong>
                      </p>
                      <p className="font-mono text-xs text-nouveau-charcoal/70 pt-1 border-t border-nouveau-gold/20 mt-1">
                        Pos: {item.positive_rate}% | Neg: {item.negative_rate}%
                      </p>
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
            <Bar
              dataKey="net_sentiment_score"
              name="Net Sentiment Score (NSS)"
              fill={NOUVEAU_CHART_THEME.sentiment.positive}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="reputation_index"
              name="Reputation Index (BRI)"
              fill={NOUVEAU_CHART_THEME.sentiment.neutral}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-nouveau-gold/20 flex flex-wrap items-center justify-between gap-2 text-xs font-display text-nouveau-charcoal/70">
        <span>Higher NSS indicates superior customer satisfaction balance</span>
        <span className="font-mono text-nouveau-burgundy font-semibold">US Airways #6 (-68.45)</span>
      </div>
    </div>
  );
};
