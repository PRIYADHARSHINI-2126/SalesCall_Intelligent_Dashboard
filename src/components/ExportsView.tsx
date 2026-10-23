import React, { useState, useEffect } from 'react';
import { ExportManifest } from '../types.js';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Presentation,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export const ExportsView: React.FC = () => {
  const [manifest, setManifest] = useState<ExportManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchManifest = () => {
    setLoading(true);
    fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: {} }),
    })
      .then((res) => res.json())
      .then((data) => setManifest(data.manifest || null))
      .catch((err) => console.error('Error fetching manifest:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchManifest();
  }, []);

  const handleGenerateFresh = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: {} }),
      });
      const data = await res.json();
      setManifest(data.manifest || null);
    } catch (err) {
      console.error('Error generating exports:', err);
    } finally {
      setGenerating(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Overview Banner */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Standardized Data Exports & Manifest Center</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Download live-generated tabular and structured exports. Every package is accompanied by a cryptographic
              SHA-256 checksum manifest to guarantee row integrity and detect tampering.
            </p>
          </div>

          <button
            onClick={handleGenerateFresh}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Recomputing Hashes...' : 'Regenerate All Exports'}</span>
          </button>
        </div>

        {manifest && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs font-mono tabular-nums">
            <div>
              <span className="text-[11px] text-slate-500 font-sans block">Export Package ID</span>
              <span className="font-semibold text-slate-900">{manifest.export_id}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-sans block">Generated Timestamp</span>
              <span className="text-slate-800">{new Date(manifest.generated_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-sans block">Total Bundled Datasets</span>
              <span className="font-semibold text-blue-600">{manifest.total_files} Verified Files</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-sans block">Hash Algorithm</span>
              <span className="text-slate-800 font-semibold">SHA-256 (256-bit)</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Download Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: conversations.csv */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase text-blue-600 font-semibold">CSV Format</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">conversations.csv</h3>
            <p className="text-xs text-slate-600 mt-1">
              Full tabular export of all conversations, metadata, outcomes, topics, and assigned routing decisions.
            </p>
          </div>
          <a
            href="/api/export/download/conversations.csv"
            download="conversations.csv"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download CSV</span>
          </a>
        </div>

        {/* Card 2: conversations.json */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase text-indigo-600 font-semibold">JSON Format</span>
              <FileCode className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">conversations.json</h3>
            <p className="text-xs text-slate-600 mt-1">
              Hierarchical JSON export with parsed evidence arrays, audit histories, and record version metadata.
            </p>
          </div>
          <a
            href="/api/export/download/conversations.json"
            download="conversations.json"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download JSON</span>
          </a>
        </div>

        {/* Card 3: attention_queue.csv */}
        <div className="p-4 bg-white rounded-lg border border-red-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-red-600 mb-1">
              <span className="font-mono uppercase font-semibold">Urgent Action Items</span>
              <FileSpreadsheet className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">attention_queue.csv</h3>
            <p className="text-xs text-slate-600 mt-1">
              Filtered queue containing only Critical/High priority escalations, overdue tasks, and ambiguous calls.
            </p>
          </div>
          <a
            href="/api/export/download/attention_queue.csv"
            download="attention_queue.csv"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-red-700" />
            <span>Download Attention Queue</span>
          </a>
        </div>

        {/* Card 4: routing_decisions.csv */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase text-slate-700 font-semibold">Decision Audit</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">routing_decisions.csv</h3>
            <p className="text-xs text-slate-600 mt-1">
              Classified category, priority, confidence score, plain-text rationale, and human override logs.
            </p>
          </div>
          <a
            href="/api/export/download/routing_decisions.csv"
            download="routing_decisions.csv"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Routing Decisions</span>
          </a>
        </div>

        {/* Card 5: import_summary.csv */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase text-slate-700 font-semibold">Ingestion Audit</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">import_summary.csv</h3>
            <p className="text-xs text-slate-600 mt-1">
              Historical ledger of batch imports, row counts, new records inserted, and duplicate prevention rates.
            </p>
          </div>
          <a
            href="/api/export/download/import_summary.csv"
            download="import_summary.csv"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Import Summary</span>
          </a>
        </div>

        {/* Card 6: correction_audit.csv */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-mono uppercase text-slate-700 font-semibold">Field Changes</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">correction_audit.csv</h3>
            <p className="text-xs text-slate-600 mt-1">
              Full change log of previous vs new field values, timestamps, operator emails, and mandatory reasons.
            </p>
          </div>
          <a
            href="/api/export/download/correction_audit.csv"
            download="correction_audit.csv"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Audit Log</span>
          </a>
        </div>
      </div>

      {/* PowerPoint Deck Callout Card */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Presentation className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900">
              Five-Slide PowerPoint Presentation Deck
            </h3>
            <p className="text-xs text-blue-800 mt-0.5">
              Editable PPTX presentation generated directly from the current database state with 3 evidence-backed findings and 1 rejected alternative.
            </p>
          </div>
        </div>
        <a
          href="/api/presentation"
          download="sales-review-findings.pptx"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download sales-review-findings.pptx</span>
        </a>
      </div>

      {/* Real-time manifest.json Cryptographic Verification Inspector */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Checksum Verification (manifest.json)</span>
          </div>
          <a
            href="/api/export/download/manifest.json"
            download="manifest.json"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Raw manifest.json</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {manifest && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Filename</th>
                  <th className="py-2.5 px-3 text-right">Row Count</th>
                  <th className="py-2.5 px-3 text-right">Byte Size</th>
                  <th className="py-2.5 px-3">SHA-256 Checksum Hash</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {manifest.files.map((file) => (
                  <tr key={file.filename} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">
                      {file.filename}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 tabular-nums font-semibold">
                      {file.row_count} rows
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                      {(file.byte_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      <span className="font-mono text-[10px] select-all">{file.sha256_hash}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => copyHash(file.sha256_hash)}
                        title="Copy SHA-256 hash"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-sans text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded"
                      >
                        {copiedHash === file.sha256_hash ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
