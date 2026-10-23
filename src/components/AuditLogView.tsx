import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types.js';
import { History, Search, ShieldCheck, User, Calendar, Filter } from 'lucide-react';

interface AuditLogViewProps {
  onSelectConversation: (id: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onSelectConversation }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/audit?limit=200')
      .then((res) => res.json())
      .then((data) => setLogs(data || []))
      .catch((err) => console.error('Error fetching audit log:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (filterType !== 'all' && l.change_type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        l.source_id.toLowerCase().includes(q) ||
        l.field_name.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.changed_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Immutable Modifications & Audit Trail</span>
          </div>
          <span className="text-xs font-mono text-slate-500">{filteredLogs.length} Events Logged</span>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          In accordance with Section 7 audit standards, every manual manager correction and batch update records
          the affected field, exact previous value, new value, execution timestamp, operator identity, and mandatory
          justification.
        </p>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('manual_correction')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterType === 'manual_correction'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Manual Overrides
            </button>
            <button
              onClick={() => setFilterType('import_update')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterType === 'import_update'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Batch Updates
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by source ID, field, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No audit log entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3">Previous State</th>
                  <th className="py-2.5 px-3">New State</th>
                  <th className="py-2.5 px-3">Mandatory Reason</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-slate-500 tabular-nums">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectConversation(entry.source_id)}
                        className="font-semibold text-blue-600 hover:underline font-mono"
                      >
                        {entry.source_id}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-sans capitalize">
                      {entry.change_type === 'manual_correction' ? (
                        <span className="text-amber-800 font-medium">Manual Override</span>
                      ) : entry.change_type === 'import_update' ? (
                        <span className="text-blue-800 font-medium">Batch Update</span>
                      ) : (
                        <span className="text-slate-500">Initial Import</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{entry.field_name}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate line-through">
                      {entry.old_value || '(none)'}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-medium max-w-xs truncate">
                      {entry.new_value || '(none)'}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 max-w-sm truncate italic">
                      "{entry.reason}"
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px] truncate">
                      {entry.changed_by}
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
