import React, { useState, useMemo, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Plus,
  AlertTriangle,
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Edit3,
  Calendar,
  Sparkles,
  Clock,
  ChevronRight,
  GripVertical,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { formatPaydayLabel } from '../../utils/paycheckCalculator';

interface SimpleDashboardProps {
  onOpenAddExpense: () => void;
  onOpenMonthlySetup: () => void;
  onOpenEditIncome: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  onOpenAddExpense,
  onOpenMonthlySetup,
  onOpenEditIncome
}) => {
  const {
    selectedMonth,
    selectedScope,
    getStats,
    getCategoryStatuses,
    getMonthlyHistory,
    setSelectedMonth,
    getPaychecksForMonth
  } = useFinance();

  const stats = getStats(selectedMonth, selectedScope);
  const categories = getCategoryStatuses(selectedMonth, selectedScope);
  const history = getMonthlyHistory(selectedScope);

  // Saved sequence order of categories on dashboard
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('household_dashboard_category_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const touchStartIdxRef = useRef<number | null>(null);

  const saveCategoryOrder = (newOrder: string[]) => {
    setCategoryOrder(newOrder);
    try {
      localStorage.setItem('household_dashboard_category_order', JSON.stringify(newOrder));
    } catch {}
  };

  const resetCategoryOrder = () => {
    setCategoryOrder([]);
    try {
      localStorage.removeItem('household_dashboard_category_order');
    } catch {}
  };

  // Sort categories by the user's custom sequence
  const orderedCategories = useMemo(() => {
    if (!categoryOrder || categoryOrder.length === 0) return categories;
    const map = new Map(categories.map(c => [c.category, c]));
    const result: typeof categories = [];
    categoryOrder.forEach(catName => {
      if (map.has(catName)) {
        result.push(map.get(catName)!);
        map.delete(catName);
      }
    });
    map.forEach(c => result.push(c));
    return result;
  }, [categories, categoryOrder]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newItems = [...orderedCategories];
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(dropIndex, 0, moved);
    saveCategoryOrder(newItems.map(c => c.category));
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const moveCategory = (fromIdx: number, direction: 'up' | 'down') => {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= orderedCategories.length) return;
    const newItems = [...orderedCategories];
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);
    saveCategoryOrder(newItems.map(c => c.category));
  };

  const handleTouchStart = (index: number) => {
    touchStartIdxRef.current = index;
    setDraggedIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIdxRef.current === null) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardEl = targetEl?.closest('[data-category-index]');
    if (cardEl) {
      const targetIdx = Number(cardEl.getAttribute('data-category-index'));
      if (!isNaN(targetIdx) && targetIdx !== dragOverIdx) {
        setDragOverIdx(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIdxRef.current !== null && dragOverIdx !== null && touchStartIdxRef.current !== dragOverIdx) {
      const newItems = [...orderedCategories];
      const [moved] = newItems.splice(touchStartIdxRef.current, 1);
      newItems.splice(dragOverIdx, 0, moved);
      saveCategoryOrder(newItems.map(c => c.category));
    }
    touchStartIdxRef.current = null;
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  // Paychecks for this month (Tejas)
  const activePaychecks = getPaychecksForMonth(selectedMonth, 'Tejas');

  const isThreePaycheckMonth = activePaychecks.length >= 3;

  // Chart 1: Allocation Donut Data
  const totalAlloc = categories.reduce((s, c) => s + c.planned, 0);
  const palette = ['#10b981', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6'];
  const donutSlices = categories.map((c, i) => {
    const pct = totalAlloc > 0 ? (c.planned / totalAlloc) * 100 : 0;
    return {
      name: c.category,
      planned: c.planned,
      percentage: pct,
      color: palette[i % palette.length]
    };
  });

  // Chart 2: Spent by category (Max spent for scaling)
  const maxSpent = Math.max(...categories.map(c => c.spent), 100);

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Month & Setup Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Tejas&apos;s Finances
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {monthName} {year}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Income → Allocate money → Add expenses → Track savings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Monthly Setup Button */}
          <button
            onClick={onOpenMonthlySetup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Monthly Setup</span>
          </button>

          {/* Quick Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metrics (Income, Allocated, Spent, Remaining, Expected Savings) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* Income Card (Clickable to Edit Variable Paychecks) */}
        <div
          onClick={onOpenEditIncome}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition group"
          title="Click to customize variable paychecks & paydays"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Income
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
              <Edit3 className="w-2.5 h-2.5" />
              Edit
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {fmt(stats.income)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Bi-weekly Thu</span>
          </span>
        </div>

        {/* Allocated */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Allocated
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            {fmt(stats.allocated)}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Planned budget
          </span>
        </div>

        {/* Spent */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Spent
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-600 font-mono mt-1">
            {fmt(stats.actualExpenses)}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
            Actual costs
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Remaining
          </span>
          <div className="text-lg sm:text-xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">
            {fmt(stats.remainingBudget)}
          </div>
          <span className="text-[10px] text-sky-500 font-semibold block mt-0.5">
            Available to spend
          </span>
        </div>

        {/* Expected Savings */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Expected Savings
          </span>
          <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {fmt(stats.plannedSavings)}
          </div>
          <span className="text-[10px] text-purple-500 font-semibold block mt-0.5">
            Target savings
          </span>
        </div>

      </div>

      {/* Bi-weekly Payday Schedule Strip */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/30 p-3 sm:p-3.5 rounded-2xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Bi-Weekly Paydays (Every 2nd Thursday):
              </span>
              {isThreePaycheckMonth && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.2 rounded-full">
                  🎉 3-Paycheck Month
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {activePaychecks.map((p) => (
                <span
                  key={p.id}
                  onClick={onOpenEditIncome}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:border-emerald-500 transition"
                >
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatPaydayLabel(p.date)}:
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ${p.amount.toFixed(2)}
                  </span>

                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenEditIncome}
          className="self-end sm:self-auto flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
        >
          <span>Adjust Paychecks</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Spending Limits & Over-budget Warnings */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Category Limits & Remaining Budgets
              </h3>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-emerald-500" />
                <span>Drag to reorder</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hold and drag cards (or use arrows) to arrange your preferred sequence
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {categoryOrder.length > 0 && (
              <button
                type="button"
                onClick={resetCategoryOrder}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                title="Reset to default sequence"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset order</span>
              </button>
            )}
            <button
              onClick={onOpenMonthlySetup}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Adjust Limits
            </button>
          </div>
        </div>

        {/* Drag and Drop Category Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {orderedCategories.map((cat, idx) => {
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

            return (
              <div
                key={cat.category}
                data-category-index={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-150 relative ${
                  isDragging
                    ? 'opacity-30 scale-[0.98] border-emerald-500 shadow-inner'
                    : isDragOver
                    ? 'border-2 border-dashed border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[1.01]'
                    : cat.isOverBudget
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                    : cat.percentage >= 90
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                {/* Category Header with Grip Handle and Reorder Buttons */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Touch / Mouse Drag Grip */}
                    <div
                      onTouchStart={() => handleTouchStart(idx)}
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 rounded touch-none shrink-0"
                      title="Drag to reorder sequence"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {cat.category}
                    </span>

                    {/* Move Up/Down Arrow buttons for easy 1-tap reordering */}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-70 hover:opacity-100">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCategory(idx, 'up');
                          }}
                          className="p-0.5 text-slate-400 hover:text-emerald-500 rounded"
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < orderedCategories.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveCategory(idx, 'down');
                          }}
                          className="p-0.5 text-slate-400 hover:text-emerald-500 rounded"
                          title="Move down"
                        >
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {fmt(cat.spent)} / {fmt(cat.planned)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.isOverBudget
                        ? 'bg-rose-500'
                        : cat.percentage >= 90
                        ? 'bg-amber-500'
                        : cat.percentage >= 75
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>

                {/* Remaining / Over Budget Warning */}
                <div className="flex items-center justify-between text-[11px]">
                  {cat.isOverBudget ? (
                    <div className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>⚠️ You are over budget by {fmt(cat.overAmount)}</span>
                    </div>
                  ) : (
                    <div className="text-slate-500 dark:text-slate-400">
                      <span>Remaining: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {fmt(cat.remaining)}
                      </span>
                    </div>
                  )}

                  <span className="font-mono text-[10px] text-slate-400">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Focused Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 1. Money Allocation Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>1. Money Allocation</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Planned</span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {donutSlices.map((slice, i) => {
                  let accumulatedPct = donutSlices.slice(0, i).reduce((sum, s) => sum + s.percentage, 0);
                  const strokeDasharray = `${slice.percentage * 2.512} ${251.2 - slice.percentage * 2.512}`;
                  const strokeDashoffset = -accumulatedPct * 2.512;
                  return (
                    <circle
                      key={slice.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Allocated</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                  {fmt(stats.allocated)}
                </span>
              </div>
            </div>
          </div>

          {/* Slices legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {donutSlices.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{s.name}</span>
                </div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {fmt(s.planned)} <span className="text-[10px] text-slate-400 font-normal">({Math.round(s.percentage)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Spending by Category Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>2. Spending by Category</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Actual</span>
          </div>

          <div className="space-y-3 py-2">
            {categories.map((c) => {
              const barWidth = maxSpent > 0 ? (c.spent / maxSpent) * 100 : 0;
              return (
                <div key={c.category} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{c.category}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(c.spent)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(barWidth, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Monthly Savings Line / Bar Trend */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              <span>3. Monthly Savings</span>
            </h4>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Trend</span>
          </div>

          <div className="space-y-2.5 py-1">
            {history.slice(-4).map((h) => {
              const isCur = h.month === selectedMonth;
              return (
                <div
                  key={h.month}
                  onClick={() => setSelectedMonth(h.month)}
                  className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isCur
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-3.5 h-3.5 ${isCur ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{h.monthLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-teal-600 dark:text-teal-400">
                      {fmt(h.savings)}
                    </span>
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded">
                      {h.savingsRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
