import Papa from 'papaparse';
import { evaluateRouting } from './routing.js';
import { query, queryOne, run, runTransaction } from './db.js';
import { Conversation, ImportBatch, ImportRowClassification, AuditLogEntry } from './types.js';

export interface ImportPreviewResult {
  batchId: string;
  filename: string;
  format: 'csv' | 'json';
  totalRows: number;
  newCount: number;
  exactDuplicateCount: number;
  updateCount: number;
  potentialDuplicateCount: number;
  invalidCount: number;
  classifications: ImportRowClassification[];
}

export function parseRawInput(content: string, format: 'csv' | 'json'): any[] {
  if (format === 'json') {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON import must be an array of conversation objects.');
    }
    return parsed;
  } else {
    const parseResult = Papa.parse(content, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
    });
    if (parseResult.errors && parseResult.errors.length > 0) {
      const fatalErrors = parseResult.errors.filter(e => e.type !== 'FieldMismatch');
      if (fatalErrors.length > 0) {
        throw new Error(`CSV parsing error: ${fatalErrors[0].message} on row ${fatalErrors[0].row}`);
      }
    }
    return parseResult.data as any[];
  }
}

export function classifyImport(
  rows: any[],
  filename: string,
  format: 'csv' | 'json'
): ImportPreviewResult {
  const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const classifications: ImportRowClassification[] = [];

  let newCount = 0;
  let exactDuplicateCount = 0;
  let updateCount = 0;
  let potentialDuplicateCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const validationErrors: string[] = [];

    // Clean field values
    const sourceId = (raw.source_id || raw.sourceId || raw.id || '').toString().trim();
    const customerName = (raw.customer_name || raw.customerName || raw.account_name || '').toString().trim();
    const repName = (raw.rep_name || raw.repName || raw.sales_rep || raw.owner || '').toString().trim();
    const typeStr = (raw.type || raw.conversation_type || 'call').toString().trim().toLowerCase();
    const callDatetime = (raw.call_datetime || raw.callDatetime || raw.date || raw.datetime || '').toString().trim();
    const durationSeconds = Number(raw.duration_seconds || raw.durationSeconds || raw.duration || 0);
    const summary = (raw.summary || raw.notes || raw.description || '').toString().trim();
    const outcome = (raw.outcome || 'follow_up_scheduled').toString().trim().toLowerCase();
    const sentiment = raw.sentiment ? raw.sentiment.toString().trim().toLowerCase() : null;
    const topic = (raw.topic || 'General').toString().trim();
    const followUpRequiredRaw = raw.follow_up_required ?? raw.followUpRequired;
    const followUpRequired = followUpRequiredRaw === true || followUpRequiredRaw === 1 || String(followUpRequiredRaw).toLowerCase() === 'true' || String(followUpRequiredRaw) === '1';
    const followUpDueDate = (raw.follow_up_due_date || raw.followUpDueDate || '').toString().trim() || null;

    // Validate required fields
    if (!customerName) validationErrors.push('Missing customer or account name');
    if (!repName) validationErrors.push('Missing sales representative name');
    if (!callDatetime || isNaN(Date.parse(callDatetime))) validationErrors.push('Missing or invalid ISO call date/time');
    if (durationSeconds < 0 || isNaN(durationSeconds)) validationErrors.push('Duration must be a non-negative number of seconds');
    if (!summary) validationErrors.push('Missing conversation summary');

    if (validationErrors.length > 0) {
      invalidCount++;
      classifications.push({
        rowIndex: i + 1,
        source_id: sourceId || `ROW-${i + 1}`,
        customer_name: customerName || '(Unknown)',
        rep_name: repName || '(Unknown)',
        type: (typeStr === 'meeting' ? 'meeting' : 'call'),
        call_datetime: callDatetime,
        summary: summary || '(Empty summary)',
        outcome: (outcome as any),
        status: 'invalid',
        validationErrors,
        rowRawData: raw,
      });
      continue;
    }

    const type = typeStr === 'meeting' ? 'meeting' : 'call';

    if (sourceId) {
      const existing = queryOne<Conversation>(
        'SELECT * FROM conversations WHERE source_id = ?',
        [sourceId]
      );

      if (existing) {
        
        const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

        if (existing.customer_name !== customerName) {
          changes.push({ field: 'customer_name', oldValue: existing.customer_name, newValue: customerName });
        }
        if (existing.rep_name !== repName) {
          changes.push({ field: 'rep_name', oldValue: existing.rep_name, newValue: repName });
        }
        if (existing.type !== type) {
          changes.push({ field: 'type', oldValue: existing.type, newValue: type });
        }
        if (existing.summary !== summary) {
          changes.push({ field: 'summary', oldValue: existing.summary, newValue: summary });
        }
        if (existing.outcome !== outcome) {
          changes.push({ field: 'outcome', oldValue: existing.outcome, newValue: outcome });
        }
        if (existing.topic !== topic) {
          changes.push({ field: 'topic', oldValue: existing.topic, newValue: topic });
        }
        if (Boolean(existing.follow_up_required) !== followUpRequired) {
          changes.push({ field: 'follow_up_required', oldValue: Boolean(existing.follow_up_required), newValue: followUpRequired });
        }
        if ((existing.follow_up_due_date || '') !== (followUpDueDate || '')) {
          changes.push({ field: 'follow_up_due_date', oldValue: existing.follow_up_due_date, newValue: followUpDueDate });
        }

        if (changes.length === 0) {
          exactDuplicateCount++;
          classifications.push({
            rowIndex: i + 1,
            source_id: sourceId,
            customer_name: customerName,
            rep_name: repName,
            type,
            call_datetime: callDatetime,
            summary,
            outcome: (outcome as any),
            status: 'exact_duplicate',
            matchingId: existing.id,
            rowRawData: raw,
          });
        } else {
          updateCount++;
          classifications.push({
            rowIndex: i + 1,
            source_id: sourceId,
            customer_name: customerName,
            rep_name: repName,
            type,
            call_datetime: callDatetime,
            summary,
            outcome: (outcome as any),
            status: 'update',
            matchingId: existing.id,
            changes,
            rowRawData: raw,
          });
        }
        continue;
      }
    } else {
      
      const dateOnly = callDatetime.slice(0, 10);
      const potentialMatch = queryOne<Conversation>(
        'SELECT * FROM conversations WHERE customer_name = ? AND rep_name = ? AND substr(call_datetime, 1, 10) = ?',
        [customerName, repName, dateOnly]
      );

      if (potentialMatch) {
        potentialDuplicateCount++;
        classifications.push({
          rowIndex: i + 1,
          source_id: `POTENTIAL-${potentialMatch.source_id}`,
          customer_name: customerName,
          rep_name: repName,
          type,
          call_datetime: callDatetime,
          summary,
          outcome: (outcome as any),
          status: 'potential_duplicate',
          matchingId: potentialMatch.id,
          validationErrors: [
            `No source_id provided. Matches existing record '${potentialMatch.source_id}' (${potentialMatch.customer_name} on ${dateOnly}). Manual confirmation required to avoid accidental duplicate or false merge.`
          ],
          rowRawData: raw,
        });
        continue;
      }
    }

    
    newCount++;
    classifications.push({
      rowIndex: i + 1,
      source_id: sourceId || `GEN-${Date.now().toString(36)}-${i}`,
      customer_name: customerName,
      rep_name: repName,
      type,
      call_datetime: callDatetime,
      summary,
      outcome: (outcome as any),
      status: 'new',
      rowRawData: raw,
    });
  }

  return {
    batchId,
    filename,
    format,
    totalRows: rows.length,
    newCount,
    exactDuplicateCount,
    updateCount,
    potentialDuplicateCount,
    invalidCount,
    classifications,
  };
}

