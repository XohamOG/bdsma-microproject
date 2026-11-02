'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { Tweet, Brand } from '@/types';

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [carrier, setCarrier] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [reason, setReason] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(14485);
  const [totalPages, setTotalPages] = useState(966);
  const [loading, setLoading] = useState(true);

  // Load brands for dropdown
  useEffect(() => {
    async function loadBrands() {
      try {
        const b = await apiService.getBrands();
        setBrands(b);
      } catch (err) {
        console.error('Error loading brands in tweet explorer:', err);
      }
    }
    loadBrands();
  }, []);

  // Load tweets on filter or page change
  useEffect(() => {
    async function loadTweets() {
      setLoading(true);
      try {
        const res = await apiService.getTweets({
          brand: carrier,
          sentiment,
          reason,
          search: search.trim() || undefined,
          page,
          limit,
        });
        setTweets(res.tweets);
        setTotal(res.total);
        setTotalPages(res.totalPages || Math.ceil(res.total / limit));
      } catch (err) {
        console.error('Failed to load live tweets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTweets();
  }, [carrier, sentiment, reason, search, page, limit]);

  const handleResetFilters = () => {
    setCarrier('all');
    setSentiment('all');
    setReason('all');
    setSearch('');
    setPage(1);
  };

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate page numbers for pagination
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-nouveau-teal" />
            <span>Dataset Ingestion & Inspection</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Tweet Explorer & NLP Diagnostics
          </h1>
          <p className="font-display text-xs sm:text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Live inspection of real passenger tweets with VADER sentiment confidence and negative root-cause reasons.
          </p>
        </div>

        {/* Global Record Counter */}
        <div className="bg-nouveau-cream px-4 py-2.5 rounded-[12px] border border-nouveau-gold/40 text-right shrink-0">
          <span className="font-display text-[10px] text-nouveau-charcoal/60 uppercase block">
            Cleaned Corpus Size
          </span>
          <span className="font-mono text-base font-bold text-nouveau-teal">
            {total.toLocaleString()} Verified Tweets
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="nouveau-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-nouveau-charcoal/40" />
              <input
                type="text"
                placeholder="Search tweet text..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] pl-9 pr-3 py-1.5 text-xs font-display text-nouveau-charcoal focus:outline-none focus:ring-2 focus:ring-nouveau-teal/30 w-56 sm:w-64"
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
                className="bg-transparent font-semibold focus:outline-none cursor-pointer text-nouveau-charcoal"
              >
                <option value="all">All 6 Carriers</option>
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
                className="bg-transparent font-semibold focus:outline-none cursor-pointer text-nouveau-charcoal"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            {/* Negative Reason Filter */}
            <div className="flex items-center gap-1.5 bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] px-2.5 py-1 text-xs font-display">
              <span className="text-nouveau-charcoal/60">Reason:</span>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer text-nouveau-charcoal"
              >
                <option value="all">All Reasons</option>
                <option value="Customer Service Issue">Customer Service Issue</option>
                <option value="Late Flight">Late Flight</option>
                <option value="Cancelled Flight">Cancelled Flight</option>
                <option value="Lost Luggage">Lost Luggage</option>
                <option value="Bad Flight">Bad Flight</option>
                <option value="Flight Booking Problems">Flight Booking Problems</option>
                <option value="Flight Attendant Complaints">Flight Attendant Complaints</option>
              </select>
            </div>
          </div>

          {/* Reset Filters & Page Size */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-display text-nouveau-charcoal/70">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-nouveau-cream border border-nouveau-gold/50 rounded-[8px] px-2 py-1 text-xs font-mono font-semibold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {(carrier !== 'all' || sentiment !== 'all' || reason !== 'all' || search !== '') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-display font-semibold text-nouveau-burgundy hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tweets Table */}
      <div className="nouveau-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-nouveau-charcoal">
            <div className="w-7 h-7 border-2 border-nouveau-gold border-t-nouveau-teal rounded-full animate-spin" />
            <p className="font-display text-xs text-nouveau-charcoal/60">
              Querying live dataset records from backend...
            </p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-16 text-center text-xs font-display text-nouveau-charcoal/60">
            No tweets matching the specified filter criteria. Try resetting filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-display">
              <thead>
                <tr className="border-b border-nouveau-gold/30 bg-nouveau-cream/40 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Negative Reason</th>
                  <th className="py-3 px-4">Tweet Content</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nouveau-gold/15">
                {tweets.map((t) => (
                  <tr key={t.tweet_id} className="hover:bg-nouveau-cream/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-nouveau-charcoal whitespace-nowrap">
                      {t.airline}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[6px] uppercase ${
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
                    <td className="py-3 px-4 font-mono text-xs text-nouveau-charcoal/80 whitespace-nowrap">
                      {(t.sentiment_confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-xs font-display whitespace-nowrap">
                      {t.negativereason ? (
                        <span className="font-semibold text-nouveau-burgundy">
                          {t.negativereason}
                        </span>
                      ) : (
                        <span className="text-nouveau-charcoal/40 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-nouveau-charcoal leading-relaxed max-w-lg">
                      <p>{t.text}</p>
                      {t.name && (
                        <span className="text-[10px] font-mono text-nouveau-charcoal/50 mt-0.5 block">
                          @{t.name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-nouveau-charcoal/60 whitespace-nowrap">
                      {t.tweet_created ? new Date(t.tweet_created).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        <div className="p-4 border-t border-nouveau-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-display">
          <span className="text-nouveau-charcoal/70">
            Showing <strong className="font-mono text-nouveau-charcoal">{startRecord}</strong> to{' '}
            <strong className="font-mono text-nouveau-charcoal">{endRecord}</strong> of{' '}
            <strong className="font-mono text-nouveau-teal">{total.toLocaleString()}</strong> tweets
          </span>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First Page"
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              title="Previous Page"
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Visible Page Numbers */}
            <div className="flex items-center gap-1">
              {getVisiblePages().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-[8px] font-mono text-xs font-bold transition-all ${
                    pageNum === page
                      ? 'bg-nouveau-teal text-nouveau-ivory shadow-sm'
                      : 'border border-nouveau-gold/30 hover:bg-nouveau-cream text-nouveau-charcoal'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              title="Next Page"
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              title="Last Page"
              className="p-1.5 rounded-[8px] border border-nouveau-gold/40 hover:bg-nouveau-cream disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
