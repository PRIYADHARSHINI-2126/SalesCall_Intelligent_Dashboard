import React, { useState } from 'react';
import {
  Sliders,
  Database,
  RefreshCw,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Code2,
} from 'lucide-react';

interface SettingsViewProps {
  onResetDemo: () => void;
  isResetting: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetDemo, isResetting }) => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'routing' | 'conflict'>('dictionary');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Reset database to the baseline 20-record sample dataset? Any manual modifications will be cleared.')) {
      onResetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Settings Header */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>System Settings, Architecture & Data Dictionary</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Authoritative specifications for database entities, precedence hierarchy rules, and conflict resolution policies.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Data...' : 'Reset Demo Dataset (20 Records)'}</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Demonstration dataset reset to clean baseline (20 conversations seeded).</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'dictionary'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Data Dictionary (Schema)
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'routing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Routing Precedence Rules
          </button>
          <button
            onClick={() => setActiveTab('conflict')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'conflict'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Conflict & Override Policy
          </button>
        </div>
      </div>

      {/* Tab 1: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Entity Schema: `conversations`
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Core persistent table in SQLite database</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Field Name</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Constraints</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">id</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">PRIMARY KEY</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Internal unique surrogate identifier</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">source_id</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL UNIQUE</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Natural key from telephony or CRM system</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">customer_name</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Company or account name</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">rep_name</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Sales representative handling account</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">type</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">CHECK ('call', 'meeting')</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Interaction channel</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">call_datetime</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">ISO 8601 UTC timestamp</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">duration_seconds</td>
                  <td className="py-2 px-3 text-blue-700">INTEGER</td>
                  <td className="py-2 px-3 text-slate-500">CHECK (&gt;= 0)</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Call length in seconds</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">outcome</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Recorded outcome code</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">routing_category</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Assigned workflow queue</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">attention_priority</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">NOT NULL</td>
                  <td className="py-2 px-3 font-sans text-slate-700">critical, high, medium, or low</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">routing_evidence</td>
                  <td className="py-2 px-3 text-blue-700">TEXT</td>
                  <td className="py-2 px-3 text-slate-500">JSON array</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Extracted citations and signal quotes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">is_manually_overridden</td>
                  <td className="py-2 px-3 text-blue-700">INTEGER</td>
                  <td className="py-2 px-3 text-slate-500">DEFAULT 0</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Flag (1/0) indicating human override</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">version</td>
                  <td className="py-2 px-3 text-blue-700">INTEGER</td>
                  <td className="py-2 px-3 text-slate-500">DEFAULT 1</td>
                  <td className="py-2 px-3 font-sans text-slate-700">Concurrency version counter</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Routing Rules */}
      {activeTab === 'routing' && (
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Rule-Based Routing Hierarchy (Precedence Rules)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Deterministic order of execution in `server/routing.ts`</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 font-mono">Precedence 1: Conflict & Ambiguity Detection</span>
              <p className="text-slate-700">
                If the sales rep marked outcome as <code>completed_successful</code> or <code>follow_up_required = 0</code>,
                yet the summary or transcript notes contain customer ultimatums, competitor lower rate cards, or threats to cancel,
                the engine routes to <strong>Unclear; manual review required</strong> with Low Confidence.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 font-mono">Precedence 2: Customer Escalations & Grievances</span>
              <p className="text-slate-700">
                If outcome is explicitly <code>customer_escalation</code> OR text contains severe friction (HIPAA audit delays,
                outages, billing overage disputes), the engine routes to <strong>Customer concern or escalation</strong> with
                Critical/High priority.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 font-mono">Precedence 3: Overdue Action Items</span>
              <p className="text-slate-700">
                If <code>follow_up_required</code> is true and <code>follow_up_due_date</code> has passed relative to the current
                evaluation date, the engine routes to <strong>Follow-up required</strong> with <strong>Critical</strong> priority.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 font-mono">Precedence 4: Commercial Expansion & Renewal Wins</span>
              <p className="text-slate-700">
                If outcome is <code>completed_successful</code> and commercial indicators are positive (expansion, renewal, budget release),
                the engine routes to <strong>Positive opportunity</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-900 font-mono">Precedence 5: Scheduled Standard Follow-ups</span>
              <p className="text-slate-700">
                If <code>follow_up_required</code> is true with a future deadline (&gt;48 hours), the engine routes to
                <strong>Follow-up required</strong> with Medium priority.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Conflict Policy */}
      {activeTab === 'conflict' && (
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Documented Conflict Policy (Section 7)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Handling collisions between batch imports and human overrides</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              When a sales operations manager edits a record in the UI, the record is flagged with{' '}
              <code>is_manually_overridden = 1</code>, and the justification is permanently stored in{' '}
              <code>manual_override_reason</code> alongside an entry in <code>audit_log</code>.
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded font-sans">
              <span className="font-semibold text-slate-900 block mb-1">Subsequent Re-Import Collision Rules:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>
                  <strong>Unchanged Data Re-Import</strong>: Identical rows are classified as <code>exact_duplicate</code> and skipped. Zero data is modified.
                </li>
                <li>
                  <strong>Payload Field Updates</strong>: If an incoming file updates duration, notes, or rep name, those operational fields are updated in place and version increments.
                </li>
                <li>
                  <strong>Protection of Human Decisions</strong>: The manager's manually chosen routing category and priority remain protected and are <strong>NOT</strong> overwritten by automated rules unless explicitly re-evaluated.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
