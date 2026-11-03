import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { SavingsGoal, GoalOwner } from '../../types';
import {
  Target,
  Plus,
  Sparkles,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  Users,
  User,
  Heart
} from 'lucide-react';

export const SavingsGoals: React.FC = () => {
  const { savingsGoals, selectedScope, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToGoal } = useFinance();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | GoalOwner>(selectedScope === 'household' ? 'all' : selectedScope);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Sync with selected scope tab
  React.useEffect(() => {
    if (selectedScope === 'household') {
      setActiveFilter('all');
    } else {
      setActiveFilter(selectedScope);
    }
  }, [selectedScope]);

  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [owner, setOwner] = useState<GoalOwner>('household');
  const [category, setCategory] = useState('Investment');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredGoals = savingsGoals.filter(g => {
    if (activeFilter === 'all') return true;
    return g.owner === activeFilter;
  });

  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('2027-12-31');
    setOwner('household');
    setCategory('General');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate);
    setOwner(goal.owner);
    setCategory(goal.category);
    setNotes(goal.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteSavingsGoal(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }

    setIsSubmitting(true);
    if (editingGoal) {
      await updateSavingsGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        owner,
        category,
        notes: notes.trim()
      });
    } else {
      await addSavingsGoal({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        owner,
        category,
        notes: notes.trim()
      });
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    await depositToGoal(depositModalGoal.id, amt);
    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Wealth Targets
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Savings & Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Emergency funds, vacation dreams, TFSA targets, and personal goals.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Combined Family Milestones</span>
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold mt-1">
              {fmt(totalSaved)}
              <span className="text-xs sm:text-base font-normal text-emerald-200 ml-1.5">of {fmt(totalTarget)} target</span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
              {overallPercentage}% of combined targets achieved
            </p>
          </div>

          <div className="w-full sm:w-64 bg-black/20 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Overall Progress</span>
              <span>{overallPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Scrollable on phones) */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeFilter === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          All ({savingsGoals.length})
        </button>
        <button
          onClick={() => setActiveFilter('household')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            activeFilter === 'household'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Shared</span>
        </button>
        <button
          onClick={() => setActiveFilter('Tejas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            activeFilter === 'Tejas'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Tejas</span>
        </button>
        <button
          onClick={() => setActiveFilter('Hetvi')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
            activeFilter === 'Hetvi'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Hetvi</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {filteredGoals.map((goal) => {
          const percentage = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition shadow-sm relative flex flex-col justify-between ${
                isComplete
                  ? 'border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    goal.owner === 'Tejas'
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                      : goal.owner === 'Hetvi'
                      ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {goal.owner === 'household' ? 'Shared' : `${goal.owner}'s`}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {goal.title}
                </h3>
                {goal.notes && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                <div className="mt-3 sm:mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {fmt(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-slate-500">
                      of {fmt(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-emerald-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] mt-1.5 text-slate-500">
                    <span>{percentage}% reached</span>
                    <span>Target: {goal.targetDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {isComplete ? '🎉 Target reached!' : `${fmt(remaining)} left`}
                </span>
                <button
                  onClick={() => {
                    setDepositModalGoal(goal);
                    setDepositAmount('');
                  }}
                  className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Goal Add / Edit Modal - Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl z-10 pb-safe">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create Savings Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. TFSA Growth, Vacation, Car Down Payment..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target (CAD $) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    inputMode="numeric"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Balance
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    inputMode="numeric"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Goal Owner
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value as GoalOwner)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="household">Household Shared</option>
                    <option value="Tejas">Tejas</option>
                    <option value="Hetvi">Hetvi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Contribution Plan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Save $650 each month from surplus..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal - Bottom Sheet */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setDepositModalGoal(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-5 sm:p-6 shadow-2xl z-10 pb-safe">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deposit to {depositModalGoal.title}
              </h3>
              <button onClick={() => setDepositModalGoal(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Add funds toward this goal ({fmt(depositModalGoal.currentAmount)} / {fmt(depositModalGoal.targetAmount)}).
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Amount (CAD $) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  inputMode="numeric"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
