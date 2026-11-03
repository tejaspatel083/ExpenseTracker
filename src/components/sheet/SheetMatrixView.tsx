import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Table, Download, Plus, Filter, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionModal } from '../transactions/TransactionModal';

export const SheetMatrixView: React.FC = () => {
  const { transactions, incomeSettings } = useFinance();
  const [selectedYear] = useState('2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMobileMonthIdx, setActiveMobileMonthIdx] = useState(10); // November 2026 default

  const months = [
    { key: '01', name: 'January' },
    { key: '02', name: 'February' },
    { key: '03', name: 'March' },
    { key: '04', name: 'April' },
    { key: '05', name: 'May' },
    { key: '06', name: 'June' },
    { key: '07', name: 'July' },
    { key: '08', name: 'August' },
    { key: '09', name: 'September' },
    { key: '10', name: 'October' },
    { key: '11', name: 'November' },
    { key: '12', name: 'December' },
  ];

  const fmt = (v: number) => (v === 0 ? '-' : `$${v.toFixed(2)}`);

  // Compute month-by-month expenses breakdown
  const monthlyData = months.map(m => {
    const ym = `${selectedYear}-${m.key}`;
    const monthTx = transactions.filter(t => t.date.startsWith(ym));
    const expenses = monthTx.filter(t => t.type === 'expense');
    const incomes = monthTx.filter(t => t.type === 'income');

    const rogers = expenses.find(e => e.description.toLowerCase().includes('rogers'))?.amount || 0;
    const bell = expenses.find(e => e.description.toLowerCase().includes('bell'))?.amount || 0;
    const hydro = expenses.find(e => e.description.toLowerCase().includes('hydro'))?.amount || 0;

    const otherExpenses = expenses.filter(e => {
      const d = e.description.toLowerCase();
      return !d.includes('rogers') && !d.includes('bell') && !d.includes('hydro') && !d.includes('rent');
    });

    const rent = expenses.find(e => e.description.toLowerCase().includes('rent'))?.amount || (expenses.length > 0 ? 1400 : 0);
    const totalExpenses = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    
    let salary1 = incomes.find(i => i.paidBy === 'Tejas')?.amount || 0;
    let salary2 = incomes.find(i => i.paidBy === 'Hetvi')?.amount || 0;

    if (salary1 === 0 && expenses.length > 0) salary1 = 2075.57;
    if (salary2 === 0 && expenses.length > 0) salary2 = 2126.81;

    const totalIncome = salary1 + salary2;
    const tfsa = 650;
    const hetviSavings = 1100;
    const personalSavings = 200;

    const extraLeft = totalIncome > 0
      ? totalIncome - (rent + tfsa + hetviSavings + personalSavings + totalExpenses - rent)
      : 0;

    return {
      monthKey: m.key,
      monthName: m.name,
      ym,
      rogers,
      bell,
      hydro,
      otherExpenses,
      rent,
      totalExpenses,
      salary1,
      salary2,
      totalIncome,
      tfsa,
      hetviSavings,
      personalSavings,
      extraLeft: Math.round(extraLeft * 100) / 100
    };
  });

  const activeMobileData = monthlyData[activeMobileMonthIdx];

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Interactive Matrix
            </span>
            <span className="text-[10px] sm:text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
              Google Sheet {selectedYear}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Monthly Expenses {selectedYear}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated matrix replicating your spreadsheet workbook with live surplus balancing.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* MOBILE-ONLY FOCUS CARD (Swipe / Arrow through months) */}
      <div className="block md:hidden bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <button
            onClick={() => setActiveMobileMonthIdx(prev => Math.max(0, prev - 1))}
            disabled={activeMobileMonthIdx === 0}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              {selectedYear}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activeMobileData.monthName}
            </h3>
          </div>

          <button
            onClick={() => setActiveMobileMonthIdx(prev => Math.min(11, prev + 1))}
            disabled={activeMobileMonthIdx === 11}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Core Fixed Bills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fixed Recurring Bills
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Rogers</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.rogers)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Bell</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.bell)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Hydro</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.hydro)}</span>
            </div>
          </div>
        </div>

        {/* Discretionary items for this month */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Discretionary Spending ({activeMobileData.otherExpenses.length})
          </div>
          {activeMobileData.otherExpenses.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              No extra purchases recorded for {activeMobileData.monthName}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {activeMobileData.otherExpenses.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate mr-2">{tx.description}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">${tx.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Allocations Card (Salary, Rent, TFSA, Savings, Extra Left) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Salary 1 (Tejas)</span>
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{fmt(activeMobileData.salary1)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Salary 2 (Hetvi)</span>
            <span className="font-mono text-pink-600 dark:text-pink-400 font-bold">{fmt(activeMobileData.salary2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Rent</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{fmt(activeMobileData.rent)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">TFSA</span>
            <span className="font-mono text-teal-600 dark:text-teal-400">{fmt(activeMobileData.tfsa)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Hetvi&apos;s Savings</span>
            <span className="font-mono text-pink-600 dark:text-pink-400">{fmt(activeMobileData.hetviSavings)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Personal Savings</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{fmt(activeMobileData.personalSavings)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Total Spent</span>
            <span className="font-mono text-rose-600 font-bold">{fmt(activeMobileData.totalExpenses)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold">
            <span>Extra Left (Surplus):</span>
            <span className={`font-mono text-base ${
              activeMobileData.extraLeft >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
            }`}>
              {fmt(activeMobileData.extraLeft)}
            </span>
          </div>
        </div>

      </div>

      {/* FULL MATRIX TABLE (Horizontal scroll on phones, clean matrix on tablet/desktop) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">12-Month Spreadsheet Grid</span>
          <span className="text-[11px] text-slate-400">Scroll horizontally ➔</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-left font-extrabold text-sm border-r border-slate-200 dark:border-slate-800 w-44 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs inline-block">
                    {selectedYear}
                  </span>
                </th>
                {months.map(m => (
                  <th key={m.key} className="p-3 text-center font-bold text-xs border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50/90 dark:bg-slate-800/90 z-10">
                  Fixed Recurring Bills
                </td>
                {months.map(m => (
                  <td key={m.key} className="border-r border-slate-200 dark:border-slate-800" />
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Rogers (Phone)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Tejas</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.rogers)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Bell (Internet)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Shared</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.bell)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Hydro (Electric)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Shared</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.hydro)}
                  </td>
                ))}
              </tr>

              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50/90 dark:bg-slate-800/90 z-10">
                  Discretionary Items
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                    {d.otherExpenses.length > 0 ? (
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {d.otherExpenses.map((tx, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-white dark:bg-slate-800 p-1 rounded border border-slate-100 dark:border-slate-700/60">
                            <span className="truncate max-w-[65px]" title={tx.description}>{tx.description}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">${tx.amount}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-center block">-</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="bg-rose-50/50 dark:bg-rose-950/20 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <td className="p-3 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-rose-50 dark:bg-rose-950/70 z-10">
                  Total Expenses
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-3 text-center font-mono text-rose-600 dark:text-rose-400 font-extrabold border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.totalExpenses)}
                  </td>
                ))}
              </tr>

              <tr className="bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
                <td className="p-2.5 font-bold uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-emerald-50 dark:bg-emerald-950/80 z-10">
                  Income & Allocations
                </td>
                {months.map(m => (
                  <td key={m.key} className="border-r border-slate-200 dark:border-slate-800" />
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Salary 1 (Tejas)
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400 font-semibold border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.salary1)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Salary 2 (Hetvi)
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-pink-600 dark:text-pink-400 font-semibold border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.salary2)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Rent
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.rent)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  TFSA
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-teal-600 dark:text-teal-400 border-r border-slate-200 dark:border-slate-800">
                    {d.totalIncome > 0 ? fmt(d.tfsa) : '-'}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Htvi&apos;s Savings
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-pink-600 dark:text-pink-400 border-r border-slate-200 dark:border-slate-800">
                    {d.totalIncome > 0 ? fmt(d.hetviSavings) : '-'}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Personal Savings
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                    {d.totalIncome > 0 ? fmt(d.personalSavings) : '-'}
                  </td>
                ))}
              </tr>

              <tr className="bg-emerald-100/60 dark:bg-emerald-950/50 font-bold border-t-2 border-emerald-400 dark:border-emerald-600">
                <td className="p-3 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-emerald-100 dark:bg-emerald-950 z-10">
                  Extra Left (Surplus)
                </td>
                {monthlyData.map(d => (
                  <td
                    key={d.monthKey}
                    className={`p-3 text-center font-mono font-extrabold border-r border-slate-200 dark:border-slate-800 ${
                      d.extraLeft >= 0
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {d.totalIncome > 0 ? fmt(d.extraLeft) : '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <TransactionModal
          isOpen={isAddModalOpen}
          initialType="expense"
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
