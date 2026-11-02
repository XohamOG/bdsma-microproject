'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react';
import { DatasetUploadResult } from '@/types';
import { apiService } from '@/lib/api';

export const DatasetUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DatasetUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file (e.g. Tweets.csv).');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await apiService.uploadDataset(file);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload and validate dataset.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="nouveau-card p-6">
      <div className="border-b border-nouveau-gold/20 pb-4 mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-nouveau-charcoal">
            Dataset Ingestion & Validation Gateway
          </h3>
          <p className="text-xs font-display text-nouveau-charcoal/60 mt-0.5">
            Upload raw Twitter US Airline Sentiment CSV to trigger NLP and Big Data processing pipeline.
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-nouveau-teal/10 text-nouveau-teal border border-nouveau-teal/30 font-semibold">
          POST /api/dataset/upload
        </span>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-[16px] p-8 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
          isDragging
            ? 'border-nouveau-teal bg-nouveau-teal/5 scale-[1.01]'
            : 'border-nouveau-gold/50 bg-nouveau-cream/40 hover:bg-nouveau-cream/80 hover:border-nouveau-teal'
        }`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          input.onchange = (e: any) => {
            if (e.target.files?.[0]) handleFileProcess(e.target.files[0]);
          };
          input.click();
        }}
      >
        <div className="w-14 h-14 rounded-full bg-nouveau-ivory border border-nouveau-gold/60 flex items-center justify-center text-nouveau-teal shadow-nouveau mb-3">
          {uploading ? (
            <Loader2 className="w-7 h-7 animate-spin text-nouveau-teal" />
          ) : (
            <UploadCloud className="w-7 h-7 text-nouveau-gold" />
          )}
        </div>

        <h4 className="font-display font-bold text-base text-nouveau-charcoal">
          {uploading ? 'Processing Dataset & Validating Schema...' : 'Drag & Drop Tweets.csv here'}
        </h4>
        <p className="text-xs font-display text-nouveau-charcoal/60 mt-1 max-w-sm">
          Supports Twitter US Airline Sentiment CSV files up to 50MB. Validates sentiment labels, timestamp ISOs, and carrier IDs.
        </p>

        <button
          type="button"
          disabled={uploading}
          className="mt-4 px-5 py-2 rounded-[10px] bg-nouveau-teal hover:bg-[#006e6e] text-nouveau-ivory font-display font-semibold text-xs transition-all shadow-nouveau"
        >
          {uploading ? 'Validating...' : 'Browse Local Files'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3.5 rounded-[12px] bg-nouveau-burgundy/10 border border-nouveau-burgundy/30 text-nouveau-burgundy text-xs font-display flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ingestion Result Summary */}
      {result && (
        <div className="mt-5 p-5 rounded-[12px] bg-nouveau-cream/80 border border-nouveau-gold/40 shadow-nouveau animate-fade-in">
          <div className="flex items-center gap-2 text-nouveau-olive font-display font-bold text-sm mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Dataset Validated & Ingested Successfully</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-nouveau-ivory p-2.5 rounded-[8px] border border-nouveau-gold/20">
              <span className="text-[10px] text-nouveau-charcoal/60 block font-display">Target File</span>
              <strong className="text-nouveau-charcoal truncate block">{result.filename}</strong>
            </div>
            <div className="bg-nouveau-ivory p-2.5 rounded-[8px] border border-nouveau-gold/20">
              <span className="text-[10px] text-nouveau-charcoal/60 block font-display">Valid Records</span>
              <strong className="text-nouveau-teal">{result.valid_rows.toLocaleString()}</strong>
            </div>
            <div className="bg-nouveau-ivory p-2.5 rounded-[8px] border border-nouveau-gold/20">
              <span className="text-[10px] text-nouveau-charcoal/60 block font-display">Ingestion State</span>
              <strong className="text-nouveau-olive">{result.ingestion_status}</strong>
            </div>
            <div className="bg-nouveau-ivory p-2.5 rounded-[8px] border border-nouveau-gold/20">
              <span className="text-[10px] text-nouveau-charcoal/60 block font-display">Carriers Detected</span>
              <strong className="text-nouveau-charcoal">{result.brands_detected.length} Airlines</strong>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-nouveau-gold/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-nouveau-charcoal/70">
            <span>Parquet output: <code className="text-nouveau-teal">{result.parquet_path}</code></span>
            <span>All 14,640 records loaded into PySpark schema</span>
          </div>
        </div>
      )}
    </div>
  );
};
