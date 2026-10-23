import React, { useState, useEffect } from 'react';
import { Sidebar, TabId } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { OverviewView } from './components/OverviewView.js';
import { ConversationsView } from './components/ConversationsView.js';
import { RoutingReviewView } from './components/RoutingReviewView.js';
import { ImportCenterView } from './components/ImportCenterView.js';
import { AuditLogView } from './components/AuditLogView.js';
import { ExportsView } from './components/ExportsView.js';
import { PresentationView } from './components/PresentationView.js';
import { SettingsView } from './components/SettingsView.js';
import { ConversationDrawer } from './components/ConversationDrawer.js';
import { CorrectionModal } from './components/CorrectionModal.js';
import { DashboardStats, Conversation } from './types.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Modals & Drawers
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [correctionConversation, setCorrectionConversation] = useState<Conversation | null>(null);
  const [conversationsFilter, setConversationsFilter] = useState<any>({});

  const fetchStats = () => {
    setStatsLoading(true);
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load dashboard stats:', err))
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleOpenCorrection = (conv: Conversation) => {
    setCorrectionConversation(conv);
  };

  const handleCorrectionSuccess = (updated: Conversation) => {
    fetchStats();
    if (selectedConversationId === updated.id || selectedConversationId === updated.source_id) {
      // Re-trigger drawer refresh
      setSelectedConversationId(updated.id);
    }
  };

  const handleNavigateToConversations = (filter: any = {}) => {
    setConversationsFilter(filter);
    setActiveTab('conversations');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* 260px Workspace Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'conversations') {
            setConversationsFilter({});
          }
        }}
        attentionCount={stats?.attentionCount || 0}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onOpenImport={() => setActiveTab('import')}
          onOpenExport={() => setActiveTab('exports')}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              loading={statsLoading}
              onSelectConversation={handleSelectConversation}
              onNavigateToRouting={() => setActiveTab('routing')}
              onNavigateToConversations={handleNavigateToConversations}
            />
          )}

          {activeTab === 'conversations' && (
            <ConversationsView
              onSelectConversation={handleSelectConversation}
              onOpenCorrection={handleOpenCorrection}
              initialFilter={conversationsFilter}
            />
          )}

          {activeTab === 'routing' && (
            <RoutingReviewView
              onSelectConversation={handleSelectConversation}
              onOpenCorrection={handleOpenCorrection}
              onRefreshStats={fetchStats}
            />
          )}

          {activeTab === 'import' && (
            <ImportCenterView
              onImportSuccess={() => {
                fetchStats();
              }}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogView onSelectConversation={handleSelectConversation} />
          )}

          {activeTab === 'exports' && <ExportsView />}

          {activeTab === 'presentation' && <PresentationView />}

          {activeTab === 'settings' && (
            <SettingsView onResetDemo={handleResetDemo} isResetting={isResetting} />
          )}
        </main>
      </div>

      {/* Conversation Detail Drawer */}
      <ConversationDrawer
        conversationId={selectedConversationId}
        onClose={() => setSelectedConversationId(null)}
        onOpenCorrection={handleOpenCorrection}
      />

      {/* Managerial Correction Modal */}
      <CorrectionModal
        conversation={correctionConversation}
        onClose={() => setCorrectionConversation(null)}
        onSuccess={handleCorrectionSuccess}
      />
    </div>
  );
}
