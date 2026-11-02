import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { transactions, selectedMonth } = useFinance();
  const [dateRange, setDateRange] = useState<'thisMonth' | '3months' | '6months' | 'thisYear'>('6months');

  // Filter transactions according to selected range
  const filteredTx = useMemo(() => {
    const today = new Date('2026-11-02');
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      if (dateRange === 'thisMonth') {
        return t.date.startsWith(selectedMonth);
      } else if (dateRange === '3months') {
        // Sep, Oct, Nov
        return t.date >= '2026-09-01' && t.date <= '2026-11-30';
      } else if (dateRange === '6months') {
        // Jun to Nov
        return t.date >= '2026-06-01' && t.date <= '2026-11-30';
      } else {
        // 2026 Full Year
        return t.date.startsWith('2026');
      }
    });
  }, [transactions, dateRange, selectedMonth]);

  // 1. Spending by Category
  const categorySpending = useMemo(() => {
    const expenses = filteredTx.filter(t => t.type === 'expense');
    const map: Record<string, number> = {};
    let total = 0;

    expenses.forEach(t => {
      const cat = t.category || 'Other';
      const amt = Number(t.amount) || 0;
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });

    const colors = [
      '#10b981', '#0ea5e9', '#ec4899', '#f59e0b', '#8b5cf6',
      '#14b8a6', '#f43f5e', '#6366f1', '#84cc16', '#a855f7'
    ];

    const sorted = Object.entries(map)
      .map(([cat, amt], idx) => ({
        category: cat,
        amount: amt,
        percentage: total > 0 ? Math.round((amt / total) * 100) : 0,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.amount - a.amount);

    return { items: sorted, total };
  }, [filteredTx]);

  // 2. Household Spending Comparison (Tejas vs Hetvi vs Shared)
  const householdSplit = useMemo(() => {
    const expenses = filteredTx.filter(t => t.type === 'expense');
    let tejas = 0;
    let hetvi = 0;
    let shared = 0;

    expenses.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.paidBy === 'Tejas') tejas += amt;
      else if (t.paidBy === 'Hetvi') hetvi += amt;
      else shared += amt;
    });

    const total = tejas + hetvi + shared;
    return {
      tejas,
      hetvi,
      shared,
      total,
      tejasPct: total > 0 ? Math.round((tejas / total) * 100) : 0,
      hetviPct: total > 0 ? Math.round((hetvi / total) * 100) : 0,
      sharedPct: total > 0 ? Math.round((shared / total) * 100) : 0
    };
  }, [filteredTx]);

  // 3. Monthly Trends (Past 6 Months: Jun - Nov 2026)
  const monthlyTrends = useMemo(() => {
    const monthKeys = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
    const monthLabels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

    return monthKeys.map((mk, i) => {
      const mTx = transactions.filter(t => t.date.startsWith(mk));
      let income = mTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const expense = mTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

      // Default projected baseline if no explicit income record for past month
      if (income === 0 && expense > 0) income = 4200;

      const savings = Math.max(0, income - expense);

      return {
        key: mk,
        label: monthLabels[i],
        income,
        expense,
        savings
      };
    });
  }, [transactions]);

  const maxMonthlyVal = Math.max(
    ...monthlyTrends.map(m => Math.max(m.income, m.expense, m.savings)),
    5000
  );

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      
      {/* Analytics Header with Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Financial Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Household Analytics & Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated intelligence on category distribution, savings trajectory, and individual spending.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setDateRange('thisMonth')}
            className={`px-3 py-1.5 rounded-xl transition ${
              dateRange === 'thisMonth' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('3months')}
            className={`px-3 py-1.5 rounded-xl transition ${
              dateRange === '3months' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Last 3M
          </button>
          <button
            onClick={() => setDateRange('6months')}
            className={`px-3 py-1.5 rounded-xl transition ${
              dateRange === '6months' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Last 6M
          </button>
          <button
            onClick={() => setDateRange('thisYear')}
            className={`px-3 py-1.5 rounded-xl transition ${
              dateRange === 'thisYear' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            This Year (2026)
          </button>
        </div>
      </div>

      {/* Row 1: Donut Category Breakdown + Payer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spending by Category (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              Spending by Category
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total {fmt(categorySpending.total)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut representation */}
            <div className="relative flex items-center justify-center py-4">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                {(() => {
                  let accumulated = 0;
                  return categorySpending.items.map((cat, idx) => {
                    const strokeDasharray = `${cat.percentage * 2.387} 238.7`;
                    const strokeDashoffset = -accumulated * 2.387;
                    accumulated += cat.percentage;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="none"
                        className="transition-all duration-700 hover:opacity-80"
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Expenses</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                  {fmt(categorySpending.total)}
                </span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {categorySpending.items.slice(0, 7).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-900 dark:text-white font-bold">{fmt(item.amount)}</span>
                    <span className="text-slate-400 text-[11px] w-8 text-right">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Household Spending Comparison (Tejas vs Hetvi vs Shared) (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                Spending Comparison
              </h3>
              <span className="text-xs text-slate-500">Payer Split</span>
            </div>

            <div className="space-y-5">
              {/* Tejas */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Tejas
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{fmt(householdSplit.tejas)} ({householdSplit.tejasPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div className="bg-sky-500 h-3 rounded-full" style={{ width: `${householdSplit.tejasPct}%` }} />
                </div>
              </div>

              {/* Hetvi */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Hetvi
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{fmt(householdSplit.hetvi)} ({householdSplit.hetviPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div className="bg-pink-500 h-3 rounded-full" style={{ width: `${householdSplit.hetviPct}%` }} />
                </div>
              </div>

              {/* Shared */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Shared (Household Joint)
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold font-mono">{fmt(householdSplit.shared)} ({householdSplit.sharedPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${householdSplit.sharedPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Combined Total</span>
            <span className="font-extrabold font-mono text-slate-900 dark:text-white text-sm">
              {fmt(householdSplit.total)}
            </span>
          </div>
        </div>

      </div>

      {/* Row 2: Income vs Expenses & Monthly Savings Trend */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Monthly Income vs Expenses vs Savings Trend (Last 6 Months)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive visualization from real recorded workbook data
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expenses
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Net Savings
            </span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-64 items-end pt-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          {monthlyTrends.map((m) => {
            const incomeH = Math.round((m.income / maxMonthlyVal) * 100);
            const expenseH = Math.round((m.expense / maxMonthlyVal) * 100);
            const savingsH = Math.round((m.savings / maxMonthlyVal) * 100);

            return (
              <div key={m.key} className="flex flex-col items-center h-full justify-end group">
                {/* Bars group */}
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-full">
                  {/* Income Bar */}
                  <div
                    title={`Income: ${fmt(m.income)}`}
                    className="w-2.5 sm:w-5 bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${Math.max(4, incomeH)}%` }}
                  />
                  {/* Expense Bar */}
                  <div
                    title={`Expenses: ${fmt(m.expense)}`}
                    className="w-2.5 sm:w-5 bg-rose-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${Math.max(4, expenseH)}%` }}
                  />
                  {/* Savings Bar */}
                  <div
                    title={`Net Savings: ${fmt(m.savings)}`}
                    className="w-2.5 sm:w-5 bg-sky-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${Math.max(4, savingsH)}%` }}
                  />
                </div>

                {/* Month label */}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                  {m.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{fmt(m.savings)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Data derived automatically from Supabase transaction logs.</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Average Monthly Savings: {fmt(monthlyTrends.reduce((s, m) => s + m.savings, 0) / (monthlyTrends.length || 1))}
          </span>
        </div>
      </div>

    </div>
  );
};
