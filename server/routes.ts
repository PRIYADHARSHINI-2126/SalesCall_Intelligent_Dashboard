import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { query, queryOne, run, runTransaction } from './db.js';
import { evaluateRouting } from './routing.js';
import { classifyImport, applyImport, parseRawInput } from './importer.js';
import { generateAllExports, ensureExportsDir } from './exporter.js';
import { generatePresentation } from './presentation-generator.js';
import { Conversation, AuditLogEntry, ImportBatch } from './types.js';

export const router = express.Router();

// 1. Dashboard Statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const totalRow = queryOne<{ count: number }>('SELECT count(*) as count FROM conversations');
    const total = totalRow?.count || 0;

    const typeRows = query<{ type: string; count: number }>(
      'SELECT type, count(*) as count FROM conversations GROUP BY type'
    );
    let callsCount = 0;
    let meetingsCount = 0;
    for (const r of typeRows) {
      if (r.type === 'call') callsCount = r.count;
      if (r.type === 'meeting') meetingsCount = r.count;
    }

    const attentionRow = queryOne<{ count: number }>(
      `SELECT count(*) as count FROM conversations 
       WHERE attention_priority IN ('critical', 'high') OR requires_human_review = 1`
    );
    const attentionCount = attentionRow?.count || 0;

    // Overdue follow-ups relative to today (or 2026-10-22 reference)
    const overdueRow = queryOne<{ count: number }>(
      `SELECT count(*) as count FROM conversations 
       WHERE follow_up_required = 1 AND follow_up_due_date IS NOT NULL 
       AND follow_up_due_date < '2026-10-22'`
    );
    const overdueCount = overdueRow?.count || 0;

    // Upcoming within 48h (between 2026-10-22 and 2026-10-24)
    const upcomingRow = queryOne<{ count: number }>(
      `SELECT count(*) as count FROM conversations 
       WHERE follow_up_required = 1 AND follow_up_due_date IS NOT NULL 
       AND follow_up_due_date >= '2026-10-22' AND follow_up_due_date <= '2026-10-24'`
    );
    const upcomingCount = upcomingRow?.count || 0;

    // Sentiment breakdown
    const sentimentRows = query<{ sentiment: string; count: number }>(
      'SELECT coalesce(sentiment, "neutral") as sentiment, count(*) as count FROM conversations GROUP BY sentiment'
    );
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    for (const s of sentimentRows) {
      if (s.sentiment === 'positive') positiveCount += s.count;
      else if (s.sentiment === 'negative') negativeCount += s.count;
      else neutralCount += s.count;
    }

    // Rep activity breakdown
    const repRows = query<{
      rep_name: string;
      total: number;
      calls: number;
      meetings: number;
      escalations: number;
      positive: number;
    }>(
      `SELECT 
        rep_name, 
        count(*) as total,
        sum(CASE WHEN type = 'call' THEN 1 ELSE 0 END) as calls,
        sum(CASE WHEN type = 'meeting' THEN 1 ELSE 0 END) as meetings,
        sum(CASE WHEN routing_category = 'Customer concern or escalation' THEN 1 ELSE 0 END) as escalations,
        sum(CASE WHEN routing_category = 'Positive opportunity' THEN 1 ELSE 0 END) as positive
       FROM conversations 
       GROUP BY rep_name 
       ORDER BY total DESC`
    );

    // Volume over time (grouped by day)
    const timeRows = query<{
      day: string;
      total: number;
      calls: number;
      meetings: number;
    }>(
      `SELECT 
        substr(call_datetime, 1, 10) as day,
        count(*) as total,
        sum(CASE WHEN type = 'call' THEN 1 ELSE 0 END) as calls,
        sum(CASE WHEN type = 'meeting' THEN 1 ELSE 0 END) as meetings
       FROM conversations 
       GROUP BY day 
       ORDER BY day ASC`
    );

    // Routing category distribution
    const categoryRows = query<{
      routing_category: string;
      count: number;
      critical_count: number;
    }>(
      `SELECT 
        routing_category, 
        count(*) as count,
        sum(CASE WHEN attention_priority = 'critical' THEN 1 ELSE 0 END) as critical_count
       FROM conversations 
       GROUP BY routing_category 
       ORDER BY count DESC`
    );

    // Priority review items (top 5 critical/high)
    const topAttention = query<Conversation>(
      `SELECT * FROM conversations 
       WHERE attention_priority IN ('critical', 'high') OR requires_human_review = 1
       ORDER BY CASE attention_priority 
         WHEN 'critical' THEN 1 
         WHEN 'high' THEN 2 
         WHEN 'medium' THEN 3 
         ELSE 4 END, call_datetime DESC 
       LIMIT 6`
    );

    res.json({
      total,
      callsCount,
      meetingsCount,
      attentionCount,
      overdueCount,
      upcomingCount,
      sentiment: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount,
      },
      repActivity: repRows,
      volumeOverTime: timeRows,
      categoryDistribution: categoryRows,
      topAttention,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Filtered & Paginated Conversations
router.get('/conversations', (req: Request, res: Response) => {
  try {
    const {
      search,
      rep_name,
      type,
      routing_category,
      attention_priority,
      outcome,
      follow_up_status,
      review_status,
      page = '1',
      limit = '15',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 15);
    const offset = (pageNum - 1) * limitNum;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push(
        '(customer_name LIKE ? OR rep_name LIKE ? OR summary LIKE ? OR source_id LIKE ? OR topic LIKE ?)'
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (rep_name && rep_name !== 'all') {
      whereClauses.push('rep_name = ?');
      params.push(rep_name);
    }

    if (type && type !== 'all') {
      whereClauses.push('type = ?');
      params.push(type);
    }

    if (routing_category && routing_category !== 'all') {
      whereClauses.push('routing_category = ?');
      params.push(routing_category);
    }

    if (attention_priority && attention_priority !== 'all') {
      whereClauses.push('attention_priority = ?');
      params.push(attention_priority);
    }

    if (outcome && outcome !== 'all') {
      whereClauses.push('outcome = ?');
      params.push(outcome);
    }

    if (follow_up_status === 'overdue') {
      whereClauses.push("follow_up_required = 1 AND follow_up_due_date < '2026-10-22'");
    } else if (follow_up_status === 'required') {
      whereClauses.push('follow_up_required = 1');
    } else if (follow_up_status === 'none') {
      whereClauses.push('follow_up_required = 0');
    }

    if (review_status === 'needs_review') {
      whereClauses.push('requires_human_review = 1');
    } else if (review_status === 'overridden') {
      whereClauses.push('is_manually_overridden = 1');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = queryOne<{ total: number }>(
      `SELECT count(*) as total FROM conversations ${whereSql}`,
      params
    );
    const total = countRow?.total || 0;

    const conversations = query<Conversation>(
      `SELECT * FROM conversations ${whereSql} 
       ORDER BY CASE attention_priority 
         WHEN 'critical' THEN 1 
         WHEN 'high' THEN 2 
         WHEN 'medium' THEN 3 
         ELSE 4 END, call_datetime DESC 
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      data: conversations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Single Conversation Detail
router.get('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = queryOne<Conversation>(
      'SELECT * FROM conversations WHERE id = ? OR source_id = ?',
      [id, id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation record not found' });
    }

    const auditTrail = query<AuditLogEntry>(
      'SELECT * FROM audit_log WHERE conversation_id = ? OR source_id = ? ORDER BY id DESC',
      [conversation.id, conversation.source_id]
    );

    res.json({
      conversation,
      auditTrail,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Manual Correction & Override
router.patch('/conversations/:id/correct', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      routing_category,
      attention_priority,
      customer_name,
      rep_name,
      outcome,
      follow_up_required,
      follow_up_due_date,
      reason,
      changed_by = 'Sales Manager (priyadharshinipnk987@gmail.com)',
    } = req.body;

    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({
        error: 'A substantive reason (at least 5 characters) is required to perform a manual correction.',
      });
    }

    const existing = queryOne<Conversation>(
      'SELECT * FROM conversations WHERE id = ? OR source_id = ?',
      [id, id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const now = new Date().toISOString();

    const updated = runTransaction(() => {
      // Track changed fields in audit log
      const changesToLog: Array<{ field: string; oldVal: any; newVal: any }> = [];

      if (routing_category && routing_category !== existing.routing_category) {
        changesToLog.push({
          field: 'routing_category',
          oldVal: existing.routing_category,
          newVal: routing_category,
        });
      }
      if (attention_priority && attention_priority !== existing.attention_priority) {
        changesToLog.push({
          field: 'attention_priority',
          oldVal: existing.attention_priority,
          newVal: attention_priority,
        });
      }
      if (customer_name && customer_name !== existing.customer_name) {
        changesToLog.push({
          field: 'customer_name',
          oldVal: existing.customer_name,
          newVal: customer_name,
        });
      }
      if (rep_name && rep_name !== existing.rep_name) {
        changesToLog.push({
          field: 'rep_name',
          oldVal: existing.rep_name,
          newVal: rep_name,
        });
      }
      if (outcome && outcome !== existing.outcome) {
        changesToLog.push({
          field: 'outcome',
          oldVal: existing.outcome,
          newVal: outcome,
        });
      }
      if (follow_up_required !== undefined && Boolean(follow_up_required) !== Boolean(existing.follow_up_required)) {
        changesToLog.push({
          field: 'follow_up_required',
          oldVal: existing.follow_up_required,
          newVal: follow_up_required ? 1 : 0,
        });
      }
      if (follow_up_due_date !== undefined && (follow_up_due_date || '') !== (existing.follow_up_due_date || '')) {
        changesToLog.push({
          field: 'follow_up_due_date',
          oldVal: existing.follow_up_due_date,
          newVal: follow_up_due_date,
        });
      }

      for (const chg of changesToLog) {
        run(
          `INSERT INTO audit_log (
            conversation_id, source_id, field_name, old_value, new_value,
            reason, changed_by, change_type, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            existing.id,
            existing.source_id,
            chg.field,
            String(chg.oldVal ?? ''),
            String(chg.newVal ?? ''),
            reason,
            changed_by,
            'manual_correction',
            now,
          ]
        );
      }

      // Update record and set is_manually_overridden = 1
      const newCategory = routing_category || existing.routing_category;
      const newPriority = attention_priority || existing.attention_priority;
      const newCustomer = customer_name || existing.customer_name;
      const newRep = rep_name || existing.rep_name;
      const newOutcome = outcome || existing.outcome;
      const newFollowUpReq = follow_up_required !== undefined ? (follow_up_required ? 1 : 0) : existing.follow_up_required;
      const newDueDate = follow_up_due_date !== undefined ? follow_up_due_date : existing.follow_up_due_date;

      run(
        `UPDATE conversations SET
          routing_category = ?,
          attention_priority = ?,
          customer_name = ?,
          rep_name = ?,
          outcome = ?,
          follow_up_required = ?,
          follow_up_due_date = ?,
          is_manually_overridden = 1,
          manual_override_reason = ?,
          requires_human_review = 0,
          updated_at = ?,
          version = version + 1
        WHERE id = ?`,
        [
          newCategory,
          newPriority,
          newCustomer,
          newRep,
          newOutcome,
          newFollowUpReq,
          newDueDate,
          reason,
          now,
          existing.id,
        ]
      );

      return queryOne<Conversation>('SELECT * FROM conversations WHERE id = ?', [existing.id]);
    });

    res.json({
      success: true,
      message: 'Correction saved and recorded in audit log.',
      conversation: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Import Preview
router.post('/import/preview', (req: Request, res: Response) => {
  try {
    const { content, filename = 'import_data.csv', format = 'csv' } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Payload missing raw text content for import.' });
    }

    const rows = parseRawInput(content, format);
    const preview = classifyImport(rows, filename, format);

    res.json(preview);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Import Apply
router.post('/import/apply', (req: Request, res: Response) => {
  try {
    const { preview, userEmail = 'priyadharshinipnk987@gmail.com' } = req.body;

    if (!preview || !preview.classifications) {
      return res.status(400).json({ error: 'Valid preview object required to apply import.' });
    }

    const batch = applyImport(preview, userEmail);

    res.json({
      success: true,
      batch,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Import History
router.get('/import/history', (req: Request, res: Response) => {
  try {
    const batches = query<ImportBatch>('SELECT * FROM import_batches ORDER BY created_at DESC');
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Audit Log
router.get('/audit', (req: Request, res: Response) => {
  try {
    const { conversation_id, limit = '100' } = req.query;
    let sql = 'SELECT * FROM audit_log';
    let params: any[] = [];

    if (conversation_id) {
      sql += ' WHERE conversation_id = ? OR source_id = ?';
      params.push(conversation_id, conversation_id);
    }
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit as string, 10) || 100);

    const logs = query<AuditLogEntry>(sql, params);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Generate All Exports & Manifest
router.post('/export', (req: Request, res: Response) => {
  try {
    const { filters = {} } = req.body;
    const manifest = generateAllExports(filters);
    res.json({
      success: true,
      manifest,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Download Export File
router.get('/export/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'exports', safeFilename);

    if (!fs.existsSync(filePath)) {
      // If it doesn't exist yet, trigger generation
      generateAllExports();
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Export file '${safeFilename}' not found.` });
      }
    }

    res.download(filePath, safeFilename);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Generate / Download Presentation
router.get('/presentation', async (req: Request, res: Response) => {
  try {
    const pptxPath = path.join(process.cwd(), 'presentation', 'sales-review-findings.pptx');
    if (!fs.existsSync(pptxPath)) {
      await generatePresentation(pptxPath);
    }
    res.download(pptxPath, 'sales-review-findings.pptx');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Download Sample Data Files
router.get('/sample-data/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'data', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Sample file '${safeFilename}' not found.` });
    }

    res.download(filePath, safeFilename);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Reset Demo Data
router.post('/reset-demo', (req: Request, res: Response) => {
  try {
    const sampleCsvPath = path.join(process.cwd(), 'data', 'sample_conversations.csv');
    if (!fs.existsSync(sampleCsvPath)) {
      return res.status(400).json({ error: 'Sample dataset file missing.' });
    }

    const csvContent = fs.readFileSync(sampleCsvPath, 'utf8');
    const rows = parseRawInput(csvContent, 'csv');

    runTransaction(() => {
      run('DELETE FROM conversations;');
      run('DELETE FROM import_batches;');
      run('DELETE FROM audit_log;');

      const preview = classifyImport(rows, 'sample_conversations.csv', 'csv');
      applyImport(preview, 'system_seed@enterprise.internal');
    });

    // Also update pre-generated exports
    generateAllExports({});

    res.json({
      success: true,
      message: 'Demo dataset reset successfully. 20 clean demonstration conversations seeded.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
