import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  badge?: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'gold';
}

export const MetricCard: React.FC<Props> = ({
  title,
  badge,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
}) => {
  const borderVariants = {
    default: 'border-nouveau-gold/40 hover:border-nouveau-teal',
    positive: 'border-nouveau-teal/50 hover:border-nouveau-teal bg-gradient-to-br from-nouveau-ivory to-nouveau-teal/5',
    negative: 'border-nouveau-burgundy/40 hover:border-nouveau-burgundy bg-gradient-to-br from-nouveau-ivory to-nouveau-burgundy/5',
    gold: 'border-nouveau-gold hover:border-nouveau-teal bg-gradient-to-br from-nouveau-ivory to-nouveau-gold/10',
  };

  return (
    <div
      className={`nouveau-card p-5 relative overflow-hidden flex flex-col justify-between ${borderVariants[variant]}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-nouveau-gold/20 pb-3">
        <span className="font-display font-bold text-sm text-nouveau-charcoal truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-[8px] bg-nouveau-cream text-nouveau-charcoal/80 border border-nouveau-gold/40">
              {badge}
            </span>
          )}
          {Icon && <Icon className="w-4 h-4 text-nouveau-gold" />}
        </div>
      </div>

      {/* Main Value */}
      <div className="py-4">
        <div className="font-mono text-3xl font-bold tracking-tight text-nouveau-charcoal">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Footer Trend */}
      {trend && (
        <div className="pt-2 border-t border-nouveau-gold/15 flex items-center gap-2 text-xs font-mono">
          <span
            className={`font-semibold ${
              trend.isNeutral
                ? 'text-nouveau-gold'
                : trend.isPositive
                ? 'text-nouveau-teal'
                : 'text-nouveau-burgundy'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-[11px] text-nouveau-charcoal/50">vs dataset baseline</span>
        </div>
      )}

      {/* Subtle corner flourish */}
      <div className="absolute top-1 right-1 text-nouveau-gold/20 text-xs font-serif pointer-events-none select-none">
        ❧
      </div>
    </div>
  );
};
