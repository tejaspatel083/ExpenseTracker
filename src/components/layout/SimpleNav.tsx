import React from 'react';
import { LayoutDashboard, Receipt, BarChart2, Plus } from 'lucide-react';

export type SimpleTabKey = 'dashboard' | 'transactions' | 'summary';

interface SimpleNavProps {
  activeTab: SimpleTabKey;
  setActiveTab: (tab: SimpleTabKey) => void;
  onOpenAddExpense: () => void;
}

export const SimpleNav: React.FC<SimpleNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddExpense
}) => {
  const tabs = [
    { id: 'dashboard' as SimpleTabKey, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as SimpleTabKey, label: 'Transactions', icon: Receipt },
    { id: 'summary' as SimpleTabKey, label: 'Monthly Summary', icon: BarChart2 }
  ];

  return (
    <>
      {/* Desktop Compact Top Tab Navigation */}
      <nav className="hidden sm:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2.5">
            <div className="flex space-x-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (3 Tabs + Raised Center Plus Button) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-2xl">
        <div className="grid grid-cols-4 items-center justify-around h-14 px-2">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          {/* Center Floating Plus Action */}
          <div className="flex justify-center -mt-5">
            <button
              onClick={onOpenAddExpense}
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 ring-4 ring-white dark:ring-slate-900 active:scale-95 transition"
              title="Add Expense"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'transactions' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Transactions</span>
          </button>

          {/* Tab 3: Monthly Summary */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'summary' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Summary</span>
          </button>

        </div>
      </div>
    </>
  );
};

