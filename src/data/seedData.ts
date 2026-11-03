import { Transaction, Budget, RecurringExpense, SavingsGoal, IncomeSetting } from '../types';

export const SEED_INCOME_SETTINGS: IncomeSetting[] = [
  {
    id: 'inc-tejas-1',
    userName: 'Tejas',
    type: 'salary',
    title: 'Senior Software Engineer',
    annualSalary: 80000,
    payFrequency: 'biweekly',
    nextPayday: '2026-11-05',
    employer: 'TechCorp Canada',
    bonusAmount: 5000,
    notes: 'Direct deposit every other Thursday',
    isActive: true
  },
  {
    id: 'inc-hetvi-1',
    userName: 'Hetvi',
    type: 'salary',
    title: 'Financial Analyst',
    annualSalary: 55000,
    payFrequency: 'biweekly',
    nextPayday: '2026-11-12',
    employer: 'Scotiabank',
    bonusAmount: 2500,
    notes: 'Direct deposit alternating Thursdays',
    isActive: true
  }
];

export const SEED_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'rec-1',
    description: 'Apartment Rent',
    amount: 1400.00,
    category: 'Rent/Mortgage',
    paidBy: 'Shared',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-01',
    isActive: true,
    isEssential: true
  },
  {
    id: 'rec-2',
    description: 'Bell Internet & Fibe',
    amount: 53.11,
    category: 'Utilities',
    paidBy: 'Shared',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-18',
    isActive: true,
    isEssential: true
  },
  {
    id: 'rec-3',
    description: 'Rogers Mobile Phone',
    amount: 23.22,
    category: 'Utilities',
    paidBy: 'Tejas',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-15',
    isActive: true,
    isEssential: true
  },
  {
    id: 'rec-4',
    description: 'Hydro Electric & Water',
    amount: 51.00,
    category: 'Utilities',
    paidBy: 'Shared',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-22',
    isActive: true,
    isEssential: true
  },
  {
    id: 'rec-5',
    description: 'Netflix & Spotify Family',
    amount: 32.50,
    category: 'Subscriptions',
    paidBy: 'Hetvi',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-10',
    isActive: true,
    isEssential: false
  },
  {
    id: 'rec-6',
    description: 'Tenant & Auto Insurance',
    amount: 115.00,
    category: 'Insurance',
    paidBy: 'Shared',
    frequency: 'monthly',
    nextPaymentDate: '2026-11-05',
    isActive: true,
    isEssential: true
  }
];

export const SEED_BUDGETS: Budget[] = [
  // Household Budgets
  { id: 'b-rent', month: '2026-11', category: 'Rent/Mortgage', amount: 1400, scope: 'household' },
  { id: 'b-util', month: '2026-11', category: 'Utilities', amount: 150, scope: 'household' },
  { id: 'b-groc', month: '2026-11', category: 'Groceries', amount: 600, scope: 'household' },
  { id: 'b-dine', month: '2026-11', category: 'Dining', amount: 250, scope: 'household' },
  { id: 'b-trans', month: '2026-11', category: 'Transportation', amount: 200, scope: 'household' },
  { id: 'b-shop', month: '2026-11', category: 'Shopping', amount: 300, scope: 'household' },
  { id: 'b-sub', month: '2026-11', category: 'Subscriptions', amount: 60, scope: 'household' },
  { id: 'b-ins', month: '2026-11', category: 'Insurance', amount: 115, scope: 'household' },
  { id: 'b-ent', month: '2026-11', category: 'Entertainment', amount: 150, scope: 'household' },
  
  // Personal Budgets
  { id: 'b-tejas-pers', month: '2026-11', category: 'Personal', amount: 300, scope: 'Tejas' },
  { id: 'b-hetvi-pers', month: '2026-11', category: 'Personal', amount: 300, scope: 'Hetvi' }
];

export const SEED_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-tfsa',
    title: 'TFSA Investment Fund',
    targetAmount: 20000,
    currentAmount: 14500,
    targetDate: '2026-12-31',
    owner: 'household',
    category: 'Investment',
    notes: 'Contributing $650/month each regular cycle'
  },
  {
    id: 'sg-emergency',
    title: 'Household Emergency Fund (6 Months)',
    targetAmount: 25000,
    currentAmount: 18200,
    targetDate: '2027-06-30',
    owner: 'household',
    category: 'Emergency',
    notes: 'High interest savings account for unexpected events'
  },
  {
    id: 'sg-hetvi-vacation',
    title: 'Hetvi Japan & India Trip',
    targetAmount: 5000,
    currentAmount: 3850,
    targetDate: '2027-02-15',
    owner: 'Hetvi',
    category: 'Travel',
    notes: 'Flight tickets, hotels, and travel shopping'
  },
  {
    id: 'sg-tejas-car',
    title: 'Tejas EV / Car Upgrade',
    targetAmount: 12000,
    currentAmount: 7600,
    targetDate: '2027-08-31',
    owner: 'Tejas',
    category: 'Vehicle',
    notes: 'Down payment for hybrid/electric SUV'
  }
];

