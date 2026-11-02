import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Budget, BudgetScope, DEFAULT_EXPENSE_CATEGORIES } from '../../types';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  ShieldAlert,
  Users,
  User,
  X
} from 'lucide-react';

export const BudgetManager: React.FC = () => {
  const { budgets, transactions, selectedMonth, addBudget, updateBudget, deleteBudget } = useFinance();
  const { currentUser } = useAuth();

  const [activeScopeFilter, setActiveScopeFilter] = useState<'all' | BudgetScope>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form states
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [scope, setScope] = useState<BudgetScope>('household');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter transactions for this month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense');

  // Compute spent amount for a budget item
  const getBudgetStatus = (b: Budget) => {
    let relevantTx = monthTransactions.filter(
      t => t.category.toLowerCase() === b.category.toLowerCase()
    );

    if (b.scope === 'Tejas') {
      relevantTx = relevantTx.filter(t => t.paidBy === 'Tejas');
    } else if (b.scope === 'Hetvi') {
      relevantTx = relevantTx.filter(t => t.paidBy === 'Hetvi');
    }

    const spent = relevantTx.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = b.amount - spent;
    const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

    let statusType: 'safe' | 'warning' | 'alert' | 'exceeded' = 'safe';
    let statusText = 'On track';
    let colorClass = 'bg-emerald-500';

    if (percentage >= 100) {
      statusType = 'exceeded';
      statusText = '🚨 Budget Exceeded!';
      colorClass = 'bg-rose-500';
    } else if (percentage >= 90) {
      statusType = 'alert';
      statusText = '⚠️ 90% reached';
      colorClass = 'bg-orange-500';
    } else if (percentage >= 75) {
      statusType = 'warning';
      statusText = '⚠️ 75% reached';
      colorClass = 'bg-amber-500';
    }

    return { spent, remaining, percentage, statusType, statusText, colorClass };
  };

  const filteredBudgets = budgets.filter(b => {
    if (activeScopeFilter === 'all') return true;
    return b.scope === activeScopeFilter;
  });

  const householdBudgets = budgets.filter(b => b.scope === 'household');
  const tejasBudgets = budgets.filter(b => b.scope === 'Tejas');
  const hetviBudgets = budgets.filter(b => b.scope === 'Hetvi');

  const handleOpenAdd = (targetScope: BudgetScope = 'household') => {
    setEditingBudget(null);
    setCategory(targetScope === 'household' ? 'Groceries' : 'Personal');
    setAmount('');
    setScope(targetScope);
    setIsModalOpen(true);
  };

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setAmount(b.amount.toString());
    setScope(b.scope);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete budget for "${name}"?`)) {
      await deleteBudget(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    setIsSubmitting(true);
    if (editingBudget) {
      await updateBudget(editingBudget.id, {
        category,
        amount: parsedAmount,
        scope,
        month: selectedMonth
      });
    } else {
      await addBudget({
        category,
        amount: parsedAmount,
        scope,
        month: selectedMonth
      });
    }
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Monthly Caps & Limits
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Household & Personal Budgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated alerts at 75%, 90%, and 100% spending thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAdd('household')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveScopeFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeScopeFilter === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Budgets ({budgets.length})
        </button>
        <button
          onClick={() => setActiveScopeFilter('household')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeScopeFilter === 'household'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Household ({householdBudgets.length})</span>
        </button>
        <button
          onClick={() => setActiveScopeFilter('Tejas')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeScopeFilter === 'Tejas'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Tejas ({tejasBudgets.length})</span>
        </button>
        <button
          onClick={() => setActiveScopeFilter('Hetvi')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeScopeFilter === 'Hetvi'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Hetvi ({hetviBudgets.length})</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBudgets.map((b) => {
          const { spent, remaining, percentage, statusType, statusText, colorClass } = getBudgetStatus(b);

          return (
            <div
              key={b.id}
              className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border transition shadow-sm relative ${
                statusType === 'exceeded'
                  ? 'border-rose-400/80 dark:border-rose-800 ring-1 ring-rose-500/20'
                  : statusType === 'alert'
                  ? 'border-orange-400/80 dark:border-orange-800'
                  : statusType === 'warning'
                  ? 'border-amber-400/80 dark:border-amber-800'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    b.scope === 'Tejas'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : b.scope === 'Hetvi'
                      ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {b.scope === 'household' ? 'Household' : `${b.scope}'s Personal`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    title="Edit budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id, b.category)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Numbers */}
              <div className="mt-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {b.category}
                </h3>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {fmt(spent)} <span className="text-xs font-normal text-slate-400">/ {fmt(b.amount)}</span>
                  </div>
                  <div className={`text-xs font-bold ${
                    statusType === 'exceeded'
                      ? 'text-rose-600 dark:text-rose-400'
                      : statusType === 'alert'
                      ? 'text-orange-600 dark:text-orange-400'
                      : statusType === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {percentage}%
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mt-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Footer Remaining / Warning */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(Math.abs(remaining))} over`}
                </span>
                <span className={`font-semibold ${
                  statusType === 'exceeded'
                    ? 'text-rose-600 dark:text-rose-400'
                    : statusType === 'alert'
                    ? 'text-orange-600 dark:text-orange-400'
                    : statusType === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as BudgetScope)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="household">Household Budget (Shared)</option>
                  <option value="Tejas">Tejas Personal Budget</option>
                  <option value="Hetvi">Hetvi Personal Budget</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DEFAULT_EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Budget Amount (CAD $) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 600"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
