# Sales Call Intelligence & Activity Review Dashboard

An enterprise-grade, portfolio-quality full-stack web application designed for sales managers to review sales calls and meetings, monitor team activity, identify high-risk customer escalations, route conversations into transparent review queues, and export cryptographically verified reports.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, **Recharts**, **Node.js / Express**, and a persistent **SQLite** database.

---

## Key Features

1. **Managerial Overview Dashboard**:
   - Split metrics for total conversations, phone calls vs. scheduled meetings.
   - Live attention queue tracking critical and high-priority accounts.
   - Real-time follow-up tracking highlighting overdue deadlines and approaching commitments (<48 hours).
   - Sales representative activity distribution across volume, meeting ratio, and escalations.
   - Interactive volume-over-time trends and category distribution charts powered by Recharts.

2. **Transparent, Explainable Rule-Based Routing**:
   - Categorizes conversations into 5 practical manager queues:
     - *Customer concern or escalation*
     - *Follow-up required*
     - *Positive opportunity*
     - *No follow-up needed*
     - *Unclear; manual review required*
   - Strict precedence rules with conflict detection (catches when sales reps log "completed successfully" while customer notes contain urgent churn threats or contract breaches).
   - Exposes explicit citations and date math evidence for every routing decision (no opaque AI black boxes).

3. **Idempotent Ingestion & Duplicate Handling**:
   - Supports CSV and JSON imports with pre-import validation and row classification:
     - *New records*
     - *Exact duplicates* (safe repeated ingestion; importing unchanged data 10x creates 0 duplicates)
     - *Existing records with updates* (in-place modification with field diffs)
     - *Potential duplicates* (flags records with missing source IDs matching existing accounts)
     - *Invalid rows* (isolated without breaking the batch)
   - Atomic database transactions ensure failed batches never leave partial data.

4. **Manager Corrections & Audit Trail**:
   - Allows authorized managers to adjust routing category, priority, customer name, owner, and due dates.
   - Mandatory reason capture for any adjustment.
   - Preserves manual corrections against subsequent batch imports according to a documented conflict policy.
   - Immutable historical audit log tracking field, old value, new value, timestamp, user, and reason.

5. **Cryptographic Export Center & Manifest**:
   - Live generation of 6 standardized datasets:
     - `conversations.csv`
     - `conversations.json`
     - `attention_queue.csv`
     - `routing_decisions.csv`
     - `import_summary.csv`
     - `correction_audit.csv`
   - Real-time `manifest.json` reporting exact row counts, byte sizes, active filters, and SHA-256 cryptographic hashes for each file.

6. **Five-Slide Presentation & Demonstration Deck**:
   - Auto-generated editable `.pptx` PowerPoint file (`presentation/sales-review-findings.pptx`) with 5 dedicated slides grounded in the actual dataset.
   - Built-in slide deck viewer directly inside the web interface.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Recharts.
- **Backend**: Node.js, Express, SQL.js (WebAssembly SQLite engine with disk persistence).
- **File Handling**: Papa Parse (CSV), pptxgenjs (PowerPoint generation), Node.js `crypto` (SHA-256).
- **Testing**: Vitest for unit and integration testing.

---

## Repository Structure

```
sales-call-intelligence-dashboard/
  data/
    sample_conversations.csv     # 20 rich demonstration conversations
    sample_conversations.json    # JSON representation of sample dataset
    sample_updates.csv          # Modified records for testing update diffs
  exports/
    conversations.csv           # Full export of current state
    conversations.json
    attention_queue.csv         # Prioritized urgent items
    routing_decisions.csv       # Explanations and evidence
    import_summary.csv          # Batch ingestion audit history
    correction_audit.csv        # Field-level change log
    manifest.json               # Cryptographic manifest with SHA-256 hashes
  docs/
    README.md                   # Project overview & documentation
    data-dictionary.md          # Complete schema definition
    findings.md                 # 3 evidence-backed findings & rejected alternative
    architecture.md             # In-depth architectural & transaction design
  presentation/
    sales-review-findings.pptx  # 5-slide PowerPoint deck
  recording/
    demo-script.md              # 3-minute video narration script
  server/
    db.ts                       # SQLite database manager & transactions
    types.ts                    # TypeScript domain definitions
    routing.ts                  # Explainable routing engine
    importer.ts                 # Idempotent import & deduplication logic
    exporter.ts                 # Real-time export generator & SHA-256 manifest
    presentation-generator.ts   # PPTX slide deck compiler
    routes.ts                   # Express REST API endpoints
  src/
    components/                 # Modular UI components & drawers
    App.tsx                     # Main layout & navigation container
    main.tsx                    # Application entry point
    index.css                   # Tailwind styles
  tests/
    all.test.ts                 # Complete Vitest test suite
  server.ts                     # Full-stack server entry point (port 3000)
  package.json
  LICENSE
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (or Node.js 22 LTS)
- npm or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sales-call-intelligence-dashboard.git
cd sales-call-intelligence-dashboard

# Install dependencies
npm install
```

### Running the Application
```bash
# Starts Express server with Vite middleware on http://localhost:3000
npm run dev
```

### Running Tests
```bash
# Executes Vitest test suite (routing, deduplication, updates, manifest)
npm test
```

### Building for Production
```bash
# Builds frontend to dist/ and prepares server
npm run build
npm start
```

---

## Demonstration Workflow (Step-by-Step)

1. **Review Dashboard Overview**: Observe baseline KPIs (20 conversations, 8 in attention queue, 3 overdue follow-ups).
2. **Inspect an Urgent Item**: Click on **NovaHealth Systems** (`CONV-2026-101`) to inspect extracted evidence showing the HIPAA audit dispute.
3. **Resolve a Conflict**: In **Routing Review**, select **Horizon Media** (`CONV-2026-109`). Notice the contradiction between the rep's "completed" tag and the customer's 30% competitor ultimatum. Click **Override**, set category to `Customer concern or escalation`, enter justification, and save.
4. **Test Idempotent Deduplication**: In **Data Import**, click **Load Sample Dataset (20 records)** and click **Preview**. Observe that all 20 rows are identified as `Exact Duplicates`. Click **Apply Import** to verify 0 new records are created.
5. **Test In-Place Updates**: Click **Load Modified Records (Updates demo)**. Preview the diffs for Apex Financial, apply the update, and view the audit record in **Corrections & Audit**.
6. **Download Verified Exports**: In **Exports & Reports**, view the live `manifest.json` and download any generated report or PowerPoint slide deck.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
