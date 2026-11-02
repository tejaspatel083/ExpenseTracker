import React from 'react';
import {
  LayoutDashboard,
  Table,
  Receipt,
  PieChart,
  CalendarDays,
  Target,
  BarChart3,
  Settings
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
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'sheet' as TabKey,
      label: 'Monthly Sheet',
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
      label: 'Settings & Income',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
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
  );
};
