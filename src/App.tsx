import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { LoginPage } from './components/auth/LoginPage';
import { SimpleHeader } from './components/layout/SimpleHeader';
import { SimpleNav, SimpleTabKey } from './components/layout/SimpleNav';
import { SimpleDashboard } from './components/dashboard/SimpleDashboard';
import { SimpleTransactions } from './components/transactions/SimpleTransactions';
import { SimpleMonthlySummary } from './components/summary/SimpleMonthlySummary';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { MonthlySetupModal } from './components/modals/MonthlySetupModal';
import { EditIncomeModal } from './components/modals/EditIncomeModal';
import { SimpleSettingsModal } from './components/modals/SimpleSettingsModal';
import { Heart, ShieldCheck } from 'lucide-react';

const MainApplication: React.FC<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SimpleTabKey>('dashboard');
  
  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isMonthlySetupOpen, setIsMonthlySetupOpen] = useState(false);
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Instant render: never block with an infinite loading screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Sticky Header with Tejas | Hetvi | Household selector, Month selector, Settings gear */}
      <SimpleHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetup={() => setIsMonthlySetupOpen(true)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main 3 Tabs Navigation (Top for desktop, Bottom for mobile) */}
      <SimpleNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8">
        {activeTab === 'dashboard' && (
          <SimpleDashboard
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenMonthlySetup={() => setIsMonthlySetupOpen(true)}
            onOpenEditIncome={() => setIsEditIncomeOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <SimpleTransactions
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {activeTab === 'summary' && (
          <SimpleMonthlySummary />
        )}
      </main>

      {/* Desktop Clean Footer */}
      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800/80 py-5 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private Household Money Ledger • Tejas & Hetvi</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with harmony</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>• GitHub Pages & Supabase</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}

      {isMonthlySetupOpen && (
        <MonthlySetupModal
          isOpen={isMonthlySetupOpen}
          onClose={() => setIsMonthlySetupOpen(false)}
        />
      )}

      {isEditIncomeOpen && (
        <EditIncomeModal
          isOpen={isEditIncomeOpen}
          onClose={() => setIsEditIncomeOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SimpleSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
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
