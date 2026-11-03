import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Percent,
  Table,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import { SheetMatrixView } from '../sheet/SheetMatrixView';

export const SimpleMonthlySummary: React.FC = () => {
  const { selectedMonth, selectedScope, getStats, getMonthlyHistory, setSelectedMonth } = useFinance();
  const [viewMode, setViewMode] = useState<'summary' | 'sheet'>('summary');

  const stats = getStats(selectedMonth, selectedScope);
  const history = getMonthlyHistory(selectedScope);

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  const isSavingsMet = stats.actualSavings >= stats.plannedSavings;
  const savingsVariance = stats.actualSavings - stats.plannedSavings;

  return (
    <div className="space-y-5">
      
      {/* Top Toggle: Summary Cards vs Google Sheet View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
            Monthly Ledger
          </span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">
            {monthName} {year}
          </span>
        </div>

        {/* View Switcher Pill */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'summary'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Summary & History</span>
          </button>
          <button
            onClick={() => setViewMode('sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'sheet'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheet Grid</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {viewMode === 'sheet' ? (
        <SheetMatrixView />
      ) : (
        <>
          {/* November Summary Main Box */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {monthName} {year} Summary
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula: Income − actual expenses − actual investments = remaining money (Actual Savings).
              </p>
            </div>

            {/* Key Equation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Income</span>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {fmt(stats.income)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Expenses</span>
                <div className="text-lg sm:text-xl font-black text-rose-600 font-mono mt-0.5">
                  {fmt(stats.actualExpenses)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Investments</span>
                <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                  {fmt(stats.actualInvestments)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300">Actual Savings</span>
                <div className="text-lg sm:text-xl font-black text-teal-700 dark:text-teal-300 font-mono mt-0.5">
                  {fmt(stats.actualSavings)}
                </div>
              </div>
            </div>

            {/* Savings Rate & Planned vs Actual Comparison */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/70 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Monthly Savings Rate:
                  </span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-300 font-mono">
                    {stats.savingsRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Percentage of monthly income safely retained after all expenses & investments.
                </p>
              </div>

              {/* Planned vs Actual */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-teal-200/60 dark:border-teal-800/60 shadow-sm shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Planned Savings</div>
                  <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{fmt(stats.plannedSavings)}</div>
                </div>
                <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Actual Savings</div>
                  <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{fmt(stats.actualSavings)}</div>
                </div>
                <div className="ml-1">
                  {isSavingsMet ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      +{fmt(savingsVariance)} ahead
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      {fmt(Math.abs(savingsVariance))} short
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Monthly History Table (Sep, Oct, Nov) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Monthly History
                </h3>
                <p className="text-xs text-slate-400">
                  Click any month to view details and switch current period.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                {history.length} months logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    <th className="p-3.5">Month</th>
                    <th className="p-3.5 text-right">Income</th>
                    <th className="p-3.5 text-right">Expenses</th>
                    <th className="p-3.5 text-right">Investment</th>
                    <th className="p-3.5 text-right">Savings</th>
                    <th className="p-3.5 text-right">Savings Rate</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {history.map((row) => {
                    const isSelected = row.month === selectedMonth;
                    return (
                      <tr
                        key={row.month}
                        onClick={() => setSelectedMonth(row.month)}
                        className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                          isSelected ? 'bg-teal-50/50 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                          <span>{row.monthLabel}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-teal-600 text-white font-bold px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-800 dark:text-slate-200">
                          {fmt(row.income)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-rose-600">
                          {fmt(row.expenses)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-purple-600 dark:text-purple-400">
                          {fmt(row.investment)}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                          {fmt(row.savings)}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.savingsRate >= 20
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : row.savingsRate > 0
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {row.savingsRate}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMonth(row.month);
                            }}
                            className="text-xs text-teal-600 hover:text-teal-700 font-bold hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
