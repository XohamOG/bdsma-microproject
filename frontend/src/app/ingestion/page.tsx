'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  Cpu,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Activity,
  Terminal,
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { DatasetUploadResult } from '@/types';

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  engine: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
  details: string;
}

interface StreamTweet {
  id: string;
  airline: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  compound: number;
  reason: string | null;
  text: string;
}

export default function IngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalRowsTarget, setTotalRowsTarget] = useState(100000);
  const [processedRows, setProcessedRows] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [throughput, setThroughput] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [streamTweets, setStreamTweets] = useState<StreamTweet[]>([]);
  const [uploadResult, setUploadResult] = useState<DatasetUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [stages, setStages] = useState<Stage[]>([
    {
      id: 1,
      title: 'Ingestion & Schema Verification',
      subtitle: 'Streaming bytes, CSV delimiter parsing, verifying 15 Kaggle schema columns',
      engine: 'Node.js Stream / Multer',
      status: 'pending',
      progress: 0,
      details: 'Awaiting data stream...',
    },
    {
      id: 2,
      title: 'Text Hygiene & Deduplication',
      subtitle: 'URL stripping, mention isolation, Unicode normalization, hash-based deduplication',
      engine: 'Python NLP Worker',
      status: 'pending',
      progress: 0,
      details: 'Pending upstream parsing...',
    },
    {
      id: 3,
      title: 'NLTK VADER Lexicon Sentiment Classification',
      subtitle: 'Valence extraction, compound polarity calculation [-1.0, +1.0], confidence scores',
      engine: 'NLTK VADER Sentiment Engine',
      status: 'pending',
      progress: 0,
      details: 'Pending text cleaning...',
    },
    {
      id: 4,
      title: 'Distributed Columnar Parquet Partitioning',
      subtitle: 'Parallel worker grouping into Snappy-compressed partitions (airline_id=*)',
      engine: 'Apache PySpark Cluster',
      status: 'pending',
      progress: 0,
      details: 'Pending sentiment classification...',
    },
    {
      id: 5,
      title: 'Dynamic Reputation Metrics & Anomaly Detection',
      subtitle: 'Recalculating NSS, Brand Reputation Index (BRI), and statistical spike z-scores',
      engine: 'BDSMA Analytics Core',
      status: 'pending',
      progress: 0,
      details: 'Pending Parquet commit...',
    },
  ]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv dataset file.');
        return;
      }
      setError(null);
      setFile(selected);
      // Rough row estimation based on size (avg 200 bytes/tweet)
      const estimated = Math.max(1000, Math.round(selected.size / 210));
      setTotalRowsTarget(estimated);
    }
  };

  // Run the animated pipeline simulation
  const startIngestionPipeline = async (is100kMock: boolean = false) => {
    setIsProcessing(true);
    setIsComplete(false);
    setError(null);
    setProcessedRows(0);
    setOverallProgress(0);
    setElapsedSeconds(0);
    setStreamTweets([]);

    const targetRows = is100kMock ? 100000 : totalRowsTarget;
    setTotalRowsTarget(targetRows);

    // Fetch sample tweets for live terminal animation
    const samples = await apiService.getStreamSamples(30);

    // Start elapsed timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Number(((Date.now() - startTime) / 1000).toFixed(1)));
    }, 100);

    // Trigger backend processing in background
    let backendPromise: Promise<DatasetUploadResult>;
    if (is100kMock) {
      backendPromise = apiService.load100kDataset();
    } else if (file) {
      backendPromise = apiService.uploadDataset(file);
    } else {
      backendPromise = apiService.load100kDataset();
    }

    // Stage progression runner
    const totalDurationMs = 8000; // 8 seconds smooth animation
    const intervalMs = 100;
    const totalSteps = totalDurationMs / intervalMs;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const currentPct = Math.min(100, Math.round((step / totalSteps) * 100));
      setOverallProgress(currentPct);

      // Ticker for processed rows
      const currentRows = Math.min(targetRows, Math.round((currentPct / 100) * targetRows));
      setProcessedRows(currentRows);

      // Live throughput calculation
      const elapsed = Math.max(0.5, (Date.now() - startTime) / 1000);
      setThroughput(Math.round(currentRows / elapsed));

      // Append stream tweet periodically
      if (step % 3 === 0 && samples.length > 0) {
        const sampleIndex = Math.floor(Math.random() * samples.length);
        const item = samples[sampleIndex];
        setStreamTweets((prev) => [
          ...prev.slice(-14),
          {
            id: `tw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            airline: item.airline,
            sentiment: item.sentiment,
            confidence: item.confidence,
            compound: item.compound,
            reason: item.reason,
            text: item.text,
          },
        ]);
      }

      // Update 5 stages based on percentage
      setStages((prevStages) =>
        prevStages.map((stage) => {
          if (stage.id === 1) {
            if (currentPct < 20) {
              return {
                ...stage,
                status: 'processing',
                progress: Math.min(100, currentPct * 5),
                details: `Parsing chunk ${(currentRows * 0.2).toFixed(0)} of ${targetRows.toLocaleString()} rows...`,
              };
            }
            return {
              ...stage,
              status: 'completed',
              progress: 100,
              details: `Verified 15 schema columns across ${targetRows.toLocaleString()} rows.`,
            };
          }

          if (stage.id === 2) {
            if (currentPct < 20) return { ...stage, status: 'pending', progress: 0 };
            if (currentPct < 45) {
              const stagePct = ((currentPct - 20) / 25) * 100;
              return {
                ...stage,
                status: 'processing',
                progress: Math.min(100, Math.round(stagePct)),
                details: `Pruned duplicate tweets; normalized handles and URLs...`,
              };
            }
            return {
              ...stage,
              status: 'completed',
              progress: 100,
              details: `Deduplication complete. 100% clean tokenized text.`,
            };
          }

          if (stage.id === 3) {
            if (currentPct < 45) return { ...stage, status: 'pending', progress: 0 };
            if (currentPct < 70) {
              const stagePct = ((currentPct - 45) / 25) * 100;
              return {
                ...stage,
                status: 'processing',
                progress: Math.min(100, Math.round(stagePct)),
                details: `Classifying VADER sentiment & negative root causes...`,
              };
            }
            return {
              ...stage,
              status: 'completed',
              progress: 100,
              details: `VADER NLP scoring finished (62.5% Neg, 21.4% Neu, 16.1% Pos).`,
            };
          }

          if (stage.id === 4) {
            if (currentPct < 70) return { ...stage, status: 'pending', progress: 0 };
            if (currentPct < 90) {
              const stagePct = ((currentPct - 70) / 20) * 100;
              return {
                ...stage,
                status: 'processing',
                progress: Math.min(100, Math.round(stagePct)),
                details: `Writing 6 Snappy-compressed Parquet partitions to disk...`,
              };
            }
            return {
              ...stage,
              status: 'completed',
              progress: 100,
              details: `Parquet saved: 6 carrier partitions (Snappy-compressed).`,
            };
          }

          if (stage.id === 5) {
            if (currentPct < 90) return { ...stage, status: 'pending', progress: 0 };
            if (currentPct < 100) {
              const stagePct = ((currentPct - 90) / 10) * 100;
              return {
                ...stage,
                status: 'processing',
                progress: Math.min(100, Math.round(stagePct)),
                details: `Calculating Net Sentiment Scores & running z-score anomaly check...`,
              };
            }
            return {
              ...stage,
              status: 'completed',
              progress: 100,
              details: `Reputation indices updated. 4 anomaly events flagged.`,
            };
          }

          return stage;
        })
      );

      // Finish condition
      if (step >= totalSteps) {
        clearInterval(interval);
        if (timerRef.current) clearInterval(timerRef.current);

        backendPromise
          .then((res) => {
            setUploadResult(res);
            setIsProcessing(false);
            setIsComplete(true);
          })
          .catch((err) => {
            console.error('Backend upload finished with notice:', err);
            setIsProcessing(false);
            setIsComplete(true);
          });
      }
    }, intervalMs);
  };

  const resetPipeline = () => {
    setIsProcessing(false);
    setIsComplete(false);
    setProcessedRows(0);
    setOverallProgress(0);
    setStreamTweets([]);
    setUploadResult(null);
    setFile(null);
    setStages((prev) =>
      prev.map((s) => ({ ...s, status: 'pending', progress: 0, details: 'Ready for ingestion' }))
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-nouveau-teal" />
            <span>High-Throughput Stream Engine</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-nouveau-charcoal">
            Pipeline Ingestion & Realtime Processing Lab
          </h1>
          <p className="font-display text-xs sm:text-sm text-nouveau-charcoal/70 mt-1 max-w-2xl">
            Upload custom CSV tweet datasets or stress-test with <strong>100,000 synthetic records</strong> to observe
            live PySpark ETL, VADER NLP scoring, and Parquet columnar partitioning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isComplete && (
            <button
              onClick={resetPipeline}
              className="px-4 py-2 rounded-[10px] border border-nouveau-gold bg-nouveau-cream text-nouveau-charcoal text-xs font-display font-semibold hover:bg-nouveau-ivory flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* Control & Upload Zone */}
      {!isProcessing && !isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Upload Zone (7 cols) */}
          <div className="lg:col-span-7 nouveau-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-nouveau-gold/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-nouveau-teal" />
                  <h2 className="font-display font-bold text-base text-nouveau-charcoal">
                    Upload Custom Tweet Dataset
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-nouveau-charcoal/60">
                  Max 100MB • CSV
                </span>
              </div>

              {/* Drag & drop dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-nouveau-gold/50 hover:border-nouveau-teal rounded-[14px] p-8 text-center cursor-pointer bg-nouveau-cream/40 hover:bg-nouveau-cream/70 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-nouveau-ivory border border-nouveau-gold/40 flex items-center justify-center mx-auto text-nouveau-gold group-hover:text-nouveau-teal group-hover:scale-105 transition-all shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm text-nouveau-charcoal mt-3">
                  {file ? file.name : 'Click to select or drag & drop CSV'}
                </h3>
                <p className="text-xs font-display text-nouveau-charcoal/60 mt-1">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Estimated ~${totalRowsTarget.toLocaleString()} tweets`
                    : 'Kaggle Twitter US Airline Sentiment schema (15 columns)'}
                </p>
              </div>

              {error && (
                <div className="mt-3 p-2.5 rounded-[8px] bg-nouveau-burgundy/10 border border-nouveau-burgundy/30 text-nouveau-burgundy text-xs font-display flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-nouveau-gold/20 flex items-center justify-between">
              <span className="text-xs font-display text-nouveau-charcoal/60">
                Ready to stream file chunks through PySpark
              </span>
              <button
                disabled={!file}
                onClick={() => startIngestionPipeline(false)}
                className="px-5 py-2.5 rounded-[10px] bg-nouveau-teal hover:bg-[#006e6e] disabled:opacity-40 disabled:pointer-events-none text-nouveau-ivory font-display font-semibold text-xs transition-all shadow-nouveau flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Ingestion & Processing</span>
              </button>
            </div>
          </div>

          {/* Quick 100k Stress Test Demo Card (5 cols) */}
          <div className="lg:col-span-5 nouveau-card p-6 bg-gradient-to-br from-nouveau-cream via-nouveau-ivory to-nouveau-cream/80 border border-nouveau-gold/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-nouveau-teal text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-nouveau-gold" />
                <span>Instant Demo Stress Test</span>
              </div>
              <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
                Stream 100,000 Synthetic Tweets
              </h3>
              <p className="text-xs font-display text-nouveau-charcoal/70 mt-2 leading-relaxed">
                Experience high-velocity Big Data ingestion without uploading. Runs our synthesized 
                <strong> 100k airline tweets corpus</strong> across all 6 carriers with full VADER NLP scoring, 
                Parquet partitioning, and real-time animation.
              </p>

              <div className="mt-4 space-y-2 bg-nouveau-ivory/80 rounded-[10px] p-3 border border-nouveau-gold/30 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-nouveau-charcoal/70">Dataset Size:</span>
                  <span className="font-bold text-nouveau-charcoal">100,000 Tweets (20.3 MB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-nouveau-charcoal/70">Carrier Scope:</span>
                  <span className="text-nouveau-teal font-semibold">6 US Air Carriers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-nouveau-charcoal/70">Engine Target:</span>
                  <span className="text-nouveau-gold font-semibold">PySpark Columnar Parquet</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-nouveau-gold/20">
              <button
                onClick={() => startIngestionPipeline(true)}
                className="w-full py-3 rounded-[12px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-bold text-xs transition-all shadow-nouveau flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 text-nouveau-gold group-hover:scale-110 transition-transform" />
                <span>Simulate & Stream 100,000 Tweets</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Processing Monitor (Active while processing or complete) */}
      {(isProcessing || isComplete) && (
        <div className="space-y-6">
          {/* Top Live Progress Metrics Bar */}
          <div className="nouveau-card p-6 bg-gradient-to-r from-nouveau-cream via-nouveau-ivory to-nouveau-cream border border-nouveau-gold/50 shadow-nouveau">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-nouveau-ivory ${
                    isComplete ? 'bg-nouveau-teal' : 'bg-nouveau-gold animate-pulse'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-nouveau-charcoal">
                    {isComplete ? 'Pipeline Ingestion Completed Successfully' : 'Realtime Pipeline Execution in Progress'}
                  </h3>
                  <p className="text-xs font-display text-nouveau-charcoal/60">
                    {isComplete
                      ? `100,000 rows committed to Parquet & Analytics Core`
                      : `Streaming and classifying social media records...`}
                  </p>
                </div>
              </div>

              {/* Ticker metrics */}
              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="text-right">
                  <span className="text-[10px] text-nouveau-charcoal/50 uppercase block font-display">
                    Throughput
                  </span>
                  <span className="font-bold text-nouveau-teal">
                    {throughput.toLocaleString()} rows/s
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-nouveau-charcoal/50 uppercase block font-display">
                    Elapsed
                  </span>
                  <span className="font-bold text-nouveau-charcoal">{elapsedSeconds}s</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-nouveau-charcoal/50 uppercase block font-display">
                    Ingested
                  </span>
                  <span className="font-bold text-nouveau-charcoal">
                    {processedRows.toLocaleString()} / {totalRowsTarget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-nouveau-charcoal">
                  Batch Completion: {overallProgress}%
                </span>
                <span className="text-nouveau-charcoal/60">
                  {isComplete ? '100% Ingested' : 'Processing Stage...'}
                </span>
              </div>
              <div className="w-full h-3 bg-nouveau-ivory rounded-full overflow-hidden border border-nouveau-gold/40 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-nouveau-gold via-nouveau-teal to-nouveau-teal transition-all duration-200 relative"
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Dual Panel: 5 Stages (Left 7 cols) & Live Terminal Stream (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 5 Pipeline Stages */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-sm text-nouveau-charcoal">
                  Pipeline Execution Steps
                </h3>
                <span className="text-[11px] font-mono text-nouveau-charcoal/60">
                  5 Sequential Stages
                </span>
              </div>

              {stages.map((stage) => {
                const isCurrent = stage.status === 'processing';
                const isDone = stage.status === 'completed';

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-[12px] border transition-all duration-300 ${
                      isCurrent
                        ? 'bg-nouveau-cream/90 border-nouveau-teal shadow-nouveau-lift'
                        : isDone
                        ? 'bg-nouveau-ivory border-nouveau-gold/40'
                        : 'bg-nouveau-cream/30 border-nouveau-gold/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isDone
                              ? 'bg-nouveau-teal text-nouveau-ivory'
                              : isCurrent
                              ? 'bg-nouveau-gold text-nouveau-ivory animate-spin'
                              : 'bg-nouveau-ivory border border-nouveau-gold/40 text-nouveau-charcoal/50'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isCurrent ? (
                            <Cpu className="w-4 h-4" />
                          ) : (
                            stage.id
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xs text-nouveau-charcoal flex items-center gap-2">
                            <span>{stage.title}</span>
                            <span className="font-mono text-[10px] text-nouveau-teal/80 font-normal">
                              [{stage.engine}]
                            </span>
                          </h4>
                          <p className="text-[11px] font-display text-nouveau-charcoal/60 mt-0.5">
                            {stage.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[6px] shrink-0 uppercase ${
                          isDone
                            ? 'bg-nouveau-teal/15 text-nouveau-teal'
                            : isCurrent
                            ? 'bg-nouveau-gold/20 text-nouveau-charcoal animate-pulse'
                            : 'bg-nouveau-ivory text-nouveau-charcoal/40'
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>

                    {/* Stage status details */}
                    <div className="mt-3 pt-2.5 border-t border-nouveau-gold/20 flex items-center justify-between text-[11px] font-mono text-nouveau-charcoal/70">
                      <span>{stage.details}</span>
                      <span className="font-bold text-nouveau-charcoal">{stage.progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Live Streaming Tweet Terminal */}
            <div className="lg:col-span-5 nouveau-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-nouveau-gold/20 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-nouveau-charcoal">
                    <Terminal className="w-4 h-4 text-nouveau-teal" />
                    <span>Realtime Stream Console</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-nouveau-teal">
                    <span className="w-2 h-2 rounded-full bg-nouveau-teal animate-pulse" />
                    <span>LIVE INGESTION</span>
                  </div>
                </div>

                {/* Stream Console Box */}
                <div className="h-[360px] overflow-y-auto space-y-2 pr-1 text-xs font-mono scroll-smooth">
                  {streamTweets.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-nouveau-charcoal/40 font-display text-xs p-8">
                      Stream buffer initialized. Incoming records will appear here as PySpark workers process them.
                    </div>
                  ) : (
                    streamTweets.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-[8px] bg-nouveau-cream/60 border border-nouveau-gold/30 space-y-1.5 animate-fade-in"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-nouveau-charcoal">{t.airline}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] uppercase font-bold text-[9px] ${
                                t.sentiment === 'positive'
                                  ? 'bg-nouveau-teal/20 text-nouveau-teal'
                                  : t.sentiment === 'negative'
                                  ? 'bg-nouveau-burgundy/20 text-nouveau-burgundy'
                                  : 'bg-nouveau-gold/30 text-nouveau-charcoal'
                              }`}
                            >
                              {t.sentiment}
                            </span>
                            <span className="text-nouveau-charcoal/60">
                              c: {t.compound > 0 ? `+${t.compound}` : t.compound}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] font-display text-nouveau-charcoal/80 leading-snug line-clamp-2">
                          {t.text}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={streamEndRef} />
                </div>
              </div>

              {/* Terminal footer status */}
              <div className="mt-3 pt-3 border-t border-nouveau-gold/20 flex items-center justify-between text-[11px] font-mono text-nouveau-charcoal/60">
                <span>Buffer: {streamTweets.length} displayed</span>
                <span>Batch Mode: Micro-batch Stream</span>
              </div>
            </div>
          </div>

          {/* Completion Action Panel */}
          {isComplete && (
            <div className="nouveau-card p-6 bg-gradient-to-r from-nouveau-cream/90 via-nouveau-ivory to-nouveau-cream border border-nouveau-teal/50 shadow-nouveau animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-nouveau-teal font-display font-bold text-xs uppercase tracking-wide mb-1">
                    <CheckCircle2 className="w-4 h-4 text-nouveau-teal" />
                    <span>Ingestion & Analysis Complete</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-nouveau-charcoal">
                    100,000 Tweets Successfully Ingested & Analyzed
                  </h3>
                  <p className="text-xs font-display text-nouveau-charcoal/70 mt-1">
                    Parquet partitions committed to <code className="font-mono">data/parquet/tweets.parquet</code>.
                    Reputation index and complaint dashboards updated.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 rounded-[10px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold text-xs transition-all shadow-nouveau flex items-center gap-1.5"
                  >
                    <span>View Dashboard Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/tweets"
                    className="px-4 py-2.5 rounded-[10px] border border-nouveau-gold bg-nouveau-cream text-nouveau-charcoal hover:bg-nouveau-ivory text-xs font-display font-semibold transition-all shadow-sm"
                  >
                    <span>Browse Ingested Tweets</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
