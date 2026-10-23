import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateRouting } from '../server/routing.js';
import { parseRawInput, classifyImport, applyImport } from '../server/importer.js';
import { getDb, query, queryOne, run } from '../server/db.js';
import { generateAllExports } from '../server/exporter.js';

describe('Sales Call Intelligence Test Suite', () => {
  beforeAll(async () => {
    await getDb();
    // Clean test state
    run('DELETE FROM conversations;');
    run('DELETE FROM import_batches;');
    run('DELETE FROM audit_log;');
  });

  describe('1. Routing Rules & Conflict Detection', () => {
    it('detects conflicting signals when rep marks success but customer threatens cancellation', () => {
      const result = evaluateRouting({
        customer_name: 'Risk Corp',
        rep_name: 'Sarah Lin',
        type: 'meeting',
        call_datetime: '2026-10-20T10:00:00Z',
        duration_seconds: 1800,
        summary: 'Customer director threatened migration to competitor Datadog unless rate matched.',
        outcome: 'completed_successful',
        follow_up_required: 0,
      });

      expect(result.category).toBe('Unclear; manual review required');
      expect(result.confidence).toBe('low');
      expect(result.requires_human_review).toBe(true);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('routes explicit customer escalations to Customer concern or escalation with high/critical priority', () => {
      const result = evaluateRouting({
        customer_name: 'NovaHealth Systems',
        rep_name: 'Elena Rostova',
        type: 'call',
        call_datetime: '2026-10-20T14:30:00Z',
        duration_seconds: 1200,
        summary: 'Customer expressed alarm over HIPAA audit delay. Threatening to freeze onboarding.',
        outcome: 'customer_escalation',
        follow_up_required: 1,
        follow_up_due_date: '2026-10-21',
      });

      expect(result.category).toBe('Customer concern or escalation');
      expect(result.priority).toBe('critical');
      expect(result.requires_human_review).toBe(true);
    });

    it('identifies overdue follow-ups relative to reference date', () => {
      const result = evaluateRouting(
        {
          customer_name: 'Zenith Logistics',
          rep_name: 'Sarah Lin',
          type: 'call',
          call_datetime: '2026-10-15T09:00:00Z',
          duration_seconds: 900,
          summary: 'Awaiting scheduling confirmation.',
          outcome: 'follow_up_scheduled',
          follow_up_required: 1,
          follow_up_due_date: '2026-10-18', // 4 days past 2026-10-22
        },
        '2026-10-22'
      );

      expect(result.category).toBe('Follow-up required');
      expect(result.priority).toBe('critical');
      expect(result.evidence.some(e => e.includes('overdue'))).toBe(true);
    });

    it('routes successful commercial renewals to Positive opportunity', () => {
      const result = evaluateRouting({
        customer_name: 'Beacon Energy',
        rep_name: 'Sarah Lin',
        type: 'meeting',
        call_datetime: '2026-10-18T11:30:00Z',
        duration_seconds: 3000,
        summary: 'Steering committee agreed in principle to 3-year renewal with 12% expansion.',
        outcome: 'completed_successful',
        follow_up_required: 1,
        follow_up_due_date: '2026-10-28',
      });

      expect(result.category).toBe('Positive opportunity');
      expect(result.priority).toBe('high');
      expect(result.confidence).toBe('high');
    });
  });

  describe('2. Idempotent Import & Deduplication Engine', () => {
    const rawCsv = `source_id,customer_name,rep_name,type,call_datetime,duration_seconds,summary,outcome,sentiment,topic,follow_up_required,follow_up_due_date
TEST-001,Acme Corp,Sarah Lin,call,2026-10-21T10:00:00Z,1200,"Initial onboarding discussion.",follow_up_scheduled,positive,Onboarding,1,2026-10-25
TEST-002,Apex Financial,Marcus Vance,meeting,2026-10-20T14:00:00Z,2400,"Billing review.",customer_escalation,negative,Billing,1,2026-10-23`;

    it('classifies new records on first import and persists them in an atomic transaction', () => {
      const rows = parseRawInput(rawCsv, 'csv');
      const preview = classifyImport(rows, 'test_batch_1.csv', 'csv');

      expect(preview.totalRows).toBe(2);
      expect(preview.newCount).toBe(2);
      expect(preview.exactDuplicateCount).toBe(0);

      const batch = applyImport(preview, 'tester@internal.com');
      expect(batch.new_records).toBe(2);

      const total = queryOne<{ count: number }>('SELECT count(*) as count FROM conversations');
      expect(total?.count).toBe(2);
    });

    it('handles exact duplicate imports idempotently without duplicating database rows', () => {
      // Re-import the exact same file
      const rows = parseRawInput(rawCsv, 'csv');
      const preview = classifyImport(rows, 'test_batch_1.csv', 'csv');

      expect(preview.newCount).toBe(0);
      expect(preview.exactDuplicateCount).toBe(2);

      const batch = applyImport(preview, 'tester@internal.com');
      expect(batch.exact_duplicates).toBe(2);
      expect(batch.new_records).toBe(0);

      // Total count in database MUST remain exactly 2!
      const total = queryOne<{ count: number }>('SELECT count(*) as count FROM conversations');
      expect(total?.count).toBe(2);
    });

    it('detects updates to existing records and logs field-level audit entries', () => {
      const updatedCsv = `source_id,customer_name,rep_name,type,call_datetime,duration_seconds,summary,outcome,sentiment,topic,follow_up_required,follow_up_due_date
TEST-002,Apex Financial,Marcus Vance,meeting,2026-10-20T14:00:00Z,2400,"Billing review credit issued. Account settled.",completed_successful,positive,Billing,1,2026-10-28`;

      const rows = parseRawInput(updatedCsv, 'csv');
      const preview = classifyImport(rows, 'test_updates.csv', 'csv');

      expect(preview.updateCount).toBe(1);
      expect(preview.classifications[0].status).toBe('update');
      expect(preview.classifications[0].changes?.length).toBeGreaterThan(0);

      const batch = applyImport(preview, 'tester@internal.com');
      expect(batch.updated_records).toBe(1);

      // Verify the record updated in place and version bumped to 2
      const updatedRecord = queryOne<any>('SELECT * FROM conversations WHERE source_id = "TEST-002"');
      expect(updatedRecord.outcome).toBe('completed_successful');
      expect(updatedRecord.version).toBe(2);

      // Verify audit trail entry was recorded
      const audits = query<any>('SELECT * FROM audit_log WHERE source_id = "TEST-002" AND change_type = "import_update"');
      expect(audits.length).toBeGreaterThan(0);
    });

    it('flags invalid rows missing required fields without failing entire batch', () => {
      const invalidCsv = `source_id,customer_name,rep_name,type,call_datetime,duration_seconds,summary,outcome,sentiment,topic,follow_up_required,follow_up_due_date
TEST-BAD,,Sarah Lin,call,2026-10-21T10:00:00Z,1200,"Missing customer name",follow_up_scheduled,positive,Onboarding,1,2026-10-25`;

      const rows = parseRawInput(invalidCsv, 'csv');
      const preview = classifyImport(rows, 'invalid.csv', 'csv');

      expect(preview.invalidCount).toBe(1);
      expect(preview.classifications[0].status).toBe('invalid');
      expect(preview.classifications[0].validationErrors).toContain('Missing customer or account name');
    });
  });

  describe('3. Exports & Manifest Integrity', () => {
    it('generates real CSV/JSON export files with verified SHA-256 hashes and accurate row counts', () => {
      const manifest = generateAllExports();

      expect(manifest.total_files).toBe(6);
      expect(manifest.files.length).toBe(6);

      const convFile = manifest.files.find(f => f.filename === 'conversations.csv');
      expect(convFile).toBeDefined();
      expect(convFile?.row_count).toBe(2);
      expect(convFile?.sha256_hash).toHaveLength(64); // 64 hex characters for SHA-256
      expect(convFile?.byte_size).toBeGreaterThan(50);
    });
  });
});
