import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SimpleTransaction, STANDARD_CATEGORIES } from '../../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import { AddExpenseModal } from '../modals/AddExpenseModal';

interface SimpleTransactionsProps {
  onOpenAddExpense: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const SimpleTransactions: React.FC<SimpleTransactionsProps> = ({
  onOpenAddExpense
}) => {
  const { transactions, deleteTransaction, selectedMonth } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthYearFilter, setMonthYearFilter] = useState<string>('all');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<SimpleTransaction | null>(null);

  // Strictly the requested 7 categories
  const availableCategories = STANDARD_CATEGORIES;

  // Extract all distinct year-months (YYYY-MM) present in transactions, plus selectedMonth
  const availableMonthYears = useMemo(() => {
    const set = new Set<string>();
    if (selectedMonth) set.add(selectedMonth);
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions, selectedMonth]);

  const formatMonthYear = (ym: string) => {
    const [year, month] = ym.split('-');
    const idx = parseInt(month, 10) - 1;
    const name = MONTH_NAMES[idx] || month;
    return `${name} ${year}`;
  };

  const formatMonthShort = (ym: string) => {
    const [year, month] = ym.split('-');
    const idx = parseInt(month, 10) - 1;
    const name = MONTH_SHORT[idx] || month;
    return `${name} ${year}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 10) return dateStr;
    const [y, m, d] = dateStr.split('-');
    const mIdx = parseInt(m, 10) - 1;
    const month = MONTH_SHORT[mIdx] || m;
    const day = parseInt(d, 10);
    return `${month} ${day}, ${y}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Rent':
        return 'bg-indigo-500';
      case 'Fix bills':
        return 'bg-amber-500';
      case 'Personal expenses':
        return 'bg-sky-500';
      case 'Personal savings':
        return 'bg-teal-500';
      case 'TFSA':
        return 'bg-emerald-500';
      case 'Sent Honey':
        return 'bg-pink-500';
      case 'Miscellaneous':
      default:
        return 'bg-slate-400';
    }
  };

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Month-Year filter
      if (monthYearFilter !== 'all' && !t.date.startsWith(monthYearFilter)) return false;
      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q) ||
          t.date.includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, monthYearFilter, categoryFilter, searchTerm]);

  // Group filtered transactions by Year & Month
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, SimpleTransaction[]>();

    filtered.forEach(tx => {
      const ym = tx.date.slice(0, 7);
      if (!map.has(ym)) {
        map.set(ym, []);
      }
      map.get(ym)!.push(tx);
    });

    // Sort descending (latest month first)
    const sortedYMs = Array.from(map.keys()).sort().reverse();

    return sortedYMs.map(ym => {
      const txs = map.get(ym)!;
      const total = txs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return {
        monthKey: ym,
        monthLabel: formatMonthYear(ym),
        transactions: txs,
        totalAmount: total
      };
    });
  }, [filtered]);

  const totalFilteredAmount = useMemo(() => {
    return filtered.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [filtered]);

  const handleEdit = (tx: SimpleTransaction) => {
    setEditingTx(tx);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, desc: string) => {
    if (confirm(`Delete "${desc}"?`)) {
      await deleteTransaction(id);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            Expenses & Transactions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'} • Total:{' '}
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {fmt(totalFilteredAmount)}
            </span>
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Filter Bar: Search, Month/Year Dropdown, Category Dropdown */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Month & Year Filter Dropdown */}
          <div>
            <select
              value={monthYearFilter}
              onChange={(e) => setMonthYearFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Months & Years</option>
              {availableMonthYears.map(ym => (
                <option key={ym} value={ym}>
                  {formatMonthYear(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown (Strictly 7 Categories) */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Horizontal Month Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1 mr-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Month:
          </span>
          <button
            type="button"
            onClick={() => setMonthYearFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
              monthYearFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Months
          </button>
          {availableMonthYears.map(ym => (
            <button
              key={ym}
              type="button"
              onClick={() => setMonthYearFilter(ym)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                monthYearFilter === ym
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {formatMonthShort(ym)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Grouped Based on Months and Year */}
      {groupedByMonth.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">No expenses found</p>
          <p>Try adjusting your search, month, or category filter, or tap &quot;+ Add Expense&quot; above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMonth.map(group => (
            <div
              key={group.monthKey}
              className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Month Group Header */}
              <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      {group.monthLabel}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {group.transactions.length} {group.transactions.length === 1 ? 'transaction' : 'transactions'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Month Total
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {fmt(group.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Transactions in this month */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-10 rounded-full shrink-0 ${getCategoryColor(tx.category)}`} />

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {formatDisplayDate(tx.date)}
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                        {fmt(tx.amount)}
                      </span>

                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditModalOpen && (
        <AddExpenseModal
          isOpen={isEditModalOpen}
          transactionToEdit={editingTx}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTx(null);
          }}
        />
      )}

    </div>
  );
};
