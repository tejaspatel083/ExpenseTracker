import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { RecurringExpense, DEFAULT_EXPENSE_CATEGORIES, PaidBy } from '../../types';
import {
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  Repeat,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  CreditCard
} from 'lucide-react';

export const PaydayPlanner: React.FC = () => {
  const {
    incomeSettings,
    recurringExpenses,
    calculatePaycheckAmount,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense
  } = useFinance();
  const { currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<RecurringExpense | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState<PaidBy>('Shared');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'weekly' | 'annual'>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEssential, setIsEssential] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate upcoming cash flow timeline for November/December 2026
  const events: Array<{
    date: string;
    title: string;
    type: 'income' | 'expense';
    amount: number;
    userOrPayer: string;
    category?: string;
  }> = [];

  // Paychecks for Tejas & Hetvi
  incomeSettings.filter(s => s.isActive).forEach(setting => {
    const paycheckAmt = calculatePaycheckAmount(setting);
    const baseDate = new Date(setting.nextPayday || '2026-11-05');

    // Project 4 occurrences
    for (let i = 0; i < 4; i++) {
      const occurrence = new Date(baseDate);
      if (setting.payFrequency === 'weekly') {
        occurrence.setDate(baseDate.getDate() + i * 7);
      } else if (setting.payFrequency === 'biweekly') {
        occurrence.setDate(baseDate.getDate() + i * 14);
      } else if (setting.payFrequency === 'twice_monthly') {
        occurrence.setDate(baseDate.getDate() + i * 15);
      } else {
        occurrence.setMonth(baseDate.getMonth() + i);
      }

      events.push({
        date: occurrence.toISOString().split('T')[0],
        title: `${setting.userName} salary (${setting.employer || 'Employer'})`,
        type: 'income',
        amount: paycheckAmt,
        userOrPayer: setting.userName
      });
    }
  });

  // Upcoming recurring bills
  recurringExpenses.filter(r => r.isActive).forEach(rec => {
    const baseDate = new Date(rec.nextPaymentDate || '2026-11-01');
    for (let i = 0; i < 2; i++) {
      const occurrence = new Date(baseDate);
      occurrence.setMonth(baseDate.getMonth() + i);
      events.push({
        date: occurrence.toISOString().split('T')[0],
        title: rec.description,
        type: 'expense',
        amount: rec.amount,
        userOrPayer: rec.paidBy,
        category: rec.category
      });
    }
  });

  // Sort chronological
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter to next 45 days
  const todayStr = '2026-11-02';
  const upcomingEvents = events.filter(e => e.date >= todayStr).slice(0, 10);

  // Running balance calculation
  let runningBalance = 4250; // starting household cash balance
  const timelineWithBalance = upcomingEvents.map(e => {
    if (e.type === 'income') {
      runningBalance += e.amount;
    } else {
      runningBalance -= e.amount;
    }
    return {
      ...e,
      projectedBalance: runningBalance
    };
  });

  const handleOpenAdd = () => {
    setEditingRec(null);
    setDescription('');
    setAmount('');
    setCategory('Utilities');
    setPaidBy('Shared');
    setFrequency('monthly');
    setNextPaymentDate(new Date().toISOString().split('T')[0]);
    setIsEssential(true);
    setIsModalOpen(true);
  };

  const handleEdit = (rec: RecurringExpense) => {
    setEditingRec(rec);
    setDescription(rec.description);
    setAmount(rec.amount.toString());
    setCategory(rec.category);
    setPaidBy(rec.paidBy);
    setFrequency(rec.frequency);
    setNextPaymentDate(rec.nextPaymentDate);
    setIsEssential(rec.isEssential ?? false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`Delete recurring bill "${desc}"?`)) {
      await deleteRecurringExpense(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    if (editingRec) {
      await updateRecurringExpense(editingRec.id, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        paidBy,
        frequency,
        nextPaymentDate,
        isEssential
      });
    } else {
      await addRecurringExpense({
        description: description.trim(),
        amount: parsedAmount,
        category,
        paidBy,
        frequency,
        nextPaymentDate,
        isActive: true,
        isEssential
      });
    }
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Cash Flow Forecast
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Payday & Bill Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Coordinated cash flow forecast synchronizing Tejas and Hetvi&apos;s paydays against recurring bills.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Paycheck Planning Timeline & Recurring Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upcoming Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
              Upcoming Paydays & Bills Timeline
            </h3>
            <span className="text-xs text-slate-400">Next 45 Days</span>
          </div>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-5">
            {timelineWithBalance.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[23px] sm:-left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  item.type === 'income'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                }`} />

                {/* Content Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        item.userOrPayer === 'Tejas'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                          : item.userOrPayer === 'Hetvi'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {item.userOrPayer}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {item.title}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Est. Bank Cash: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{fmt(item.projectedBalance)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-base font-extrabold font-mono ${
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{fmt(item.amount)}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recurring Expenses List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-sky-500" />
              Active Recurring Bills
            </h3>
            <span className="text-xs text-slate-400">
              {recurringExpenses.length} configured
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Automatically included in monthly projection calculations (Rogers, Bell, Hydro, Rent, etc.).
          </p>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {recurringExpenses.map(rec => (
              <div
                key={rec.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {rec.description}
                    </span>
                    {rec.isEssential && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Essential
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{rec.category}</span>
                    <span>•</span>
                    <span className={`font-semibold ${
                      rec.paidBy === 'Tejas'
                        ? 'text-sky-600'
                        : rec.paidBy === 'Hetvi'
                        ? 'text-pink-600'
                        : 'text-purple-600'
                    }`}>
                      {rec.paidBy}
                    </span>
                    <span>•</span>
                    <span>Due {rec.nextPaymentDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                      {fmt(rec.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {rec.frequency}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-1">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                      title="Edit recurring expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id, rec.description)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Delete recurring expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal for Add / Edit Recurring */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRec ? 'Edit Recurring Bill' : 'Add Recurring Bill'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Rogers Phone, Bell Internet, Hydro..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (CAD $) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Paid By
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value as PaidBy)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tejas">Tejas</option>
                    <option value="Hetvi">Hetvi</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="essentialCheck"
                  checked={isEssential}
                  onChange={(e) => setIsEssential(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="essentialCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mark as Essential (e.g. Rent, Hydro, Bell, Rogers)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
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
                  {isSubmitting ? 'Saving...' : 'Save Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
