import path from 'node:path';
import fs from 'node:fs';
import PptxGenJS from 'pptxgenjs';

export async function generatePresentation(outputFilePath?: string): Promise<string> {
  const presentationDir = path.resolve(process.cwd(), 'presentation');
  if (!fs.existsSync(presentationDir)) {
    fs.mkdirSync(presentationDir, { recursive: true });
  }

  const finalPath = outputFilePath || path.join(presentationDir, 'sales-review-findings.pptx');

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // Palette: Professional Slate & Navy SaaS Aesthetic
  const COLOR_BG = 'F8FAFC';
  const COLOR_PRIMARY = '0F172A'; // Slate 900
  const COLOR_ACCENT = '2563EB';  // Blue 600
  const COLOR_TEXT = '334155';    // Slate 700
  const COLOR_MUTED = '64748B';   // Slate 500
  const COLOR_CARD = 'FFFFFF';
  const COLOR_BORDER = 'E2E8F0';

  // SLIDE 1: Title & Solution Overview
  const slide1 = pptx.addSlide();
  slide1.bkgd = COLOR_BG;
  
  slide1.addText('SALES CALL INTELLIGENCE & ACTIVITY REVIEW', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Arial'
  });

  slide1.addText('Executive Review & Conversation Intelligence Architecture', {
    x: 0.8,
    y: 1.2,
    w: 8.5,
    h: 1.0,
    fontSize: 28,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  slide1.addText('A production-grade platform for sales managers to eliminate blind spots, enforce idempotent data imports, and automate explainable conversation routing.', {
    x: 0.8,
    y: 2.3,
    w: 8.5,
    h: 0.8,
    fontSize: 14,
    color: COLOR_TEXT,
    fontFace: 'Arial'
  });

  // 3 Overview Cards
  const cards1 = [
    {
      title: 'Problem Statement',
      body: 'Sales managers lack unified visibility across calls and meetings. Critical customer objections and overdue commitments get buried in unparsed notes, while repeated CRM imports cause data fragmentation.'
    },
    {
      title: 'Business Objective',
      body: 'Establish an automated review queue prioritizing high-risk accounts and commercial expansion, guarantee safe repeated data ingestion without duplication, and preserve manual overrides with complete auditability.'
    },
    {
      title: 'Architectural Solution',
      body: 'Full-stack Node.js + Express with SQLite persistence, transparent rule-based routing with explicit source evidence (no opaque black boxes), and cryptographic export manifests.'
    }
  ];

  cards1.forEach((card, idx) => {
    const cardX = 0.8 + idx * 2.85;
    slide1.addShape(pptx.ShapeType.rect, {
      x: cardX,
      y: 3.3,
      w: 2.7,
      h: 3.4,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_BORDER, width: 1 }
    });
    slide1.addText(card.title, {
      x: cardX + 0.2,
      y: 3.5,
      w: 2.3,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: 'Arial'
    });
    slide1.addText(card.body, {
      x: cardX + 0.2,
      y: 4.0,
      w: 2.3,
      h: 2.5,
      fontSize: 11,
      color: COLOR_TEXT,
      fontFace: 'Arial',
      lineSpacing: 16
    });
  });

  // SLIDE 2: Dashboard Metrics & Activity Patterns
  const slide2 = pptx.addSlide();
  slide2.bkgd = COLOR_BG;

  slide2.addText('ACTIVITY PATTERNS & METRICS', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Arial'
  });

  slide2.addText('Operational Baseline: Demonstration Dataset Analysis', {
    x: 0.8,
    y: 1.2,
    w: 8.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  const kpis = [
    { label: 'Total Ingested Conversations', val: '20 Records' },
    { label: 'Attention Queue (Critical/High)', val: '8 Records (40%)' },
    { label: 'Overdue Follow-ups', val: '3 Records' },
    { label: 'Positive Expansions/Renewals', val: '6 Records (30%)' }
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = 0.8 + idx * 2.15;
    slide2.addShape(pptx.ShapeType.rect, {
      x: kpiX,
      y: 1.9,
      w: 2.0,
      h: 1.0,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_BORDER, width: 1 }
    });
    slide2.addText(kpi.val, {
      x: kpiX + 0.1,
      y: 2.0,
      w: 1.8,
      h: 0.45,
      fontSize: 16,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: 'Arial'
    });
    slide2.addText(kpi.label, {
      x: kpiX + 0.1,
      y: 2.45,
      w: 1.8,
      h: 0.35,
      fontSize: 9,
      color: COLOR_MUTED,
      fontFace: 'Arial'
    });
  });

  // Slide 2 Detail Rows
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.1,
    w: 8.4,
    h: 3.6,
    fill: { color: COLOR_CARD },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText('Key Activity Distribution & Pipeline Observations', {
    x: 1.1,
    y: 3.3,
    w: 7.8,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  const observations = [
    '1. Meeting vs. Call Duration Asymmetry: Meetings averaged 43.8 minutes (2,630s) while phone calls averaged 23.9 minutes (1,438s). Strategic enterprise renewals were concentrated in scheduled meetings.',
    '2. Escalation Clustering: Out of 4 active escalations, 3 occurred around technical architecture (HIPAA compliance, SSO directory integration, IoT gateway telemetry disconnects), indicating integration friction.',
    '3. Representative Workload Distribution: Sarah Lin (5) and Marcus Vance (5) handled 50% of conversations, while Elena Rostova logged highest proportion of positive closes (Acme, Vanguard, Northstar).',
    '4. Follow-up Discipline Gap: 15% of records had follow-up required with missing or lapsed due dates (e.g. Zenith Logistics CONV-2026-113 past due since Oct 18).'
  ];

  observations.forEach((obs, idx) => {
    slide2.addText(obs, {
      x: 1.1,
      y: 3.8 + idx * 0.65,
      w: 7.8,
      h: 0.55,
      fontSize: 11,
      color: COLOR_TEXT,
      fontFace: 'Arial',
      lineSpacing: 14
    });
  });

  // SLIDE 3: Conversation Routing Logic & Difficult Decision
  const slide3 = pptx.addSlide();
  slide3.bkgd = COLOR_BG;

  slide3.addText('EXPLAINABLE ROUTING ENGINE', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Arial'
  });

  slide3.addText('Transparent Multi-Tier Rules & Difficult Edge Case', {
    x: 0.8,
    y: 1.2,
    w: 8.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  // Left card: Routing Hierarchy
  slide3.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.9,
    w: 4.1,
    h: 4.8,
    fill: { color: COLOR_CARD },
    line: { color: COLOR_BORDER, width: 1 }
  });
  slide3.addText('Precedence Hierarchy & Evidence Extraction', {
    x: 1.0,
    y: 2.1,
    w: 3.7,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  const rules = [
    'P1 Conflict Detection: Flags contradictory outcomes (e.g. "completed" + severe cancellation threat) directly to Unclear / Manual Review queue.',
    'P2 Escalation Rule: Matches outcome = "customer_escalation" OR keywords (outage, freeze, dispute, HIPAA) -> Priority Critical/High.',
    'P3 Follow-up Urgency: Calculates exact delta between follow_up_due_date and current time. Overdue -> Critical. <48h -> High.',
    'P4 Positive Opportunity: Completed calls with commercial expansion or renewal momentum -> Priority Medium/High.',
    'P5 Closed/Disqualified: Lost deals or standard checks without open items -> No follow-up needed (Priority Low).'
  ];
  rules.forEach((r, idx) => {
    slide3.addText(r, {
      x: 1.0,
      y: 2.5 + idx * 0.75,
      w: 3.7,
      h: 0.65,
      fontSize: 10,
      color: COLOR_TEXT,
      fontFace: 'Arial',
      lineSpacing: 13
    });
  });

  // Right card: The Difficult Routing Decision
  slide3.addShape(pptx.ShapeType.rect, {
    x: 5.1,
    y: 1.9,
    w: 4.1,
    h: 4.8,
    fill: { color: COLOR_CARD },
    line: { color: COLOR_BORDER, width: 1 }
  });
  slide3.addText('Difficult Decision: CONV-2026-109 (Horizon Media)', {
    x: 5.3,
    y: 2.1,
    w: 3.7,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: '#B91C1C', // Red accent
    fontFace: 'Arial'
  });

  const diffCase = [
    '• Source Evidence: Rep Sarah Lin tagged outcome as "completed_successful" with follow_up_required = 0.',
    '• Hidden Risk in Transcript: "Director of Operations stated competitor offered 30% lower rate card and threatened migration unless price matched by Friday."',
    '• Why Naive Rules Fail: A simple outcome-based classifier would assign this to "No follow-up needed", losing the account.',
    '• Engine Decision: Rule P1 detected conflict between "completed_successful" and cancellation risk ("threatened", "competitor"). Automatically routed to "Unclear; manual review required" with Low Confidence.',
    '• Manager Action: Manager opens record, overrides category to "Customer concern or escalation", sets Priority to "Critical", and enters audit justification.'
  ];
  diffCase.forEach((dc, idx) => {
    slide3.addText(dc, {
      x: 5.3,
      y: 2.5 + idx * 0.75,
      w: 3.7,
      h: 0.68,
      fontSize: 10,
      color: COLOR_TEXT,
      fontFace: 'Arial',
      lineSpacing: 13
    });
  });

  // SLIDE 4: Deduplication, Updates, and Auditability
  const slide4 = pptx.addSlide();
  slide4.bkgd = COLOR_BG;

  slide4.addText('DATA INTEGRITY & LIFECYCLE', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Arial'
  });

  slide4.addText('Idempotent Ingestion, Update Diffs, & Conflict Policy', {
    x: 0.8,
    y: 1.2,
    w: 8.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  const ingCards = [
    {
      title: '1. Exact Duplicate Handling',
      points: [
        'Deterministic identity matching via stable source_id.',
        'Comparing all payload fields against database state.',
        'Zero record multiplication: Importing unchanged CSV 10x yields 0 new rows.',
        'Batch status logged with exact count of unchanged records.'
      ]
    },
    {
      title: '2. Record Update & Versioning',
      points: [
        'When source_id matches but payload fields differ, the existing record is updated in place.',
        'Record version integer increments automatically (v1 -> v2).',
        'Field-level diffing logs exact oldValue -> newValue in audit_log.',
        'Maintains historical continuity without creating orphaned rows.'
      ]
    },
    {
      title: '3. Manual Correction Protection',
      points: [
        'Conflict Policy: Once a sales manager corrects routing/priority (is_manually_overridden = 1), future re-imports do NOT blindly clobber the human decision.',
        'Operational fields update while human decision remains intact.',
        'Full historical audit trail tracks who, when, old/new value, and reason.'
      ]
    }
  ];

  ingCards.forEach((c, idx) => {
    const cx = 0.8 + idx * 2.85;
    slide4.addShape(pptx.ShapeType.rect, {
      x: cx,
      y: 1.9,
      w: 2.7,
      h: 4.8,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_BORDER, width: 1 }
    });
    slide4.addText(c.title, {
      x: cx + 0.15,
      y: 2.1,
      w: 2.4,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: 'Arial'
    });
    c.points.forEach((p, pIdx) => {
      slide4.addText(p, {
        x: cx + 0.15,
        y: 2.6 + pIdx * 0.95,
        w: 2.4,
        h: 0.85,
        fontSize: 10,
        color: COLOR_TEXT,
        fontFace: 'Arial',
        lineSpacing: 14
      });
    });
  });

  // SLIDE 5: Three Evidence-Backed Findings & Rejected Decision
  const slide5 = pptx.addSlide();
  slide5.bkgd = COLOR_BG;

  slide5.addText('EVIDENCE-BACKED FINDINGS & ARCHITECTURAL DECISIONS', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: 'Arial'
  });

  slide5.addText('Three Critical Findings & One Rejected Alternative', {
    x: 0.8,
    y: 1.2,
    w: 8.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: 'Arial'
  });

  // 3 Findings
  const findings = [
    {
      num: 'Finding 1: High-Risk Compliance & Billing Bottlenecks',
      ev: 'Source IDs: CONV-2026-101 (NovaHealth HIPAA dispute), CONV-2026-102 (Apex Financial $14.2k overage). Both customers issued explicit contract freeze threats over administrative/security delays.',
      rec: 'Action: Establish cross-functional SLA requiring Legal and InfoSec bridge letters within 24 hours of escalation tagging.'
    },
    {
      num: 'Finding 2: Silent Churn Risk in Rep Self-Reporting',
      ev: 'Source ID: CONV-2026-109 (Horizon Media). Sales rep logged outcome as "completed_successful" despite customer delivering a 30% discount ultimatum by Friday.',
      rec: 'Action: Enforce conflicting-signal validation rules to automatically route contradictory summaries to manager triage.'
    },
    {
      num: 'Finding 3: Follow-Up Slippage on High-Potential Pilots',
      ev: 'Source IDs: CONV-2026-113 (Zenith Logistics - overdue since Oct 18), CONV-2026-108 (Crestline Health - 3-week SSO implementation delay).',
      rec: 'Action: Activate automated priority escalation when follow-up dates lapse by >48 hours without status change.'
    }
  ];

  findings.forEach((f, idx) => {
    const fy = 1.9 + idx * 1.25;
    slide5.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: fy,
      w: 8.4,
      h: 1.15,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_BORDER, width: 1 }
    });
    slide5.addText(f.num, {
      x: 1.0,
      y: fy + 0.1,
      w: 8.0,
      h: 0.28,
      fontSize: 11,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: 'Arial'
    });
    slide5.addText(f.ev, {
      x: 1.0,
      y: fy + 0.38,
      w: 8.0,
      h: 0.35,
      fontSize: 9.5,
      color: COLOR_TEXT,
      fontFace: 'Arial'
    });
    slide5.addText(f.rec, {
      x: 1.0,
      y: fy + 0.72,
      w: 8.0,
      h: 0.32,
      fontSize: 9.5,
      bold: true,
      color: COLOR_ACCENT,
      fontFace: 'Arial'
    });
  });

  // Rejected Decision Card
  slide5.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 5.8,
    w: 8.4,
    h: 1.0,
    fill: { color: 'FEE2E2' }, // Soft red tint
    line: { color: 'F87171', width: 1 }
  });
  slide5.addText('Rejected Architectural Decision: Fuzzy Automatic De-duplication Merging', {
    x: 1.0,
    y: 5.88,
    w: 8.0,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: '#991B1B',
    fontFace: 'Arial'
  });
  slide5.addText('Why Rejected: Automatic fuzzy matching on customer names (e.g. "Acme Corp" vs "Acme Labs" or distinct subsidiary divisions) risks silently merging unrelated sales accounts, corrupting commercial deal histories. Selected Strategy: Require exact stable source_id or flag uncertain matches into a dedicated human confirmation queue.', {
    x: 1.0,
    y: 6.13,
    w: 8.0,
    h: 0.58,
    fontSize: 8.5,
    color: '#7F1D1D',
    fontFace: 'Arial',
    lineSpacing: 12
  });

  await pptx.writeFile({ fileName: finalPath });
  return finalPath;
}
