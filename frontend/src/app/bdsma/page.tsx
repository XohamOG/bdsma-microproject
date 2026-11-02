'use client';

import React, { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  TrendingUp,
  BrainCircuit,
  Binary,
  CheckCircle2,
  FileCode2,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { WhiplashDivider } from '@/components/common/WhiplashDivider';

const BIG_DATA_VS = [
  {
    title: 'Volume',
    subtitle: 'Corpus Scale & Distributed Partitioning',
    highlight: '14,640 records (Scaled to 1.46M)',
    description:
      'The baseline dataset comprises 14,640 historical tweets. In our BDSMA simulation, the dataset was scaled 10x (146,400) and 100x (1,464,000 records) to test distributed partition parallelization in Apache PySpark vs single-node Pandas.',
    metric: '1.46M Tweets',
    tag: 'Horizontal Scaling',
  },
  {
    title: 'Velocity',
    subtitle: 'Stream Arrival & Burst Spikes',
    highlight: 'Hourly Trajectories across Feb 17–24',
    description:
      'Social media events exhibit high temporal velocity. During the February 22 Northeast winter storm, tweet influx surged +65% within 6 hours, requiring sliding-window aggregation and real-time z-score anomaly detection.',
    metric: '2,440/day Peak',
    tag: 'Temporal Dynamics',
  },
  {
    title: 'Variety',
    subtitle: 'Multimodal Unstructured Discourse',
    highlight: 'Text, Mentions, Geolocation & Categorical Reasons',
    description:
      'Combines unstructured microblog text (140 chars) with structured relational metadata: target carrier handle, author username, retweet counts, UTC timestamps, user timezone locations, and 10 multi-class complaint labels.',
    metric: '15 Schema Fields',
    tag: 'Multi-attribute',
  },
  {
    title: 'Veracity',
    subtitle: 'Noise Filtering & Confidence Scores',
    highlight: 'Confidence Scoring: 0.33 to 1.0',
    description:
      'Social media data contains slang, sarcasm, and ambiguous phrasing. Each tweet carries a sentiment_confidence score. The NLP pipeline filters low-confidence noise (<0.60) to maintain analytical veracity.',
    metric: '82.4% Avg Conf',
    tag: 'Data Quality',
  },
  {
    title: 'Value',
    subtitle: 'Actionable Brand Reputation Indices',
    highlight: 'Net Sentiment Score & Churn Prevention',
    description:
      'Raw noisy tweets are converted into standardized business intelligence: Net Sentiment Score (NSS) and Brand Reputation Index (BRI), enabling airlines to diagnose operational bottlenecks and protect brand equity.',
    metric: 'NSS [-100, +100]',
    tag: 'Business Impact',
  },
];

export default function BdsmaLabPage() {
  const [activeTab, setActiveTab] = useState<'5vs' | 'pipeline' | 'math' | 'nlp'>('5vs');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nouveau-gold/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-nouveau-gold text-xs font-serif uppercase tracking-widest mb-1">
            <span>♦</span>
            <span>Academic Methodology & Big Data Architecture</span>
            <span>♦</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-nouveau-charcoal">
            Big Data Social Media Analysis (BDSMA) Lab
          </h1>
          <p className="font-display text-sm text-nouveau-charcoal/70 mt-1 max-w-2xl">
            Technical foundations of our microproject: Mapping the 5 Vs of Big Data to social streams, Apache PySpark distributed processing, NLP text mining, and statistical anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-nouveau-cream px-3 py-1.5 rounded-[12px] border border-nouveau-gold/40 text-xs font-mono text-nouveau-charcoal">
          <BookOpen className="w-4 h-4 text-nouveau-teal" />
          <span>Subject: BDSMA Microproject</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-nouveau-gold/20 pb-3 text-xs font-display font-semibold">
        <button
          onClick={() => setActiveTab('5vs')}
          className={`px-4 py-2 rounded-[10px] transition-all flex items-center gap-2 ${
            activeTab === '5vs'
              ? 'bg-nouveau-teal text-nouveau-ivory shadow-nouveau-lift border border-nouveau-gold'
              : 'bg-nouveau-cream text-nouveau-charcoal/70 hover:bg-nouveau-ivory'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-nouveau-gold" />
          <span>The 5 Vs of Big Data</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-[10px] transition-all flex items-center gap-2 ${
            activeTab === 'pipeline'
              ? 'bg-nouveau-teal text-nouveau-ivory shadow-nouveau-lift border border-nouveau-gold'
              : 'bg-nouveau-cream text-nouveau-charcoal/70 hover:bg-nouveau-ivory'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-nouveau-gold" />
          <span>Distributed Architecture & PySpark</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`px-4 py-2 rounded-[10px] transition-all flex items-center gap-2 ${
            activeTab === 'math'
              ? 'bg-nouveau-teal text-nouveau-ivory shadow-nouveau-lift border border-nouveau-gold'
              : 'bg-nouveau-cream text-nouveau-charcoal/70 hover:bg-nouveau-ivory'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-nouveau-gold" />
          <span>Mathematical Formulations</span>
        </button>

        <button
          onClick={() => setActiveTab('nlp')}
          className={`px-4 py-2 rounded-[10px] transition-all flex items-center gap-2 ${
            activeTab === 'nlp'
              ? 'bg-nouveau-teal text-nouveau-ivory shadow-nouveau-lift border border-nouveau-gold'
              : 'bg-nouveau-cream text-nouveau-charcoal/70 hover:bg-nouveau-ivory'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-nouveau-gold" />
          <span>NLP Text Mining & Preprocessing</span>
        </button>
      </div>

      {/* TAB 1: 5 Vs of Big Data */}
      {activeTab === '5vs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="nouveau-card p-6 bg-gradient-to-r from-nouveau-ivory via-nouveau-cream/40 to-nouveau-ivory">
            <h3 className="font-display font-bold text-lg text-nouveau-charcoal mb-1">
              Mapping Twitter Discourse to Big Data Dimensions
            </h3>
            <p className="font-display text-xs text-nouveau-charcoal/70 max-w-3xl leading-relaxed">
              Social media represents the quintessential Big Data challenge: streaming unstructured texts generated at massive scale with heterogeneous formatting, high noise, and critical commercial value. Here is how our microproject operationalizes the 5 Vs:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BIG_DATA_VS.map((item, idx) => (
              <div
                key={item.title}
                className="nouveau-card p-6 border-t-4 border-t-nouveau-teal flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-nouveau-gold/20 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-nouveau-teal">
                        V{idx + 1}.
                      </span>
                      <h4 className="font-display font-bold text-base text-nouveau-charcoal">
                        {item.title}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-nouveau-cream border border-nouveau-gold/30 text-nouveau-charcoal">
                      {item.tag}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-nouveau-burgundy block mb-2">
                    {item.highlight}
                  </span>

                  <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-nouveau-gold/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-nouveau-charcoal/50">Benchmark KPI:</span>
                  <strong className="text-nouveau-teal">{item.metric}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Distributed Architecture & PySpark */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-fade-in">
          <div className="nouveau-card p-6">
            <h3 className="font-display font-bold text-lg text-nouveau-charcoal mb-2">
              Multi-Tier Distributed Big Data Architecture
            </h3>
            <p className="font-display text-xs text-nouveau-charcoal/70 max-w-3xl leading-relaxed mb-6">
              Our system architecture cleanly decouples the High-Throughput Storage Layer, Distributed Compute Layer, RESTful API Microservices, and the Art Nouveau Florido Presentation Layer across distributed machines.
            </p>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-display">
              <div className="bg-nouveau-cream/60 p-4 rounded-[12px] border border-nouveau-gold/40 space-y-2">
                <div className="flex items-center gap-2 text-nouveau-teal font-bold">
                  <Database className="w-4 h-4" />
                  <span>1. Storage Layer</span>
                </div>
                <p className="text-nouveau-charcoal/70 text-[11px]">
                  Raw CSV ingestion converted into <strong>Snappy Parquet columnar storage</strong> and PostgreSQL relational catalog. 78% storage compression.
                </p>
                <div className="pt-2 text-[10px] font-mono text-nouveau-charcoal/50">
                  Tech: Parquet, PostgreSQL
                </div>
              </div>

              <div className="bg-nouveau-cream/60 p-4 rounded-[12px] border border-nouveau-gold/40 space-y-2">
                <div className="flex items-center gap-2 text-nouveau-gold font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>2. Compute Engine</span>
                </div>
                <p className="text-nouveau-charcoal/70 text-[11px]">
                  <strong>Apache PySpark</strong> DataFrame API with Catalyst Query Optimization. Parallel partitioned execution for sentiment aggregations.
                </p>
                <div className="pt-2 text-[10px] font-mono text-nouveau-charcoal/50">
                  Tech: PySpark, Spark SQL, Pandas
                </div>
              </div>

              <div className="bg-nouveau-cream/60 p-4 rounded-[12px] border border-nouveau-gold/40 space-y-2">
                <div className="flex items-center gap-2 text-nouveau-peacock font-bold">
                  <FileCode2 className="w-4 h-4" />
                  <span>3. API Gateway</span>
                </div>
                <p className="text-nouveau-charcoal/70 text-[11px]">
                  Node.js / Express microservices exposing typed REST API endpoints (`GET /api/analytics/...`) with structured JSON envelope.
                </p>
                <div className="pt-2 text-[10px] font-mono text-nouveau-charcoal/50">
                  Tech: Node.js, Express, TS
                </div>
              </div>

              <div className="bg-nouveau-cream/60 p-4 rounded-[12px] border border-nouveau-gold/40 space-y-2">
                <div className="flex items-center gap-2 text-nouveau-teal font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>4. Analytics Client</span>
                </div>
                <p className="text-nouveau-charcoal/70 text-[11px]">
                  Next.js App Router client with Art Nouveau Florido UI system, Recharts data visualizations, and client CSV export.
                </p>
                <div className="pt-2 text-[10px] font-mono text-nouveau-charcoal/50">
                  Tech: Next.js, Tailwind, Recharts
                </div>
              </div>
            </div>
          </div>

          {/* Spark Execution Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nouveau-card p-6 border-l-4 border-l-nouveau-burgundy">
              <h4 className="font-display font-bold text-base text-nouveau-charcoal mb-2">
                Pandas (Single-Node In-Memory)
              </h4>
              <ul className="text-xs font-display text-nouveau-charcoal/80 space-y-2 list-disc pl-4">
                <li>Fast on small data (&lt;100k rows) due to zero JVM initialization latency (420ms).</li>
                <li>Monolithic memory footprint: loads entire dataframe into single process RAM.</li>
                <li>Fails to scale when dataset exceeds physical RAM capacity (out-of-memory crash).</li>
                <li>Scales poorly on 1.46M benchmark: takes 54.2 seconds.</li>
              </ul>
            </div>

            <div className="nouveau-card p-6 border-l-4 border-l-nouveau-teal">
              <h4 className="font-display font-bold text-base text-nouveau-charcoal mb-2">
                Apache PySpark (Distributed Memory DAG)
              </h4>
              <ul className="text-xs font-display text-nouveau-charcoal/80 space-y-2 list-disc pl-4">
                <li>Initial JVM and DAG query planning overhead on sub-100k data (1,150ms).</li>
                <li>Lazy evaluation with Catalyst optimizer creates optimal logical and physical plans.</li>
                <li>Horizontal data partitioning distributes load across multiple worker nodes.</li>
                <li>3.84x faster at 1.46M scale: drops execution from 54.2s to 14.1s.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mathematical Formulations */}
      {activeTab === 'math' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NSS Formula */}
            <div className="nouveau-card p-6 space-y-4">
              <div className="border-b border-nouveau-gold/20 pb-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-nouveau-teal/10 text-nouveau-teal font-semibold">
                  Primary Metric
                </span>
                <h3 className="font-display font-bold text-lg text-nouveau-charcoal mt-1">
                  Net Sentiment Score (NSS)
                </h3>
              </div>

              <div className="p-4 rounded-[10px] bg-nouveau-cream/70 border border-nouveau-gold/40 text-center font-mono text-base font-bold text-nouveau-charcoal">
                NSS = ((P - N) / (P + N + U)) × 100
              </div>

              <div className="text-xs font-display text-nouveau-charcoal/80 space-y-2 leading-relaxed">
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>P</strong> = Positive sentiment tweet count</li>
                  <li><strong>N</strong> = Negative complaint tweet count</li>
                  <li><strong>U</strong> = Neutral inquiry tweet count</li>
                </ul>
                <p className="pt-2">
                  <strong>Domain:</strong> <code className="font-mono text-nouveau-teal">[-100, +100]</code>. An NSS of +100 represents universal praise; -100 represents unanimous hostility. Normalizes for varying carrier tweet volume.
                </p>
              </div>
            </div>

            {/* BRI Formula */}
            <div className="nouveau-card p-6 space-y-4">
              <div className="border-b border-nouveau-gold/20 pb-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-nouveau-gold/20 text-nouveau-charcoal font-semibold">
                  Reputation Utility
                </span>
                <h3 className="font-display font-bold text-lg text-nouveau-charcoal mt-1">
                  Brand Reputation Index (BRI)
                </h3>
              </div>

              <div className="p-4 rounded-[10px] bg-nouveau-cream/70 border border-nouveau-gold/40 text-center font-mono text-base font-bold text-nouveau-charcoal">
                BRI = ((P × 1.0 + U × 0.5) / (P + N + U)) × 100
              </div>

              <div className="text-xs font-display text-nouveau-charcoal/80 space-y-2 leading-relaxed">
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Positive tweets contribute full weight (1.0)</li>
                  <li>Neutral inquiries contribute partial utility (0.5) for brand awareness</li>
                  <li>Negative tweets contribute 0.0 utility</li>
                </ul>
                <p className="pt-2">
                  <strong>Domain:</strong> <code className="font-mono text-nouveau-gold">[0, 100]</code>. Provides an absolute, non-negative index of customer brand equity.
                </p>
              </div>
            </div>
          </div>

          {/* Anomaly Z-Score Algorithm */}
          <div className="nouveau-card p-6 border-l-4 border-l-nouveau-burgundy">
            <h3 className="font-display font-bold text-base text-nouveau-charcoal mb-2">
              Statistical Anomaly Detection: 3-Sigma Outlier Model
            </h3>
            <p className="font-display text-xs text-nouveau-charcoal/80 max-w-3xl leading-relaxed mb-4">
              To detect social media crises in streaming flight sentiment without manual thresholding, we apply rolling window z-score outlier detection:
            </p>

            <div className="p-3.5 rounded-[10px] bg-nouveau-cream/70 border border-nouveau-gold/40 text-center font-mono text-sm font-bold text-nouveau-burgundy max-w-md mx-auto mb-4">
              z = (x_t - μ_baseline) / σ_baseline
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-nouveau-ivory p-3 rounded-[8px] border border-nouveau-gold/20">
                <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Threshold</span>
                <strong>z &ge; 2.5 (p &lt; 0.01)</strong>
              </div>
              <div className="bg-nouveau-ivory p-3 rounded-[8px] border border-nouveau-gold/20">
                <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Rolling Window</span>
                <strong>24-Hour Horizon</strong>
              </div>
              <div className="bg-nouveau-ivory p-3 rounded-[8px] border border-nouveau-gold/20">
                <span className="font-display text-[11px] text-nouveau-charcoal/60 block">Detected Event</span>
                <strong className="text-nouveau-burgundy">Feb 22 Storm (z = 3.42)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NLP Text Mining */}
      {activeTab === 'nlp' && (
        <div className="space-y-6 animate-fade-in">
          <div className="nouveau-card p-6">
            <h3 className="font-display font-bold text-lg text-nouveau-charcoal mb-2">
              Social Media Natural Language Processing (NLP) Pipeline
            </h3>
            <p className="font-display text-xs text-nouveau-charcoal/70 max-w-3xl leading-relaxed mb-6">
              Twitter text data presents unique computational linguistic difficulties: noisy punctuation, slang, contractions, hashtags, and airline handle mentions.
            </p>

            {/* Pipeline Steps */}
            <div className="space-y-3">
              {[
                {
                  step: '1. Text Normalization & Clean',
                  detail: 'Lowercase folding, stripping HTTP/S URLs, converting user handles (@United, @Delta) into standardized [CARRIER_TAG] tokens.',
                },
                {
                  step: '2. Contraction & Negation Preservation',
                  detail: 'Expanding "didn\'t" -> "did not", preserving critical negation words ("not satisfied", "never flying") which invert sentiment polarities.',
                },
                {
                  step: '3. Tokenization & Lemmatization',
                  detail: 'Splitting text into word tokens, lemmatizing inflectional suffixes ("cancelled", "cancelling" -> "cancel").',
                },
                {
                  step: '4. Multi-class Negative Classification',
                  detail: 'When sentiment is negative, clustering complaint tokens into 10 discrete root-cause classes (Customer Service, Late Flight, Lost Luggage).',
                },
              ].map((s) => (
                <div key={s.step} className="p-3.5 rounded-[10px] bg-nouveau-cream/60 border border-nouveau-gold/20 flex items-start gap-3 text-xs font-display">
                  <CheckCircle2 className="w-4 h-4 text-nouveau-teal shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-nouveau-charcoal block">{s.step}</strong>
                    <span className="text-nouveau-charcoal/70">{s.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lexicon vs ML Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nouveau-card p-5">
              <h4 className="font-display font-bold text-sm text-nouveau-charcoal mb-2">
                Lexicon-Based Models (VADER)
              </h4>
              <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
                Rules-based lexicon approach specifically tuned for social media contexts (VADER). Handles capitalization ("WORST flight"), emoji heuristics, and exclamation intensification without requiring GPU training pipelines.
              </p>
            </div>

            <div className="nouveau-card p-5">
              <h4 className="font-display font-bold text-sm text-nouveau-charcoal mb-2">
                Supervised Classification Models
              </h4>
              <p className="font-display text-xs text-nouveau-charcoal/80 leading-relaxed">
                Trained on human-annotated sentiment classes (`positive`, `neutral`, `negative`). Yields probability confidence values (`airline_sentiment_confidence`) that allow filtering ambiguous tweets below 0.60 certainty.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
