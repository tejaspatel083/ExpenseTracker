import React, { useState } from 'react';
import {
  LayoutDashboard,
  Table,
  Receipt,
  PieChart,
  CalendarDays,
  Target,
  BarChart3,
  Settings,
  Plus,
  MoreHorizontal,
  X
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'sheet'
  | 'transactions'
  | 'budgets'
  | 'planner'
  | 'goals'
  | 'analytics'
  | 'settings';

interface NavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onQuickAdd?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'sheet' as TabKey,
      label: 'Sheet',
      icon: Table,
      badge: '2026'
    },
    {
      id: 'transactions' as TabKey,
      label: 'Transactions',
      icon: Receipt,
      badge: null
    },
    {
      id: 'budgets' as TabKey,
      label: 'Budgets',
      icon: PieChart,
      badge: null
    },
    {
      id: 'planner' as TabKey,
      label: 'Payday Planner',
      icon: CalendarDays,
      badge: null
    },
    {
      id: 'goals' as TabKey,
      label: 'Savings Goals',
      icon: Target,
      badge: null
    },
    {
      id: 'analytics' as TabKey,
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as TabKey,
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  // Mobile More items
  const moreTabs = [
    { id: 'budgets' as TabKey, label: 'Monthly Budgets', icon: PieChart, desc: 'Caps & warning alerts' },
    { id: 'planner' as TabKey, label: 'Payday & Bill Planner', icon: CalendarDays, desc: 'Dual paycheck timeline' },
    { id: 'goals' as TabKey, label: 'Savings & Goals', icon: Target, desc: 'TFSA, vacation, emergency' },
    { id: 'analytics' as TabKey, label: 'Analytics & Trends', icon: BarChart3, desc: 'Donut & spending curves' },
    { id: 'settings' as TabKey, label: 'Income & Settings', icon: Settings, desc: 'Salaries & cloud sync' }
  ];

  return (
    <>
      {/* Desktop / Tablet Top Tabs Bar (hidden on mobile) */}
      <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (App-like native feeling for iPhone/Android) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-2xl">
        <div className="grid grid-cols-5 items-center justify-around h-14 px-1">
          
          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* 2. Sheet (2026) */}
          <button
            onClick={() => setActiveTab('sheet')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'sheet'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Table className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Sheet</span>
          </button>

          {/* 3. Center Quick Add Button (Prominent Touch Target) */}
          <div className="flex justify-center -mt-5">
            <button
              onClick={onQuickAdd}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-4 ring-white dark:ring-slate-900 active:scale-95 transition"
              title="Add Transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 4. Transactions */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ledger</span>
          </button>

          {/* 5. More (Budgets, Goals, Analytics, Settings) */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              ['budgets', 'planner', 'goals', 'analytics', 'settings'].includes(activeTab)
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>

        </div>
      </div>

      {/* Mobile "More" Slide-up Drawer */}
      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 pb-safe shadow-2xl max-h-[80vh] overflow-y-auto">
            
            {/* Grab handle */}
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Household Tools & Views
              </h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
