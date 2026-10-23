import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { query } from './db.js';
import { Conversation, ImportBatch, AuditLogEntry, ExportManifest } from './types.js';

const EXPORTS_DIR = path.resolve(process.cwd(), 'exports');

export function ensureExportsDir(): string {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
  return EXPORTS_DIR;
}

function calculateSha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function generateAllExports(appliedFilters: Record<string, any> = {}): ExportManifest {
  ensureExportsDir();

  
  let whereClauses: string[] = [];
  let params: any[] = [];

  if (appliedFilters.rep_name && appliedFilters.rep_name !== 'all') {
    whereClauses.push('rep_name = ?');
    params.push(appliedFilters.rep_name);
  }
  if (appliedFilters.type && appliedFilters.type !== 'all') {
    whereClauses.push('type = ?');
    params.push(appliedFilters.type);
  }
  if (appliedFilters.routing_category && appliedFilters.routing_category !== 'all') {
    whereClauses.push('routing_category = ?');
    params.push(appliedFilters.routing_category);
  }
  if (appliedFilters.attention_priority && appliedFilters.attention_priority !== 'all') {
    whereClauses.push('attention_priority = ?');
    params.push(appliedFilters.attention_priority);
  }
  if (appliedFilters.outcome && appliedFilters.outcome !== 'all') {
    whereClauses.push('outcome = ?');
    params.push(appliedFilters.outcome);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const conversations = query<Conversation>(
    `SELECT * FROM conversations ${whereSql} ORDER BY call_datetime DESC`,
    params
  );

  const conversationsCsvContent = Papa.unparse(
    conversations.map(c => ({
      id: c.id,
      source_id: c.source_id,
      customer_name: c.customer_name,
      rep_name: c.rep_name,
      type: c.type,
      call_datetime: c.call_datetime,
      duration_seconds: c.duration_seconds,
      outcome: c.outcome,
      sentiment: c.sentiment || '',
      topic: c.topic,
      follow_up_required: c.follow_up_required ? 1 : 0,
      follow_up_due_date: c.follow_up_due_date || '',
      attention_priority: c.attention_priority,
      routing_category: c.routing_category,
      routing_rationale: c.routing_rationale,
      routing_confidence: c.routing_confidence,
      requires_human_review: c.requires_human_review ? 1 : 0,
      is_manually_overridden: c.is_manually_overridden ? 1 : 0,
      manual_override_reason: c.manual_override_reason || '',
      version: c.version,
      updated_at: c.updated_at,
    }))
  );
  fs.writeFileSync(path.join(EXPORTS_DIR, 'conversations.csv'), conversationsCsvContent, 'utf8');

  
  const conversationsJsonContent = JSON.stringify(conversations, null, 2);
  fs.writeFileSync(path.join(EXPORTS_DIR, 'conversations.json'), conversationsJsonContent, 'utf8');

  
  const attentionQueue = conversations.filter(
    c => c.attention_priority === 'critical' || c.attention_priority === 'high' || Boolean(c.requires_human_review)
  );
  const attentionQueueCsvContent = Papa.unparse(
    attentionQueue.map(c => ({
      priority: c.attention_priority,
      source_id: c.source_id,
      customer_name: c.customer_name,
      rep_name: c.rep_name,
      routing_category: c.routing_category,
      follow_up_due_date: c.follow_up_due_date || 'None',
      reason_for_attention: c.routing_rationale,
      evidence: c.routing_evidence,
      requires_human_review: c.requires_human_review ? 'Yes' : 'No',
    }))
  );
  fs.writeFileSync(path.join(EXPORTS_DIR, 'attention_queue.csv'), attentionQueueCsvContent, 'utf8');

  
  const routingDecisionsCsvContent = Papa.unparse(
    conversations.map(c => ({
      source_id: c.source_id,
      customer_name: c.customer_name,
      rep_name: c.rep_name,
      assigned_category: c.routing_category,
      priority: c.attention_priority,
      confidence: c.routing_confidence,
      rationale: c.routing_rationale,
      evidence: c.routing_evidence,
      is_manually_overridden: c.is_manually_overridden ? 'Yes' : 'No',
      override_reason: c.manual_override_reason || '',
      updated_at: c.updated_at,
    }))
  );
  fs.writeFileSync(path.join(EXPORTS_DIR, 'routing_decisions.csv'), routingDecisionsCsvContent, 'utf8');

  
  const batches = query<ImportBatch>('SELECT * FROM import_batches ORDER BY created_at DESC');
  const importSummaryCsvContent = Papa.unparse(batches);
  fs.writeFileSync(path.join(EXPORTS_DIR, 'import_summary.csv'), importSummaryCsvContent, 'utf8');

  
  const auditEntries = query<AuditLogEntry>('SELECT * FROM audit_log ORDER BY id DESC');
  const auditCsvContent = Papa.unparse(auditEntries);
  fs.writeFileSync(path.join(EXPORTS_DIR, 'correction_audit.csv'), auditCsvContent, 'utf8');

  
  const fileDefinitions = [
    {
      filename: 'conversations.csv',
      description: 'Tabular extract of all filtered sales conversations, metadata, and routing decisions.',
      content: conversationsCsvContent,
      row_count: conversations.length,
    },
    {
      filename: 'conversations.json',
      description: 'Structured JSON representation of sales conversations with full evidence and history.',
      content: conversationsJsonContent,
      row_count: conversations.length,
    },
    {
      filename: 'attention_queue.csv',
      description: 'Prioritized manager action queue of urgent, overdue, or escalated conversations.',
      content: attentionQueueCsvContent,
      row_count: attentionQueue.length,
    },
    {
      filename: 'routing_decisions.csv',
      description: 'Explainable routing classification table with reasons and confidence metrics.',
      content: routingDecisionsCsvContent,
      row_count: conversations.length,
    },
    {
      filename: 'import_summary.csv',
      description: 'Complete audit log of repeated batch imports, row classifications, and changes.',
      content: importSummaryCsvContent,
      row_count: batches.length,
    },
    {
      filename: 'correction_audit.csv',
      description: 'Historical audit trail of all manual corrections and system updates.',
      content: auditCsvContent,
      row_count: auditEntries.length,
    },
  ];

  const filesMeta = fileDefinitions.map(f => ({
    filename: f.filename,
    description: f.description,
    row_count: f.row_count,
    byte_size: Buffer.byteLength(f.content, 'utf8'),
    sha256_hash: calculateSha256(f.content),
  }));

  const manifest: ExportManifest = {
    export_id: `EXP-${Date.now().toString(36).toUpperCase()}`,
    generated_at: new Date().toISOString(),
    environment: 'production-applet',
    total_files: filesMeta.length,
    applied_filters: appliedFilters,
    files: filesMeta,
  };

  fs.writeFileSync(
    path.join(EXPORTS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  return manifest;
}