export function applyImport(
  preview: ImportPreviewResult,
  userEmail: string = 'priyadharshinipnk987@gmail.com'
): ImportBatch {
  return runTransaction<ImportBatch>(() => {
    const now = new Date().toISOString();
    let insertedCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;

    for (const item of preview.classifications) {
      if (item.status === 'invalid' || item.status === 'potential_duplicate') {
       
        continue;
      }

      if (item.status === 'exact_duplicate') {
        unchangedCount++;
        continue; 
      }

      const raw = item.rowRawData;
      const sourceId = item.source_id;
      const customerName = item.customer_name;
      const repName = item.rep_name;
      const type = item.type;
      const callDatetime = item.call_datetime;
      const durationSeconds = Number(raw.duration_seconds || raw.durationSeconds || raw.duration || 0);
      const summary = item.summary;
      const outcome = item.outcome;
      const sentiment = raw.sentiment ? String(raw.sentiment).trim().toLowerCase() : null;
      const topic = (raw.topic || 'General').toString().trim();
      const followUpRequired = raw.follow_up_required === true || raw.follow_up_required === 1 || String(raw.follow_up_required).toLowerCase() === 'true' || String(raw.follow_up_required) === '1' ? 1 : 0;
      const followUpDueDate = (raw.follow_up_due_date || raw.followUpDueDate || '').toString().trim() || null;

      
      const routing = evaluateRouting({
        source_id: sourceId,
        customer_name: customerName,
        rep_name: repName,
        type,
        call_datetime: callDatetime,
        duration_seconds: durationSeconds,
        summary,
        outcome,
        sentiment,
        topic,
        follow_up_required: followUpRequired,
        follow_up_due_date: followUpDueDate,
      });

      if (item.status === 'new') {
        const internalId = `CONV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

        run(
          `INSERT INTO conversations (
            id, source_id, customer_name, rep_name, type, call_datetime, duration_seconds,
            summary, transcript, outcome, sentiment, topic, follow_up_required, follow_up_due_date,
            attention_priority, routing_category, routing_rationale, routing_evidence,
            routing_confidence, requires_human_review, is_manually_overridden, manual_override_reason,
            source_filename, import_batch_id, created_at, updated_at, version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            internalId,
            sourceId,
            customerName,
            repName,
            type,
            callDatetime,
            durationSeconds,
            summary,
            raw.transcript || null,
            outcome,
            sentiment,
            topic,
            followUpRequired,
            followUpDueDate,
            routing.priority,
            routing.category,
            routing.rationale,
            JSON.stringify(routing.evidence),
            routing.confidence,
            routing.requires_human_review ? 1 : 0,
            0,
            null,
            preview.filename,
            preview.batchId,
            now,
            now,
            1,
          ]
        );

        // Record initial creation in audit log
        run(
          `INSERT INTO audit_log (
            conversation_id, source_id, field_name, old_value, new_value,
            reason, changed_by, change_type, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            internalId,
            sourceId,
            'initial_import',
            null,
            'Record created',
            `Imported via batch ${preview.batchId} (${preview.filename})`,
            userEmail,
            'initial_import',
            now,
          ]
        );

        insertedCount++;
      } else if (item.status === 'update') {
        const existing = queryOne<Conversation>(
          'SELECT * FROM conversations WHERE source_id = ?',
          [sourceId]
        );

        if (existing) {
          // Check conflict policy:
          // If the record was previously manually corrected (is_manually_overridden = 1),
          // preserve the manual routing override and only update the non-overridden operational fields
          const isManual = Boolean(existing.is_manually_overridden);
          const finalCategory = isManual ? existing.routing_category : routing.category;
          const finalPriority = isManual ? existing.attention_priority : routing.priority;
          const finalRationale = isManual
            ? `${existing.routing_rationale} [Preserved manual override: ${existing.manual_override_reason || 'Manager correction'}]`
            : routing.rationale;

          // Record audit log entries for changed fields
          if (item.changes && item.changes.length > 0) {
            for (const chg of item.changes) {
              run(
                `INSERT INTO audit_log (
                  conversation_id, source_id, field_name, old_value, new_value,
                  reason, changed_by, change_type, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  existing.id,
                  sourceId,
                  chg.field,
                  String(chg.oldValue ?? ''),
                  String(chg.newValue ?? ''),
                  `Updated via batch ${preview.batchId} (${preview.filename})`,
                  userEmail,
                  'import_update',
                  now,
                ]
              );
            }
          }

          run(
            `UPDATE conversations SET
              customer_name = ?,
              rep_name = ?,
              type = ?,
              summary = ?,
              outcome = ?,
              sentiment = ?,
              topic = ?,
              follow_up_required = ?,
              follow_up_due_date = ?,
              attention_priority = ?,
              routing_category = ?,
              routing_rationale = ?,
              routing_evidence = ?,
              routing_confidence = ?,
              requires_human_review = ?,
              source_filename = ?,
              import_batch_id = ?,
              updated_at = ?,
              version = version + 1
            WHERE source_id = ?`,
            [
              customerName,
              repName,
              type,
              summary,
              outcome,
              sentiment,
              topic,
              followUpRequired,
              followUpDueDate,
              finalPriority,
              finalCategory,
              finalRationale,
              JSON.stringify(routing.evidence),
              routing.confidence,
              routing.requires_human_review ? 1 : 0,
              preview.filename,
              preview.batchId,
              now,
              sourceId,
            ]
          );

          updatedCount++;
        }
      }
    }

    const batchRecord: ImportBatch = {
      id: preview.batchId,
      filename: preview.filename,
      file_format: preview.format,
      total_rows: preview.totalRows,
      new_records: insertedCount,
      exact_duplicates: unchangedCount,
      updated_records: updatedCount,
      unchanged_records: unchangedCount,
      potential_duplicates: preview.potentialDuplicateCount,
      invalid_records: preview.invalidCount,
      status: 'applied',
      created_at: now,
    };

    run(
      `INSERT INTO import_batches (
        id, filename, file_format, total_rows, new_records,
        exact_duplicates, updated_records, unchanged_records,
        potential_duplicates, invalid_records, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batchRecord.id,
        batchRecord.filename,
        batchRecord.file_format,
        batchRecord.total_rows,
        batchRecord.new_records,
        batchRecord.exact_duplicates,
        batchRecord.updated_records,
        batchRecord.unchanged_records,
        batchRecord.potential_duplicates,
        batchRecord.invalid_records,
        batchRecord.status,
        batchRecord.created_at,
      ]
    );

    return batchRecord;
  });
}
