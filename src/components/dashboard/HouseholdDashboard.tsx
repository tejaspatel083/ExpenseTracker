import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PlusCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { TransactionModal } from '../transactions/TransactionModal';
import { Transaction } from '../../types';

export const HouseholdDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    selectedMonth,
    selectedScope,
    setSelectedScope,
    getMonthlySummary,
    transactions,
    budgets,
    recurringExpenses,
    savingsGoals
  } = useFinance();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<'expense' | 'income'>('expense');

  const summary = getMonthlySummary(selectedMonth);

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredTransactions = monthTransactions.filter(t => {
    if (selectedScope === 'household') return true;
    return t.paidBy === selectedScope || t.paidBy === 'Shared';
  });

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  let displayIncome = summary.householdIncome;
  let displayExpenses = summary.householdExpenses;

  if (selectedScope === 'Tejas') {
    displayIncome = summary.tejasIncome;
    displayExpenses = summary.tejasExpenses + (summary.sharedExpenses / 2);
  } else if (selectedScope === 'Hetvi') {
    displayIncome = summary.hetviIncome;
    displayExpenses = summary.hetviExpenses + (summary.sharedExpenses / 2);
  }

  const displayAvailable = displayIncome - displayExpenses;
  const displaySavings = Math.max(0, displayAvailable);

  const budgetAlerts = budgets
    .filter(b => b.month === selectedMonth || b.month === 'all')
    .map(b => {
      const spent = monthTransactions
        .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        category: b.category,
        budget: b.amount,
        spent,
        percentage
      };
    })
    .filter(item => item.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage);

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  const handleOpenAdd = (type: 'expense' | 'income') => {
    setModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {monthName} {year}
            </span>
            {selectedScope !== 'household' && (
              <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
                selectedScope === 'Tejas'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                  : 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300'
              }`}>
                {selectedScope}&apos;s View
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {selectedScope === 'household' ? 'Household Finances' : `${selectedScope}'s Ledger`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedScope === 'household'
              ? 'Combined income, expenses, and savings targets.'
              : 'Individual cash flow and allocated shared bills.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-500/20 active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            onClick={() => handleOpenAdd('income')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (2x2 on phones, 4 cols on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Income
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displayIncome)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
              {selectedScope === 'household' ? 'Tejas + Hetvi' : 'Personal net'}
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Expenses
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displayExpenses)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium truncate">
              Rent, bills & food
            </div>
          </div>
        </div>

        {/* Available Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className={`text-lg sm:text-2xl lg:text-3xl font-extrabold ${
              displayAvailable >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'
            }`}>
              {fmt(displayAvailable)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-sky-600 dark:text-sky-400 font-medium truncate">
              Net balance
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displaySavings)}
            </div>
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 font-medium truncate">
              TFSA & goals
            </div>
          </div>
        </div>

      </div>

      {/* Individual Contributions Split (Income & Expense split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Income Split */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Income Contributions
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total {fmt(summary.householdIncome)}
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-slate-800 dark:text-slate-200">Tejas</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(summary.tejasIncome)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-2.5 rounded-full"
                  style={{
                    width: `${summary.householdIncome > 0 ? (summary.tejasIncome / summary.householdIncome) * 100 : 50}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-slate-800 dark:text-slate-200">Hetvi</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(summary.hetviIncome)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-pink-500 h-2.5 rounded-full"
                  style={{
                    width: `${summary.householdIncome > 0 ? (summary.hetviIncome / summary.householdIncome) * 100 : 50}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Split */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Expenses Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total {fmt(summary.householdExpenses)}
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-slate-800 dark:text-slate-200">Tejas Direct</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(summary.tejasExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.tejasExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-slate-800 dark:text-slate-200">Hetvi Direct</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(summary.hetviExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.hetviExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs sm:text-sm font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-800 dark:text-slate-200">Shared (Rent & Utilities)</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(summary.sharedExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.sharedExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Budget Alerts (if any) */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm mb-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Budget Warnings for {monthName}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {budgetAlerts.map(alert => (
              <div
                key={alert.category}
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {alert.category}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {fmt(alert.spent)} of {fmt(alert.budget)}
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                  alert.percentage >= 100
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {alert.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit trail showing creator tagging
            </p>
          </div>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Add
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No transactions found for {monthName}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span>Paid by <strong className="font-semibold text-slate-600 dark:text-slate-300">{tx.paidBy}</strong></span>
                      <span>•</span>
                      <span className={`px-1 rounded text-[10px] font-semibold ${
                        tx.createdBy === 'Tejas'
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                          : 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300'
                      }`}>
                        By {tx.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs sm:text-base font-extrabold font-mono ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {tx.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          initialType={modalDefaultType}
          onClose={() => setIsTxModalOpen(false)}
        />
      )}
    </div>
  );
};
