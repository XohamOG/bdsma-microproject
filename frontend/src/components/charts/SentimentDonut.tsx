'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { NOUVEAU_CHART_THEME } from '@/lib/theme';
import { SentimentAnalytics } from '@/types';

interface Props {
  data: SentimentAnalytics;
  title?: string;
}

export const SentimentDonut: React.FC<Props> = ({ data, title = 'Global Sentiment Distribution' }) => {
  const chartData = [
    {
      name: 'Positive',
      value: data.distribution.positive.count,
      pct: data.distribution.positive.percentage,
      color: NOUVEAU_CHART_THEME.sentiment.positive,
    },
    {
      name: 'Neutral',
      value: data.distribution.neutral.count,
      pct: data.distribution.neutral.percentage,
      color: NOUVEAU_CHART_THEME.sentiment.neutral,
    },
    {
      name: 'Negative',
      value: data.distribution.negative.count,
      pct: data.distribution.negative.percentage,
      color: NOUVEAU_CHART_THEME.sentiment.negative,
    },
  ];

  return (
    <div className="nouveau-card p-6 flex flex-col justify-between">
      <div className="border-b border-nouveau-gold/20 pb-3 mb-2 flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-nouveau-charcoal">{title}</h3>
        <span className="font-mono text-xs text-nouveau-charcoal/60">
          N = {data.total_tweets.toLocaleString()}
        </span>
      </div>

      <div className="h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              stroke="#FFFFF0"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div style={NOUVEAU_CHART_THEME.tooltip.contentStyle}>
                      <p style={NOUVEAU_CHART_THEME.tooltip.labelStyle}>{item.name} Sentiment</p>
                      <p className="font-mono text-sm font-semibold">
                        {item.value.toLocaleString()} tweets{' '}
                        <span className="text-xs text-nouveau-charcoal/70">({item.pct}%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value, entry: any) => {
                const item = chartData.find((d) => d.name === value);
                return (
                  <span className="font-display text-xs text-nouveau-charcoal font-medium mr-3">
                    {value}: <strong className="font-mono">{item?.pct}%</strong>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="font-mono text-xs text-nouveau-charcoal/60 uppercase tracking-widest">
            Negative
          </span>
          <span className="font-mono text-2xl font-bold text-nouveau-burgundy">
            {data.distribution.negative.percentage}%
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-nouveau-gold/20 flex items-center justify-between text-xs font-display text-nouveau-charcoal/70">
        <span>Negative sentiment dominates 62.7% of all recorded tweets</span>
        <span className="font-mono text-nouveau-teal font-semibold">6 Airlines</span>
      </div>
    </div>
  );
};
