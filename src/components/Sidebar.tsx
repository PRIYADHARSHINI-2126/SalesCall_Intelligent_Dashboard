import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Route,
  UploadCloud,
  History,
  FileSpreadsheet,
  Presentation,
  Sliders,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'conversations'
  | 'routing'
  | 'import'
  | 'audit'
  | 'exports'
  | 'presentation'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  attentionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  attentionCount = 0,
}) => {
  const navItems: Array<{ id: TabId; label: string; icon: React.ComponentType<any>; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'conversations', label: 'Conversations', icon: MessageSquareText },
    { id: 'routing', label: 'Routing Review', icon: Route, badge: attentionCount > 0 ? attentionCount : undefined },
    { id: 'import', label: 'Data Import', icon: UploadCloud },
    { id: 'audit', label: 'Corrections & Audit', icon: History },
    { id: 'exports', label: 'Exports & Reports', icon: FileSpreadsheet },
    { id: 'presentation', label: 'Executive Slides', icon: Presentation },
    { id: 'settings', label: 'Data Dictionary', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Zone */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-semibold text-base">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-white whitespace-nowrap">
            Sales Call Intelligence
          </span>
          <span className="text-xs text-slate-400">Activity & Review Desk</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operator Identity & Database Status */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">SQLite Engine Active</span>
          <span className="text-slate-400 font-mono text-[10px]">· v1.4</span>
        </div>
        <div className="text-xs text-slate-300 flex flex-col">
          <span className="font-medium text-slate-200">Priyadharshini P.</span>
          <span className="text-[11px] text-slate-400 truncate">priyadharshinipnk987@gmail.com</span>
        </div>
      </div>
    </aside>
  );
};
