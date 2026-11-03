import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Plus,
  AlertTriangle,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Edit3,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SimpleDashboardProps {
  onOpenAddExpense: () => void;
  onOpenMonthlySetup: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  onOpenAddExpense,
  onOpenMonthlySetup
}) => {
  const { selectedMonth, selectedScope, getStats, getCategoryStatuses, getMonthlyHistory, setSelectedMonth } = useFinance();

  const stats = getStats(selectedMonth, selectedScope);
  const categories = getCategoryStatuses(selectedMonth, selectedScope);
  const history = getMonthlyHistory(selectedScope);

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  // Chart 1: Allocation Donut Data
  const totalAlloc = categories.reduce((s, c) => s + c.planned, 0);
  const palette = ['#10b981', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'];
  const donutSlices = categories.map((c, i) => {
    const pct = totalAlloc > 0 ? (c.planned / totalAlloc) * 100 : 0;
    return {
      name: c.category,
      planned: c.planned,
      percentage: pct,
      color: palette[i % palette.length]
    };
  });

  // Chart 2: Spent by category (Max spent for scaling)
  const maxSpent = Math.max(...categories.map(c => c.spent), 100);

  return (
    <div className="space-y-5">
      
      {/* Month & Setup Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {selectedScope === 'household' ? 'Household Finances' : `${selectedScope}'s Dashboard`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {monthName} {year}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Income → Allocate money → Add expenses → Track savings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Monthly Setup Button */}
          <button
            onClick={onOpenMonthlySetup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Monthly Setup</span>
          </button>

          {/* Quick Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metrics (Income, Allocated, Spent, Remaining, Expected Savings) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* Income */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Income
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {fmt(stats.income)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
            Total inflow
          </span>
        </div>

        {/* Allocated */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Allocated
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {fmt(stats.allocated)}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Planned budget
          </span>
        </div>

        {/* Spent */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Spent
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-600 font-mono mt-1">
            {fmt(stats.actualExpenses)}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
            Actual costs
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Remaining
          </span>
          <div className="text-lg sm:text-xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
            {fmt(stats.remainingBudget)}
          </div>
          <span className="text-[10px] text-sky-500 font-semibold block mt-0.5">
            Available to spend
          </span>
        </div>

        {/* Expected Savings */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Expected Savings
          </span>
          <div className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">
            {fmt(stats.plannedSavings)}
          </div>
          <span className="text-[10px] text-teal-500 font-semibold block mt-0.5">
            Monthly target
          </span>
        </div>

      </div>

      {/* Categories Spending Limits & Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            Budget Categories & Spending Limits
          </h3>
          <span className="text-xs text-slate-400">
            {categories.length} categories active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isOver = cat.isOverBudget;
            const isWarn75 = cat.percentage >= 75 && cat.percentage < 90;
            const isWarn90 = cat.percentage >= 90 && !isOver;

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition ${
                  isOver
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                    : isWarn90
                    ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900'
                    : isWarn75
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {cat.category}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    cat.nature === 'investment'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : cat.nature === 'savings'
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.nature}
                  </span>
                </div>

                {/* Numbers */}
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {fmt(cat.spent)} <span className="text-xs font-normal text-slate-400">/ {fmt(cat.planned)}</span>
                  </div>
                  <span className="text-[11px] font-bold font-mono text-slate-500">
                    {cat.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : isWarn90
                        ? 'bg-orange-500'
                        : isWarn75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>

                {/* Remaining / Over Warning status */}
                <div className="mt-2 text-[11px] font-medium">
                  {isOver ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      ⚠️ Over budget by {fmt(cat.overAmount)}
                    </span>
                  ) : isWarn90 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      ⚠️ 90% reached ({fmt(cat.remaining)} left)
                    </span>
                  ) : isWarn75 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      ⚠️ 75% reached ({fmt(cat.remaining)} left)
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">
                      {fmt(cat.remaining)} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Visualizations (3 Essential Charts from specification) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Money Allocation Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-emerald-500" />
              1. Money Allocation
            </h4>
            <div className="relative flex items-center justify-center py-3">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                {(() => {
                  let acc = 0;
                  return donutSlices.map((s, idx) => {
                    const strokeDasharray = `${s.percentage * 2.387} 238.7`;
                    const strokeDashoffset = -acc * 2.387;
                    acc += s.percentage;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={s.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="none"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400">Allocated</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">{fmt(totalAlloc)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {donutSlices.slice(0, 4).map((s, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(s.planned)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Spending by Category Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-rose-500" />
              2. Spending by Category
            </h4>
            <div className="space-y-2.5 pt-2">
              {categories.slice(0, 4).map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{c.category}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(c.spent)}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (c.spent / maxSpent) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Actual costs deducted from spending limits
          </div>
        </div>

        {/* 3. Monthly Savings History Trend */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              3. Monthly Savings Trend
            </h4>

            <div className="flex items-end justify-between gap-3 h-32 pt-4 px-2">
              {history.map((h, i) => {
                const maxSav = Math.max(...history.map(x => x.savings), 1200);
                const hHeight = Math.max(10, Math.round((h.savings / maxSav) * 100));
                const isCurrent = h.month === selectedMonth;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedMonth(h.month)}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                    title={`Click to view ${h.monthLabel}`}
                  >
                    <div className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 mb-1">
                      {fmt(h.savings)}
                    </div>
                    <div
                      className={`w-full max-w-[32px] rounded-t-xl transition-all ${
                        isCurrent
                          ? 'bg-teal-500'
                          : 'bg-teal-300 dark:bg-teal-800 group-hover:bg-teal-400'
                      }`}
                      style={{ height: `${hHeight}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {h.month.split('-')[1] === '09' ? 'Sep' : h.month.split('-')[1] === '10' ? 'Oct' : 'Nov'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Click any month to view its detailed breakdown
          </div>
        </div>

      </div>

    </div>
  );
};