export const SEED_TRANSACTIONS: Transaction[] = [
  // --- November 2026 (Current Active Month) ---
  {
    id: 'tx-nov-inc-1',
    date: '2026-11-05',
    description: 'Biweekly Paycheck - TechCorp',
    category: 'Salary',
    amount: 2564.10,
    type: 'income',
    paidBy: 'Tejas',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Tejas',
    notes: 'Biweekly salary payout'
  },
  {
    id: 'tx-nov-inc-2',
    date: '2026-11-12',
    description: 'Biweekly Paycheck - Scotiabank',
    category: 'Salary',
    amount: 1730.77,
    type: 'income',
    paidBy: 'Hetvi',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Hetvi',
    notes: 'Biweekly salary payout'
  },
  {
    id: 'tx-nov-1',
    date: '2026-11-01',
    description: 'Monthly Apartment Rent',
    category: 'Rent/Mortgage',
    amount: 1400.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'E-Transfer',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-2',
    date: '2026-11-02',
    description: 'Metro Grocery haul',
    category: 'Groceries',
    amount: 125.40,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-3',
    date: '2026-11-03',
    description: 'Bell Fibe Gigabit Internet',
    category: 'Utilities',
    amount: 53.11,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-4',
    date: '2026-11-04',
    description: 'Rogers 5G Mobile Plan',
    category: 'Utilities',
    amount: 23.22,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-5',
    date: '2026-11-05',
    description: 'Hydro Electricity Bill',
    category: 'Utilities',
    amount: 51.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Bank Account',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-6',
    date: '2026-11-06',
    description: 'Tim Hortons Breakfast & Coffee',
    category: 'Dining',
    amount: 14.80,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-7',
    date: '2026-11-07',
    description: 'Costco Wholesale Bulk Groceries',
    category: 'Groceries',
    amount: 185.30,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-8',
    date: '2026-11-08',
    description: 'Rexall Pharmacy vitamins & essentials',
    category: 'Healthcare',
    amount: 28.50,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-9',
    date: '2026-11-10',
    description: 'Netflix & Spotify Family bundle',
    category: 'Subscriptions',
    amount: 32.50,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-10',
    date: '2026-11-11',
    description: 'Esso Gas Refuel',
    category: 'Gas',
    amount: 68.20,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-nov-11',
    date: '2026-11-12',
    description: 'Dinner at Kanzo Sushi',
    category: 'Dining',
    amount: 74.50,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-12',
    date: '2026-11-14',
    description: 'Uniqlo Winter sweater (Hetvi personal)',
    category: 'Personal',
    amount: 89.90,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-nov-13',
    date: '2026-11-15',
    description: 'Tech gadgets & cables (Tejas personal)',
    category: 'Personal',
    amount: 62.40,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },

  // --- October 2026 (From user Google Sheet) ---
  {
    id: 'tx-oct-sal1',
    date: '2026-10-05',
    description: 'Salary 1 (Tejas)',
    category: 'Salary',
    amount: 2075.57,
    type: 'income',
    paidBy: 'Tejas',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-sal2',
    date: '2026-10-12',
    description: 'Salary 2 (Hetvi)',
    category: 'Salary',
    amount: 2126.81,
    type: 'income',
    paidBy: 'Hetvi',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-rent',
    date: '2026-10-01',
    description: 'Rent',
    category: 'Rent/Mortgage',
    amount: 1400.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'E-Transfer',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-rogers',
    date: '2026-10-05',
    description: 'Rogers',
    category: 'Utilities',
    amount: 23.22,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-bell',
    date: '2026-10-10',
    description: 'Bell',
    category: 'Utilities',
    amount: 53.11,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-hydro',
    date: '2026-10-15',
    description: 'Hydro',
    category: 'Utilities',
    amount: 51.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Bank Account',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-tommy',
    date: '2026-10-16',
    description: 'Tommy Hilfiger',
    category: 'Shopping',
    amount: 85.75,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-407',
    date: '2026-10-18',
    description: '407 Highway Toll',
    category: 'Transportation',
    amount: 14.49,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-ribbon',
    date: '2026-10-19',
    description: 'Red Ribbon Bakery',
    category: 'Dining',
    amount: 4.24,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-post',
    date: '2026-10-20',
    description: 'CanadaPost parcel',
    category: 'Other',
    amount: 22.15,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-go',
    date: '2026-10-21',
    description: 'GO Train transit',
    category: 'Transportation',
    amount: 12.30,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Presto Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-tims',
    date: '2026-10-22',
    description: 'Tims coffee & donut',
    category: 'Dining',
    amount: 7.40,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-cookies',
    date: '2026-10-23',
    description: 'Cookies sweet treats',
    category: 'Dining',
    amount: 9.27,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-aw',
    date: '2026-10-24',
    description: 'A&W burger meal',
    category: 'Dining',
    amount: 14.85,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-drivetest',
    date: '2026-10-25',
    description: 'Drive Test license fee',
    category: 'Transportation',
    amount: 91.25,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Debit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-oct-honey',
    date: '2026-10-27',
    description: 'Honey-Shopping (Hetvi clothes)',
    category: 'Shopping',
    amount: 55.00,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-oct-hdfc',
    date: '2026-10-28',
    description: 'HDFC India Transfer',
    category: 'Other',
    amount: 144.24,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'E-Transfer',
    isRecurring: false,
    createdBy: 'Tejas'
  },

  // --- September 2026 (From Google Sheet) ---
  {
    id: 'tx-sep-sal1',
    date: '2026-09-05',
    description: 'Salary 1 (Tejas)',
    category: 'Salary',
    amount: 2075.57,
    type: 'income',
    paidBy: 'Tejas',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-sal2',
    date: '2026-09-12',
    description: 'Salary 2 (Hetvi)',
    category: 'Salary',
    amount: 2301.24,
    type: 'income',
    paidBy: 'Hetvi',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-sep-rent',
    date: '2026-09-01',
    description: 'Rent',
    category: 'Rent/Mortgage',
    amount: 1400.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'E-Transfer',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-rogers',
    date: '2026-09-05',
    description: 'Rogers',
    category: 'Utilities',
    amount: 23.22,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-bell',
    date: '2026-09-10',
    description: 'Bell',
    category: 'Utilities',
    amount: 53.11,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-hydro',
    date: '2026-09-15',
    description: 'Hydro',
    category: 'Utilities',
    amount: 51.85,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Bank Account',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-fb',
    date: '2026-09-18',
    description: 'Facebook Adv',
    category: 'Other',
    amount: 10.71,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-don',
    date: '2026-09-20',
    description: 'Donation',
    category: 'Other',
    amount: 20.87,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-sep-hair',
    date: '2026-09-22',
    description: 'Haircut salon',
    category: 'Personal',
    amount: 30.25,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-rest',
    date: '2026-09-24',
    description: 'Dinner Restaurant anniversary',
    category: 'Dining',
    amount: 164.15,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-sep-metro',
    date: '2026-09-26',
    description: 'Metro Groceries',
    category: 'Groceries',
    amount: 30.21,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-sep-val',
    date: '2026-09-27',
    description: 'Val City groceries',
    category: 'Groceries',
    amount: 7.90,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-sep-photo',
    date: '2026-09-29',
    description: 'Photographs frame prints',
    category: 'Shopping',
    amount: 66.45,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },

  // --- August 2026 (From Google Sheet) ---
  {
    id: 'tx-aug-sal1',
    date: '2026-08-05',
    description: 'Salary 1 (Tejas)',
    category: 'Salary',
    amount: 2075.57,
    type: 'income',
    paidBy: 'Tejas',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-sal2',
    date: '2026-08-12',
    description: 'Salary 2 (Hetvi)',
    category: 'Salary',
    amount: 2301.24,
    type: 'income',
    paidBy: 'Hetvi',
    paymentMethod: 'Direct Deposit',
    isRecurring: true,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-aug-rent',
    date: '2026-08-01',
    description: 'Rent',
    category: 'Rent/Mortgage',
    amount: 1400.00,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'E-Transfer',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-rogers',
    date: '2026-08-05',
    description: 'Rogers',
    category: 'Utilities',
    amount: 23.21,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-bell',
    date: '2026-08-10',
    description: 'Bell',
    category: 'Utilities',
    amount: 53.11,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-hydro',
    date: '2026-08-15',
    description: 'Hydro',
    category: 'Utilities',
    amount: 56.21,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Bank Account',
    isRecurring: true,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-temu',
    date: '2026-08-17',
    description: 'Temu Household items',
    category: 'Shopping',
    amount: 71.40,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-aug-amz-t',
    date: '2026-08-18',
    description: 'Amazon-Tejas electronics',
    category: 'Shopping',
    amount: 45.19,
    type: 'expense',
    paidBy: 'Tejas',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-amz-h',
    date: '2026-08-20',
    description: 'Amazon-Honey skincare',
    category: 'Shopping',
    amount: 27.76,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  },
  {
    id: 'tx-aug-cinema',
    date: '2026-08-22',
    description: 'Shapolis Cinema movie night',
    category: 'Entertainment',
    amount: 59.24,
    type: 'expense',
    paidBy: 'Shared',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Tejas'
  },
  {
    id: 'tx-aug-rexall',
    date: '2026-08-25',
    description: 'Rexall Medicine',
    category: 'Healthcare',
    amount: 16.97,
    type: 'expense',
    paidBy: 'Hetvi',
    paymentMethod: 'Credit Card',
    isRecurring: false,
    createdBy: 'Hetvi'
  }
];

