import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Table, Download, Plus, Filter, Sparkles, Check, ArrowRight } from 'lucide-react';
import { TransactionModal } from '../transactions/TransactionModal';

export const SheetMatrixView: React.FC = () => {
  const { transactions, incomeSettings } = useFinance();
  const [selectedYear] = useState('2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // Helper to format currency
  const fmt = (v: number) => (v === 0 ? '-' : `$${v.toFixed(2)}`);

  // Compute month-by-month expenses breakdown
  const monthlyData = months.map(m => {
    const ym = `${selectedYear}-${m.key}`;
    const monthTx = transactions.filter(t => t.date.startsWith(ym));
    const expenses = monthTx.filter(t => t.type === 'expense');
    const incomes = monthTx.filter(t => t.type === 'income');

    // Rogers, Bell, Hydro
    const rogers = expenses.find(e => e.description.toLowerCase().includes('rogers'))?.amount || 0;
    const bell = expenses.find(e => e.description.toLowerCase().includes('bell'))?.amount || 0;
    const hydro = expenses.find(e => e.description.toLowerCase().includes('hydro'))?.amount || 0;

    // Discretionary / other expenses
    const otherExpenses = expenses.filter(e => {
      const d = e.description.toLowerCase();
      return !d.includes('rogers') && !d.includes('bell') && !d.includes('hydro') && !d.includes('rent');
    });

    const rent = expenses.find(e => e.description.toLowerCase().includes('rent'))?.amount || (expenses.length > 0 ? 1400 : 0);

    const totalExpenses = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    
    // Incomes
    let salary1 = incomes.find(i => i.paidBy === 'Tejas')?.amount || 0;
    let salary2 = incomes.find(i => i.paidBy === 'Hetvi')?.amount || 0;

    // If incomes not recorded explicitly for a month, fallback to setting
    if (salary1 === 0 && expenses.length > 0) salary1 = 2075.57;
    if (salary2 === 0 && expenses.length > 0) salary2 = 2126.81;

    const totalIncome = salary1 + salary2;

    // Monthly commitments from reference image
    const tfsa = 650;
    const hetviSavings = 1100;
    const personalSavings = 200;

    // Extra left calculation
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

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Interactive Spreadsheet Matrix
            </span>
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
              Google Sheet {selectedYear} Layout
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Monthly Expenses {selectedYear}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A comprehensive matrix matching your Google Sheets workbook with auto-balancing calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              {/* Year Banner Row */}
              <tr className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-left font-extrabold text-sm border-r border-slate-200 dark:border-slate-800 w-44 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs inline-block">
                    {selectedYear}
                  </span>
                </th>
                {months.map(m => (
                  <th key={m.key} className="p-3 text-center font-bold text-xs border-r border-slate-200 dark:border-slate-800 min-w-[140px]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* Core Recurring Bills Header */}
              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50/90 dark:bg-slate-800/90 z-10">
                  Fixed Recurring Bills
                </td>
                {months.map(m => (
                  <td key={m.key} className="border-r border-slate-200 dark:border-slate-800" />
                ))}
              </tr>

              {/* Rogers */}
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

              {/* Bell */}
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

              {/* Hydro */}
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

              {/* Discretionary Items Preview */}
              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50/90 dark:bg-slate-800/90 z-10">
                  Monthly Discretionary Items
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                    {d.otherExpenses.length > 0 ? (
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {d.otherExpenses.map((tx, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-white dark:bg-slate-800 p-1 rounded border border-slate-100 dark:border-slate-700/60">
                            <span className="truncate max-w-[70px]" title={tx.description}>{tx.description}</span>
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

              {/* Total Expenses Row */}
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

              {/* Income & Core Budget Allocation Section */}
              <tr className="bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
                <td className="p-2.5 font-bold uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-emerald-50 dark:bg-emerald-950/80 z-10">
                  Income & Allocations
                </td>
                {months.map(m => (
                  <td key={m.key} className="border-r border-slate-200 dark:border-slate-800" />
                ))}
              </tr>

              {/* Salary 1 (Tejas) */}
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

              {/* Salary 2 (Hetvi) */}
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

              {/* Rent */}
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

              {/* TFSA */}
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

              {/* Hetvi's Savings */}
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

              {/* Personal Savings */}
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

              {/* Extra Left Row (The highlight of their original spreadsheet) */}
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
