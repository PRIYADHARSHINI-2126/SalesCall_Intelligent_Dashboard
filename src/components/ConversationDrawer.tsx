import React, { useEffect, useState } from 'react';
import { Conversation, AuditLogEntry } from '../types.js';
import {
  X,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Edit3,
  ShieldAlert,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface ConversationDrawerProps {
  conversationId: string | null;
  onClose: () => void;
  onOpenCorrection: (conversation: Conversation) => void;
}

export const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  conversationId,
  onClose,
  onOpenCorrection,
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setAuditTrail([]);
      return;
    }

    setLoading(true);
    fetch(`/api/conversations/${encodeURIComponent(conversationId)}`)
      .then((res) => res.json())
      .then((data) => {
        setConversation(data.conversation || null);
        setAuditTrail(data.auditTrail || []);
      })
      .catch((err) => console.error('Error fetching conversation:', err))
      .finally(() => setLoading(false));
  }, [conversationId]);

  if (!conversationId) return null;

  const evidenceList: string[] = conversation?.routing_evidence
    ? (() => {
        try {
          return JSON.parse(conversation.routing_evidence);
        } catch {
          return [conversation.routing_evidence];
        }
      })()
    : [];

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder > 0 ? `${remainder}s` : ''}`;
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums mb-1">
              <span>{conversation?.source_id}</span>
              <span aria-hidden="true">·</span>
              <span>v{conversation?.version || 1}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{conversation?.type}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {conversation?.customer_name || 'Loading...'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {conversation && (
              <button
                onClick={() => onOpenCorrection(conversation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Override / Correct</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading conversation details...</div>
        ) : conversation ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Essential Call Metadata Strip */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Account Executive</span>
                <span className="font-medium text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {conversation.rep_name}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Date & Duration</span>
                <span className="font-medium text-slate-900 flex items-center gap-1.5 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDateTime(conversation.call_datetime)} ({formatDuration(conversation.duration_seconds)})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Recorded Outcome</span>
                <span className="font-medium text-slate-900 font-mono">
                  {conversation.outcome}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Topic & Sentiment</span>
                <span className="font-medium text-slate-900">
                  {conversation.topic} · {conversation.sentiment ? <span className="capitalize">{conversation.sentiment}</span> : 'Unspecified'}
                </span>
              </div>
            </div>

            {/* Transparent Rule-Based Routing Decision */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Routing Decision & Rationale
                </span>
                <span className="text-xs font-mono font-medium text-slate-600">
                  Confidence: <span className="capitalize">{conversation.routing_confidence}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  {conversation.routing_category}
                </div>
                <span className="text-xs text-slate-400">·</span>
                <div className="text-xs font-medium uppercase tracking-wide">
                  {conversation.attention_priority === 'critical' ? (
                    <span className="text-red-700 font-semibold">Priority: Critical</span>
                  ) : conversation.attention_priority === 'high' ? (
                    <span className="text-amber-700 font-semibold">Priority: High</span>
                  ) : (
                    <span className="text-slate-600">Priority: {conversation.attention_priority}</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {conversation.routing_rationale}
              </p>

              {Boolean(conversation.is_manually_overridden) && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-xs text-amber-900">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>Manager Manual Override Applied</span>
                  </div>
                  <div>Reason: {conversation.manual_override_reason || 'Manual classification adjustment'}</div>
                </div>
              )}

              {/* Extracted Evidence List */}
              {evidenceList.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                    Source Evidence & Trigger Signals
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {evidenceList.map((ev, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Conversation Summary & Narrative */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Call Narrative & Notes</span>
              </div>
              <div className="p-3.5 rounded-md bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {conversation.summary}
              </div>
            </div>

            {/* Follow-up Deliverable Status */}
            <div className="p-3.5 rounded-md border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Follow-up Requirement</span>
                <span className="font-medium text-slate-900">
                  {conversation.follow_up_required ? 'Action item required' : 'No follow-up required'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Due Date</span>
                <span className="font-mono font-medium text-slate-900">
                  {conversation.follow_up_due_date || 'None'}
                </span>
              </div>
            </div>

            {/* Historical Audit Trail for this record */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3">
                Record Modification History ({auditTrail.length})
              </span>
              {auditTrail.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No modifications recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                        <span className="capitalize font-medium text-slate-700">
                          {entry.change_type.replace('_', ' ')}
                        </span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      {entry.field_name !== 'initial_import' ? (
                        <div className="text-slate-800">
                          Field <span className="font-mono font-medium text-blue-700">{entry.field_name}</span> changed from{' '}
                          <span className="line-through text-slate-500 font-mono">
                            {entry.old_value || '(empty)'}
                          </span>{' '}
                          to <span className="font-semibold text-slate-900 font-mono">{entry.new_value}</span>
                        </div>
                      ) : (
                        <div className="text-slate-800">Initial record creation via batch import.</div>
                      )}
                      <div className="text-[11px] text-slate-500">
                        Reason: <span className="text-slate-700 italic">{entry.reason}</span> · By: {entry.changed_by}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-red-500">Record not found.</div>
        )}
      </div>
    </div>
  );
};
