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

  // Month label formatting
  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  // Filter transactions for display based on scope
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredTransactions = monthTransactions.filter(t => {
    if (selectedScope === 'household') return true;
    return t.paidBy === selectedScope || t.paidBy === 'Shared';
  });

  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Calculate scope-specific numbers
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

  // Budget alerts calculation
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

  // Formatter
  const fmt = (val: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  const handleOpenAdd = (type: 'expense' | 'income') => {
    setModalDefaultType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Scope Pills */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {monthName} {year} Overview
            </span>
            {selectedScope !== 'household' && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                selectedScope === 'Tejas'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                  : 'bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300'
              }`}>
                {selectedScope}&apos;s View
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {selectedScope === 'household' ? 'Combined Household Ledger' : `${selectedScope}'s Personal Finance`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {selectedScope === 'household'
              ? 'Shared living expenses, dual incomes, and joint savings goals.'
              : `Showing individual cash flow and assigned portion of shared expenses.`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {selectedScope === 'household' ? 'Household Income' : `${selectedScope} Income`}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displayIncome)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Projected & verified net salary</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {selectedScope === 'household' ? 'Household Expenses' : `${selectedScope} Expenses`}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displayExpenses)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Rent, utilities & discretionary</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition" />
        </div>

        {/* Available Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Cash
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-extrabold ${
              displayAvailable >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {fmt(displayAvailable)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-medium">
              <span>{Math.round((displayAvailable / (displayIncome || 1)) * 100)}% retained after bills</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition" />
        </div>

        {/* Savings Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Surplus
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {fmt(displaySavings)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Allocated to TFSA & emergency</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl group-hover:bg-teal-500/10 transition" />
        </div>

      </div>

      {/* Individual Contributions Section (As explicitly requested in the prompt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Split */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Income Contributions
            </h3>
            <span className="text-xs text-slate-500">
              Total {fmt(summary.householdIncome)}
            </span>
          </div>

          <div className="space-y-4">
            {/* Tejas */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="text-slate-800 dark:text-slate-200">Tejas</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(summary.tejasIncome)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-sky-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.householdIncome > 0 ? (summary.tejasIncome / summary.householdIncome) * 100 : 50}%`
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Senior Software Engineer</span>
                <span>{summary.householdIncome > 0 ? Math.round((summary.tejasIncome / summary.householdIncome) * 100) : 0}% of household</span>
              </div>
            </div>

            {/* Hetvi */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-slate-800 dark:text-slate-200">Hetvi</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(summary.hetviIncome)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.householdIncome > 0 ? (summary.hetviIncome / summary.householdIncome) * 100 : 50}%`
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Financial Analyst</span>
                <span>{summary.householdIncome > 0 ? Math.round((summary.hetviIncome / summary.householdIncome) * 100) : 0}% of household</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Split */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Expenses Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Total {fmt(summary.householdExpenses)}
            </span>
          </div>

          <div className="space-y-4">
            {/* Tejas */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                  <span className="text-slate-800 dark:text-slate-200">Tejas Direct</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(summary.tejasExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-2.5 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.tejasExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Hetvi */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-slate-800 dark:text-slate-200">Hetvi Direct</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(summary.hetviExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-pink-500 h-2.5 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.hetviExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Shared */}
            <div>
              <div className="flex justify-between items-center text-sm font-semibold mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-800 dark:text-slate-200">Shared (Rent, Utilities, Household)</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{fmt(summary.sharedExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-2.5 rounded-full"
                  style={{
                    width: `${summary.householdExpenses > 0 ? (summary.sharedExpenses / summary.householdExpenses) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Budget Alerts Section (if any exceeded or near 75%/90%) */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Budget Utilization Warnings for {monthName}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgetAlerts.map(alert => (
              <div
                key={alert.category}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {alert.category}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {fmt(alert.spent)} of {fmt(alert.budget)}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-xl text-xs font-bold ${
                  alert.percentage >= 100
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : alert.percentage >= 90
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {alert.percentage}% used
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity with "Added by" Tagging */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Showing created-by audit trail for mutual transparency
            </p>
          </div>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>+ Quick Add</span>
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No transactions found for {monthName} {year}.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    tx.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{tx.description}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {tx.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Paid by <strong className="text-slate-700 dark:text-slate-300 font-medium">{tx.paidBy}</strong>
                      </span>
                      <span>•</span>
                      {/* Added by requirement */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-medium ${
                        tx.createdBy === 'Tejas'
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                          : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                      }`}>
                        Added by {tx.createdBy}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm sm:text-base font-extrabold ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tx.paymentMethod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
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
