'use client';

import React from 'react';
import { Database, FileSpreadsheet, CheckCircle2, ShieldCheck, HardDrive, Cpu } from 'lucide-react';
import { DatasetUploader } from '@/components/dataset/DatasetUploader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';

const DATASET_SCHEMA = [
  { field: 'tweet_id', type: 'String / Int64', desc: 'Unique Twitter snowflake identifier', nulls: '0%' },
  { field: 'airline_sentiment', type: 'Category', desc: 'Positive, neutral, or negative sentiment', nulls: '0%' },
  { field: 'airline_sentiment_confidence', type: 'Float64', desc: 'Model confidence score (0.0 to 1.0)', nulls: '0%' },
  { field: 'negativereason', type: 'Category', desc: 'Categorized customer complaint driver', nulls: '37.3%' },
  { field: 'negativereason_confidence', type: 'Float64', desc: 'Confidence in complaint classification', nulls: '37.3%' },
  { field: 'airline', type: 'String', desc: 'Target carrier name (e.g. United, Delta)', nulls: '0%' },
  { field: 'name', type: 'String', desc: 'Twitter author user handle', nulls: '0%' },
  { field: 'retweet_count', type: 'Int32', desc: 'Number of times tweet was amplified', nulls: '0%' },
  { field: 'text', type: 'String', desc: 'Raw text content of the tweet', nulls: '0%' },
  { field: 'tweet_created', type: 'Timestamp ISO', desc: 'Timestamp of publication (Feb 2015)', nulls: '0%' },
  { field: 'user_timezone', type: 'String', desc: 'Self-reported timezone location', nulls: '32.9%' },
];

export default function DatasetPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <span>Data Ingestion & Integrity</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Dataset Management & Diagnostics
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-xl">
            Ingest raw CSV files, validate relational schemas, and monitor downstream Parquet conversion states.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-nouveau-cream px-3 py-1.5 rounded-[12px] border border-nouveau-gold/40 text-xs font-mono text-nouveau-charcoal">
          <HardDrive className="w-4 h-4 text-nouveau-gold" />
          <span>Active Ingestion: Tweets.csv</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Indexed Records"
          badge="100% Validated"
          value="14,640"
          subtitle="Total rows in Kaggle source"
          icon={Database}
        />

        <MetricCard
          title="Schema Columns"
          badge="Relational DDL"
          value="15 Fields"
          subtitle="Typed attributes mapped"
          icon={FileSpreadsheet}
          variant="gold"
        />

        <MetricCard
          title="Monitored Carriers"
          badge="Domestic Scope"
          value="6 Airlines"
          subtitle="VA, UA, DL, WN, AA, US"
          icon={ShieldCheck}
          variant="positive"
        />

        <MetricCard
          title="Parquet Compression"
          badge="Snappy"
          value="78% Smaller"
          subtitle="4.2MB CSV to ~950KB Parquet"
          icon={Cpu}
          variant="default"
        />
      </div>

      {/* Upload Component */}
      <DatasetUploader />

      <WhiplashDivider label="RELATIONAL SCHEMA DEFINITION" />

      {/* Schema Table */}
      <div className="nouveau-card p-6">
        <div className="border-b border-nouveau-gold/20 pb-3 mb-4">
          <h3 className="font-display font-bold text-base text-nouveau-charcoal">
            Twitter US Airline Sentiment Schema Specification
          </h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Expected field types, nullability rates, and semantic definitions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-display">
            <thead>
              <tr className="border-b border-nouveau-gold/30 bg-nouveau-cream/40 text-nouveau-charcoal/60 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Missing / Nulls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nouveau-gold/15 font-mono">
              {DATASET_SCHEMA.map((row) => (
                <tr key={row.field} className="hover:bg-nouveau-cream/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-nouveau-teal">{row.field}</td>
                  <td className="py-2.5 px-3 text-nouveau-charcoal/70">{row.type}</td>
                  <td className="py-2.5 px-3 font-display text-nouveau-charcoal/90">{row.desc}</td>
                  <td className="py-2.5 px-3 text-right text-nouveau-charcoal/60">{row.nulls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
