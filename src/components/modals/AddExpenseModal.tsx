import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { SimpleTransaction, UserProfileName } from '../../types';
import { X, DollarSign, Calendar, Tag, User } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: SimpleTransaction | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit
}) => {
  const { addTransaction, updateTransaction, selectedMonth, selectedScope, getCategoryStatuses } = useFinance();
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState<UserProfileName>(
    selectedScope === 'Hetvi' ? 'Hetvi' : 'Tejas'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories
  const categoryStatuses = getCategoryStatuses(selectedMonth, user);
  const categoriesList = Array.from(new Set([
    ...categoryStatuses.map(c => c.category),
    'Personal', 'Bills', 'Food', 'Shopping', 'Entertainment', 'Transportation', 'Investment', 'Savings', 'Other'
  ]));

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setUser(transactionToEdit.user);
    } else {
      setAmount('');
      setDescription('');
      setCategory('Personal');
      setDate(new Date().toISOString().split('T')[0]);
      setUser(selectedScope === 'Hetvi' ? 'Hetvi' : 'Tejas');
    }
  }, [transactionToEdit, selectedScope, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description (e.g. Coffee, Restaurant).');
      return;
    }

    setIsSubmitting(true);
    if (transactionToEdit) {
      await updateTransaction(transactionToEdit.id, {
        amount: parsedAmount,
        description: description.trim(),
        category,
        date,
        user
      });
    } else {
      await addTransaction({
        amount: parsedAmount,
        description: description.trim(),
        category,
        date,
        user
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl z-10 pb-safe">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {transactionToEdit ? 'Edit Expense' : 'Add Expense'}
            </h3>
            <p className="text-xs text-slate-400">
              Quickly record an expense to deduct from your budget.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 py-4">
          
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount (CAD $) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-8 pr-3 py-3 text-xl font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Coffee, Restaurant, Groceries, Movie"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Category & User Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {categoriesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Spent By
              </label>
              <select
                value={user}
                onChange={(e) => setUser(e.target.value as UserProfileName)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="Tejas">Tejas</option>
                <option value="Hetvi">Hetvi</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/25 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : '+ Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

