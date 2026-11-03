import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfileName, CategoryNature } from '../../types';
import { X, Plus, Trash2, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface MonthlySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: UserProfileName;
}

export const MonthlySetupModal: React.FC<MonthlySetupModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { selectedMonth, selectedScope, monthlyIncomes, allocations, setMonthlyIncome, updateAllocations } = useFinance();
  const { currentUser } = useAuth();

  const userToEdit: UserProfileName = targetUser || (selectedScope === 'Hetvi' ? 'Hetvi' : 'Tejas');

  // Find existing income for this user & month
  const existingIncome = monthlyIncomes.find(i => i.month === selectedMonth && i.user === userToEdit)?.income || (userToEdit === 'Tejas' ? 4000 : 3000);
  const [incomeStr, setIncomeStr] = useState(existingIncome.toString());

  // Existing allocations for this user & month
  const existingAllocs = allocations.filter(a => a.month === selectedMonth && a.user === userToEdit);

  const [categories, setCategories] = useState<Array<{ category: string; plannedAmount: string; nature: CategoryNature }>>(() => {
    if (existingAllocs.length > 0) {
      return existingAllocs.map(a => ({
        category: a.category,
        plannedAmount: a.plannedAmount.toString(),
        nature: a.nature
      }));
    }
    // Default allocations matching user prompt
    if (userToEdit === 'Tejas') {
      return [
        { category: 'Personal', plannedAmount: '325', nature: 'expense' },
        { category: 'Investment', plannedAmount: '1000', nature: 'investment' },
        { category: 'Savings', plannedAmount: '1500', nature: 'savings' },
        { category: 'Bills', plannedAmount: '1175', nature: 'expense' }
      ];
    } else {
      return [
        { category: 'Personal', plannedAmount: '300', nature: 'expense' },
        { category: 'Investment', plannedAmount: '600', nature: 'investment' },
        { category: 'Savings', plannedAmount: '1100', nature: 'savings' },
        { category: 'Bills', plannedAmount: '1000', nature: 'expense' }
      ];
    }
  });

  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('');
  const [newCatNature, setNewCatNature] = useState<CategoryNature>('expense');

  useEffect(() => {
    if (existingAllocs.length > 0) {
      setCategories(existingAllocs.map(a => ({
        category: a.category,
        plannedAmount: a.plannedAmount.toString(),
        nature: a.nature
      })));
    }
    setIncomeStr(existingIncome.toString());
  }, [selectedMonth, userToEdit, isOpen]);

  if (!isOpen) return null;

  const totalAllocated = categories.reduce((sum, c) => sum + (parseFloat(c.plannedAmount) || 0), 0);
  const incomeNum = parseFloat(incomeStr) || 0;
  const difference = incomeNum - totalAllocated;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const amt = parseFloat(newCatAmount) || 0;
    setCategories(prev => [...prev, { category: newCatName.trim(), plannedAmount: amt.toString(), nature: newCatNature }]);
    setNewCatName('');
    setNewCatAmount('');
  };

  const handleRemoveCategory = (idx: number) => {
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateAmount = (idx: number, val: string) => {
    setCategories(prev => prev.map((item, i) => i === idx ? { ...item, plannedAmount: val } : item));
  };

  const handleSaveAll = async () => {
    await setMonthlyIncome(selectedMonth, userToEdit, incomeNum);
    await updateAllocations(
      selectedMonth,
      userToEdit,
      categories.map(c => ({
        category: c.category,
        plannedAmount: parseFloat(c.plannedAmount) || 0,
        nature: c.nature
      }))
    );
    onClose();
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col pb-safe">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {userToEdit}&apos;s Monthly Setup
            </h3>
            <p className="text-xs text-slate-500">
              Set monthly income and allocate budget categories.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          
          {/* Monthly Income input */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Monthly Income (CAD $) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">$</span>
              <input
                type="number"
                inputMode="numeric"
                value={incomeStr}
                onChange={(e) => setIncomeStr(e.target.value)}
                placeholder="4000"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Example: $4,000 to be allocated below
            </p>
          </div>

          {/* Allocation Categories Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Budget Allocation Categories
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Total: {fmt(totalAllocated)} / {fmt(incomeNum)}
              </span>
            </div>

            <div className="space-y-2">
              {categories.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {item.category}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      item.nature === 'investment'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : item.nature === 'savings'
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {item.nature}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={item.plannedAmount}
                        onChange={(e) => handleUpdateAmount(idx, e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Difference / Balance check */}
            <div className={`mt-2 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
              difference === 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : difference > 0
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              <span>{difference === 0 ? '✓ 100% of income allocated' : difference > 0 ? `${fmt(difference)} unallocated money` : `⚠️ Over-allocated by ${fmt(Math.abs(difference))}`}</span>
              <span className="font-mono font-bold">{fmt(totalAllocated)}</span>
            </div>
          </div>

          {/* Add custom category row */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              + Add Custom Category
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="e.g. Travel, Food"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Amount $"
                value={newCatAmount}
                onChange={(e) => setNewCatAmount(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white font-mono"
              />
              <select
                value={newCatNature}
                onChange={(e) => setNewCatNature(e.target.value as CategoryNature)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1 py-1 text-xs text-slate-900 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              className="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Add to List
            </button>
          </div>

        </div>

        {/* Footer save buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
          >
            Save Monthly Plan
          </button>
        </div>

      </div>
    </div>
  );
};
