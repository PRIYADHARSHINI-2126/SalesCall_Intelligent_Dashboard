import React, { useState, useEffect } from 'react';
import { Conversation } from '../types.js';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FileText,
} from 'lucide-react';

interface ConversationsViewProps {
  onSelectConversation: (id: string) => void;
  onOpenCorrection: (conv: Conversation) => void;
  initialFilter?: any;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  onSelectConversation,
  onOpenCorrection,
  initialFilter = {},
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState(initialFilter.rep_name || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');

  const fetchConversations = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '15',
    });

    if (search.trim()) params.append('search', search.trim());
    if (repFilter !== 'all') params.append('rep_name', repFilter);
    if (typeFilter !== 'all') params.append('type', typeFilter);
    if (categoryFilter !== 'all') params.append('routing_category', categoryFilter);
    if (priorityFilter !== 'all') params.append('attention_priority', priorityFilter);
    if (outcomeFilter !== 'all') params.append('outcome', outcomeFilter);
    if (followUpFilter !== 'all') params.append('follow_up_status', followUpFilter);
    if (reviewFilter !== 'all') params.append('review_status', reviewFilter);

    fetch(`/api/conversations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.data || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch((err) => console.error('Error fetching conversations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversations();
  }, [page, search, repFilter, typeFilter, categoryFilter, priorityFilter, outcomeFilter, followUpFilter, reviewFilter]);

  const handleExportFiltered = () => {
    window.location.href = '/api/export/download/conversations.csv';
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins}m`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Search & Global Filter Bar */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, owner, summary, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleExportFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {(search || repFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || outcomeFilter !== 'all' || followUpFilter !== 'all' || reviewFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setRepFilter('all');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setOutcomeFilter('all');
                  setFollowUpFilter('all');
                  setReviewFilter('all');
                  setPage(1);
                }}
                className="text-xs text-blue-600 hover:underline px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Sales Rep</label>
            <select
              value={repFilter}
              onChange={(e) => {
                setRepFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Reps</option>
              <option value="Sarah Lin">Sarah Lin</option>
              <option value="Marcus Vance">Marcus Vance</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="David Kim">David Kim</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">Call & Meeting</option>
              <option value="call">Phone Call</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Routing Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Customer concern or escalation">Escalation / Concern</option>
              <option value="Follow-up required">Follow-up Required</option>
              <option value="Positive opportunity">Positive Opportunity</option>
              <option value="No follow-up needed">No Follow-up</option>
              <option value="Unclear; manual review required">Unclear / Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Outcomes</option>
              <option value="completed_successful">Completed Successful</option>
              <option value="customer_escalation">Customer Escalation</option>
              <option value="follow_up_scheduled">Follow-up Scheduled</option>
              <option value="no_show">No Show</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Follow-up</label>
            <select
              value={followUpFilter}
              onChange={(e) => {
                setFollowUpFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="overdue">Overdue Items</option>
              <option value="required">Active Required</option>
              <option value="none">None Required</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-0.5">Review Status</label>
            <select
              value={reviewFilter}
              onChange={(e) => {
                setReviewFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-800 bg-white"
            >
              <option value="all">All Records</option>
              <option value="needs_review">Needs Review</option>
              <option value="overridden">Manually Overridden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main High-Density Conversations Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-600 font-mono">
            Showing <span className="font-semibold text-slate-900">{conversations.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{total}</span> conversations
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-600">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p className="font-medium text-slate-700">No conversations match the current filter criteria.</p>
            <p>Try clearing search terms or broadening the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Customer / Account</th>
                  <th className="py-2.5 px-3">Sales Rep</th>
                  <th className="py-2.5 px-3">Type & Date</th>
                  <th className="py-2.5 px-3">Routing Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Follow-up Due</th>
                  <th className="py-2.5 px-3">Summary Preview</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversations.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {c.customer_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {c.source_id} · v{c.version}
                      </div>
                    </td>

                    {/* Sales Rep */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {c.rep_name}
                    </td>

                    {/* Type & Date */}
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                      <div>{formatDate(c.call_datetime)}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {c.type} · {formatDuration(c.duration_seconds)}
                      </div>
                    </td>

                    {/* Routing Category */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{c.routing_category}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Conf: {c.routing_confidence} {Boolean(c.is_manually_overridden) ? '· Overridden' : ''}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 uppercase text-[11px] font-mono font-medium">
                      {c.attention_priority === 'critical' ? (
                        <span className="text-red-700 font-semibold">Critical</span>
                      ) : c.attention_priority === 'high' ? (
                        <span className="text-amber-700 font-semibold">High</span>
                      ) : (
                        <span className="text-slate-600">{c.attention_priority}</span>
                      )}
                    </td>

                    {/* Follow-up Due */}
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {c.follow_up_due_date ? (
                        <span
                          className={
                            c.follow_up_due_date < '2026-10-22'
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {c.follow_up_due_date}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Summary Preview */}
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600">
                      {c.summary}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenCorrection(c)}
                        title="Edit record or override routing"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
