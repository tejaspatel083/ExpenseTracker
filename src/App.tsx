import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Navigation, TabKey } from './components/layout/Navigation';
import { HouseholdDashboard } from './components/dashboard/HouseholdDashboard';
import { SheetMatrixView } from './components/sheet/SheetMatrixView';
import { TransactionList } from './components/transactions/TransactionList';
import { BudgetManager } from './components/budget/BudgetManager';
import { PaydayPlanner } from './components/planner/PaydayPlanner';
import { SavingsGoals } from './components/savings/SavingsGoals';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShieldCheck, Heart } from 'lucide-react';

const MainApplication: React.FC<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'income' | 'supabase' | 'backup'>('income');

  const handleOpenSettings = (tab: 'income' | 'supabase' | 'backup' = 'income') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  const handleTabSelect = (tab: TabKey) => {
    if (tab === 'settings') {
      handleOpenSettings('income');
    } else {
      setActiveTab(tab);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Verifying household session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Sticky Header */}
      <Header
        onOpenSettings={handleOpenSettings}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Navigation Tab Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
      />

      {/* Primary Application Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <HouseholdDashboard />}
        {activeTab === 'sheet' && <SheetMatrixView />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'budgets' && <BudgetManager />}
        {activeTab === 'planner' && <PaydayPlanner />}
        {activeTab === 'goals' && <SavingsGoals />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private Household Ledger • Tejas & Hetvi</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built for marriage finance harmony</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
            <span>• GitHub Pages & Supabase</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('household_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('household_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('household_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApplication darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
