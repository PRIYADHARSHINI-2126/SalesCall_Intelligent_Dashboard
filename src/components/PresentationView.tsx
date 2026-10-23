import React, { useState } from 'react';
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export const PresentationView: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(1);

  const slides = [
    {
      num: 1,
      title: 'Slide 1: Executive Overview & Architectural Solution',
      subtitle: 'Problem Statement, Business Objective, and Solution Architecture',
      render: (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Problem & Solution Summary
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Eliminating Pipeline Blind Spots with Explainable Sales Call Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Problem Statement
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Sales managers lack unified, granular visibility into call discussions. Critical customer objections and
                overdue commitments get lost in unparsed rep notes, while repeated CRM imports cause data fragmentation
                and accidental record multiplication.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Business Objective
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Establish an automated managerial review queue prioritizing high-risk accounts and expansion momentum,
                guarantee safe repeated data ingestion without duplication, and protect manual corrections with complete
                auditability.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 block">
                Architectural Solution
              </span>
              <p className="text-xs text-blue-900 leading-relaxed">
                Full-stack Node.js + Express with SQLite persistence, transparent rule-based routing with explicit source
                evidence (no opaque black boxes), two-phase idempotent imports, and cryptographically verified export manifests.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Slide 2: Activity Patterns & Baseline Metrics',
      subtitle: 'Dashboard Metrics, Sales Activity Patterns, and Key Observations',
      render: (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Operational Baseline
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Demonstration Dataset Telemetry: 20 Verified Enterprise Conversations
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono tabular-nums">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-sans text-slate-500 block">Total Conversations</span>
              <span className="text-xl font-bold text-slate-900">20 Records</span>
            </div>
            <div className="p-3.5 bg-red-50 rounded-lg border border-red-200">
              <span className="text-[11px] font-sans text-red-700 block">Attention Queue</span>
              <span className="text-xl font-bold text-red-700">8 Items (40%)</span>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[11px] font-sans text-amber-700 block">Overdue Follow-ups</span>
              <span className="text-xl font-bold text-amber-700">3 Records</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-[11px] font-sans text-emerald-700 block">Positive Opportunities</span>
              <span className="text-xl font-bold text-emerald-700">6 Records (30%)</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Key Activity Observations from Dataset
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-mono text-blue-600 font-bold shrink-0">1.</span>
                <span>
                  <strong>Meeting vs. Call Duration Asymmetry</strong>: Scheduled meetings averaged 43.8 minutes (2,630s)
                  while calls averaged 23.9 minutes (1,438s). Strategic enterprise renewals were exclusively closed in meetings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-blue-600 font-bold shrink-0">2.</span>
                <span>
                  <strong>Escalation Clustering</strong>: 75% of customer escalations concentrated around administrative,
                  billing overcharges, and security questionnaires rather than product functionality dissatisfaction.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-blue-600 font-bold shrink-0">3.</span>
                <span>
                  <strong>Representative Workload Balance</strong>: Sarah Lin and Marcus Vance conducted 50% of conversations,
                  with Elena Rostova delivering the highest deal close conversion rate (Acme Corp, Vanguard Media).
                </span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Slide 3: Explainable Rule-Based Routing Logic',
      subtitle: 'Multi-Tier Precedence Hierarchy and Resolution of Difficult Edge Case',
      render: (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Transparent Logic & Conflict Handling
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Precedence Hierarchy & The Horizon Media Edge Case
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Precedence System */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Rule Precedence Architecture
              </span>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-900">P1. Conflict Detection:</span> Rep logged success but
                  summary contains cancellation threat $\to$ routes to <em>Unclear; manual review required</em>.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-900">P2. Escalation / Concerns:</span> Outages, HIPAA audit
                  delays, billing disputes $\to$ routes to <em>Customer concern or escalation</em> (Critical/High).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-900">P3. Overdue Follow-ups:</span> Lapsed deadline relative
                  to current date $\to$ routes to <em>Follow-up required</em> (Critical priority).
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-900">P4. Positive Opportunities:</span> Successful renewals and
                  multi-seat expansion $\to$ routes to <em>Positive opportunity</em>.
                </div>
              </div>
            </div>

            {/* Right: Difficult Decision Focus */}
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Difficult Decision: CONV-2026-109 (Horizon Media)</span>
              </div>
              <div className="text-xs text-amber-950 space-y-2">
                <p>
                  <strong>The Trap</strong>: Sales rep logged outcome as <code>completed_successful</code> with{' '}
                  <code>follow_up_required = 0</code>.
                </p>
                <p className="italic bg-white/80 p-2.5 rounded border border-amber-200">
                  Source Notes: "Director of Operations stated competitor offered 30% lower rate card and threatened migration unless price matched by Friday."
                </p>
                <p>
                  <strong>Engine Resolution</strong>: Precedence Rule 1 caught the contradiction between positive tag and
                  explicit competitor threat. Automatically flagged as <strong>Unclear; manual review required</strong> with Low Confidence.
                </p>
                <p>
                  <strong>Manager Intervention</strong>: Manager overrode category to <em>Customer concern or escalation</em>,
                  set Priority to <em>Critical</em>, and dispatched an executive discount offer before Friday.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: 'Slide 4: Ingestion Idempotence & Audit Protection',
      subtitle: 'Duplicate Handling, In-Place Updates, and Manual Override Conflict Policy',
      render: (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Data Integrity & Ingestion Guarantees
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Deterministic Deduplication, In-Place Diffing, & Conflict Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                1. Exact Duplicate Handling
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Deterministic matching via stable <code>source_id</code>. Re-importing the identical file 10 times results
                in <strong>strictly 0 new records</strong> and 0 duplicate rows created.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                2. Record Updates & Versioning
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                When <code>source_id</code> matches but data fields differ (e.g. Apex Financial credit memo settled), the
                record is updated in place, the version increments ($v1 \to v2$), and exact diffs are logged in the audit trail.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                3. Conflict Policy for Overrides
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                Once a human manager overrides a record (<code>is_manually_overridden = 1</code>), subsequent re-imports
                never blindly clobber the human decision. Operational telemetry updates while manager decisions remain protected.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 5,
      title: 'Slide 5: Evidence-Backed Findings & Strategic Decisions',
      subtitle: 'Three Verified Dataset Findings and Architectural Alternative Considered but Rejected',
      render: (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider block mb-1">
              Data Insights & Strategy
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Three Core Findings & One Rejected Architectural Alternative
            </h2>
          </div>

          <div className="space-y-3">
            {/* Finding 1 */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Finding 1: High-Risk Compliance & Billing Bottlenecks (NovaHealth, Apex Financial)</span>
                <span className="font-mono text-slate-500">CONV-2026-101, CONV-2026-102</span>
              </div>
              <p className="text-slate-600">
                Customers threatened onboarding freeze over SOC2 bridge letter delays and disputed a $14,200 compute overage.
                <strong> Action</strong>: Establish a 24-hour cross-functional SLA for Legal & Finance on escalated accounts.
              </p>
            </div>

            {/* Finding 2 */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Finding 2: Rep Self-Reporting Bias & Silent Churn Risk (Horizon Media)</span>
                <span className="font-mono text-slate-500">CONV-2026-109</span>
              </div>
              <p className="text-slate-600">
                Rep logged "completed successfully" despite customer issuing a 30% competitor discount ultimatum by Friday.
                <strong> Action</strong>: Enforce automated conflict validation rules to route contradictory summaries to manager triage.
              </p>
            </div>

            {/* Finding 3 */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Finding 3: Follow-Up Slippage on High-Potential Pilots (Zenith Logistics)</span>
                <span className="font-mono text-slate-500">CONV-2026-113</span>
              </div>
              <p className="text-slate-600">
                Pilot kickoff scheduling follow-up lapsed by 4 full days without calendar invitation sent.
                <strong> Action</strong>: Dynamic priority escalation to Critical priority for any follow-up past due &gt;48 hours.
              </p>
            </div>

            {/* Rejected Decision */}
            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-lg text-xs space-y-1 text-red-950">
              <div className="font-bold flex items-center gap-1.5 text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-700" />
                <span>Rejected Decision: Fuzzy Automatic Deduplication Merging</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-900">
                <strong>Why Rejected</strong>: Automatic fuzzy matching on account names (e.g. "Acme Retail EMEA" vs "Acme Labs")
                risks silently merging distinct enterprise subsidiary deals, destroying contract history.
                <strong> Adopted Instead</strong>: Deterministic source_id matching + dedicated human review queue for uncertain matches.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Slide Navigator & Download Bar */}
      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Five-Slide Executive Presentation Deck
            </h2>
            <p className="text-xs text-slate-500">
              Slide {activeSlide} of 5 · Grounded directly in evaluation dataset
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Slide Indicator Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSlide(s)}
                className={`w-7 h-7 text-xs font-mono font-medium rounded transition-colors ${
                  activeSlide === s
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <a
            href="/api/presentation"
            download="sales-review-findings.pptx"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .pptx</span>
          </a>
        </div>
      </div>

      {/* Slide Viewer Canvas */}
      <div className="p-8 bg-white rounded-lg border border-slate-200 shadow-sm min-h-[440px] flex flex-col justify-between">
        <div>{slides[activeSlide - 1].render}</div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setActiveSlide((s) => Math.max(1, s - 1))}
            disabled={activeSlide === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>
          <span className="font-mono text-slate-400">
            Slide {activeSlide} of 5 · Sales Review Findings
          </span>
          <button
            onClick={() => setActiveSlide((s) => Math.min(5, s + 1))}
            disabled={activeSlide === 5}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 disabled:opacity-40"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
