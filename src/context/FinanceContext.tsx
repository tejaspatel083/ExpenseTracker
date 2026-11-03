import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  Budget,
  RecurringExpense,
  SavingsGoal,
  IncomeSetting,
  UserViewScope,
  UserProfileName,
  MonthlySummary,
  PayFrequency
} from '../types';
import {
  SEED_TRANSACTIONS,
  SEED_BUDGETS,
  SEED_RECURRING_EXPENSES,
  SEED_SAVINGS_GOALS,
  SEED_INCOME_SETTINGS
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { getSupabase } from '../lib/supabase';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  incomeSettings: IncomeSetting[];
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  selectedScope: UserViewScope;
  setSelectedScope: (scope: UserViewScope) => void;
  isLoading: boolean;
  isSyncing: boolean;
  syncStatus: string;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Recurring Expenses
  addRecurringExpense: (rec: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, rec: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;

  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  depositToGoal: (id: string, amount: number) => Promise<void>;

  // Income Settings
  updateIncomeSetting: (id: string, setting: Partial<IncomeSetting>) => Promise<void>;

  // Calculations
  calculatePaycheckAmount: (setting: IncomeSetting) => number;
  calculateMonthlyProjectedIncome: (setting: IncomeSetting) => number;
  getMonthlySummary: (month: string) => MonthlySummary;
  
  // Data management
  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LS_PREFIX = 'household_finance_';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isSupabaseConnected } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedScope, setSelectedScope] = useState<UserViewScope>('household');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Local Mode');

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}budgets`);
    return saved ? JSON.parse(saved) : SEED_BUDGETS;
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}recurring`);
    return saved ? JSON.parse(saved) : SEED_RECURRING_EXPENSES;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}goals`);
    return saved ? JSON.parse(saved) : SEED_SAVINGS_GOALS;
  });

  const [incomeSettings, setIncomeSettings] = useState<IncomeSetting[]>(() => {
    const saved = localStorage.getItem(`${LS_PREFIX}income`);
    return saved ? JSON.parse(saved) : SEED_INCOME_SETTINGS;
  });

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}budgets`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}recurring`, JSON.stringify(recurringExpenses));
  }, [recurringExpenses]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}goals`, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(`${LS_PREFIX}income`, JSON.stringify(incomeSettings));
  }, [incomeSettings]);

  // Supabase sync when available
  useEffect(() => {
    const syncWithSupabase = async () => {
      const supabase = getSupabase();
      if (!isSupabaseConnected || !supabase || !currentUser) {
        setSyncStatus('Local Storage (Active)');
        setIsLoading(false);
        return;
      }

      setIsSyncing(true);
      setSyncStatus('Syncing with Supabase...');

      try {
        // Fetch transactions from Supabase
        const { data: remoteTx, error: txErr } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (!txErr && remoteTx && remoteTx.length > 0) {
          const mappedTx: Transaction[] = remoteTx.map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            category: t.category,
            amount: Number(t.amount),
            type: t.type,
            paidBy: t.paid_by,
            paymentMethod: t.payment_method,
            isRecurring: t.is_recurring,
            createdBy: t.created_by,
            notes: t.notes,
            createdAt: t.created_at
          }));
          setTransactions(mappedTx);
        } else if (!txErr && remoteTx && remoteTx.length === 0 && transactions.length > 0) {
          // If remote is empty, seed it with current transactions!
          const dbRows = transactions.map(t => ({
            date: t.date,
            description: t.description,
            category: t.category,
            amount: t.amount,
            type: t.type,
            paid_by: t.paidBy,
            payment_method: t.paymentMethod,
            is_recurring: t.isRecurring,
            created_by: t.createdBy,
            notes: t.notes || ''
          }));
          await supabase.from('transactions').insert(dbRows);
        }

        // Fetch budgets
        const { data: remoteBudgets, error: bErr } = await supabase.from('budgets').select('*');
        if (!bErr && remoteBudgets && remoteBudgets.length > 0) {
          setBudgets(remoteBudgets.map(b => ({
            id: b.id,
            month: b.month,
            category: b.category,
            amount: Number(b.amount),
            scope: b.scope
          })));
        }

        // Fetch recurring
        const { data: remoteRec, error: recErr } = await supabase.from('recurring_expenses').select('*');
        if (!recErr && remoteRec && remoteRec.length > 0) {
          setRecurringExpenses(remoteRec.map(r => ({
            id: r.id,
            description: r.description,
            amount: Number(r.amount),
            category: r.category,
            paidBy: r.paid_by,
            frequency: r.frequency,
            nextPaymentDate: r.next_payment_date,
            isActive: r.is_active,
            isEssential: r.is_essential
          })));
        }

        // Fetch goals
        const { data: remoteGoals, error: gErr } = await supabase.from('savings_goals').select('*');
        if (!gErr && remoteGoals && remoteGoals.length > 0) {
          setSavingsGoals(remoteGoals.map(g => ({
            id: g.id,
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            targetDate: g.target_date,
            owner: g.owner,
            category: g.category,
            notes: g.notes
          })));
        }

        // Fetch income settings
        const { data: remoteInc, error: incErr } = await supabase.from('income_settings').select('*');
        if (!incErr && remoteInc && remoteInc.length > 0) {
          setIncomeSettings(remoteInc.map(i => ({
            id: i.id,
            userName: i.user_name,
            type: i.type,
            title: i.title,
            annualSalary: Number(i.annual_salary),
            payFrequency: i.pay_frequency,
            nextPayday: i.next_payday,
            employer: i.employer,
            bonusAmount: Number(i.bonus_amount || 0),
            notes: i.notes,
            isActive: i.is_active
          })));
        }

        setSyncStatus('Supabase Connected');
      } catch (err) {
        console.warn('Supabase fetch failed, operating in offline/local cache mode:', err);
        setSyncStatus('Local Cache (Supabase sync paused)');
      } finally {
        setIsSyncing(false);
        setIsLoading(false);
      }
    };

    syncWithSupabase();
  }, [isSupabaseConnected, currentUser]);

  // Calculations
  const calculatePaycheckAmount = (setting: IncomeSetting): number => {
    const annual = Number(setting.annualSalary) || 0;
    switch (setting.payFrequency) {
      case 'weekly':
        return Math.round((annual / 52) * 100) / 100;
      case 'biweekly':
        return Math.round((annual / 26) * 100) / 100;
      case 'twice_monthly':
        return Math.round((annual / 24) * 100) / 100;
      case 'monthly':
      default:
        return Math.round((annual / 12) * 100) / 100;
    }
  };

  const calculateMonthlyProjectedIncome = (setting: IncomeSetting): number => {
    const paycheck = calculatePaycheckAmount(setting);
    switch (setting.payFrequency) {
      case 'weekly':
        return Math.round((paycheck * 52 / 12) * 100) / 100;
      case 'biweekly':
        return Math.round((paycheck * 26 / 12) * 100) / 100;
      case 'twice_monthly':
        return Math.round((paycheck * 2) * 100) / 100;
      case 'monthly':
      default:
        return paycheck;
    }
  };

  const getMonthlySummary = (month: string): MonthlySummary => {
    // Filter transactions for this month (YYYY-MM)
    const monthTx = transactions.filter(t => t.date.startsWith(month));

    let householdIncome = 0;
    let tejasIncome = 0;
    let hetviIncome = 0;

    let householdExpenses = 0;
    let tejasExpenses = 0;
    let hetviExpenses = 0;
    let sharedExpenses = 0;

    // Sum transactions
    monthTx.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        householdIncome += amt;
        if (t.paidBy === 'Tejas') tejasIncome += amt;
        else if (t.paidBy === 'Hetvi') hetviIncome += amt;
        else {
          // If shared income, split 50/50 for individual tracking
          tejasIncome += amt / 2;
          hetviIncome += amt / 2;
        }
      } else {
        householdExpenses += amt;
        if (t.paidBy === 'Tejas') tejasExpenses += amt;
        else if (t.paidBy === 'Hetvi') hetviExpenses += amt;
        else if (t.paidBy === 'Shared') sharedExpenses += amt;
      }
    });

    // If month has no income transactions yet, project based on active income settings
    if (householdIncome === 0) {
      incomeSettings.filter(s => s.isActive).forEach(s => {
        const projected = calculateMonthlyProjectedIncome(s);
        householdIncome += projected;
        if (s.userName === 'Tejas') tejasIncome += projected;
        if (s.userName === 'Hetvi') hetviIncome += projected;
      });
    }

    const available = householdIncome - householdExpenses;
    // Savings: surplus available plus explicit savings transactions/goals
    const savings = Math.max(0, available);

    return {
      month,
      householdIncome: Math.round(householdIncome * 100) / 100,
      householdExpenses: Math.round(householdExpenses * 100) / 100,
      available: Math.round(available * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      tejasIncome: Math.round(tejasIncome * 100) / 100,
      hetviIncome: Math.round(hetviIncome * 100) / 100,
      tejasExpenses: Math.round(tejasExpenses * 100) / 100,
      hetviExpenses: Math.round(hetviExpenses * 100) / 100,
      sharedExpenses: Math.round(sharedExpenses * 100) / 100
    };
  };

  // CRUD Actions
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdBy: currentUser ? currentUser.name : 'Tejas',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('transactions').insert({
          date: newTx.date,
          description: newTx.description,
          category: newTx.category,
          amount: newTx.amount,
          type: newTx.type,
          paid_by: newTx.paidBy,
          payment_method: newTx.paymentMethod,
          is_recurring: newTx.isRecurring,
          created_by: newTx.createdBy,
          notes: newTx.notes || ''
        });
      } catch (err) {
        console.error('Supabase insert transaction error:', err);
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        const dbUpdates: any = {};
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.paidBy !== undefined) dbUpdates.paid_by = updates.paidBy;
        if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

        await supabase.from('transactions').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Supabase update transaction error:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete transaction error:', err);
      }
    }
  };

  // Budgets CRUD
  const addBudget = async (bData: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      ...bData,
      id: `b-${Date.now()}`
    };
    setBudgets(prev => [...prev, newB]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('budgets').insert({
          month: newB.month,
          category: newB.category,
          amount: newB.amount,
          scope: newB.scope
        });
      } catch (err) {
        console.error('Supabase add budget error:', err);
      }
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('budgets').update(updates).eq('id', id);
      } catch (err) {
        console.error('Supabase update budget error:', err);
      }
    }
  };

  const deleteBudget = async (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('budgets').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete budget error:', err);
      }
    }
  };

  // Recurring Expenses CRUD
  const addRecurringExpense = async (recData: Omit<RecurringExpense, 'id'>) => {
    const newRec: RecurringExpense = {
      ...recData,
      id: `rec-${Date.now()}`
    };
    setRecurringExpenses(prev => [...prev, newRec]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('recurring_expenses').insert({
          description: newRec.description,
          amount: newRec.amount,
          category: newRec.category,
          paid_by: newRec.paidBy,
          frequency: newRec.frequency,
          next_payment_date: newRec.nextPaymentDate,
          is_active: newRec.isActive,
          is_essential: newRec.isEssential ?? false
        });
      } catch (err) {
        console.error('Supabase add recurring error:', err);
      }
    }
  };

  const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
    setRecurringExpenses(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        const dbUpdates: any = {};
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.paidBy) dbUpdates.paid_by = updates.paidBy;
        if (updates.frequency) dbUpdates.frequency = updates.frequency;
        if (updates.nextPaymentDate) dbUpdates.next_payment_date = updates.nextPaymentDate;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.isEssential !== undefined) dbUpdates.is_essential = updates.isEssential;

        await supabase.from('recurring_expenses').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Supabase update recurring error:', err);
      }
    }
  };

  const deleteRecurringExpense = async (id: string) => {
    setRecurringExpenses(prev => prev.filter(r => r.id !== id));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('recurring_expenses').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete recurring error:', err);
      }
    }
  };

  // Savings Goals CRUD
  const addSavingsGoal = async (gData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...gData,
      id: `sg-${Date.now()}`
    };
    setSavingsGoals(prev => [...prev, newGoal]);

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('savings_goals').insert({
          title: newGoal.title,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount,
          target_date: newGoal.targetDate,
          owner: newGoal.owner,
          category: newGoal.category,
          notes: newGoal.notes || ''
        });
      } catch (err) {
        console.error('Supabase add goal error:', err);
      }
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
        if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
        if (updates.targetDate) dbUpdates.target_date = updates.targetDate;
        if (updates.owner) dbUpdates.owner = updates.owner;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

        await supabase.from('savings_goals').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Supabase update goal error:', err);
      }
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete goal error:', err);
      }
    }
  };

  const depositToGoal = async (id: string, amount: number) => {
    const targetGoal = savingsGoals.find(g => g.id === id);
    if (!targetGoal) return;
    const newCurrent = Math.max(0, targetGoal.currentAmount + amount);
    await updateSavingsGoal(id, { currentAmount: newCurrent });
  };

  // Income Settings CRUD
  const updateIncomeSetting = async (id: string, updates: Partial<IncomeSetting>) => {
    setIncomeSettings(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    const supabase = getSupabase();
    if (supabase && isSupabaseConnected) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.annualSalary !== undefined) dbUpdates.annual_salary = updates.annualSalary;
        if (updates.payFrequency) dbUpdates.pay_frequency = updates.payFrequency;
        if (updates.nextPayday) dbUpdates.next_payday = updates.nextPayday;
        if (updates.employer) dbUpdates.employer = updates.employer;
        if (updates.bonusAmount !== undefined) dbUpdates.bonus_amount = updates.bonusAmount;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        await supabase.from('income_settings').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Supabase update income setting error:', err);
      }
    }
  };

  const resetToSampleData = () => {
    setTransactions(SEED_TRANSACTIONS);
    setBudgets(SEED_BUDGETS);
    setRecurringExpenses(SEED_RECURRING_EXPENSES);
    setSavingsGoals(SEED_SAVINGS_GOALS);
    setIncomeSettings(SEED_INCOME_SETTINGS);
    localStorage.removeItem(`${LS_PREFIX}transactions`);
    localStorage.removeItem(`${LS_PREFIX}budgets`);
    localStorage.removeItem(`${LS_PREFIX}recurring`);
    localStorage.removeItem(`${LS_PREFIX}goals`);
    localStorage.removeItem(`${LS_PREFIX}income`);
  };

  const exportDataJSON = () => {
    const backup = {
      transactions,
      budgets,
      recurringExpenses,
      savingsGoals,
      incomeSettings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.recurringExpenses) setRecurringExpenses(parsed.recurringExpenses);
      if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
      if (parsed.incomeSettings) setIncomeSettings(parsed.incomeSettings);
      return true;
    } catch (e) {
      console.error('Invalid JSON import:', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        recurringExpenses,
        savingsGoals,
        incomeSettings,
        selectedMonth,
        setSelectedMonth,
        selectedScope,
        setSelectedScope,
        isLoading,
        isSyncing,
        syncStatus,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        depositToGoal,
        updateIncomeSetting,
        calculatePaycheckAmount,
        calculateMonthlyProjectedIncome,
        getMonthlySummary,
        resetToSampleData,
        exportDataJSON,
        importDataJSON
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

