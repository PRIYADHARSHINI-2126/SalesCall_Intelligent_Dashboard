export type ConversationType = 'call' | 'meeting';

export type OutcomeType =
  | 'completed_successful'
  | 'follow_up_scheduled'
  | 'objection_raised'
  | 'customer_escalation'
  | 'no_show'
  | 'lost'
  | 'pending';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type RoutingCategory =
  | 'Customer concern or escalation'
  | 'Follow-up required'
  | 'Positive opportunity'
  | 'No follow-up needed'
  | 'Unclear; manual review required';

export type RoutingConfidence = 'high' | 'medium' | 'low';

export interface Conversation {
  id: string;
  source_id: string;
  customer_name: string;
  rep_name: string;
  type: ConversationType;
  call_datetime: string;
  duration_seconds: number;
  summary: string;
  transcript?: string | null;
  outcome: OutcomeType;
  sentiment: SentimentType | null;
  topic: string;
  follow_up_required: number;
  follow_up_due_date: string | null;
  attention_priority: PriorityLevel;
  routing_category: RoutingCategory;
  routing_rationale: string;
  routing_evidence: string; // JSON array string
  routing_confidence: RoutingConfidence;
  requires_human_review: number;
  is_manually_overridden: number;
  manual_override_reason: string | null;
  source_filename: string;
  import_batch_id: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ImportBatch {
  id: string;
  filename: string;
  file_format: 'csv' | 'json';
  total_rows: number;
  new_records: number;
  exact_duplicates: number;
  updated_records: number;
  unchanged_records: number;
  potential_duplicates: number;
  invalid_records: number;
  status: 'applied' | 'preview' | 'failed';
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  conversation_id: string;
  source_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  changed_by: string;
  change_type: 'manual_correction' | 'import_update' | 'initial_import';
  timestamp: string;
}

export interface ImportRowClassification {
  rowIndex: number;
  source_id: string;
  customer_name: string;
  rep_name: string;
  type: ConversationType;
  call_datetime: string;
  summary: string;
  outcome: OutcomeType;
  status: 'new' | 'exact_duplicate' | 'update' | 'potential_duplicate' | 'invalid';
  validationErrors?: string[];
  changes?: Array<{ field: string; oldValue: any; newValue: any }>;
  matchingId?: string;
  rowRawData: any;
}

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

export interface ExportManifest {
  export_id: string;
  generated_at: string;
  environment: string;
  total_files: number;
  applied_filters: Record<string, any>;
  files: Array<{
    filename: string;
    description: string;
    row_count: number;
    byte_size: number;
    sha256_hash: string;
  }>;
}

export interface DashboardStats {
  total: number;
  callsCount: number;
  meetingsCount: number;
  attentionCount: number;
  overdueCount: number;
  upcomingCount: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  repActivity: Array<{
    rep_name: string;
    total: number;
    calls: number;
    meetings: number;
    escalations: number;
    positive: number;
  }>;
  volumeOverTime: Array<{
    day: string;
    total: number;
    calls: number;
    meetings: number;
  }>;
  categoryDistribution: Array<{
    routing_category: string;
    count: number;
    critical_count: number;
  }>;
  topAttention: Conversation[];
}
