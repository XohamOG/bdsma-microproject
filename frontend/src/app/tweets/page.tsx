'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { apiService } from '@/lib/api';
import { Tweet, Brand } from '@/types';

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [carrier, setCarrier] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(14640);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      const b = await apiService.getBrands();
      setBrands(b);
    }
    loadBrands();
  }, []);

  useEffect(() => {
    async function loadTweets() {
      setLoading(true);
      try {
        const res = await apiService.getTweets({
          brand: carrier,
          sentiment: sentiment,
          page,
          limit: 10,
        });
        setTweets(res.tweets);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to load tweets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTweets();
  }, [carrier, sentiment, page]);

  const filteredTweets = tweets.filter((t) =>
    search ? t.text.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-gold text-xs font-serif uppercase tracking-widest mb-1">
            <span>♦</span>
            <span>Raw Dataset Records</span>
            <span>♦</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Tweet Explorer & NLP Diagnostics
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Directly browse, filter, and inspect genuine tweet texts, sentiment confidence coefficients, and negative reasons.
          </p>
        </div>

        {/* Global Record Counter */}
        <div className="bg-nouveau-cream px-3.5 py-2 rounded-[12px] border border-nouveau-gold/40 text-right">
          <span className="font-display text-[10px] text-nouveau-charcoal/60 uppercase block">
            Indexed Corpus
          </span>
          <span className="font-mono text-base font-bold text-nouveau-teal">
            {total.toLocaleString()} Tweets
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="nouveau-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nouveau-charcoal/40" />
            <input
              type="text"
              placeholder="Search tweet text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] pl-9 pr-3 py-1.5 text-xs font-display text-nouveau-charcoal focus:outline-none focus:ring-2 focus:ring-nouveau-teal/30 w-64"
            />
          </div>

          {/* Carrier Scope */}
          <div className="flex items-center gap-1.5 bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] px-2.5 py-1 text-xs font-display">
            <span className="text-nouveau-charcoal/60">Carrier:</span>
            <select
              value={carrier}
              onChange={(e) => {
                setCarrier(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Carriers</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5 bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] px-2.5 py-1 text-xs font-display">
            <span className="text-nouveau-charcoal/60">Sentiment:</span>
            <select
              value={sentiment}
              onChange={(e) => {
                setSentiment(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(carrier !== 'all' || sentiment !== 'all' || search !== '') && (
          <button
            onClick={() => {
              setCarrier('all');
              setSentiment('all');
              setSearch('');
              setPage(1);
            }}
            className="text-xs font-display font-semibold text-nouveau-burgundy hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Tweets Table */}
      <div className="nouveau-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-display text-nouveau-charcoal/60">
            Fetching tweet records...
          </div>
        ) : filteredTweets.length === 0 ? (
          <div className="p-12 text-center text-xs font-display text-nouveau-charcoal/60">
            No tweets matching the specified filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-display">
              <thead>
                <tr className="border-b border-nouveau-gold/30 bg-nouveau-cream/40 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Tweet Content</th>
                  <th className="py-3 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nouveau-gold/15">
                {filteredTweets.map((t) => (
                  <tr key={t.tweet_id} className="hover:bg-nouveau-cream/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-nouveau-charcoal shrink-0">
                      {t.airline}
                    </td>
                    <td className="py-3 px-4 shrink-0">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-[6px] uppercase ${
                          t.airline_sentiment === 'positive'
                            ? 'bg-nouveau-teal/15 text-nouveau-teal border border-nouveau-teal/30'
                            : t.airline_sentiment === 'negative'
                            ? 'bg-nouveau-burgundy/15 text-nouveau-burgundy border border-nouveau-burgundy/30'
                            : 'bg-nouveau-gold/20 text-nouveau-charcoal border border-nouveau-gold/40'
                        }`}
                      >
                        {t.airline_sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-nouveau-charcoal/80">
                      {(t.sentiment_confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-xs font-display">
                      {t.negativereason ? (
                        <span className="font-semibold text-nouveau-burgundy">
                          {t.negativereason}
                        </span>
                      ) : (
                        <span className="text-nouveau-charcoal/40 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-nouveau-charcoal leading-relaxed max-w-lg">
                      {t.text}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-nouveau-charcoal/60 shrink-0">
                      {new Date(t.tweet_created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="p-4 border-t border-nouveau-gold/20 flex items-center justify-between text-xs font-display">
          <span className="text-nouveau-charcoal/60">
            Showing Page <strong className="font-mono text-nouveau-charcoal">{page}</strong> of{' '}
            <span className="font-mono">{Math.ceil(total / 10)}</span> (10 tweets/page)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
