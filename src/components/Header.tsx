import React from 'react';
import { TabId } from './Sidebar.js';
import { Download, RefreshCw, Upload, Shield } from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onResetDemo: () => void;
  isResetting?: boolean;
}

const tabTitles: Record<TabId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'High-level activity metrics, attention queue, and representative distribution',
  },
  conversations: {
    title: 'Conversations Register',
    subtitle: 'Searchable directory of sales calls and meetings with verified evidence',
  },
  routing: {
    title: 'Routing Review Station',
    subtitle: 'Managerial review queue for high-risk accounts and conflicting signals',
  },
  import: {
    title: 'Data Ingestion & Deduplication',
    subtitle: 'Two-phase preview and atomic ingestion with exact duplicate detection',
  },
  audit: {
    title: 'Corrections & Change Audit',
    subtitle: 'Immutable historical record of managerial overrides and batch updates',
  },
  exports: {
    title: 'Export Center & Manifests',
    subtitle: 'Downloadable standardized CSV/JSON datasets with cryptographic SHA-256 hashes',
  },
  presentation: {
    title: 'Executive Presentation Deck',
    subtitle: 'Five-slide PowerPoint analysis grounded directly in the evaluation dataset',
  },
  settings: {
    title: 'Data Dictionary & Rules Reference',
    subtitle: 'Schema constraints, routing precedence hierarchy, and conflict policies',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenImport,
  onOpenExport,
  onResetDemo,
  isResetting = false,
}) => {
  const current = tabTitles[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-6 shrink-0">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Sales Operations</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-medium">{current.title}</span>
        </div>
        <h1 className="text-sm font-semibold text-slate-900 truncate tracking-tight">
          {current.subtitle}
        </h1>
      </div>

      {/* Zone 2 & 3: Actions & Quick Links */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          title="Reset database to the clean 20-record sample dataset"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data</span>
        </button>

        <button
          onClick={onOpenImport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Import Data</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Center</span>
        </button>
      </div>
    </header>
  );
};
