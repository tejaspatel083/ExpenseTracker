import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SimpleTransaction } from '../../types';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  User,
  ArrowUpDown
} from 'lucide-react';
import { AddExpenseModal } from '../modals/AddExpenseModal';

interface SimpleTransactionsProps {
  onOpenAddExpense: () => void;
}

export const SimpleTransactions: React.FC<SimpleTransactionsProps> = ({
  onOpenAddExpense
}) => {
  const { transactions, deleteTransaction, selectedMonth, selectedScope, getCategoryStatuses } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState<string>(selectedScope === 'household' ? 'all' : selectedScope);
  const [monthFilter, setMonthFilter] = useState(selectedMonth);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<SimpleTransaction | null>(null);

  // Sync with selected scope
  React.useEffect(() => {
    if (selectedScope === 'household') {
      setUserFilter('all');
    } else {
      setUserFilter(selectedScope);
    }
  }, [selectedScope]);

  const categoryStatuses = getCategoryStatuses(selectedMonth, 'household');
  const availableCategories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (monthFilter !== 'all' && !t.date.startsWith(monthFilter)) return false;
      if (userFilter !== 'all' && t.user !== userFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, monthFilter, userFilter, categoryFilter, searchTerm]);

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
          <p className="text-xs text-slate-400">
            {filtered.length} recorded items
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Filter Chips & Search */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search (e.g. Coffee, Restaurant)..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
            >
              <option value="all">Everyone</option>
              <option value="Tejas">Tejas</option>
              <option value="Hetvi">Hetvi</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No expenses found. Tap &quot;+ Add Expense&quot; above to log a purchase!
          </div>
        ) : (
          filtered.map(tx => (
            <div
              key={tx.id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-10 rounded-full shrink-0 ${
                  tx.user === 'Tejas' ? 'bg-sky-500' : 'bg-pink-500'
                }`} />

                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono">{tx.date}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </span>
                    <span>•</span>
                    <span className={tx.user === 'Tejas' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-pink-600 dark:text-pink-400 font-bold'}>
                      {tx.user}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                  {fmt(tx.amount)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id, tx.description)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
