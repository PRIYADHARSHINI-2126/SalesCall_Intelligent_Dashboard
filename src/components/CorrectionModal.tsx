import React, { useState } from 'react';
import { Conversation, RoutingCategory, PriorityLevel, OutcomeType } from '../types.js';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

interface CorrectionModalProps {
  conversation: Conversation | null;
  onClose: () => void;
  onSuccess: (updated: Conversation) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  conversation,
  onClose,
  onSuccess,
}) => {
  if (!conversation) return null;

  const [category, setCategory] = useState<RoutingCategory>(conversation.routing_category);
  const [priority, setPriority] = useState<PriorityLevel>(conversation.attention_priority);
  const [outcome, setOutcome] = useState<OutcomeType>(conversation.outcome);
  const [repName, setRepName] = useState(conversation.rep_name);
  const [customerName, setCustomerName] = useState(conversation.customer_name);
  const [followUpRequired, setFollowUpRequired] = useState(Boolean(conversation.follow_up_required));
  const [dueDate, setDueDate] = useState(conversation.follow_up_due_date || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason || reason.trim().length < 5) {
      setError('A descriptive reason (at least 5 characters) is required for audit compliance.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(conversation.id)}/correct`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing_category: category,
          attention_priority: priority,
          outcome,
          rep_name: repName,
          customer_name: customerName,
          follow_up_required: followUpRequired,
          follow_up_due_date: dueDate.trim() || null,
          reason: reason.trim(),
          changed_by: 'Sales Operations Manager (priyadharshinipnk987@gmail.com)',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply manual correction.');
      }

      onSuccess(data.conversation);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred during correction submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-mono text-slate-500">Record {conversation.source_id}</span>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Managerial Correction & Routing Override
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Customer / Account</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sales Representative</label>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Routing Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoutingCategory)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 bg-white"
              >
                <option value="Customer concern or escalation">Customer concern or escalation</option>
                <option value="Follow-up required">Follow-up required</option>
                <option value="Positive opportunity">Positive opportunity</option>
                <option value="No follow-up needed">No follow-up needed</option>
                <option value="Unclear; manual review required">Unclear; manual review required</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Attention Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 bg-white"
              >
                <option value="critical">Critical (Immediate Action)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Recorded Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as OutcomeType)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 bg-white"
              >
                <option value="completed_successful">completed_successful</option>
                <option value="follow_up_scheduled">follow_up_scheduled</option>
                <option value="customer_escalation">customer_escalation</option>
                <option value="objection_raised">objection_raised</option>
                <option value="no_show">no_show</option>
                <option value="lost">lost</option>
                <option value="pending">pending</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Follow-up Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Follow-up action item is actively required</span>
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Correction Justification / Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Explain why this record is being modified (e.g. 'Customer issued urgent competitor price match deadline; escalated to executive review')."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs text-slate-900"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Required by Section 7 audit standards. This explanation will be permanently recorded in the audit trail.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Immutable audit log entry will be created</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Correction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
