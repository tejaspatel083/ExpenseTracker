export type UserProfileName = 'Tejas' | 'Hetvi';
export type UserViewScope = 'household' | 'Tejas' | 'Hetvi';

export interface UserProfile {
  id?: string;
  name: UserProfileName;
  email: string;
  avatarColor: string;
  avatarBg: string;
  role?: string;
}

export type CategoryNature = 'expense' | 'investment' | 'savings';

export interface CategoryAllocation {
  id: string;
  month: string; // YYYY-MM
  user: UserProfileName;
  category: string;
  plannedAmount: number;
  nature: CategoryNature;
}

export interface MonthlyUserIncome {
  month: string; // YYYY-MM
  user: UserProfileName;
  income: number;
}

export interface PaycheckEntry {
  id: string;
  month: string; // YYYY-MM
  user: UserProfileName;
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Paycheck 1 (Thu, Nov 5)"
  amount: number;
}

export interface UserIncomeSettings {
  user: UserProfileName;
  payFrequency: 'biweekly-thursday' | 'monthly' | 'custom';
  anchorThursday: string; // e.g. '2026-11-05'
  defaultPaycheckAmount: number;
}

export interface SimpleTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  user: UserProfileName;
}

export interface MonthSummaryStats {
  month: string;
  income: number;
  allocated: number;
  actualExpenses: number;
  actualInvestments: number;
  plannedSavings: number;
  actualSavings: number;
  remainingBudget: number;
  savingsRate: number;
}

export interface MonthlyHistoryRow {
  month: string;
  monthLabel: string;
  income: number;
  expenses: number;
  investment: number;
  savings: number;
  savingsRate: number;
  plannedSavings: number;
}

export interface CategoryStatus {
  category: string;
  planned: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  overAmount: number;
  nature: CategoryNature;
}

export const DEFAULT_CATEGORIES: { name: string; nature: CategoryNature; defaultPlanned: Record<UserProfileName, number> }[] = [
  { name: 'Bills', nature: 'expense', defaultPlanned: { Tejas: 1175, Hetvi: 900 } },
  { name: 'Personal', nature: 'expense', defaultPlanned: { Tejas: 325, Hetvi: 325 } },
  { name: 'Food', nature: 'expense', defaultPlanned: { Tejas: 500, Hetvi: 400 } },
  { name: 'Investment', nature: 'investment', defaultPlanned: { Tejas: 1000, Hetvi: 600 } },
  { name: 'Savings', nature: 'savings', defaultPlanned: { Tejas: 1000, Hetvi: 775 } }
];
