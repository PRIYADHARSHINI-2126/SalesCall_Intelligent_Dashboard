import React from 'react';
import { DashboardStats, Conversation } from '../types.js';
import {
  PhoneCall,
  Users,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface OverviewViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onSelectConversation: (id: string) => void;
  onNavigateToRouting: () => void;
  onNavigateToConversations: (filter?: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  loading,
  onSelectConversation,
  onNavigateToRouting,
  onNavigateToConversations,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-28 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Calculate percentages
  const totalSentiment = stats.sentiment.positive + stats.sentiment.neutral + stats.sentiment.negative;
  const posPct = totalSentiment > 0 ? Math.round((stats.sentiment.positive / totalSentiment) * 100) : 0;
  const negPct = totalSentiment > 0 ? Math.round((stats.sentiment.negative / totalSentiment) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Ingested Activity */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Conversations Total</span>
            <span className="font-mono tabular-nums text-slate-700 font-medium">All Records</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({stats.callsCount} calls · {stats.meetingsCount} meetings)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Duration</span>
            <span className="font-mono tabular-nums">29m 35s</span>
          </div>
        </div>

        {/* Metric 2: Attention Queue */}
        <div
          onClick={onNavigateToRouting}
          className="p-4 bg-white rounded-lg border border-red-200/80 hover:border-red-300 transition-colors shadow-2xs flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-red-600 mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>Requires Attention</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-red-700 tracking-tight">
              {stats.attentionCount}
            </span>
            <span className="text-xs text-red-600/80 font-mono">
              ({Math.round((stats.attentionCount / (stats.total || 1)) * 100)}% of pipeline)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-red-100 text-[11px] text-red-700/80">
            Critical escalations & ambiguous reviews
          </div>
        </div>

        {/* Metric 3: Follow-up Discipline */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Follow-up Commitments</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 tracking-tight">
              {stats.overdueCount}
            </span>
            <span className="text-xs text-amber-700 font-mono">Overdue</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-mono font-medium">{stats.upcomingCount} Due &lt;48h</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Past Target SLA</span>
            <span className="font-mono tabular-nums text-amber-600 font-semibold">{stats.overdueCount} items</span>
          </div>
        </div>

        {/* Metric 4: Outcome & Sentiment Balance */}
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Commercial Sentiment</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 tracking-tight">
              {posPct}%
            </span>
            <span className="text-xs text-slate-600 font-mono">Positive</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-red-600 font-mono">{negPct}% Concern</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {stats.sentiment.positive} expansion/renewals · {stats.sentiment.neutral} neutral
          </div>
        </div>
      </div>

      {/* Two Column Layout: Charts and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume over Time */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Conversation Volume Over Time
              </h3>
              <p className="text-xs text-slate-500">Daily call vs. scheduled meeting activity</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs" /> Calls
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-xs" /> Meetings
              </span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="day"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="calls" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} name="Calls" />
                <Bar dataKey="meetings" stackId="a" fill="#818CF8" radius={[3, 3, 0, 0]} name="Meetings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Routing Category Distribution */}
        <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Routing Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Breakdown of assigned triage queues</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{stats.categoryDistribution.length} Categories</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats.categoryDistribution}
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  type="category"
                  dataKey="routing_category"
                  width={140}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '6px', color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Total Conversations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prioritized Attention Queue Widget (Section 3 Requirement) */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>Prioritized Manager Attention Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Conversations requiring immediate executive intervention or manual routing review
            </p>
          </div>
          <button
            onClick={onNavigateToRouting}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            <span>Open Review Desk ({stats.attentionCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {stats.topAttention.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-md transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="pt-0.5">
                  {conv.attention_priority === 'critical' ? (
                    <span className="w-2 h-2 rounded-full bg-red-600 block" title="Critical Priority" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-500 block" title="High Priority" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-0.5">
                    <span className="font-semibold text-slate-900 font-sans">{conv.customer_name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{conv.source_id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{conv.rep_name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{conv.type}</span>
                  </div>
                  <p className="text-xs text-slate-700 truncate max-w-2xl">{conv.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <div className="text-xs">
                  <div className="font-medium text-slate-900">{conv.routing_category}</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {conv.follow_up_due_date ? `Due: ${conv.follow_up_due_date}` : 'No due date'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Representative Activity & Performance Table */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Sales Representative Activity Breakdown
            </h3>
            <p className="text-xs text-slate-500">Call/meeting distribution, positive deal momentum, and customer escalations</p>
          </div>
          <button
            onClick={() => onNavigateToConversations()}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all conversations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Sales Representative</th>
                <th className="py-2.5 px-3 text-right">Total Interactions</th>
                <th className="py-2.5 px-3 text-right">Calls</th>
                <th className="py-2.5 px-3 text-right">Meetings</th>
                <th className="py-2.5 px-3 text-right">Positive Opportunities</th>
                <th className="py-2.5 px-3 text-right">Escalations</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {stats.repActivity.map((rep) => (
                <tr key={rep.rep_name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{rep.rep_name}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{rep.total}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{rep.calls}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{rep.meetings}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">{rep.positive}</td>
                  <td className="py-2.5 px-3 text-right text-red-600 font-medium">
                    {rep.escalations > 0 ? rep.escalations : 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      onClick={() => onNavigateToConversations({ rep_name: rep.rep_name })}
                      className="text-blue-600 hover:underline"
                    >
                      Filter
                    </button>
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
