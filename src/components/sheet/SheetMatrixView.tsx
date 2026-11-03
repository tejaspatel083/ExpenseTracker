import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Table, Plus, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { AddExpenseModal } from '../modals/AddExpenseModal';

export const SheetMatrixView: React.FC = () => {
  const { transactions, monthlyIncomes, selectedMonth, setSelectedMonth } = useFinance();
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

    // Bills
    const rogers = monthTx.find(e => e.description.toLowerCase().includes('rogers'))?.amount || 0;
    const bell = monthTx.find(e => e.description.toLowerCase().includes('bell'))?.amount || 0;
    const hydro = monthTx.find(e => e.description.toLowerCase().includes('hydro'))?.amount || 0;

    // Discretionary / Personal spending
    const discretionaryExpenses = monthTx.filter(e => {
      const d = e.description.toLowerCase();
      const c = e.category.toLowerCase();
      return (
        !d.includes('rogers') &&
        !d.includes('bell') &&
        !d.includes('hydro') &&
        !d.includes('rent') &&
        c !== 'investment' &&
        c !== 'savings'
      );
    });

    const discretionaryTotal = discretionaryExpenses.reduce((acc, t) => acc + Number(t.amount), 0);

    // Personal Spending Budget is $325 (from Google Sheet)
    const personalBudget = 325;
    const personalLeft = discretionaryExpenses.length > 0 ? personalBudget - discretionaryTotal : personalBudget;

    // Salary & Allocations
    const tejasIncRecord = monthlyIncomes.find(i => i.month === ym && i.user === 'Tejas');
    const hetviIncRecord = monthlyIncomes.find(i => i.month === ym && i.user === 'Hetvi');

    let salary1 = tejasIncRecord ? tejasIncRecord.income : (discretionaryExpenses.length > 0 ? 2075.57 : 0);
    let salary2 = hetviIncRecord ? hetviIncRecord.income : (discretionaryExpenses.length > 0 ? 2126.81 : 0);

    const rent = monthTx.find(e => e.description.toLowerCase().includes('rent'))?.amount || (discretionaryExpenses.length > 0 ? 1400 : 0);
    const tfsaTx = monthTx.find(e => e.description.toLowerCase().includes('tfsa'))?.amount;
    const tfsa = tfsaTx !== undefined ? tfsaTx : (discretionaryExpenses.length > 0 ? 650 : 0);

    const hetviSavTx = monthTx.find(e => e.description.toLowerCase().includes('hetvi') && (e.category === 'Savings' || e.description.toLowerCase().includes('saving')))?.amount || 
      monthTx.find(e => e.description.toLowerCase().includes('hetvi'))?.amount;
    const hetviSavings = hetviSavTx !== undefined ? hetviSavTx : (discretionaryExpenses.length > 0 ? 1100 : 0);

    const personalSavings = discretionaryExpenses.length > 0 ? 200 : 0;
    const totalIncome = salary1 + salary2;

    const extraLeft = totalIncome > 0
      ? totalIncome - (rent + tfsa + hetviSavings + personalSavings + discretionaryTotal)
      : 0;

    return {
      monthKey: m.key,
      monthName: m.name,
      ym,
      rogers,
      bell,
      hydro,
      discretionaryExpenses,
      discretionaryTotal,
      personalLeft: Math.round(personalLeft * 100) / 100,
      rent,
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
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Spreadsheet View
            </span>
            <span className="text-[10px] sm:text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">
              {selectedYear}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Monthly Expenses {selectedYear}
          </h2>
          <p className="text-xs text-slate-400">
            Interactive grid replicating your Google Sheet workbook with live $325 personal limit and surplus tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* MOBILE FOCUS CARD (For small screens) */}
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
            <span className="text-xs uppercase tracking-wider font-bold text-amber-500">
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
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fixed Bills
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Rogers</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.rogers)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Bell</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.bell)}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Hydro</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{fmt(activeMobileData.hydro)}</span>
            </div>
          </div>
        </div>

        {/* Discretionary items for this month */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Daily Expenses ({activeMobileData.discretionaryExpenses.length})</span>
            <span className="text-slate-600 dark:text-slate-300">Total: ${activeMobileData.discretionaryTotal.toFixed(2)}</span>
          </div>
          {activeMobileData.discretionaryExpenses.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
              No daily expenses recorded for {activeMobileData.monthName}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {activeMobileData.discretionaryExpenses.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate mr-2">{tx.description}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">${tx.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Budget Left indicator ($325 limit) */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex justify-between items-center text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">Personal Left ($325 Limit):</span>
          <span className={`font-mono text-sm ${
            activeMobileData.personalLeft >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
          }`}>
            {fmt(activeMobileData.personalLeft)}
          </span>
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

      {/* FULL MATRIX TABLE (Exact replica of Google Sheet) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">12-Month Spreadsheet Grid</span>
          <span className="text-[11px] text-slate-400">Scroll horizontally ➔</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 text-left font-extrabold text-sm border-r border-slate-200 dark:border-slate-800 w-48 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs inline-block">
                    {selectedYear}
                  </span>
                </th>
                {months.map(m => (
                  <th 
                    key={m.key} 
                    onClick={() => setSelectedMonth(`${selectedYear}-${m.key}`)}
                    className={`p-3 text-center font-bold text-xs border-r border-slate-200 dark:border-slate-800 min-w-[130px] cursor-pointer hover:bg-amber-500/20 transition ${
                      selectedMonth === `${selectedYear}-${m.key}` ? 'bg-amber-500/20 font-black' : ''
                    }`}
                  >
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* FIXED BILLS */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Rogers</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.rogers)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Bell</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.bell)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between">
                  <span>Hydro</span>
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    {fmt(d.hydro)}
                  </td>
                ))}
              </tr>

              {/* DAILY / DISCRETIONARY EXPENSES */}
              <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                <td className="p-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50/90 dark:bg-slate-800/90 z-10">
                  Daily Expenses
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                    {d.discretionaryExpenses.length > 0 ? (
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {d.discretionaryExpenses.map((tx, idx) => (
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

              {/* TOTAL ROW (Exact match of Google Sheet row 17) */}
              <tr className="bg-rose-50/60 dark:bg-rose-950/20 font-bold border-t border-slate-300 dark:border-slate-700">
                <td className="p-2.5 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-rose-50 dark:bg-rose-950/70 z-10">
                  Total
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-rose-600 dark:text-rose-400 font-extrabold border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.discretionaryTotal + d.rogers + d.bell + d.hydro)}
                  </td>
                ))}
              </tr>

              {/* LEFT ROW (Exact match of Google Sheet row 18: $325 limit) */}
              <tr className="bg-emerald-50/60 dark:bg-emerald-950/20 font-bold border-b-2 border-slate-300 dark:border-slate-700">
                <td className="p-2.5 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-emerald-50 dark:bg-emerald-950/70 z-10">
                  Left ($325 Budget)
                </td>
                {monthlyData.map(d => (
                  <td 
                    key={d.monthKey} 
                    className={`p-2.5 text-center font-mono font-extrabold border-r border-slate-200 dark:border-slate-800 ${
                      d.personalLeft >= 0
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/40 dark:bg-emerald-950/40'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-950/50'
                    }`}
                  >
                    {d.personalLeft.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* SALARY & SAVINGS ALLOCATION ROWS (Rows 21-27) */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Salary-1 (Tejas)
                </td>
                {monthlyData.map(d => (
                  <td key={d.monthKey} className="p-2.5 text-center font-mono text-sky-600 dark:text-sky-400 font-semibold border-r border-slate-200 dark:border-slate-800">
                    {fmt(d.salary1)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Salary-2 (Hetvi)
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
                  Hetvi&apos;s Savings
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
                  Hetvi Left / Extra Surplus
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
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};
