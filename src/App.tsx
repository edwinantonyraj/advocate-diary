import React, { useState, useEffect } from 'react';
import { AppState, Case, Client, FeeTransaction } from './types';
import { loadAppState, saveAppState, resetAppState } from './data/initialData';
import { getDueSoonCases, triggerDueSoonNotifications } from './utils/hearingAlerts';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DailyCauseList } from './components/DailyCauseList';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { CaseList } from './components/CaseList';
import { ClientList } from './components/ClientList';
import { FeeLedger } from './components/FeeLedger';
import { AiLegalAssistant } from './components/AiLegalAssistant';
import { DataImporter } from './components/DataImporter';
import { CaseDetailsModal } from './components/CaseDetailsModal';
import { AddCaseModal } from './components/AddCaseModal';
import { DueSoonAlertModal } from './components/DueSoonAlertModal';
import { EmailRemindersModal } from './components/EmailRemindersModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState<boolean>(false);
  const [isDueSoonAlertsOpen, setIsDueSoonAlertsOpen] = useState<boolean>(false);
  const [isEmailRemindersOpen, setIsEmailRemindersOpen] = useState<boolean>(false);
  const [selectedCaseForAi, setSelectedCaseForAi] = useState<Case | null>(null);

  // Auto-persist changes to local storage and check for notifications
  useEffect(() => {
    saveAppState(appState);
    triggerDueSoonNotifications(appState.cases);
  }, [appState]);

  // Handler to update or save a case
  const handleSaveCase = (savedCase: Case) => {
    setAppState((prev) => {
      const existsIndex = prev.cases.findIndex((c) => c.id === savedCase.id);
      let newCases = [...prev.cases];
      if (existsIndex >= 0) {
        newCases[existsIndex] = savedCase;
      } else {
        newCases = [savedCase, ...newCases];
      }
      return { ...prev, cases: newCases };
    });

    if (selectedCase && selectedCase.id === savedCase.id) {
      setSelectedCase(savedCase);
    }
  };

  // Delete case handler
  const handleDeleteCase = (caseId: string) => {
    setAppState((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => c.id !== caseId),
    }));
    setSelectedCase(null);
  };

  // Add Client handler
  const handleAddClient = (newClient: Client): Client => {
    setAppState((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
    }));
    return newClient;
  };

  // Add Fee Transaction handler
  const handleAddTransaction = (newTx: FeeTransaction) => {
    setAppState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  // Update Case Paid Fee
  const handleUpdateCaseFee = (caseId: string, paidFee: number) => {
    setAppState((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => (c.id === caseId ? { ...c, paidFee } : c)),
    }));
  };

  // Import WordPress / PC Exe converted cases and clients
  const handleImportData = (importedCases: Case[], importedClients: Client[]) => {
    setAppState((prev) => {
      const mergedCases = [...importedCases, ...prev.cases];
      const mergedClients = [...importedClients, ...prev.clients];
      return {
        ...prev,
        cases: mergedCases,
        clients: mergedClients,
      };
    });
    setActiveTab('cause-list');
  };

  // Reset sample data
  const handleResetData = () => {
    const freshState = resetAppState();
    setAppState(freshState);
  };

  // Counts
  const todayCount = appState.cases.filter((c) => c.nextHearingDate === appState.selectedDate).length;
  const dueSoonCases = getDueSoonCases(appState.cases);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDate={appState.selectedDate}
        todayCount={todayCount}
        dueSoonCount={dueSoonCases.length}
        onOpenDueSoonAlerts={() => setIsDueSoonAlertsOpen(true)}
        onOpenEmailReminders={() => setIsEmailRemindersOpen(true)}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden px-3 pt-3 pb-24">
        {activeTab === 'cause-list' && (
          <DailyCauseList
            cases={appState.cases}
            selectedDate={appState.selectedDate}
            onDateChange={(date) => setAppState((prev) => ({ ...prev, selectedDate: date }))}
            onSelectCase={(caseItem) => setSelectedCase(caseItem)}
            onOpenAddCase={() => setIsAddCaseOpen(true)}
            onOpenAiDraft={(caseItem) => {
              setSelectedCaseForAi(caseItem);
              setActiveTab('ai');
            }}
            searchQuery={searchQuery}
            onSwitchToMonthlyView={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'calendar' && (
          <MonthlyCalendar
            cases={appState.cases}
            selectedDate={appState.selectedDate}
            onDateChange={(date) => setAppState((prev) => ({ ...prev, selectedDate: date }))}
            onSelectCase={(caseItem) => setSelectedCase(caseItem)}
            onOpenAddCase={() => setIsAddCaseOpen(true)}
            onSwitchToDailyView={() => setActiveTab('cause-list')}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'cases' && (
          <CaseList
            cases={appState.cases}
            onSelectCase={(caseItem) => setSelectedCase(caseItem)}
            onOpenAddCase={() => setIsAddCaseOpen(true)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'clients' && (
          <ClientList
            clients={appState.clients}
            cases={appState.cases}
            onAddClient={handleAddClient}
            onSelectCase={(caseItem) => setSelectedCase(caseItem)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'fees' && (
          <FeeLedger
            cases={appState.cases}
            transactions={appState.transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateCaseFee={handleUpdateCaseFee}
          />
        )}

        {activeTab === 'ai' && (
          <AiLegalAssistant
            cases={appState.cases}
            selectedCaseForAi={selectedCaseForAi}
          />
        )}

        {activeTab === 'import' && (
          <DataImporter
            onImportData={handleImportData}
            currentCases={appState.cases}
            currentClients={appState.clients}
          />
        )}
      </main>

      {/* Modals */}
      <CaseDetailsModal
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
        onSaveCase={handleSaveCase}
        onDeleteCase={handleDeleteCase}
        onOpenAiDraft={(caseItem) => {
          setSelectedCaseForAi(caseItem);
          setSelectedCase(null);
          setActiveTab('ai');
        }}
      />

      <AddCaseModal
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        onSaveCase={handleSaveCase}
        clients={appState.clients}
        onAddClient={handleAddClient}
      />

      <DueSoonAlertModal
        isOpen={isDueSoonAlertsOpen}
        onClose={() => setIsDueSoonAlertsOpen(false)}
        cases={appState.cases}
        onSelectCase={(caseItem) => setSelectedCase(caseItem)}
      />

      <EmailRemindersModal
        isOpen={isEmailRemindersOpen}
        onClose={() => setIsEmailRemindersOpen(false)}
        cases={appState.cases}
        clients={appState.clients}
      />

      {/* Mobile Bottom Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddCase={() => setIsAddCaseOpen(true)}
      />
    </div>
  );
}
