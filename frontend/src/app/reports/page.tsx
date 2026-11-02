'use client';

import React, { useState } from 'react';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';
import { MOCK_BRANDS, MOCK_GLOBAL_SENTIMENT, MOCK_COMPLAINTS } from '@/mock/data';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('executive_summary');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      // Build genuine CSV content
      const headers = ['Carrier', 'Code', 'Total_Tweets', 'Positive_Count', 'Neutral_Count', 'Negative_Count', 'Net_Sentiment_Score', 'Reputation_Index', 'Rank'];
      const rows = MOCK_BRANDS.map((b) => [
        b.name,
        b.code,
        b.total_tweets,
        b.positive,
        b.neutral,
        b.negative,
        b.net_sentiment_score,
        b.reputation_index,
        b.rank,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `AeroSentiment_Report_${carrierFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-gold text-xs font-serif uppercase tracking-widest mb-1">
            <span>♦</span>
            <span>Business Intelligence Artifacts</span>
            <span>♦</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Analytical Reports & Export
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Compile customized analytical briefings, export structured CSV datasets, and generate board-ready reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-[12px] border border-nouveau-gold bg-nouveau-cream text-nouveau-charcoal hover:bg-nouveau-ivory hover:text-nouveau-teal font-display font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={downloading}
            className="px-4 py-2 rounded-[12px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold text-xs transition-all shadow-nouveau flex items-center gap-1.5 disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Compiling CSV...' : 'Export CSV Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Controls */}
      <div className="nouveau-card p-6">
        <h3 className="font-display font-bold text-base text-nouveau-charcoal mb-4">
          Report Parameters & Scope
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-display">
          <div>
            <label className="block text-nouveau-charcoal/70 mb-1 font-semibold">Report Format</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] px-3 py-2 font-semibold text-nouveau-charcoal focus:outline-none"
            >
              <option value="executive_summary">Executive Summary Briefing</option>
              <option value="complaint_root_cause">Complaint Root-Cause Analysis</option>
              <option value="competitor_matrix">Carrier Benchmarking Matrix</option>
            </select>
          </div>

          <div>
            <label className="block text-nouveau-charcoal/70 mb-1 font-semibold">Carrier Scope</label>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="w-full bg-nouveau-cream border border-nouveau-gold/50 rounded-[10px] px-3 py-2 font-semibold text-nouveau-charcoal focus:outline-none"
            >
              <option value="all">All 6 Monitored Airlines</option>
              <option value="virgin_america">Virgin America (Rank #1)</option>
              <option value="delta">Delta (Rank #2)</option>
              <option value="southwest">Southwest (Rank #3)</option>
              <option value="united">United (Rank #4)</option>
              <option value="american">American (Rank #5)</option>
              <option value="us_airways">US Airways (Rank #6)</option>
            </select>
          </div>

          <div>
            <label className="block text-nouveau-charcoal/70 mb-1 font-semibold">Temporal Horizon</label>
            <div className="bg-nouveau-cream/70 border border-nouveau-gold/30 rounded-[10px] px-3 py-2 text-nouveau-charcoal/80 font-mono">
              Feb 17 – Feb 24, 2015 (Complete)
            </div>
          </div>
        </div>
      </div>

      <WhiplashDivider label="EXECUTIVE BRIEFING PREVIEW" />

      {/* Generated Report Preview (Printable Card) */}
      <div className="nouveau-card p-8 bg-gradient-to-b from-nouveau-ivory via-nouveau-cream/30 to-nouveau-ivory border-nouveau-gold/60 space-y-6">
        <div className="border-b-2 border-nouveau-gold/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-serif text-nouveau-gold text-xs tracking-widest uppercase">
              CONFIDENTIAL ANALYTICAL BRIEFING
            </span>
            <h2 className="font-display font-bold text-2xl text-nouveau-charcoal mt-1">
              US Airline Industry Brand Reputation Report
            </h2>
            <p className="font-mono text-xs text-nouveau-charcoal/60 mt-0.5">
              Corpus: 14,640 Tweets | Scope: 6 US Carriers | Date: February 2015
            </p>
          </div>
          <div className="text-right font-mono text-xs text-nouveau-charcoal/60">
            <span>Doc ID: AER-2015-02</span>
          </div>
        </div>

        {/* Section 1: Key Findings */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-nouveau-teal flex items-center gap-2">
            <span>1. Core Findings & High-Level Sentiment Distribution</span>
          </h3>
          <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
            The dataset indicates a heavily negative sentiment environment across domestic US carriers. Out of 14,640 analyzed tweets, <strong>62.7% (9,178 tweets)</strong> expressed explicit complaints, while only <strong>16.1% (2,363 tweets)</strong> were positive commendations, generating an industry-wide Net Sentiment Score of <strong>-46.55</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
            <div className="bg-nouveau-cream/60 p-3 rounded-[8px] border border-nouveau-gold/20">
              <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Positive Commendations</span>
              <strong className="text-nouveau-teal text-lg">16.1% (2,363)</strong>
            </div>
            <div className="bg-nouveau-cream/60 p-3 rounded-[8px] border border-nouveau-gold/20">
              <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Neutral Inquiries</span>
              <strong className="text-nouveau-gold text-lg">21.2% (3,099)</strong>
            </div>
            <div className="bg-nouveau-cream/60 p-3 rounded-[8px] border border-nouveau-gold/20">
              <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Negative Complaints</span>
              <strong className="text-nouveau-burgundy text-lg">62.7% (9,178)</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Carrier Rankings */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-nouveau-teal">
            2. Relative Brand Standing & Differential
          </h3>
          <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
            <strong>Virgin America</strong> ranks #1 with a Net Sentiment Score of -5.75 and a Brand Reputation Index of 47.12, reflecting superior brand perception. In contrast, <strong>US Airways</strong> recorded the lowest standing with NSS of -68.45 and a 77.7% complaint rate, primarily driven by winter flight cancellations.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-nouveau-gold/30 text-nouveau-charcoal/60 text-[10px]">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Carrier</th>
                  <th className="py-2 text-right">Volume</th>
                  <th className="py-2 text-right">Net Sentiment (NSS)</th>
                  <th className="py-2 text-right">Reputation Index (BRI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nouveau-gold/15">
                {MOCK_BRANDS.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 font-bold text-nouveau-charcoal">#{b.rank}</td>
                    <td className="py-2 font-display font-semibold text-nouveau-charcoal">{b.name}</td>
                    <td className="py-2 text-right">{b.total_tweets}</td>
                    <td className="py-2 text-right font-bold">
                      <span className={b.net_sentiment_score >= -20 ? 'text-nouveau-teal' : 'text-nouveau-burgundy'}>
                        {b.net_sentiment_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 text-right font-bold text-nouveau-charcoal">{b.reputation_index.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Root Cause Drivers */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-base text-nouveau-teal">
            3. Primary Root Cause Recommendations
          </h3>
          <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
            <strong>Customer Service Issues (31.7%)</strong> and <strong>Late Flights (18.1%)</strong> account for nearly half of all negative passenger discourse. Airlines should focus operational investments on responsive phone/digital customer support and transparent gate communication to mitigate churn.
          </p>
        </div>

        <div className="pt-4 border-t border-nouveau-gold/30 flex items-center justify-between text-[11px] font-display text-nouveau-charcoal/50">
          <span>Prepared by AeroSentiment Analytics Engine</span>
          <span className="font-mono">Status: Verified & Export-Ready</span>
        </div>
      </div>
    </div>
  );
}
