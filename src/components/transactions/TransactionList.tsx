import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction, DEFAULT_EXPENSE_CATEGORIES } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  User,
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';

export const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, selectedMonth } = useFinance();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(selectedMonth);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Available unique categories from data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    DEFAULT_EXPENSE_CATEGORIES.forEach(c => set.add(c));
    return Array.from(set).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Month
      if (monthFilter !== 'all' && !t.date.startsWith(monthFilter)) return false;

      // Type
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // Person (Paid by or Created by)
      if (selectedPerson !== 'all') {
        if (t.paidBy !== selectedPerson && t.createdBy !== selectedPerson) return false;
      }

      // Category
      if (selectedCategory !== 'all' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchNotes) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });
  }, [transactions, monthFilter, selectedType, selectedPerson, selectedCategory, searchTerm, sortBy, sortOrder]);

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete "${description}"?`)) {
      await deleteTransaction(id);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Paid By', 'Payment Method', 'Created By', 'Recurring', 'Notes'];
    const rows = filteredTransactions.map(t => [
      `"${t.date}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.paidBy}"`,
      `"${t.paymentMethod}"`,
      `"${t.createdBy}"`,
      t.isRecurring ? 'Yes' : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `household_transactions_${monthFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Household Transactions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit ledger of expenses, incomes, and creator tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filters Box (Always visible on desktop, toggleable on mobile) */}
      <div className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 ${
        isMobileFiltersOpen ? 'block' : 'hidden sm:block'
      }`}>
        
        {/* Search & Main Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, vendor, notes..."
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Months</option>
              <option value="2026-12">December 2026</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Person Filter */}
          <div>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All People</option>
              <option value="Tejas">Tejas</option>
              <option value="Hetvi">Hetvi</option>
              <option value="Shared">Shared Only</option>
            </select>
          </div>

        </div>

        {/* Type & Sort Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedType === 'expense' ? 'bg-rose-500 text-white font-bold' : 'text-slate-500'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedType === 'income' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'
              }`}
            >
              Income
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                else { setSortBy('date'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                sortBy === 'date'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <span>Date</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                if (sortBy === 'amount') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                else { setSortBy('amount'); setSortOrder('desc'); }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition ${
                sortBy === 'amount'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <span>$</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>

            <span className="text-[11px] text-slate-400">
              ({filteredTransactions.length})
            </span>
          </div>

        </div>

      </div>

      {/* MOBILE VIEW: Card List for Phones (<md screens) */}
      <div className="block md:hidden space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center text-slate-400 text-xs">
            No transactions found.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
            >
              {/* Top metadata line */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{tx.date}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {tx.category}
                  </span>
                </div>
                {/* Added by badge */}
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  tx.createdBy === 'Tejas'
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                    : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                }`}>
                  Added by {tx.createdBy}
                </span>
              </div>

              {/* Middle row: Description & Amount */}
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </div>
                  {tx.notes && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.notes}</p>
                  )}
                </div>
                <div className={`text-base font-extrabold whitespace-nowrap ${
                  tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
              </div>

              {/* Bottom footer: Paid by, payment method, edit/delete actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-medium">
                    Paid by <strong className={`font-semibold ${
                      tx.paidBy === 'Tejas' ? 'text-sky-600' : tx.paidBy === 'Hetvi' ? 'text-pink-600' : 'text-purple-600'
                    }`}>{tx.paidBy}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-[11px] text-slate-400">{tx.paymentMethod}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(tx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 active:bg-slate-100"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id, tx.description)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 active:bg-rose-50"
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

      {/* DESKTOP VIEW: Full 8-Column Table (hidden on mobile) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid By</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{tx.description}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{tx.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold whitespace-nowrap">
                      <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${
                        tx.paidBy === 'Tejas' ? 'text-sky-600' : tx.paidBy === 'Hetvi' ? 'text-pink-600' : 'text-purple-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          tx.paidBy === 'Tejas' ? 'bg-sky-500' : tx.paidBy === 'Hetvi' ? 'bg-pink-500' : 'bg-purple-500'
                        }`} />
                        <span>{tx.paidBy}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tx.createdBy === 'Tejas'
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                      }`}>
                        Added by {tx.createdBy}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          transactionToEdit={editingTx}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTx(null);
          }}
        />
      )}
    </div>
  );
};
