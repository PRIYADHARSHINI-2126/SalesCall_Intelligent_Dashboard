import React, { useState, useEffect } from 'react';
import { ImportBatch, ImportPreviewResult, ImportRowClassification } from '../types.js';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  History,
  FileCode,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ImportCenterViewProps {
  onImportSuccess: () => void;
}

export const ImportCenterView: React.FC<ImportCenterViewProps> = ({ onImportSuccess }) => {
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('sample_conversations.csv');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ImportBatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = () => {
    fetch('/api/import/history')
      .then((res) => res.json())
      .then((data) => setBatches(data || []))
      .catch((err) => console.error('Error fetching import history:', err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const isJson = file.name.endsWith('.json');
    setFormat(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      triggerPreview(text, file.name, isJson ? 'json' : 'csv');
    };
    reader.readAsText(file);
  };

  const loadSampleFile = async (sampleFilename: string, fileFormat: 'csv' | 'json') => {
    setError(null);
    setApplyResult(null);
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/sample-data/${sampleFilename}`);
      if (!res.ok) throw new Error(`Could not load sample file ${sampleFilename}`);
      const text = await res.text();
      setContent(text);
      setFilename(sampleFilename);
      setFormat(fileFormat);
      await triggerPreview(text, sampleFilename, fileFormat);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample dataset');
    } finally {
      setLoadingPreview(false);
    }
  };

  const triggerPreview = async (text: string, fname: string, fmt: 'csv' | 'json') => {
    setError(null);
    setApplyResult(null);
    setLoadingPreview(true);
    try {
      const res = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, filename: fname, format: fmt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate import preview');
      setPreview(data);
    } catch (err: any) {
      setError(err.message);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch('/api/import/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview,
          userEmail: 'priyadharshinipnk987@gmail.com',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply import transaction.');

      setApplyResult(data.batch);
      setPreview(null);
      setContent('');
      fetchBatches();
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to execute import.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Overview & Demo Triggers Banner */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Data Ingestion & Duplicate Protection Engine
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Accepts CSV and JSON files from dialers or CRM exports. Previews row classifications, prevents duplicate
            multiplication, updates existing records in place with field diffing, and executes in atomic SQLite transactions.
          </p>
        </div>

        {/* Quick Demo Pre-load Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Demo Workflows:
          </span>
          <button
            onClick={() => loadSampleFile('sample_conversations.csv', 'csv')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Baseline Dataset (20 Records)</span>
          </button>
          <button
            onClick={() => loadSampleFile('sample_conversations.csv', 'csv')}
            title="Importing the exact same file tests idempotent deduplication"
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Duplicate Re-import (Verify Zero Multiplication)</span>
          </button>
          <button
            onClick={() => loadSampleFile('sample_updates.csv', 'csv')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Record Updates & Diffs (Apex Financial credit memo)</span>
          </button>
          <button
            onClick={() => loadSampleFile('sample_conversations.json', 'json')}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>4. JSON Format Ingestion</span>
          </button>
        </div>
      </div>

      {/* Upload & Raw Payload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-5 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Upload Telephony File
            </span>
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-700">Choose CSV or JSON file</span>
              <span className="text-[11px] text-slate-400 mt-1">or drag and drop here</span>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div>Supported: Standard telephony exports with columns:</div>
            <div className="font-mono text-slate-600 text-[10px]">
              source_id, customer_name, rep_name, type, call_datetime, duration_seconds, summary, outcome
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-5 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                Raw Payload Inspection: {filename}
              </span>
              <span className="font-mono text-slate-500 uppercase">{format} Format</span>
            </div>
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw CSV or JSON text here, or select a demo workflow above..."
              className="w-full p-3 font-mono text-[11px] border border-slate-200 rounded-md bg-slate-50 text-slate-800 leading-normal"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              {content ? `${content.split('\n').length} lines loaded` : 'No payload loaded'}
            </span>
            <button
              onClick={() => triggerPreview(content, filename, format)}
              disabled={!content.trim() || loadingPreview}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-40 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin' : ''}`} />
              <span>{loadingPreview ? 'Analyzing Rows...' : 'Analyze & Preview Import'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Import Engine Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Transaction Applied Success Report */}
      {applyResult && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Import Batch Successfully Applied!</span>
            </div>
            <span className="font-mono font-medium">{applyResult.id}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-emerald-200/80 font-mono text-xs">
            <div>
              <span className="text-emerald-700 block text-[11px]">Total Rows</span>
              <span className="font-bold text-slate-900 text-sm">{applyResult.total_rows}</span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">New Records Inserted</span>
              <span className="font-bold text-emerald-700 text-sm">{applyResult.new_records}</span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">Exact Duplicates Skipped</span>
              <span className="font-bold text-slate-700 text-sm">{applyResult.exact_duplicates}</span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">Existing Records Updated</span>
              <span className="font-bold text-blue-700 text-sm">{applyResult.updated_records}</span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">Invalid Rows Rejected</span>
              <span className="font-bold text-red-600 text-sm">{applyResult.invalid_records}</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-800 pt-1">
            Data committed in an atomic SQLite transaction. Check the Conversations tab or Audit log to review changes.
          </p>
        </div>
      )}

      {/* Two-Phase Classification Preview */}
      {preview && (
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Pre-Import Classification Summary: {preview.filename}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review row classification before executing the atomic database transaction.
              </p>
            </div>
            <button
              onClick={handleApply}
              disabled={applying || (preview.newCount === 0 && preview.updateCount === 0)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-40 shadow-xs shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>
                {applying
                  ? 'Executing Transaction...'
                  : preview.exactDuplicateCount === preview.totalRows
                  ? 'Confirm Re-Import (0 Changes)'
                  : `Apply Import (${preview.newCount} New, ${preview.updateCount} Updates)`}
              </span>
            </button>
          </div>

          {/* Classification Stats Badges */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono tabular-nums">
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block font-sans">Total Parsed</span>
              <span className="text-lg font-bold text-slate-900">{preview.totalRows}</span>
            </div>
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-700 block font-sans font-medium">New Records</span>
              <span className="text-lg font-bold text-emerald-800">{preview.newCount}</span>
            </div>
            <div className="p-3 rounded-md bg-slate-100 border border-slate-200">
              <span className="text-[11px] text-slate-600 block font-sans font-medium">Exact Duplicates</span>
              <span className="text-lg font-bold text-slate-800">{preview.exactDuplicateCount}</span>
            </div>
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-700 block font-sans font-medium">Updates to Existing</span>
              <span className="text-lg font-bold text-blue-800">{preview.updateCount}</span>
            </div>
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <span className="text-[11px] text-red-700 block font-sans font-medium">Invalid Rows</span>
              <span className="text-lg font-bold text-red-700">{preview.invalidCount}</span>
            </div>
          </div>

          {/* Classification Detail Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Row</th>
                  <th className="py-2 px-3">Source ID</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Sales Rep</th>
                  <th className="py-2 px-3">Status Classification</th>
                  <th className="py-2 px-3">Diff / Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {preview.classifications.slice(0, 25).map((row) => (
                  <tr key={row.rowIndex} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-400">#{row.rowIndex}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{row.source_id}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{row.customer_name}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{row.rep_name}</td>
                    <td className="py-2 px-3 font-sans uppercase text-[10px] font-semibold">
                      {row.status === 'new' && (
                        <span className="text-emerald-700">New Record</span>
                      )}
                      {row.status === 'exact_duplicate' && (
                        <span className="text-slate-500">Exact Duplicate (Skip)</span>
                      )}
                      {row.status === 'update' && (
                        <span className="text-blue-700">Modified ({row.changes?.length} fields)</span>
                      )}
                      {row.status === 'potential_duplicate' && (
                        <span className="text-amber-700">Potential Duplicate</span>
                      )}
                      {row.status === 'invalid' && (
                        <span className="text-red-700">Invalid Schema</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-600">
                      {row.status === 'update' && row.changes && (
                        <div className="space-y-0.5 text-[11px]">
                          {row.changes.map((chg, idx) => (
                            <div key={idx}>
                              <span className="font-mono text-slate-700 font-medium">{chg.field}:</span>{' '}
                              <span className="line-through text-slate-400 font-mono">{String(chg.oldValue)}</span>{' '}
                              <span className="font-semibold text-slate-900 font-mono">{String(chg.newValue)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {row.status === 'exact_duplicate' && (
                        <span className="text-slate-400 text-[11px]">Identical to database record {row.matchingId}</span>
                      )}
                      {row.status === 'new' && (
                        <span className="text-slate-500 text-[11px]">Will create new internal ID with version 1</span>
                      )}
                      {row.status === 'invalid' && row.validationErrors && (
                        <span className="text-red-600 text-[11px]">{row.validationErrors.join(', ')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Batch Ingestion Audit Log */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            <History className="w-4 h-4 text-slate-500" />
            <span>Ingestion Batch History</span>
          </div>
          <span className="text-xs font-mono text-slate-500">{batches.length} Batches Executed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Filename & Format</th>
                <th className="py-2.5 px-3 text-right">Total Rows</th>
                <th className="py-2.5 px-3 text-right">New</th>
                <th className="py-2.5 px-3 text-right">Updated</th>
                <th className="py-2.5 px-3 text-right">Duplicates</th>
                <th className="py-2.5 px-3 text-right">Invalid</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{b.id}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">
                    {b.filename} <span className="uppercase text-[10px] text-slate-400">({b.file_format})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-900">{b.total_rows}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">{b.new_records}</td>
                  <td className="py-2.5 px-3 text-right text-blue-700 font-medium">{b.updated_records}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{b.exact_duplicates}</td>
                  <td className="py-2.5 px-3 text-right text-red-600">{b.invalid_records}</td>
                  <td className="py-2.5 px-3 font-sans capitalize text-slate-700">{b.status}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
