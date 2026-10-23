import React, { useState, useEffect } from 'react';
import { Conversation } from '../types.js';
import {
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Check,
  Edit3,
  Clock,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';

interface RoutingReviewViewProps {
  onSelectConversation: (id: string) => void;
  onOpenCorrection: (conv: Conversation) => void;
  onRefreshStats: () => void;
}

export const RoutingReviewView: React.FC<RoutingReviewViewProps> = ({
  onSelectConversation,
  onOpenCorrection,
  onRefreshStats,
}) => {
  const [reviewItems, setReviewItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unclear' | 'escalation' | 'overdue'>('all');

  const fetchReviewItems = () => {
    setLoading(true);
    fetch('/api/conversations?limit=100&review_status=needs_review')
      .then((res) => res.json())
      .then((data) => {
        setReviewItems(data.data || []);
      })
      .catch((err) => console.error('Error fetching review queue:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviewItems();
  }, []);

  const handleAcceptRouting = async (conv: Conversation) => {
    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(conv.id)}/correct`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing_category: conv.routing_category,
          attention_priority: conv.attention_priority,
          reason: 'Manager accepted automated routing recommendation as verified.',
          changed_by: 'Sales Operations Manager (priyadharshinipnk987@gmail.com)',
        }),
      });
      if (res.ok) {
        fetchReviewItems();
        onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to accept routing:', err);
    }
  };

  const filteredItems = reviewItems.filter((item) => {
    if (filterType === 'unclear') {
      return item.routing_category === 'Unclear; manual review required';
    }
    if (filterType === 'escalation') {
      return item.routing_category === 'Customer concern or escalation';
    }
    if (filterType === 'overdue') {
      return Boolean(item.follow_up_due_date && item.follow_up_due_date < '2026-10-22');
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Review Station Mission Banner */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Managerial Triage & Routing Review Desk</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {filteredItems.length} Conversations Pending Decision
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Conversations are directed here when the rule engine detects <strong>contradictory rep signals</strong>,
          critical customer escalations requiring executive intervention, or lapsed follow-up deadlines. Managers can
          review the underlying evidence, verify accuracy, or override the classification with a permanent audit justification.
        </p>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Pending ({reviewItems.length})
          </button>
          <button
            onClick={() => setFilterType('unclear')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'unclear' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Conflicting / Unclear Signals
          </button>
          <button
            onClick={() => setFilterType('escalation')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'escalation' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Critical Escalations
          </button>
          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterType === 'overdue' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Overdue Follow-ups
          </button>
        </div>
      </div>

      {/* Review Queue Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading review queue...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200 space-y-2">
          <p className="font-semibold text-slate-800 text-sm">Review Desk Clear!</p>
          <p>No conversations currently require manual manager verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const evidenceArr: string[] = (() => {
              try {
                return JSON.parse(item.routing_evidence);
              } catch {
                return [item.routing_evidence];
              }
            })();

            const isConflicting = item.routing_category === 'Unclear; manual review required';
            const isOverdue = Boolean(item.follow_up_due_date && item.follow_up_due_date < '2026-10-22');

            return (
              <div
                key={item.id}
                className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Item Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                      <span className="font-semibold text-slate-900 font-sans text-sm">{item.customer_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.source_id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Owner: {item.rep_name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium uppercase tracking-wide">
                      {item.attention_priority === 'critical' ? (
                        <span className="text-red-700 font-semibold">Priority: Critical</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Priority: High</span>
                      )}
                    </span>
                    <button
                      onClick={() => onSelectConversation(item.id)}
                      className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>Full Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Evidence & Conflict Analysis Box */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Reason & Conflict Callout */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {isConflicting ? (
                        <span className="text-amber-800 flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Conflicting Signals Detected Between Rep Log & Source Notes</span>
                        </span>
                      ) : (
                        <span>Routing Rationale & Escalation Basis</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-md border border-slate-200">
                      {item.routing_rationale}
                    </p>

                    {/* Source Note Excerpt */}
                    <div className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Source Call Summary
                      </span>
                      <p className="italic text-slate-700">"{item.summary}"</p>
                    </div>
                  </div>

                  {/* Right: Explicit Evidence Checklist */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-md border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Trigger Evidence ({evidenceArr.length})
                      </span>
                      <ul className="space-y-1.5 text-slate-700">
                        {evidenceArr.map((ev, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span className="text-[11px] leading-tight">{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 font-mono text-[11px] text-slate-500">
                      Recorded Outcome: <span className="font-semibold text-slate-800">{item.outcome}</span>
                    </div>
                  </div>
                </div>

                {/* Manager Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    Suggested Queue:{' '}
                    <span className="font-semibold text-slate-900">{item.routing_category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRouting(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Confirm & Accept</span>
                    </button>
                    <button
                      onClick={() => onOpenCorrection(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Override Category / Priority</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
