# Sales Call Intelligence Dashboard — Data Dictionary

This document defines the schema, data types, database constraints, business validations, and lifecycle rules for all entities managed by the Sales Call Intelligence Dashboard.

---

## 1. Entity: `conversations`

Stores all ingested sales calls and meetings, extracted metadata, calculated routing classifications, and managerial overrides.

| Field Name | Type | SQLite Constraint | Description | Example / Allowed Values |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique internal surrogate identifier generated upon ingestion. | `CONV-M9G21-A7K` |
| `source_id` | `TEXT` | `NOT NULL UNIQUE` | Natural/external stable record ID from telephony/CRM system. | `CONV-2026-101` |
| `customer_name` | `TEXT` | `NOT NULL` | Account or company name involved in the conversation. | `NovaHealth Systems` |
| `rep_name` | `TEXT` | `NOT NULL` | Sales representative who conducted the conversation. | `Elena Rostova`, `Sarah Lin` |
| `type` | `TEXT` | `NOT NULL` | Communication medium. | `'call'`, `'meeting'` |
| `call_datetime` | `TEXT` | `NOT NULL` | ISO 8601 UTC timestamp of call initiation. | `2026-10-20T14:30:00Z` |
| `duration_seconds` | `INTEGER` | `NOT NULL CHECK (duration_seconds >= 0)` | Total duration in seconds. | `1850` (~31 minutes) |
| `summary` | `TEXT` | `NOT NULL` | Structured narrative or notes recorded by rep or transcription service. | Free text |
| `transcript` | `TEXT` | `NULLABLE` | Verbatim text transcript or conversational excerpts. | Free text or `NULL` |
| `outcome` | `TEXT` | `NOT NULL` | Documented status outcome. | `'completed_successful'`, `'follow_up_scheduled'`, `'objection_raised'`, `'customer_escalation'`, `'no_show'`, `'lost'`, `'pending'` |
| `sentiment` | `TEXT` | `NULLABLE` | Evidenced sentiment rating. Null when no explicit proof exists. | `'positive'`, `'neutral'`, `'negative'`, `'mixed'`, or `NULL` |
| `topic` | `TEXT` | `NOT NULL DEFAULT 'General'` | Primary commercial or technical subject matter. | `'Security & Compliance'`, `'Pricing & Discount'`, `'Contract Renewal'`, `'Implementation Delay'` |
| `follow_up_required` | `INTEGER` | `NOT NULL DEFAULT 0` | Boolean indicator (0 = False, 1 = True) for outstanding action items. | `0` or `1` |
| `follow_up_due_date` | `TEXT` | `NULLABLE` | Target completion date formatted as `YYYY-MM-DD`. | `2026-10-21` or `NULL` |
| `attention_priority` | `TEXT` | `NOT NULL` | Triage priority assigned by rule engine or manager. | `'critical'`, `'high'`, `'medium'`, `'low'` |
| `routing_category` | `TEXT` | `NOT NULL` | Target manager workflow queue. | `'Customer concern or escalation'`, `'Follow-up required'`, `'Positive opportunity'`, `'No follow-up needed'`, `'Unclear; manual review required'` |
| `routing_rationale` | `TEXT` | `NOT NULL` | Plain-language explanation for why the record was routed to this queue. | *"Overdue follow-up deadline requires immediate manager intervention."* |
| `routing_evidence` | `TEXT` | `NOT NULL` | JSON array of explicit citations and keyword extractions from source. | `["Action item was due on 2026-10-21 (1 days overdue)", "Outcome tagged as customer_escalation"]` |
| `routing_confidence` | `TEXT` | `NOT NULL` | Algorithmic confidence based on signal clarity. | `'high'`, `'medium'`, `'low'` |
| `requires_human_review` | `INTEGER` | `NOT NULL DEFAULT 0` | Flag (0/1) indicating whether manager confirmation is mandatory. | `0` or `1` |
| `is_manually_overridden`| `INTEGER` | `NOT NULL DEFAULT 0` | Flag (0/1) indicating whether a human manager adjusted the system decision. | `0` or `1` |
| `manual_override_reason`| `TEXT` | `NULLABLE` | Mandatory justification entered by manager when overriding values. | *"Overrode rep classification: customer issued price match ultimatum."* |
| `source_filename` | `TEXT` | `NOT NULL` | Name of the file from which this record was ingested. | `sample_conversations.csv` |
| `import_batch_id` | `TEXT` | `NOT NULL` | Foreign key referencing the `import_batches` log. | `BATCH-M9G20-X81` |
| `created_at` | `TEXT` | `NOT NULL` | Ingestion timestamp in ISO 8601 UTC. | `2026-10-22T21:00:00.000Z` |
| `updated_at` | `TEXT` | `NOT NULL` | Most recent modification timestamp in ISO 8601 UTC. | `2026-10-22T21:15:30.000Z` |
| `version` | `INTEGER` | `NOT NULL DEFAULT 1` | Optimistic concurrency version counter. Increments on update. | `1`, `2`, `3`... |

