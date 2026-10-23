# Sales Call Intelligence Dashboard — System Architecture

This document describes the software architecture, engineering patterns, data flows, and transactional boundaries implemented in the Sales Call Intelligence Dashboard.

---

## 1. Architectural Overview

The application is structured as a full-stack web application designed for high performance, transactional data integrity, and explainable decision-making:

```
[ Telephony / CRM Source Files (CSV / JSON) ]
                      │
                      ▼
[ Ingestion & Classification Engine (server/importer.ts) ]
    ├─ Schema & Type Validation
    ├─ Deterministic Source ID Matcher
    ├─ Conflict & Manual Override Policy Enforcer
    └─ Atomic Transaction Boundary (SQL.js)
                      │
                      ▼
[ Explainable Rule Routing Engine (server/routing.ts) ]
    ├─ Precedence 1: Conflict & Ambiguity Detection
    ├─ Precedence 2: Customer Escalations & Grievances
    ├─ Precedence 3: Overdue Action Items (< Now)
    ├─ Precedence 4: Commercial Expansions & Positive Wins
    ├─ Precedence 5: Standard Follow-ups (< 48h / Future)
    └─ Precedence 6: Closed & Disqualified Calls
                      │
                      ▼
[ Persistent SQLite Database (data/sales_call_intelligence.sqlite) ]
    ├─ conversations (Core record store + versioning)
    ├─ import_batches (Audit log of ingestion runs)
    └─ audit_log (Immutable field-level change history)
                      │
                      ▼
[ Express REST API (server/routes.ts) ]
    ├─ /api/stats (Aggregated KPI indicators)
    ├─ /api/conversations (Paginated, multi-filtered query)
    ├─ /api/conversations/:id/correct (Manager overrides)
    ├─ /api/import/preview & /api/import/apply
    └─ /api/export & /api/presentation
                      │
                      ▼
[ Client Application (React 19 + TypeScript + Vite + Tailwind CSS) ]
    ├─ Overview Dashboard (Recharts telemetry & urgent review strip)
    ├─ Interactive Conversations Data Grid (High density, zero pills)
    ├─ Routing Review Station (Instant manager triage)
    ├─ Two-Phase Import Center (Drag-and-drop preview & diff inspector)
    ├─ Audit Trail Viewer (Complete change logs)
    ├─ Export Hub (CSV/JSON generation & SHA-256 manifest inspector)
    └─ In-App 5-Slide Presentation Viewer (.pptx generator)
```

---

## 2. Ingestion & Deduplication Architecture

### Deterministic Matching Pipeline
1. **Raw Payload Ingestion**: Accepts arbitrary CSV or JSON payloads via `/api/import/preview`.
2. **Schema Sanitization**: Converts and validates data types (ISO dates, duration seconds, non-empty customer/rep strings).
3. **Classification Strategy**:
   - **Exact Duplicate**: If `source_id` exists in the database AND all payload fields match existing values identically $\to$ marked as `exact_duplicate`. Applying this batch is idempotent; zero new rows are created.
   - **Update Record**: If `source_id` exists BUT one or more fields differ $\to$ marked as `update`. Generates field-level diffs (`oldValue` vs `newValue`).
   - **Potential Duplicate**: If `source_id` is missing or novel, but `customer_name` + `rep_name` + `call_datetime` match an existing conversation $\to$ marked as `potential_duplicate` and held for manager review.
   - **Invalid Record**: Fails date parsing or required field checks $\to$ isolated with explanatory error strings without aborting valid sibling rows.
   - **New Record**: Unseen `source_id` and unique combination $\to$ marked as `new`.

### Conflict Policy for Manual Corrections
When a sales manager updates a record manually, the record is flagged with `is_manually_overridden = 1` and the manager's justification is recorded in `manual_override_reason`.
If a later import file contains older or unchanged automated data for this record:
- The system **preserves** the human manager's manual decision.
- Operational telemetry (duration, transcript) updates appropriately, while the human-validated routing and priority remain protected.

---

## 3. Explainable Rule-Based Routing Engine

The routing engine intentionally avoids opaque machine-learning "black boxes" in favor of deterministic, explainable precedence rules grounded in explicit evidence:

| Precedence | Rule Name | Trigger Criteria | Assigned Category | Priority | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P1** | Conflict Detection | Rep logged "completed" / no follow-up, but notes state customer ultimatum/cancellation | `Unclear; manual review required` | `high` | `low` |
| **P2** | Customer Concern | Outcome is `customer_escalation` or keywords (HIPAA, SLA breach, overcharge, outage) | `Customer concern or escalation` | `critical` / `high` | `high` |
| **P3** | Overdue Action Item | `follow_up_required` is true AND `follow_up_due_date` is earlier than current reference date | `Follow-up required` | `critical` | `high` |
| **P4** | Commercial Positive | Outcome is `completed_successful` AND commercial keywords (expansion, renewal, approved) | `Positive opportunity` | `high` / `medium` | `high` |
| **P5** | Standard Follow-up | `follow_up_required` is true AND due date is in the future | `Follow-up required` | `medium` | `high` |
| **P6** | Closed / Disqualified | `follow_up_required` is false AND outcome in (`completed`, `lost`, `no_show`) | `No follow-up needed` | `low` | `high` |
| **P7** | Fallback | Unclassified combination of status signals | `Unclear; manual review required` | `medium` | `low` |

Each evaluation outputs a structured `RoutingResult` containing:
- `category`: Target manager queue.
- `priority`: Urgent triage level.
- `rationale`: Plain-language explanation.
- `evidence`: Array of explicit textual quotes and date arithmetic calculations.
- `confidence`: Signal strength rating.
- `requires_human_review`: Boolean flag routing the item to the manager's action desk.

---

## 4. Cryptographic Export Pipeline

The system includes a dedicated export pipeline (`server/exporter.ts`) generating six production datasets:
1. `conversations.csv`
2. `conversations.json`
3. `attention_queue.csv`
4. `routing_decisions.csv`
5. `import_summary.csv`
6. `correction_audit.csv`

Alongside these files, the server computes a real-time `manifest.json`. For every file, the system computes:
- Exact row count.
- Byte length (`Buffer.byteLength`).
- Cryptographic SHA-256 checksum (`crypto.createHash('sha256')`).
- Generation timestamp and active filter query parameters.
This ensures external auditors and downstream data warehouses can verify zero data tampering or transmission corruption.
