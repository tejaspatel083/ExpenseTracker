import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfileName,
  UserViewScope,
  CategoryAllocation,
  MonthlyUserIncome,
  SimpleTransaction,
  MonthSummaryStats
} from '../types';
import {
  SEED_INCOMES,
  SEED_ALLOCATIONS,
  SEED_TRANSACTIONS
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';

interface CategoryStatus {
  id: string;
  category: string;
  nature: 'expense' | 'investment' | 'savings';
  planned: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  overAmount: number;
}

interface MonthlyHistoryRow {
  month: string;
  monthLabel: string;
  income: number;
  expenses: number;
  investment: number;
  savings: number;
  savingsRate: number;
  plannedSavings: number;
}

interface FinanceContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedScope: UserViewScope;
  setSelectedScope: (scope: UserViewScope) => void;

  monthlyIncomes: MonthlyUserIncome[];
  allocations: CategoryAllocation[];
  transactions: SimpleTransaction[];

  setMonthlyIncome: (month: string, user: UserProfileName, income: number) => Promise<void>;
  updateAllocations: (month: string, user: UserProfileName, newAllocations: Array<{ category: string; plannedAmount: number; nature: 'expense' | 'investment' | 'savings' }>) => Promise<void>;

  addTransaction: (tx: Omit<SimpleTransaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<SimpleTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  getStats: (month?: string, scope?: UserViewScope) => MonthSummaryStats;
  getCategoryStatuses: (month?: string, scope?: UserViewScope) => CategoryStatus[];
  getMonthlyHistory: (scope?: UserViewScope) => MonthlyHistoryRow[];

  resetToDefault: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);
const LS_KEY = 'simple_tracker_';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSupabaseConnected } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedScope, setSelectedScope] = useState<UserViewScope>('household');

  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyUserIncome[]>(() => {
    const saved = localStorage.getItem(`${LS_KEY}incomes`);
    return saved ? JSON.parse(saved) : SEED_INCOMES;
  });

  const [allocations, setAllocations] = useState<CategoryAllocation[]>(() => {
    const saved = localStorage.getItem(`${LS_KEY}allocations`);
    return saved ? JSON.parse(saved) : SEED_ALLOCATIONS;
  });

  const [transactions, setTransactions] = useState<SimpleTransaction[]>(() => {
    const saved = localStorage.getItem(`${LS_KEY}transactions`);
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}incomes`, JSON.stringify(monthlyIncomes));
  }, [monthlyIncomes]);

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}allocations`, JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Set monthly income
  const setMonthlyIncome = async (month: string, user: UserProfileName, income: number) => {
    setMonthlyIncomes(prev => {
      const filtered = prev.filter(i => !(i.month === month && i.user === user));
      return [...filtered, { month, user, income }];
    });

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('monthly_incomes').upsert({ month, user_name: user, income });
      } catch (e) {
        console.error('Supabase error saving income:', e);
      }
    }
  };

  // Update allocation categories
  const updateAllocations = async (
    month: string,
    user: UserProfileName,
    newItems: Array<{ category: string; plannedAmount: number; nature: 'expense' | 'investment' | 'savings' }>
  ) => {
    const formatted: CategoryAllocation[] = newItems.map((item, idx) => ({
      id: `alloc-${month}-${user}-${idx}-${Date.now()}`,
      month,
      user,
      category: item.category,
      plannedAmount: Number(item.plannedAmount) || 0,
      nature: item.nature
    }));

    setAllocations(prev => {
      const rest = prev.filter(a => !(a.month === month && a.user === user));
      return [...rest, ...formatted];
    });

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('allocations').delete().match({ month, user_name: user });
        await supabase.from('allocations').insert(
          formatted.map(f => ({
            month: f.month,
            user_name: f.user,
            category: f.category,
            planned_amount: f.plannedAmount,
            nature: f.nature
          }))
        );
      } catch (e) {
        console.error('Supabase error saving allocations:', e);
      }
    }
  };

  // Transactions CRUD
  const addTransaction = async (txData: Omit<SimpleTransaction, 'id'>) => {
    const newTx: SimpleTransaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };

    setTransactions(prev => [newTx, ...prev]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('simple_transactions').insert({
          date: newTx.date,
          description: newTx.description,
          category: newTx.category,
          amount: newTx.amount,
          user_name: newTx.user
        });
      } catch (e) {
        console.error('Supabase error saving transaction:', e);
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<SimpleTransaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('simple_transactions').update(updates).eq('id', id);
      } catch (e) {
        console.error('Supabase error updating transaction:', e);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('simple_transactions').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase error deleting transaction:', e);
      }
    }
  };

  // Get Summary Stats for Dashboard & Monthly Summary
  const getStats = (month: string = selectedMonth, scope: UserViewScope = selectedScope): MonthSummaryStats => {
    // 1. Incomes
    let income = 0;
    const relevantIncomes = monthlyIncomes.filter(i => {
      if (i.month !== month) return false;
      if (scope === 'household') return true;
      return i.user === scope;
    });
    income = relevantIncomes.reduce((sum, i) => sum + Number(i.income), 0);

    // If month income not set, fallback default
    if (income === 0) {
      if (scope === 'household') income = 7000;
      else if (scope === 'Tejas') income = 4000;
      else if (scope === 'Hetvi') income = 3000;
    }

    // 2. Allocations
    const relevantAllocs = allocations.filter(a => {
      if (a.month !== month) return false;
      if (scope === 'household') return true;
      return a.user === scope;
    });

    const allocated = relevantAllocs.reduce((sum, a) => sum + Number(a.plannedAmount), 0);
    const plannedSavings = relevantAllocs
      .filter(a => a.nature === 'savings')
      .reduce((sum, a) => sum + Number(a.plannedAmount), 0);

    // 3. Transactions
    const relevantTx = transactions.filter(t => {
      if (!t.date.startsWith(month)) return false;
      if (scope === 'household') return true;
      return t.user === scope;
    });

    let actualExpenses = 0;
    let actualInvestments = 0;

    relevantTx.forEach(t => {
      const amt = Number(t.amount) || 0;
      const alloc = relevantAllocs.find(a => a.category.toLowerCase() === t.category.toLowerCase());
      if (alloc?.nature === 'investment' || t.category.toLowerCase().includes('invest')) {
        actualInvestments += amt;
      } else {
        actualExpenses += amt;
      }
    });

    // Actual Savings = Income − actual expenses − actual investments
    const actualSavings = income - actualExpenses - actualInvestments;
    const remainingBudget = Math.max(0, income - actualExpenses - actualInvestments);
    const savingsRate = income > 0 ? Math.round((actualSavings / income) * 10000) / 100 : 0;

    return {
      month,
      income,
      allocated,
      actualExpenses,
      actualInvestments,
      plannedSavings,
      actualSavings,
      remainingBudget,
      savingsRate
    };
  };

  // Get status for each allocated category
  const getCategoryStatuses = (month: string = selectedMonth, scope: UserViewScope = selectedScope): CategoryStatus[] => {
    const relevantAllocs = allocations.filter(a => {
      if (a.month !== month) return false;
      if (scope === 'household') return true;
      return a.user === scope;
    });

    const relevantTx = transactions.filter(t => {
      if (!t.date.startsWith(month)) return false;
      if (scope === 'household') return true;
      return t.user === scope;
    });

    // Aggregate by category name
    const grouped: Record<string, { planned: number; spent: number; nature: 'expense' | 'investment' | 'savings'; id: string }> = {};

    relevantAllocs.forEach(a => {
      if (!grouped[a.category]) {
        grouped[a.category] = {
          id: a.id,
          planned: 0,
          spent: 0,
          nature: a.nature
        };
      }
      grouped[a.category].planned += Number(a.plannedAmount) || 0;
    });

    relevantTx.forEach(t => {
      if (grouped[t.category]) {
        grouped[t.category].spent += Number(t.amount) || 0;
      } else {
        // Transaction without planned allocation
        grouped[t.category] = {
          id: `unplanned-${t.category}`,
          planned: 0,
          spent: Number(t.amount) || 0,
          nature: t.category.toLowerCase().includes('invest') ? 'investment' : 'expense'
        };
      }
    });

    return Object.entries(grouped).map(([category, data]) => {
      const remaining = Math.max(0, data.planned - data.spent);
      const isOverBudget = data.spent > data.planned && data.planned > 0;
      const overAmount = isOverBudget ? data.spent - data.planned : 0;
      const percentage = data.planned > 0 ? Math.round((data.spent / data.planned) * 100) : (data.spent > 0 ? 100 : 0);

      return {
        id: data.id,
        category,
        nature: data.nature,
        planned: data.planned,
        spent: data.spent,
        remaining,
        percentage,
        isOverBudget,
        overAmount
      };
    });
  };

  // History table rows (June to November 2026 from user's Google Sheet)
  const getMonthlyHistory = (scope: UserViewScope = selectedScope): MonthlyHistoryRow[] => {
    const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
    const labels: Record<string, string> = {
      '2026-06': 'June 2026',
      '2026-07': 'July 2026',
      '2026-08': 'August 2026',
      '2026-09': 'September 2026',
      '2026-10': 'October 2026',
      '2026-11': 'November 2026'
    };

    return months.map(m => {
      const stats = getStats(m, scope);
      return {
        month: m,
        monthLabel: labels[m] || m,
        income: stats.income,
        expenses: stats.actualExpenses,
        investment: stats.actualInvestments,
        savings: stats.actualSavings,
        savingsRate: stats.savingsRate,
        plannedSavings: stats.plannedSavings
      };
    });
  };

  const resetToDefault = () => {
    setMonthlyIncomes(SEED_INCOMES);
    setAllocations(SEED_ALLOCATIONS);
    setTransactions(SEED_TRANSACTIONS);
    localStorage.removeItem(`${LS_KEY}incomes`);
    localStorage.removeItem(`${LS_KEY}allocations`);
    localStorage.removeItem(`${LS_KEY}transactions`);
  };

  return (
    <FinanceContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        selectedScope,
        setSelectedScope,
        monthlyIncomes,
        allocations,
        transactions,
        setMonthlyIncome,
        updateAllocations,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getStats,
        getCategoryStatuses,
        getMonthlyHistory,
        resetToDefault
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
