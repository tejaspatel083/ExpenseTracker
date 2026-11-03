import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfileName,
  UserViewScope,
  CategoryAllocation,
  MonthlyUserIncome,
  SimpleTransaction,
  MonthSummaryStats,
  CategoryStatus,
  MonthlyHistoryRow,
  DEFAULT_CATEGORIES,
  PaycheckEntry,
  UserIncomeSettings
} from '../types';
import {
  SEED_INCOMES,
  SEED_ALLOCATIONS,
  SEED_TRANSACTIONS,
  DEFAULT_INCOME_SETTINGS,
  SEED_PAYCHECKS
} from '../data/seedData';
import { getSupabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateDefaultPaychecks, getBiweeklyThursdays } from '../utils/paycheckCalculator';

interface FinanceContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedScope: UserViewScope;
  setSelectedScope: (scope: UserViewScope) => void;

  monthlyIncomes: MonthlyUserIncome[];
  allocations: CategoryAllocation[];
  transactions: SimpleTransaction[];
  paychecks: PaycheckEntry[];
  incomeSettings: Record<UserProfileName, UserIncomeSettings>;

  setMonthlyIncome: (month: string, user: UserProfileName, income: number) => Promise<void>;
  updateAllocations: (
    month: string,
    user: UserProfileName,
    newAllocations: Array<{ category: string; plannedAmount: number; nature: 'expense' | 'investment' | 'savings' }>
  ) => Promise<void>;

  addTransaction: (tx: Omit<SimpleTransaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<SimpleTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Paycheck & Biweekly Customization
  getPaychecksForMonth: (month: string, user: UserProfileName) => PaycheckEntry[];
  savePaychecks: (month: string, user: UserProfileName, newPaychecks: PaycheckEntry[]) => Promise<void>;
  updateIncomeSettings: (user: UserProfileName, settings: Partial<UserIncomeSettings>) => void;

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

  const [paychecks, setPaychecks] = useState<PaycheckEntry[]>(() => {
    const saved = localStorage.getItem(`${LS_KEY}paychecks`);
    return saved ? JSON.parse(saved) : SEED_PAYCHECKS;
  });

  const [incomeSettings, setIncomeSettings] = useState<Record<UserProfileName, UserIncomeSettings>>(() => {
    const saved = localStorage.getItem(`${LS_KEY}income_settings`);
    return saved ? JSON.parse(saved) : DEFAULT_INCOME_SETTINGS;
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

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}paychecks`, JSON.stringify(paychecks));
  }, [paychecks]);

  useEffect(() => {
    localStorage.setItem(`${LS_KEY}income_settings`, JSON.stringify(incomeSettings));
  }, [incomeSettings]);

  // Set monthly income directly
  const setMonthlyIncome = async (month: string, user: UserProfileName, income: number) => {
    setMonthlyIncomes(prev => {
      const filtered = prev.filter(i => !(i.month === month && i.user === user));
      return [...filtered, { month, user, income: Math.round(income * 100) / 100 }];
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

  // Get paychecks for month & user (calculates bi-weekly Thursdays automatically if not set)
  const getPaychecksForMonth = (month: string, user: UserProfileName): PaycheckEntry[] => {
    const userPaychecks = paychecks.filter(p => p.month === month && p.user === user);
    if (userPaychecks.length > 0) {
      return userPaychecks;
    }
    // Generate default bi-weekly paychecks for this user
    return generateDefaultPaychecks(month, user, incomeSettings[user] || DEFAULT_INCOME_SETTINGS[user]);
  };

  // Save paychecks for month & user, and auto-sync total income
  const savePaychecks = async (month: string, user: UserProfileName, newPaychecks: PaycheckEntry[]) => {
    setPaychecks(prev => {
      const rest = prev.filter(p => !(p.month === month && p.user === user));
      return [...rest, ...newPaychecks];
    });

    // Auto-update monthly income to the sum of paychecks
    const totalIncome = newPaychecks.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    await setMonthlyIncome(month, user, totalIncome);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('paychecks').delete().match({ month, user_name: user });
        const records = newPaychecks.map(p => ({
          id: p.id,
          month: p.month,
          user_name: p.user,
          date: p.date,
          label: p.label,
          amount: p.amount
        }));
        await supabase.from('paychecks').insert(records);
      } catch (e) {
        console.error('Supabase error saving paychecks:', e);
      }
    }
  };

  // Update user income settings (anchor date, pay frequency, base amount)
  const updateIncomeSettings = (user: UserProfileName, settings: Partial<UserIncomeSettings>) => {
    setIncomeSettings(prev => ({
      ...prev,
      [user]: {
        ...prev[user],
        ...settings
      }
    }));
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
        const records = formatted.map(f => ({
          month: f.month,
          user_name: f.user,
          category: f.category,
          planned_amount: f.plannedAmount,
          nature: f.nature
        }));
        await supabase.from('allocations').insert(records);
      } catch (e) {
        console.error('Supabase error saving allocations:', e);
      }
    }
  };

  // Add transaction
  const addTransaction = async (tx: Omit<SimpleTransaction, 'id'>) => {
    const newTx: SimpleTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount: Number(tx.amount) || 0
    };

    setTransactions(prev => [newTx, ...prev]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('simple_transactions').insert({
          id: newTx.id,
          date: newTx.date,
          description: newTx.description,
          category: newTx.category,
          amount: newTx.amount,
          user_name: newTx.user
        });
      } catch (e) {
        console.error('Supabase error inserting transaction:', e);
      }
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<SimpleTransaction>) => {
    setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('simple_transactions').update({
          ...(updates.date && { date: updates.date }),
          ...(updates.description && { description: updates.description }),
          ...(updates.category && { category: updates.category }),
          ...(updates.amount !== undefined && { amount: Number(updates.amount) }),
          ...(updates.user && { user_name: updates.user })
        }).eq('id', id);
      } catch (e) {
        console.error('Supabase error updating transaction:', e);
      }
    }
  };

  // Delete transaction
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

  // Calculate Month Summary Stats
  const getStats = (month: string = selectedMonth, scope: UserViewScope = selectedScope): MonthSummaryStats => {
    let income = 0;
    if (scope === 'household') {
      const tInc = monthlyIncomes.find(i => i.month === month && i.user === 'Tejas')?.income || 0;
      const hInc = monthlyIncomes.find(i => i.month === month && i.user === 'Hetvi')?.income || 0;
      income = tInc + hInc;
    } else {
      income = monthlyIncomes.find(i => i.month === month && i.user === scope)?.income || 0;
    }

    const monthAllocs = allocations.filter(a => {
      if (a.month !== month) return false;
      if (scope === 'household') return true;
      return a.user === scope;
    });

    const allocated = monthAllocs.reduce((sum, a) => sum + (Number(a.plannedAmount) || 0), 0);
    const plannedSavings = monthAllocs
      .filter(a => a.nature === 'savings')
      .reduce((sum, a) => sum + (Number(a.plannedAmount) || 0), 0);

    const monthTx = transactions.filter(t => {
      if (!t.date.startsWith(month)) return false;
      if (scope === 'household') return true;
      return t.user === scope;
    });

    const categoryNatureMap: Record<string, 'expense' | 'investment' | 'savings'> = {};
    monthAllocs.forEach(a => {
      categoryNatureMap[a.category.toLowerCase()] = a.nature;
    });

    let actualExpenses = 0;
    let actualInvestments = 0;

    monthTx.forEach(t => {
      const amt = Number(t.amount) || 0;
      const catLower = t.category.toLowerCase();
      const nature = categoryNatureMap[catLower] ||
        (catLower === 'investment' ? 'investment' : catLower === 'savings' ? 'savings' : 'expense');

      if (nature === 'expense') {
        actualExpenses += amt;
      } else if (nature === 'investment') {
        actualInvestments += amt;
      }
    });

    const actualSavings = Math.round((income - actualExpenses - actualInvestments) * 100) / 100;
    const remainingBudget = Math.round((income - actualExpenses) * 100) / 100;
    const savingsRate = income > 0 ? Math.max(0, Math.round((actualSavings / income) * 1000) / 10) : 0;

    return {
      month,
      income: Math.round(income * 100) / 100,
      allocated: Math.round(allocated * 100) / 100,
      actualExpenses: Math.round(actualExpenses * 100) / 100,
      actualInvestments: Math.round(actualInvestments * 100) / 100,
      plannedSavings: Math.round(plannedSavings * 100) / 100,
      actualSavings,
      remainingBudget,
      savingsRate
    };
  };

  // Calculate Category Statuses
  const getCategoryStatuses = (month: string = selectedMonth, scope: UserViewScope = selectedScope): CategoryStatus[] => {
    const monthAllocs = allocations.filter(a => {
      if (a.month !== month) return false;
      if (scope === 'household') return true;
      return a.user === scope;
    });

    const monthTx = transactions.filter(t => {
      if (!t.date.startsWith(month)) return false;
      if (scope === 'household') return true;
      return t.user === scope;
    });

    const categoryMap: Record<string, { planned: number; spent: number; nature: 'expense' | 'investment' | 'savings' }> = {};

    monthAllocs.forEach(a => {
      if (!categoryMap[a.category]) {
        categoryMap[a.category] = { planned: 0, spent: 0, nature: a.nature };
      }
      categoryMap[a.category].planned += Number(a.plannedAmount) || 0;
      categoryMap[a.category].nature = a.nature;
    });

    monthTx.forEach(t => {
      if (!categoryMap[t.category]) {
        const catLower = t.category.toLowerCase();
        const nature = catLower === 'investment' ? 'investment' : catLower === 'savings' ? 'savings' : 'expense';
        categoryMap[t.category] = { planned: 0, spent: 0, nature };
      }
      categoryMap[t.category].spent += Number(t.amount) || 0;
    });

    return Object.entries(categoryMap).map(([cat, data]) => {
      const planned = Math.round(data.planned * 100) / 100;
      const spent = Math.round(data.spent * 100) / 100;
      const remaining = Math.round((planned - spent) * 100) / 100;
      const percentage = planned > 0 ? Math.round((spent / planned) * 100) : spent > 0 ? 100 : 0;
      const isOverBudget = planned > 0 && spent > planned;
      const overAmount = isOverBudget ? Math.round((spent - planned) * 100) / 100 : 0;

      return {
        category: cat,
        planned,
        spent,
        remaining,
        percentage,
        isOverBudget,
        overAmount,
        nature: data.nature
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
    setPaychecks(SEED_PAYCHECKS);
    setIncomeSettings(DEFAULT_INCOME_SETTINGS);
    localStorage.removeItem(`${LS_KEY}incomes`);
    localStorage.removeItem(`${LS_KEY}allocations`);
    localStorage.removeItem(`${LS_KEY}transactions`);
    localStorage.removeItem(`${LS_KEY}paychecks`);
    localStorage.removeItem(`${LS_KEY}income_settings`);
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
        paychecks,
        incomeSettings,
        setMonthlyIncome,
        updateAllocations,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getPaychecksForMonth,
        savePaychecks,
        updateIncomeSettings,
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
