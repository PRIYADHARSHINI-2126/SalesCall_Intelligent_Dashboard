# Three-Minute Video Narration Script & Recording Checklist

**Project Title**: Sales Call Intelligence & Activity Review Dashboard  
**Presenter**: Senior Full-Stack Engineering Candidate  
**Target Duration**: Exactly 3 minutes (180 seconds)  
**Resolution**: 1920x1080 (1080p), 60fps recommended  

---

## Recording Checklist (Pre-Flight)

- [ ] Dev server running (`npm run dev` on port 3000) or open deployed HTTPS URL.
- [ ] Browser window sized to 1080p or maximized with clean bookmarks bar hidden.
- [ ] Audio input tested for clear voice capture with zero echo or background hum.
- [ ] Database initialized to clean demonstration state (click **Reset Demo Data** in Settings if needed).
- [ ] Downloadable test files ready on desktop:
  - `sample_conversations.csv` (20 baseline records)
  - `sample_updates.csv` (2 updated records with credit memo resolution)

---

## Timed Narration Script

### 0:00 – 0:30: Overview & Dashboard Introduction
- **Visual**: Start on the full-screen **Overview Dashboard** (`/`). Hover smoothly over the high-level KPI cards (Total Ingested: 20, Attention Queue: 8, Overdue Follow-ups: 3) and the Recharts activity graph showing volume over time.
- **Voiceover (0:00 – 0:30)**:
  > *"Hello! This is the Sales Call Intelligence Dashboard, a production-grade platform built with React, TypeScript, Express, and SQLite. It helps sales managers review sales conversations, eliminate pipeline blind spots, and ensure complete data integrity.*
  > *On our executive overview, we immediately see team activity metrics across calls and meetings, active commercial momentum, and our prioritized attention queue. Notice that out of 20 customer interactions, 8 require urgent manager attention, and 3 have overdue follow-up commitments. Every number here is computed dynamically from our persistent database."*

---

### 0:30 – 1:10: Reviewing Activity Metrics & Investigating an Attention Item
- **Visual**: Scroll down to the **Conversations Needing Attention** widget on the dashboard. Click on **NovaHealth Systems** (`CONV-2026-101`), which opens the detailed drawer. Highlight the assigned category (`Customer concern or escalation`), Priority (`Critical`), and the explicit extracted evidence block.
- **Voiceover (0:30 – 1:10)**:
  > *"Let's investigate why NovaHealth Systems is flagged as Critical. Opening the conversation drawer, we see our transparent rule engine at work.*
  > *Rather than relying on an opaque AI black-box, the engine extracts verifiable evidence directly from the source notes: the customer expressed severe alarm over a HIPAA audit delay, the CISO threatened to freeze onboarding, and the rep's follow-up commitment is already overdue. The system assigned Critical priority with High confidence and routed it directly to the manager's review queue. This gives leadership immediate, actionable context before customer churn occurs."*

---

### 1:10 – 1:50: Resolving a Difficult Routing Decision Manually
- **Visual**: Navigate to **Routing Review** in the sidebar. Select **Horizon Media** (`CONV-2026-109`). Show the conflict warning: Rep marked `completed_successful` with no follow-up, but notes state the customer received a 30% competitor discount and threatened to walk by Friday. Click **Override / Correct**. In the modal, change Routing Category to `Customer concern or escalation`, Priority to `Critical`, enter reason: *"Customer issued urgent competitor price-match ultimatum by Friday; executive discount approval needed"*, and click **Save Correction**.
- **Voiceover (1:10 – 1:50)**:
  > *"Next, let's examine a difficult routing decision: Horizon Media. The sales rep logged this meeting as 'completed successfully' with no follow-up required. A naive CRM report would assume this deal is safe.*
  > *However, our Precedence Rule 1 caught a contradiction: the customer delivered a 30% discount ultimatum from a competitor and threatened to walk by Friday.*
  > *Because the signals conflict, our engine safely categorized it as 'Unclear; manual review required'. As a manager, I can click Override, adjust the category to 'Customer concern or escalation', assign Critical priority, and record an audit explanation. When saved, the database updates the record, increments the version counter, and logs every field change into an immutable audit trail."*

---

### 1:50 – 2:30: Idempotent Duplicate Imports & Zero Record Multiplication
- **Visual**: Navigate to **Data Import** in the sidebar. Click **Load Sample Dataset (20 Records)** or upload `sample_conversations.csv`. Click **Preview Import**. Show that the preview classifies all 20 rows as `Exact Duplicates (0 New, 0 Updates)`. Click **Apply Import**. Show the batch confirmation modal with `0 new records inserted, 20 unchanged records preserved`. Switch to **Conversations** and show the total count remains strictly 20.
- **Voiceover (1:50 – 2:30)**:
  > *"Now let's demonstrate data integrity during repeated imports. In real sales organizations, reps re-export the same files or cron jobs run hourly.*
  > *Watch what happens when I re-import the exact same 20-record dataset. Our ingestion engine validates every row and classifies all 20 as Exact Duplicates.*
  > *Applying this import executes an atomic SQLite transaction. The result? Exactly 0 new records created, and 20 existing records preserved untouched. Importing the same file 10 times will never multiply records or create duplicate noise in our pipeline."*

---

### 2:30 – 3:00: Record Updates, Change History & Cryptographic Export Manifest
- **Visual**: Still in **Data Import**, click **Load Modified Records (Updates & Audit Demo)**. Show the preview highlighting row changes for Apex Financial (`CONV-2026-102`). Apply the import. Navigate to **Corrections & Audit** to show the field diffs (`old_value` $\to$ `new_value`). Finally, navigate to **Exports & Reports**, show the live `manifest.json` with SHA-256 hashes and row counts, and click **Download Attention Queue (CSV)** and **Download Presentation (PPTX)**.
- **Voiceover (2:30 – 3:00)**:
  > *"What happens when an existing record changes? I'll import our updates file. The system detects that Apex Financial resolved their billing credit dispute. It updates the record in place, increments the version, and preserves our earlier manual corrections according to our conflict policy.*
  > *In the Audit History tab, we see a complete chronological ledger of what changed, who changed it, the exact old and new values, and the justification.*
  > *Finally, our Export Center generates complete CSV and JSON packages accompanied by a verified manifest.json containing row counts and cryptographic SHA-256 checksums, plus an auto-generated 5-slide PowerPoint deck.*
  > *This is Sales Call Intelligence: reliable, explainable, and built for real-world sales operations. Thank you!"*
