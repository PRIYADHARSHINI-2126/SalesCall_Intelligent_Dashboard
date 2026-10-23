import fs from 'node:fs';
import path from 'node:path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { Conversation, ImportBatch, AuditLogEntry } from './types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'sales_call_intelligence.sqlite');

let sqlJsInstance: SqlJsStatic | null = null;
let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs();
  }

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new sqlJsInstance.Database(fileBuffer);
  } else {
    dbInstance = new sqlJsInstance.Database();
  }

  initSchema(dbInstance);
  saveDb(dbInstance);

  return dbInstance;
}

export function saveDb(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rep_name TEXT NOT NULL,
      type TEXT NOT NULL,
      call_datetime TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      summary TEXT NOT NULL,
      transcript TEXT,
      outcome TEXT NOT NULL,
      sentiment TEXT,
      topic TEXT,
      follow_up_required INTEGER NOT NULL DEFAULT 0,
      follow_up_due_date TEXT,
      attention_priority TEXT NOT NULL,
      routing_category TEXT NOT NULL,
      routing_rationale TEXT NOT NULL,
      routing_evidence TEXT NOT NULL,
      routing_confidence TEXT NOT NULL,
      requires_human_review INTEGER NOT NULL DEFAULT 0,
      is_manually_overridden INTEGER NOT NULL DEFAULT 0,
      manual_override_reason TEXT,
      source_filename TEXT NOT NULL,
      import_batch_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_source_id ON conversations (source_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations (customer_name);
    CREATE INDEX IF NOT EXISTS idx_conversations_rep ON conversations (rep_name);
    CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations (routing_category);
    CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations (attention_priority);
    CREATE INDEX IF NOT EXISTS idx_conversations_due ON conversations (follow_up_due_date);

    CREATE TABLE IF NOT EXISTS import_batches (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      file_format TEXT NOT NULL,
      total_rows INTEGER NOT NULL,
      new_records INTEGER NOT NULL,
      exact_duplicates INTEGER NOT NULL,
      updated_records INTEGER NOT NULL,
      unchanged_records INTEGER NOT NULL,
      potential_duplicates INTEGER NOT NULL,
      invalid_records INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      reason TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      change_type TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_conv_id ON audit_log (conversation_id);
    CREATE INDEX IF NOT EXISTS idx_audit_source_id ON audit_log (source_id);
  `);
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  try {
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  } finally {
    stmt.free();
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

let inTransaction = false;

export function run(sql: string, params: any[] = []): void {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  if (!inTransaction) {
    saveDb(dbInstance);
  }
}

export function runTransaction<T>(fn: () => T): T {
  if (!dbInstance) throw new Error('Database not initialized');
  if (inTransaction) {
    // Already within active transaction; execute directly
    return fn();
  }
  inTransaction = true;
  dbInstance.run('BEGIN TRANSACTION;');
  try {
    const result = fn();
    dbInstance.run('COMMIT;');
    inTransaction = false;
    saveDb(dbInstance);
    return result;
  } catch (err) {
    inTransaction = false;
    try {
      dbInstance.run('ROLLBACK;');
    } catch (rbErr) {
      // ignore rollback failure if transaction was closed
    }
    throw err;
  }
}
