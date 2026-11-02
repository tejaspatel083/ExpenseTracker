import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Transaction,
  PaidBy,
  TransactionType,
  DEFAULT_EXPENSE_CATEGORIES,
  PAYMENT_METHODS
} from '../../types';
import { X, DollarSign, Calendar, Tag, CreditCard, User, Repeat, Plus } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
  initialType = 'expense'
}) => {
  const { addTransaction, updateTransaction } = useFinance();
  const { currentUser } = useAuth();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Groceries');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<PaidBy>('Shared');
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      if (DEFAULT_EXPENSE_CATEGORIES.includes(transactionToEdit.category) || transactionToEdit.category === 'Salary') {
        setCategory(transactionToEdit.category);
        setIsCustomCategory(false);
      } else {
        setCategory('Other');
        setCustomCategory(transactionToEdit.category);
        setIsCustomCategory(true);
      }
      setDate(transactionToEdit.date);
      setPaidBy(transactionToEdit.paidBy);
      setPaymentMethod(transactionToEdit.paymentMethod || 'Credit Card');
      setIsRecurring(transactionToEdit.isRecurring);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType(initialType);
      setAmount('');
      setDescription('');
      setCategory(initialType === 'income' ? 'Salary' : 'Groceries');
      setIsCustomCategory(false);
      setCustomCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaidBy(currentUser?.name || 'Shared');
      setPaymentMethod('Credit Card');
      setIsRecurring(false);
      setNotes('');
    }
  }, [transactionToEdit, initialType, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }

    const finalCategory = isCustomCategory && customCategory.trim()
      ? customCategory.trim()
      : category;

    setIsSubmitting(true);

    if (transactionToEdit) {
      await updateTransaction(transactionToEdit.id, {
        amount: parsedAmount,
        description: description.trim(),
        category: finalCategory,
        type,
        date,
        paidBy,
        paymentMethod,
        isRecurring,
        notes: notes.trim()
      });
    } else {
      await addTransaction({
        amount: parsedAmount,
        description: description.trim(),
        category: finalCategory,
        type,
        date,
        paidBy,
        paymentMethod,
        isRecurring,
        notes: notes.trim()
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-slate-500">
              Audit log will record: Added by <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentUser?.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Salary') setCategory('Groceries');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (CAD $) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-base font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Metro Groceries, Rogers Phone, Dinner at Kanzo..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {isCustomCategory ? 'Use Standard List' : '+ Custom Category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {type === 'income' ? (
                  <>
                    <option value="Salary">Salary</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment / Dividend">Investment / Dividend</option>
                    <option value="Other">Other Income</option>
                  </>
                ) : (
                  DEFAULT_EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Date & Paid By Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value as PaidBy)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tejas">Tejas</option>
                <option value="Hetvi">Hetvi</option>
                <option value="Shared">Shared (Household)</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isRecurring" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Recurring Expense (Repeats every month/cycle)
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