---

## 2. Entity: `import_batches`

Tracks every batch import operation for auditability, idempotent repeat execution, and volume reporting.

| Field Name | Type | SQLite Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Batch run identifier (`BATCH-<timestamp>-<hash>`). |
| `filename` | `TEXT` | `NOT NULL` | Original filename uploaded by the user. |
| `file_format` | `TEXT` | `NOT NULL` | Ingestion format: `'csv'` or `'json'`. |
| `total_rows` | `INTEGER` | `NOT NULL` | Total raw rows parsed from the upload. |
| `new_records` | `INTEGER` | `NOT NULL` | Count of brand new conversation records created. |
| `exact_duplicates` | `INTEGER` | `NOT NULL` | Count of identical existing records skipped (idempotent). |
| `updated_records` | `INTEGER` | `NOT NULL` | Count of existing records modified in place. |
| `unchanged_records` | `INTEGER` | `NOT NULL` | Count of records matching existing state exactly. |
| `potential_duplicates` | `INTEGER` | `NOT NULL` | Count of rows flagged for uncertain identity matching. |
| `invalid_records` | `INTEGER` | `NOT NULL` | Count of rows rejected due to schema/validation errors. |
| `status` | `TEXT` | `NOT NULL` | Status of run: `'applied'`, `'preview'`, or `'failed'`. |
| `created_at` | `TEXT` | `NOT NULL` | Timestamp when the batch was executed. |

---

## 3. Entity: `audit_log`

Maintains an immutable historical record of all field-level adjustments caused by manual manager corrections or incremental batch imports.

| Field Name | Type | SQLite Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Monotonically increasing audit log sequence ID. |
| `conversation_id` | `TEXT` | `NOT NULL` | Internal ID of the modified conversation. |
| `source_id` | `TEXT` | `NOT NULL` | External source ID of the modified conversation. |
| `field_name` | `TEXT` | `NOT NULL` | Name of the column modified (`routing_category`, `outcome`, etc.). |
| `old_value` | `TEXT` | `NULLABLE` | Serialized previous value prior to modification. |
| `new_value` | `TEXT` | `NULLABLE` | Serialized updated value. |
| `reason` | `TEXT` | `NOT NULL` | Manager justification or automated batch summary note. |
| `changed_by` | `TEXT` | `NOT NULL` | Email or user identity of the editor. |
| `change_type` | `TEXT` | `NOT NULL` | Operation type: `'manual_correction'`, `'import_update'`, or `'initial_import'`. |
| `timestamp` | `TEXT` | `NOT NULL` | ISO 8601 UTC timestamp of change execution. |

---

## 4. Entity: `manifest.json`

Metadata manifest generated alongside every export package to certify row counts, applied filter parameters, and cryptographic data integrity.

| JSON Key | Type | Description |
| :--- | :--- | :--- |
| `export_id` | `string` | Unique run identifier for the export bundle (`EXP-<id>`). |
| `generated_at` | `string` | ISO 8601 timestamp of package generation. |
| `environment` | `string` | Hosting runtime (`production-applet`). |
| `total_files` | `number` | Count of bundled files (typically 6 files). |
| `applied_filters` | `object` | Key-value dictionary of filters applied at generation time. |
| `files` | `array` | Array of file descriptors: `filename`, `description`, `row_count`, `byte_size`, and `sha256_hash`. |
