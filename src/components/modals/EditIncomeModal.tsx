import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { UserProfileName, PaycheckEntry } from '../../types';
import { formatPaydayLabel } from '../../utils/paycheckCalculator';
import {
  X,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Settings2
} from 'lucide-react';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUser?: UserProfileName;
}

export const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  onClose,
  defaultUser = 'Tejas'
}) => {
  const {
    selectedMonth,
    selectedScope,
    incomeSettings,
    getPaychecksForMonth,
    savePaychecks,
    updateIncomeSettings,
    monthlyIncomes,
    setMonthlyIncome
  } = useFinance();

  const [activeUser, setActiveUser] = useState<UserProfileName>(() => {
    if (selectedScope === 'Hetvi') return 'Hetvi';
    return defaultUser;
  });

  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [anchorThursday, setAnchorThursday] = useState('');
  const [defaultAmountStr, setDefaultAmountStr] = useState('');
  const [paycheckList, setPaycheckList] = useState<PaycheckEntry[]>([]);

  // Add custom income item state
  const [extraLabel, setExtraLabel] = useState('');
  const [extraAmount, setExtraAmount] = useState('');

  // Extract month year for display
  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[parseInt(monthNum, 10) - 1] || selectedMonth;

  useEffect(() => {
    if (!isOpen) return;

    const userSettings = incomeSettings[activeUser];
    setAnchorThursday(userSettings?.anchorThursday || '2026-11-05');
    setDefaultAmountStr(userSettings?.defaultPaycheckAmount?.toString() || '2075.57');

    const loadedPaychecks = getPaychecksForMonth(selectedMonth, activeUser);
    setPaycheckList(loadedPaychecks);
  }, [isOpen, activeUser, selectedMonth]);

  if (!isOpen) return null;

  const totalCalculated = paycheckList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleUpdatePaycheckAmount = (id: string, newAmtStr: string) => {
    const val = parseFloat(newAmtStr) || 0;
    setPaycheckList(prev => prev.map(p => (p.id === id ? { ...p, amount: val } : p)));
  };

  const handleDeletePaycheck = (id: string) => {
    setPaycheckList(prev => prev.filter(p => p.id !== id));
  };

  const handleAddExtraIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraLabel.trim() || !extraAmount) return;
    const amt = parseFloat(extraAmount) || 0;
    const newEntry: PaycheckEntry = {
      id: `custom-inc-${Date.now()}`,
      month: selectedMonth,
      user: activeUser,
      date: `${selectedMonth}-15`,
      label: extraLabel.trim(),
      amount: amt
    };
    setPaycheckList(prev => [...prev, newEntry]);
    setExtraLabel('');
    setExtraAmount('');
  };

  const handleSaveSettings = () => {
    const baseAmt = parseFloat(defaultAmountStr) || 2075.57;
    updateIncomeSettings(activeUser, {
      anchorThursday,
      defaultPaycheckAmount: baseAmt
    });
    setShowScheduleSettings(false);
  };

  const handleSaveAll = async () => {
    await savePaychecks(selectedMonth, activeUser, paycheckList);
    onClose();
  };

  const isThreePaycheckMonth = paycheckList.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Variable Income & Paydays
              </h2>
              <p className="text-xs text-slate-400">
                {monthName} {year} • Bi-weekly Thursday Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Pill Switcher */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Earner:
          </span>
          <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setActiveUser('Tejas')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeUser === 'Tejas'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tejas
            </button>
            <button
              onClick={() => setActiveUser('Hetvi')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeUser === 'Hetvi'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hetvi
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Banner for 3-Paycheck Months */}
          {isThreePaycheckMonth && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-700/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold">🎉 3-Paycheck Month!</span> {monthName} has 3 bi-weekly paydays for {activeUser}.
              </div>
            </div>
          )}

          {/* Schedule Summary & Toggle Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Every Second Thursday</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cycle anchor: {formatPaydayLabel(anchorThursday || '2026-11-05')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowScheduleSettings(!showScheduleSettings)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showScheduleSettings ? 'Hide' : 'Customize'}</span>
            </button>
          </div>

          {/* Collapsible Schedule Customization */}
          {showScheduleSettings && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3 animate-in fade-in duration-100">
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Customize Thursday Anchor & Base Pay
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Anchor Thursday Date
                  </label>
                  <input
                    type="date"
                    value={anchorThursday}
                    onChange={e => setAnchorThursday(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Any past/present pay Thursday</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Default Paycheck ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaultAmountStr}
                    onChange={e => setDefaultAmountStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Base salary estimate per check</span>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Apply to Schedule
                </button>
              </div>
            </div>
          )}

          {/* List of Paychecks for Selected Month */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>{monthName} Paychecks ({paycheckList.length})</span>
              <span className="text-[11px] font-normal text-slate-400">Variable: edit exact amounts below</span>
            </div>

            {paycheckList.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                No paydays found for this month under current schedule.
              </div>
            ) : (
              <div className="space-y-2">
                {paycheckList.map((pay, idx) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {pay.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-6 block font-mono">
                        {pay.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          value={pay.amount || ''}
                          onChange={e => handleUpdatePaycheckAmount(pay.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs text-right text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePaycheck(pay.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Additional Variable Income (Bonus / Freelance) */}
          <form onSubmit={handleAddExtraIncome} className="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              + Add Extra Variable Income (Bonus, Freelance, Reimbursement)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="e.g. Overtime or Bonus"
                value={extraLabel}
                onChange={e => setExtraLabel(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={extraAmount}
                    onChange={e => setExtraAmount(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!extraLabel.trim() || !extraAmount}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Total Monthly Income Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Total {activeUser}&apos;s Income ({monthName})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sum of {paycheckList.length} paycheck{paycheckList.length !== 1 ? 's' : ''} & variable items
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalCalculated.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Variable Income</span>
          </button>
        </div>

      </div>
    </div>
  );
};
