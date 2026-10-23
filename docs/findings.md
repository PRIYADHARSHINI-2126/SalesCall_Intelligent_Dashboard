# Sales Call Intelligence — Evidence-Backed Findings & Strategic Decisions

This document details three evidence-backed operational findings derived directly from the baseline sales conversation dataset (20 verified calls and meetings across 4 account executives), along with one fundamental architectural decision considered but rejected during system design.

---

## Finding 1: Administrative, Billing, and Compliance Delays Trigger Severe Deal Churn Risks

### Metric & Observation
- **Escalation Volume**: 4 out of 20 conversations (20.0%) represent urgent account escalations.
- **Root Cause**: 75% of escalations (3 of 4) stem from back-office operational bottlenecks (HIPAA compliance documents, billing overcharges, and SSO setup delays), rather than core product dissatisfaction.

### Supporting Source Record IDs & Exact Evidence
1. **Record ID**: `CONV-2026-101`
   - **Customer**: NovaHealth Systems
   - **Sales Representative**: Elena Rostova
   - **Type / Date**: Call / 2026-10-20T14:30:00Z
   - **Field `summary`**: *"Customer expressed severe alarm regarding recent HIPAA security audit questionnaire delays. CISO threatened to freeze onboarding unless SOC2 Type II bridge letter is provided immediately. Rep promised response."*
   - **Field `outcome`**: `customer_escalation`
   - **Field `follow_up_due_date`**: `2026-10-21` (Overdue relative to current evaluation date).

2. **Record ID**: `CONV-2026-102`
   - **Customer**: Apex Financial
   - **Sales Representative**: Marcus Vance
   - **Type / Date**: Meeting / 2026-10-19T10:00:00Z
   - **Field `summary`**: *"Finance controller disputed $14,200 overage billing on cloud compute tier. Demanded credit memo before signing Q4 annual expansion. Tension over contract ambiguity."*
   - **Field `outcome`**: `customer_escalation`
   - **Field `topic`**: `Billing & Invoicing`

### Why It Matters to Sales Management
Sales managers often treat deal stalls as salesperson persuasion failures. The evidence demonstrates that high-value enterprise accounts with verified commercial intent (NovaHealth and Apex Financial) are on the brink of termination due to operational friction from Legal, Finance, and Security. Without automated routing into an executive attention queue, these deals would slip past quarterly deadlines.

### Practical Recommended Action
1. **Automated Inter-Departmental SLA**: Connect the `Customer concern or escalation` queue directly to finance and legal webhooks. For accounts with billing disputes $> \$10,000$ or security questionnaire freezes, enforce a mandatory 24-hour turnaround on credit memos and SOC2 bridge letters.
2. **Weekly Risk Review**: Dedicate the first 15 minutes of Monday sales meetings to the `attention_queue.csv` export to eliminate cross-departmental blockers.

---

## Finding 2: Rep Self-Reporting Bias Creates High Churn Blind Spots via Contradictory Logs

### Metric & Observation
- **Contradictory Records**: 10% of ingested records (2 of 20) exhibited direct contradictions between the sales rep's structured outcome tag and the actual call notes.
- **Risk Severity**: In the most critical case, an imminent customer cancellation was logged as a closed positive call with no follow-up requested.

### Supporting Source Record IDs & Exact Evidence
1. **Record ID**: `CONV-2026-109`
   - **Customer**: Horizon Media
   - **Sales Representative**: Sarah Lin
   - **Type / Date**: Meeting / 2026-10-20T10:30:00Z
   - **Field `outcome`**: `completed_successful` (Rep marked call completed successfully).
   - **Field `follow_up_required`**: `0` (Rep marked no further action required).
   - **Field `summary`**: *"Director of Operations stated competitor offered 30% lower rate card and threatened migration unless price matched by Friday. Rep marked call completed without follow-up flag despite urgent risk."*
   - **Routing Result**: The rule engine caught the contradiction and assigned category `Unclear; manual review required` with `low` confidence and `requires_human_review = 1`.

2. **Record ID**: `CONV-2026-116`
   - **Customer**: Pioneer Solar
   - **Sales Representative**: David Kim
   - **Field `outcome`**: `no_show`
   - **Field `duration_seconds`**: `1680` (28 minutes).
   - **Field `summary`**: Rep held an extensive 28-minute unscheduled discussion with a substitute site supervisor covering critical safety compliance questions.

