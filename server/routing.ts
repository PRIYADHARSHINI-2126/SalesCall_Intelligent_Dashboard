import { OutcomeType, PriorityLevel, RoutingCategory, RoutingConfidence, RoutingResult } from './types.js';

interface InputRecord {
  source_id?: string;
  customer_name: string;
  rep_name: string;
  type: string;
  call_datetime: string;
  duration_seconds: number;
  summary: string;
  outcome: OutcomeType;
  sentiment?: string | null;
  topic?: string;
  follow_up_required: boolean | number;
  follow_up_due_date?: string | null;
}

export function evaluateRouting(record: InputRecord, referenceDateStr: string = '2026-10-22'): RoutingResult {
  const summaryLower = (record.summary || '').toLowerCase();
  const topicLower = (record.topic || '').toLowerCase();
  const outcome = record.outcome;
  const followUpRequired = Boolean(Number(record.follow_up_required));
  const dueDateStr = record.follow_up_due_date ? String(record.follow_up_due_date).trim() : null;

  const evidence: string[] = [];
  
  // Keyword indicators
  const escalationKeywords = [
    'threatened',
    'freeze onboarding',
    'dispute',
    'overcharge',
    'sla breach',
    'outage',
    'disconnect',
    'alarm',
    'delay',
    'emergency',
    'hipaa',
    'cancellation',
    'competitor',
    'lower rate card',
    'walk'
  ];

  const positiveKeywords = [
    'expansion',
    'approval',
    'approved',
    'renewal',
    'signed',
    'budget release',
    'purchase order',
    'rollout plan',
    'momentum',
    'deal close'
  ];

  const matchedEscalationTerms = escalationKeywords.filter(k => summaryLower.includes(k) || topicLower.includes(k));
  const matchedPositiveTerms = positiveKeywords.filter(k => summaryLower.includes(k) || topicLower.includes(k));

  // 1. Conflict Detection Rule (Precedence 1)
  // Example: Rep logged "completed_successful" or follow_up_required = 0, but summary describes severe customer threat or competitor ultimatum
  const hasSevereThreatInSummary = matchedEscalationTerms.some(t => ['threatened', 'freeze onboarding', 'competitor', 'walk', 'lower rate card'].includes(t));
  if (hasSevereThreatInSummary && (outcome === 'completed_successful' || !followUpRequired)) {
    evidence.push(`Conflicting signals detected: Rep recorded outcome '${outcome}' with follow-up flag=${followUpRequired}, but summary contains critical threat/risk: "${matchedEscalationTerms.join(', ')}".`);
    evidence.push(`Source summary excerpt: "${record.summary.slice(0, 140)}..."`);
    return {
      category: 'Unclear; manual review required',
      priority: 'high',
      rationale: 'Conflict between reported outcome and text narrative. Rep reported successful/no follow-up, but customer communicated an explicit risk or threat.',
      evidence,
      confidence: 'low',
      requires_human_review: true,
    };
  }

  // Also check if calendar was marked "no_show", but call duration was significant (> 15 min) with detailed discussion
  if (outcome === 'no_show' && record.duration_seconds > 600) {
    evidence.push(`Meeting recorded as 'no_show' but logged call duration is ${Math.round(record.duration_seconds / 60)} minutes with substantive discussion.`);
    return {
      category: 'Unclear; manual review required',
      priority: 'medium',
      rationale: 'Logged call outcome contradicts duration metadata (marked as no-show but conversation took place).',
      evidence,
      confidence: 'low',
      requires_human_review: true,
    };
  }

  // 2. Customer Concern or Escalation Rule (Precedence 2)
  if (outcome === 'customer_escalation' || matchedEscalationTerms.length > 0) {
    let priority: PriorityLevel = 'high';
    if (summaryLower.includes('freeze') || summaryLower.includes('hipaa') || summaryLower.includes('outage') || summaryLower.includes('dispute')) {
      priority = 'critical';
    }

    if (outcome === 'customer_escalation') {
      evidence.push(`Outcome explicitly tagged as 'customer_escalation'.`);
    }
    if (matchedEscalationTerms.length > 0) {
      evidence.push(`Detected escalation indicators in topic/summary: [${matchedEscalationTerms.join(', ')}].`);
    }
    if (dueDateStr) {
      evidence.push(`Follow-up committed by ${dueDateStr}.`);
    }

    return {
      category: 'Customer concern or escalation',
      priority,
      rationale: `Customer raised active grievances or technical/contractual obstacles (${matchedEscalationTerms.slice(0, 3).join(', ') || 'escalation reported'}) requiring management oversight.`,
      evidence,
      confidence: 'high',
      requires_human_review: true,
    };
  }

  // 3. Overdue Follow-up Rule (Urgent Action Required)
  let isOverdue = false;
  let isUrgent = false;
  let diffDays = 999;

  if (followUpRequired && dueDateStr) {
    const dueDate = new Date(dueDateStr);
    const refDate = new Date(referenceDateStr);
    const diffMs = dueDate.getTime() - refDate.getTime();
    diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      isOverdue = true;
    } else if (diffDays <= 2) {
      isUrgent = true;
    }
  }

  if (followUpRequired && isOverdue) {
    evidence.push(`Action item was due on ${dueDateStr} (${Math.abs(diffDays)} days overdue relative to current date ${referenceDateStr}).`);
    if (record.topic) {
      evidence.push(`Conversation topic: '${record.topic}'.`);
    }
    return {
      category: 'Follow-up required',
      priority: 'critical',
      rationale: 'Overdue follow-up deadline requires immediate manager intervention.',
      evidence,
      confidence: 'high',
      requires_human_review: true,
    };
  }

  // 4. Positive Opportunity Rule (Commercial Expansions & Renewals)
  if (outcome === 'completed_successful' && (matchedPositiveTerms.length > 0 || record.sentiment === 'positive')) {
    let priority: PriorityLevel = 'medium';
    if (summaryLower.includes('renewal') || summaryLower.includes('expansion') || summaryLower.includes('deal close')) {
      priority = 'high';
      evidence.push(`High commercial value milestone: renewal or multi-seat expansion discussion.`);
    }
    evidence.push(`Call outcome marked '${outcome}' with positive commercial indicators: [${matchedPositiveTerms.join(', ') || 'favorable sentiment'}].`);
    if (followUpRequired && dueDateStr) {
      evidence.push(`Next milestone follow-up scheduled for ${dueDateStr}.`);
    }

    return {
      category: 'Positive opportunity',
      priority,
      rationale: `Successful conversation demonstrating commercial growth, renewal momentum, or customer expansion interest.`,
      evidence,
      confidence: 'high',
      requires_human_review: false,
    };
  }

  // 5. Standard Follow-up Required Rule (Scheduled / Upcoming)
  if (followUpRequired) {
    let priority: PriorityLevel = isUrgent ? 'high' : 'medium';

    if (dueDateStr) {
      if (isUrgent) {
        evidence.push(`Action item due within 48 hours (due date: ${dueDateStr}).`);
      } else {
        evidence.push(`Follow-up scheduled for ${dueDateStr}.`);
      }
    } else {
      evidence.push(`Follow-up flagged as required, but no explicit due date was assigned by the sales representative.`);
      priority = 'high'; // Missing due date when follow-up is required needs prompt attention
    }

    if (record.topic) {
      evidence.push(`Conversation topic: '${record.topic}'.`);
    }

    return {
      category: 'Follow-up required',
      priority,
      rationale: isUrgent
        ? `High-priority follow-up approaching deadline within 48 hours.`
        : `Active action item scheduled for completion.`,
      evidence,
      confidence: 'high',
      requires_human_review: false,
    };
  }

  // 5. No Follow-up Needed Rule (Precedence 5)
  if (!followUpRequired && (outcome === 'completed_successful' || outcome === 'lost' || outcome === 'no_show')) {
    evidence.push(`Follow-up flag is false and outcome is '${outcome}'.`);
    if (record.topic) {
      evidence.push(`Topic: '${record.topic}'.`);
    }
    return {
      category: 'No follow-up needed',
      priority: 'low',
      rationale: `Conversation concluded normally or was disqualified with no open deliverables or manager escalation.`,
      evidence,
      confidence: 'high',
      requires_human_review: false,
    };
  }

  // 6. Fallback Rule (Precedence 6)
  evidence.push(`Source record lacks sufficient unambiguous signals to classify automatically.`);
  return {
    category: 'Unclear; manual review required',
    priority: 'medium',
    rationale: `Incomplete or non-standard combination of outcome (${outcome}), follow-up state, and discussion topics.`,
    evidence,
    confidence: 'low',
    requires_human_review: true,
  };
}
