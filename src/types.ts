export type UserProfileName = 'Tejas' | 'Hetvi';

export type UserViewScope = 'household' | 'Tejas' | 'Hetvi';

export type PayFrequency = 'weekly' | 'biweekly' | 'twice_monthly' | 'monthly';

export type TransactionType = 'expense' | 'income';

export type PaidBy = 'Tejas' | 'Hetvi' | 'Shared';

export type GoalOwner = 'household' | 'Tejas' | 'Hetvi';

export type BudgetScope = 'household' | 'Tejas' | 'Hetvi';

export interface UserProfile {
  id: string;
  name: UserProfileName;
  email: string;
  avatarBg: string;
  avatarColor: string;
  role: string;
}

export interface IncomeSetting {
  id: string;
  userName: UserProfileName;
  type: 'salary' | 'bonus' | 'freelance' | 'other';
  title: string;
  annualSalary: number;
  payFrequency: PayFrequency;
  nextPayday: string; // YYYY-MM-DD
  employer: string;
  bonusAmount?: number;
  notes?: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  paidBy: PaidBy;
  paymentMethod: string;
  isRecurring: boolean;
  createdBy: UserProfileName;
  notes?: string;
  createdAt?: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM or 'all'
  category: string;
  amount: number;
  scope: BudgetScope;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidBy: PaidBy;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'annual';
  nextPaymentDate: string; // YYYY-MM-DD
  isActive: boolean;
  isEssential?: boolean; // like Rogers, Bell, Hydro, Rent
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  owner: GoalOwner;
  category: string;
  notes?: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  householdIncome: number;
  householdExpenses: number;
  available: number;
  savings: number;
  tejasIncome: number;
  hetviIncome: number;
  tejasExpenses: number;
  hetviExpenses: number;
  sharedExpenses: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent/Mortgage',
  'Utilities',
  'Groceries',
  'Dining',
  'Transportation',
  'Gas',
  'Shopping',
  'Entertainment',
  'Insurance',
  'Healthcare',
  'Subscriptions',
  'Travel',
  'Personal',
  'Education',
  'Other'
];

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit / Bank Account',
  'E-Transfer',
  'Cash',
  'Other'
];