### Why It Matters to Sales Management
Standard CRM reports rely blindly on sales representative drop-down selections (`completed_successful`). Under quota pressure or administrative haste, reps frequently mask customer ultimatums or miss recording deliverables. A naive dashboard relying only on the `outcome` field would classify Horizon Media as a satisfied customer, allowing the deal to churn silently to a competitor before Friday.

### Practical Recommended Action
1. **Automated Conflict Detection Rule**: Retain Precedence Rule 1 (`evaluateRouting`), which intercepts calls where notes contain high-risk terms (`threatened`, `competitor`, `dispute`) but `outcome` is marked benign.
2. **Manager Correction Protocol**: Require managers to override the routing to `Customer concern or escalation` and assign an urgent counter-proposal discount approval before the customer's deadline.

---

## Finding 3: Lack of Follow-Up Discipline on High-Value Opportunities Leads to Pipeline Decay

### Metric & Observation
- **Overdue Pipeline**: 15% of records (3 of 20) had overdue action items past their committed due dates.
- **Average Slippage**: Overdue action items averaged 2.3 days past their deadline, with the oldest overdue by 4 full days (`CONV-2026-113`).

### Supporting Source Record IDs & Exact Evidence
1. **Record ID**: `CONV-2026-113`
   - **Customer**: Zenith Logistics
   - **Sales Representative**: Sarah Lin
   - **Field `call_datetime`**: `2026-10-15T09:00:00Z`
   - **Field `follow_up_due_date`**: `2026-10-18` (4 days overdue relative to current operational date of 2026-10-22).
   - **Field `summary`**: *"Call to schedule pilot kickoff workshop. Logistics VP was traveling; assistant asked for reminder email with proposed calendar slots. Follow-up overdue."*

2. **Record ID**: `CONV-2026-108`
   - **Customer**: Crestline Health
   - **Sales Representative**: David Kim
   - **Field `follow_up_due_date`**: `2026-10-22` (Due immediately today).
   - **Field `summary`**: *"Customer project manager reported 3-week implementation delay due to active directory SSO syncing errors. Requested emergency technical architect session to avoid go-live slip."*

### Why It Matters to Sales Management
Pilot scheduling momentum decays exponentially with delay. In the case of Zenith Logistics, failing to send calendar slots for 4 days signals vendor indifference, increasing the probability that the prospect's project budget will be reallocated.

### Practical Recommended Action
1. **Dynamic Priority Escalation**: The platform's automated rule escalates any follow-up past its due date to `critical` priority with an overdue count banner on the manager overview.
2. **Manager Reassignment Reallocation**: When a sales rep's overdue follow-up exceeds 72 hours, the manager can reassign the action item or schedule a joint executive touchpoint.

---

## Architectural Decision Considered and Rejected: Fuzzy Automatic Record De-duplication

### The Proposed Alternative
During initial system architecture planning, the team evaluated implementing an automated fuzzy string matching algorithm (e.g., Levenshtein distance $\ge 85\%$ or Jaro-Winkler similarity on `customer_name` + date proximity) to automatically merge incoming call records when `source_id` is absent or formatted differently across phone dialers.

### Why It Was Rejected
1. **Catastrophic False Merges on Enterprise Subsidiaries**: Many enterprise clients operate separate legal entities and procurement divisions with similar names (e.g., "Acme Retail EMEA", "Acme Logistics Americas", "Acme Health Technologies"). An automated fuzzy merge would consolidate distinct commercial deals conducted by different sales reps into a single scrambled record, corrupting contract terms and audit histories.
2. **Destruction of Historical Truth**: Once an automated merge silently combines records, undoing the operation in a production database is costly and error-prone.
3. **Loss of Accountability**: Sales managers cannot rely on an intelligence dashboard if they cannot trust whether a customer update originated from rep A or rep B.

### The Adopted Solution
1. **Deterministic Matching via Stable Identifiers**: Require stable `source_id` keys from telemetry sources whenever available.
2. **Dedicated Potential Duplicate Review Queue**: When an incoming record lacks a `source_id` but shares a customer name, rep, and date with an existing conversation, the system does **not** auto-merge. Instead, it classifies the row as `potential_duplicate`, highlights the matching candidate, and prompts the manager to explicitly confirm whether it is an update or a separate distinct discussion.
3. **Transparent Audit Trail**: Every modification records the previous state, new state, manager ID, and reason, guaranteeing 100% data integrity.
