'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { NOUVEAU_CHART_THEME } from '@/lib/theme';
import { ComplaintAnalytics } from '@/types';

interface Props {
  data: ComplaintAnalytics;
  title?: string;
  limit?: number;
}

export const ComplaintBarChart: React.FC<Props> = ({
  data,
  title = 'Top Customer Complaint Drivers',
  limit = 7,
}) => {
  const chartData = data.categories.slice(0, limit);

  return (
    <div className="nouveau-card p-6 flex flex-col justify-between">
      <div className="border-b border-nouveau-gold/20 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-nouveau-charcoal">{title}</h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Categorized breakdown of {data.total_negative_tweets.toLocaleString()} negative tweets
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-burgundy/10 text-nouveau-burgundy border border-nouveau-burgundy/30 font-semibold">
          Top {limit} Drivers
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E4D8" horizontal={false} />
            <XAxis
              type="number"
              unit="%"
              domain={[0, 40]}
              stroke="#CFB53B"
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
            <YAxis
              type="category"
              dataKey="reason"
              width={140}
              stroke="#CFB53B"
              tick={{ fill: '#1A1A18', fontSize: 11, fontFamily: 'Quattrocento, serif' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div style={NOUVEAU_CHART_THEME.tooltip.contentStyle}>
                      <p style={NOUVEAU_CHART_THEME.tooltip.labelStyle}>{item.reason}</p>
                      <p className="font-mono text-xs text-nouveau-charcoal">
                        Volume:{' '}
                        <strong className="text-sm font-semibold">{item.count.toLocaleString()}</strong> tweets
                      </p>
                      <p className="font-mono text-xs text-nouveau-burgundy font-semibold mt-1">
                        {item.percentage}% of all complaints
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => {
                // Gradient effect: top complaints are rich burgundy, lower ones soften to bronze/gold
                const colors = ['#800020', '#961C2C', '#AC3838', '#C25444', '#D87050', '#CFB53B', '#A0522D'];
                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-nouveau-gold/20 flex items-center justify-between text-xs font-display text-nouveau-charcoal/70">
        <span>Leading root cause: Customer Service Issue (31.7%)</span>
        <span className="font-mono text-nouveau-burgundy font-semibold">2,910 complaints</span>
      </div>
    </div>
  );
};
