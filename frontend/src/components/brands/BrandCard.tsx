import React from 'react';
import Link from 'next/link';
import { ChevronRight, Award, MessageSquare } from 'lucide-react';
import { Brand } from '@/types';

interface Props {
  brand: Brand;
}

export const BrandCard: React.FC<Props> = ({ brand }) => {
  const isLeader = brand.rank === 1;

  return (
    <div
      className={`nouveau-card p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isLeader ? 'border-nouveau-gold shadow-nouveau-gold bg-gradient-to-br from-nouveau-ivory to-nouveau-gold/10' : ''
      }`}
    >
      <div>
        {/* Header: Name, Code & Rank */}
        <div className="flex items-start justify-between gap-3 border-b border-nouveau-gold/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-display font-bold text-xs text-nouveau-ivory shadow-sm"
              style={{ backgroundColor: brand.color || '#008080' }}
            >
              {brand.code}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-nouveau-charcoal leading-snug">
                {brand.name}
              </h3>
              <p className="text-[11px] font-mono text-nouveau-charcoal/60">
                {brand.total_tweets.toLocaleString()} Total Tweets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isLeader && <Award className="w-4 h-4 text-nouveau-gold" />}
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-[8px] border ${
                isLeader
                  ? 'bg-nouveau-gold text-nouveau-charcoal border-nouveau-gold'
                  : 'bg-nouveau-cream text-nouveau-charcoal/80 border-nouveau-gold/40'
              }`}
            >
              #{brand.rank}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="bg-nouveau-cream/60 p-3 rounded-[10px] border border-nouveau-gold/20">
            <span className="text-[11px] font-display text-nouveau-charcoal/70 uppercase tracking-wide block">
              Net Sentiment (NSS)
            </span>
            <span
              className={`font-mono text-xl font-bold ${
                brand.net_sentiment_score >= -20
                  ? 'text-nouveau-teal'
                  : brand.net_sentiment_score >= -40
                  ? 'text-nouveau-gold'
                  : 'text-nouveau-burgundy'
              }`}
            >
              {brand.net_sentiment_score.toFixed(1)}
            </span>
          </div>

          <div className="bg-nouveau-cream/60 p-3 rounded-[10px] border border-nouveau-gold/20">
            <span className="text-[11px] font-display text-nouveau-charcoal/70 uppercase tracking-wide block">
              Reputation Index (BRI)
            </span>
            <span className="font-mono text-xl font-bold text-nouveau-charcoal">
              {brand.reputation_index.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Sentiment Distribution Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-nouveau-charcoal/70">
            <span>Positive: {brand.positive}</span>
            <span>Neutral: {brand.neutral}</span>
            <span>Negative: {brand.negative}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-nouveau-cream border border-nouveau-gold/20">
            <div
              className="bg-nouveau-teal transition-all duration-500"
              style={{ width: `${(brand.positive / brand.total_tweets) * 100}%` }}
              title={`Positive: ${brand.positive}`}
            />
            <div
              className="bg-nouveau-gold transition-all duration-500"
              style={{ width: `${(brand.neutral / brand.total_tweets) * 100}%` }}
              title={`Neutral: ${brand.neutral}`}
            />
            <div
              className="bg-nouveau-burgundy transition-all duration-500"
              style={{ width: `${(brand.negative / brand.total_tweets) * 100}%` }}
              title={`Negative: ${brand.negative}`}
            />
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 mt-3 border-t border-nouveau-gold/20 flex items-center justify-between">
        <span className="text-[11px] font-display text-nouveau-charcoal/60">
          Ranked #{brand.rank} of 6 carriers
        </span>
        <Link
          href={`/brands/${brand.id}`}
          className="inline-flex items-center gap-1 font-display font-semibold text-xs text-nouveau-teal hover:text-nouveau-charcoal transition-colors group"
        >
          <span>View Deep-Dive</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
