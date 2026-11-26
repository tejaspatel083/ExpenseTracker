import { CategoryAllocation, MonthlyUserIncome, PaycheckEntry, SimpleTransaction, UserIncomeSettings, UserProfileName } from '../types';

export const DEFAULT_INCOME_SETTINGS: Record<UserProfileName, UserIncomeSettings> = {
  Tejas: {
    user: 'Tejas',
    payFrequency: 'biweekly-thursday',
    anchorThursday: '2026-11-05',
    defaultPaycheckAmount: 2075.57
  }
};

export const SEED_PAYCHECKS: PaycheckEntry[] = [
  // November 2026
  { id: 'pay-t-2026-11-1', month: '2026-11', user: 'Tejas', date: '2026-11-05', label: 'Paycheck 1 (Thu, Nov 5)', amount: 2075.57 },
  { id: 'pay-t-2026-11-2', month: '2026-11', user: 'Tejas', date: '2026-11-19', label: 'Paycheck 2 (Thu, Nov 19)', amount: 2075.57 },

  // October 2026
  { id: 'pay-t-2026-10-1', month: '2026-10', user: 'Tejas', date: '2026-10-08', label: 'Paycheck 1 (Thu, Oct 8)', amount: 2075.57 },
  { id: 'pay-t-2026-10-2', month: '2026-10', user: 'Tejas', date: '2026-10-22', label: 'Paycheck 2 (Thu, Oct 22)', amount: 2075.57 },

  // September 2026
  { id: 'pay-t-2026-09-1', month: '2026-09', user: 'Tejas', date: '2026-09-10', label: 'Paycheck 1 (Thu, Sep 10)', amount: 2075.57 },
  { id: 'pay-t-2026-09-2', month: '2026-09', user: 'Tejas', date: '2026-09-24', label: 'Paycheck 2 (Thu, Sep 24)', amount: 2075.57 }
];

export const SEED_INCOMES: MonthlyUserIncome[] = [
  // November 2026 (calculated as 2 paychecks of $2,075.57 = $4,151.14 for Tejas)
  { month: '2026-11', user: 'Tejas', income: 4151.14 },

  // October 2026
  { month: '2026-10', user: 'Tejas', income: 4151.14 },

  // September 2026
  { month: '2026-09', user: 'Tejas', income: 4151.14 },

  // August 2026
  { month: '2026-08', user: 'Tejas', income: 2075.57 },

  // July 2026 (3 paychecks in July!)
  { month: '2026-07', user: 'Tejas', income: 6226.71 },

  // June 2026
  { month: '2026-06', user: 'Tejas', income: 2075.00 }
];

export const SEED_ALLOCATIONS: CategoryAllocation[] = [
  // November 2026 (Tejas)
  { id: 'alloc-t-nov-rent', month: '2026-11', user: 'Tejas', category: 'Rent', plannedAmount: 1400, nature: 'expense' },
  { id: 'alloc-t-nov-bills', month: '2026-11', user: 'Tejas', category: 'Fix bills', plannedAmount: 150, nature: 'expense' },
  { id: 'alloc-t-nov-pers', month: '2026-11', user: 'Tejas', category: 'Personal expenses', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-nov-honey', month: '2026-11', user: 'Tejas', category: 'Sent Honey', plannedAmount: 0, nature: 'expense' },
  { id: 'alloc-t-nov-tfsa', month: '2026-11', user: 'Tejas', category: 'TFSA', plannedAmount: 1000, nature: 'investment' },
  { id: 'alloc-t-nov-sav', month: '2026-11', user: 'Tejas', category: 'Personal savings', plannedAmount: 1276.14, nature: 'savings' },
  { id: 'alloc-t-nov-misc', month: '2026-11', user: 'Tejas', category: 'Miscellaneous', plannedAmount: 0, nature: 'expense' },

  // October 2026
  { id: 'alloc-t-oct-rent', month: '2026-10', user: 'Tejas', category: 'Rent', plannedAmount: 1400, nature: 'expense' },
  { id: 'alloc-t-oct-bills', month: '2026-10', user: 'Tejas', category: 'Fix bills', plannedAmount: 150, nature: 'expense' },
  { id: 'alloc-t-oct-pers', month: '2026-10', user: 'Tejas', category: 'Personal expenses', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-oct-honey', month: '2026-10', user: 'Tejas', category: 'Sent Honey', plannedAmount: 0, nature: 'expense' },
  { id: 'alloc-t-oct-tfsa', month: '2026-10', user: 'Tejas', category: 'TFSA', plannedAmount: 550, nature: 'investment' },
  { id: 'alloc-t-oct-sav', month: '2026-10', user: 'Tejas', category: 'Personal savings', plannedAmount: 200, nature: 'savings' },
  { id: 'alloc-t-oct-misc', month: '2026-10', user: 'Tejas', category: 'Miscellaneous', plannedAmount: 0, nature: 'expense' },

  // September 2026
  { id: 'alloc-t-sep-rent', month: '2026-09', user: 'Tejas', category: 'Rent', plannedAmount: 1400, nature: 'expense' },
  { id: 'alloc-t-sep-bills', month: '2026-09', user: 'Tejas', category: 'Fix bills', plannedAmount: 150, nature: 'expense' },
  { id: 'alloc-t-sep-pers', month: '2026-09', user: 'Tejas', category: 'Personal expenses', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-sep-honey', month: '2026-09', user: 'Tejas', category: 'Sent Honey', plannedAmount: 0, nature: 'expense' },
  { id: 'alloc-t-sep-tfsa', month: '2026-09', user: 'Tejas', category: 'TFSA', plannedAmount: 650, nature: 'investment' },
  { id: 'alloc-t-sep-sav', month: '2026-09', user: 'Tejas', category: 'Personal savings', plannedAmount: 200, nature: 'savings' },
  { id: 'alloc-t-sep-misc', month: '2026-09', user: 'Tejas', category: 'Miscellaneous', plannedAmount: 0, nature: 'expense' }
];

export const SEED_TRANSACTIONS: SimpleTransaction[] = [
  // ================= NOVEMBER 2026 =================
  { id: 't-nov-1', date: '2026-11-02', description: 'Coffee', category: 'Personal expenses', amount: 8, user: 'Tejas' },
  { id: 't-nov-2', date: '2026-11-03', description: 'Restaurant', category: 'Personal expenses', amount: 35, user: 'Tejas' },
  { id: 't-nov-3', date: '2026-11-04', description: 'Shopping', category: 'Personal expenses', amount: 50, user: 'Tejas' },
  { id: 't-nov-4', date: '2026-11-05', description: 'Movie', category: 'Personal expenses', amount: 20, user: 'Tejas' },
  { id: 't-nov-5', date: '2026-11-01', description: 'Rogers Phone Bill', category: 'Fix bills', amount: 23.22, user: 'Tejas' },
  { id: 't-nov-6', date: '2026-11-01', description: 'Bell Internet', category: 'Fix bills', amount: 53.11, user: 'Tejas' },
  { id: 't-nov-7', date: '2026-11-01', description: 'Hydro Electricity', category: 'Fix bills', amount: 51.00, user: 'Tejas' },
  { id: 't-nov-8', date: '2026-11-01', description: 'Rent', category: 'Rent', amount: 1400, user: 'Tejas' },
  { id: 't-nov-9', date: '2026-11-10', description: 'TFSA Index Fund Deposit', category: 'TFSA', amount: 1000, user: 'Tejas' },

  // ================= OCTOBER 2026 =================
  { id: 't-oct-rogers', date: '2026-10-01', description: 'Rogers', category: 'Fix bills', amount: 23.22, user: 'Tejas' },
  { id: 't-oct-bell', date: '2026-10-01', description: 'Bell', category: 'Fix bills', amount: 53.11, user: 'Tejas' },
  { id: 't-oct-hydro', date: '2026-10-01', description: 'Hydro', category: 'Fix bills', amount: 51.00, user: 'Tejas' },
  { id: 't-oct-tommy', date: '2026-10-03', description: 'Tommy', category: 'Personal expenses', amount: 65.75, user: 'Tejas' },
  { id: 't-oct-hwy', date: '2026-10-06', description: '407 highway', category: 'Personal expenses', amount: 14.49, user: 'Tejas' },
  { id: 't-oct-red', date: '2026-10-08', description: 'red ribbon', category: 'Personal expenses', amount: 4.24, user: 'Tejas' },
  { id: 't-oct-post', date: '2026-10-10', description: 'CanadaPost', category: 'Personal expenses', amount: 22.15, user: 'Tejas' },
  { id: 't-oct-gotrain', date: '2026-10-12', description: 'Go train', category: 'Personal expenses', amount: 12.30, user: 'Tejas' },
  { id: 't-oct-tims', date: '2026-10-14', description: 'Tims', category: 'Personal expenses', amount: 7.40, user: 'Tejas' },
  { id: 't-oct-cookies', date: '2026-10-18', description: 'Cookies', category: 'Personal expenses', amount: 9.27, user: 'Tejas' },
  { id: 't-oct-aw', date: '2026-10-21', description: 'A&W', category: 'Personal expenses', amount: 14.66, user: 'Tejas' },
  { id: 't-oct-drive', date: '2026-10-25', description: 'drive test', category: 'Personal expenses', amount: 91.25, user: 'Tejas' },
  { id: 't-oct-rent', date: '2026-10-01', description: 'Rent', category: 'Rent', amount: 1400.00, user: 'Tejas' },
  { id: 't-oct-tfsa', date: '2026-10-05', description: 'TFSA', category: 'TFSA', amount: 550.00, user: 'Tejas' },
  { id: 't-oct-pers-sav', date: '2026-10-05', description: 'Personal Savings', category: 'Personal savings', amount: 200.00, user: 'Tejas' },

  // ================= SEPTEMBER 2026 =================
  { id: 't-sep-rogers', date: '2026-09-01', description: 'Rogers', category: 'Fix bills', amount: 23.22, user: 'Tejas' },
  { id: 't-sep-bell', date: '2026-09-01', description: 'Bell', category: 'Fix bills', amount: 53.11, user: 'Tejas' },
  { id: 't-sep-hydro', date: '2026-09-01', description: 'Hydro', category: 'Fix bills', amount: 51.85, user: 'Tejas' },
  { id: 't-sep-fb', date: '2026-09-04', description: 'Facebook Adv.', category: 'Personal expenses', amount: 10.71, user: 'Tejas' },
  { id: 't-sep-don', date: '2026-09-07', description: 'donation', category: 'Personal expenses', amount: 20.87, user: 'Tejas' },
  { id: 't-sep-hair', date: '2026-09-11', description: 'haircut', category: 'Personal expenses', amount: 30.25, user: 'Tejas' },
  { id: 't-sep-rest', date: '2026-09-15', description: 'Restaurant', category: 'Personal expenses', amount: 164.15, user: 'Tejas' },
  { id: 't-sep-metro', date: '2026-09-18', description: 'metro', category: 'Personal expenses', amount: 30.21, user: 'Tejas' },
  { id: 't-sep-vall', date: '2026-09-22', description: 'vall city', category: 'Personal expenses', amount: 7.90, user: 'Tejas' },
  { id: 't-sep-photo', date: '2026-09-27', description: 'Photography', category: 'Personal expenses', amount: 55.48, user: 'Tejas' },
  { id: 't-sep-rent', date: '2026-09-01', description: 'Rent', category: 'Rent', amount: 1400.00, user: 'Tejas' },
  { id: 't-sep-tfsa', date: '2026-09-05', description: 'TFSA', category: 'TFSA', amount: 650.00, user: 'Tejas' },
  { id: 't-sep-pers-sav', date: '2026-09-05', description: 'Personal Savings', category: 'Personal savings', amount: 200.00, user: 'Tejas' },

  // ================= AUGUST 2026 =================
  { id: 't-aug-rogers', date: '2026-08-01', description: 'Rogers', category: 'Fix bills', amount: 28.21, user: 'Tejas' },
  { id: 't-aug-bell', date: '2026-08-01', description: 'Bell', category: 'Fix bills', amount: 53.11, user: 'Tejas' },
  { id: 't-aug-hydro', date: '2026-08-01', description: 'Hydro', category: 'Fix bills', amount: 56.21, user: 'Tejas' },
  { id: 't-aug-temu', date: '2026-08-04', description: 'temu', category: 'Personal expenses', amount: 71.40, user: 'Tejas' },
  { id: 't-aug-amz-t', date: '2026-08-08', description: 'Amazon-Tejas', category: 'Personal expenses', amount: 45.19, user: 'Tejas' },
  { id: 't-aug-amz-h', date: '2026-08-12', description: 'Amazon-Honey', category: 'Sent Honey', amount: 27.76, user: 'Tejas' },
  { id: 't-aug-cine', date: '2026-08-19', description: 'skopolis-cinepl', category: 'Personal expenses', amount: 59.24, user: 'Tejas' },
  { id: 't-aug-rex', date: '2026-08-25', description: 'Rexall Medicine', category: 'Personal expenses', amount: 16.97, user: 'Tejas' },
  { id: 't-aug-rent', date: '2026-08-01', description: 'Rent', category: 'Rent', amount: 1400.00, user: 'Tejas' },
  { id: 't-aug-tfsa', date: '2026-08-05', description: 'TFSA', category: 'TFSA', amount: 650.00, user: 'Tejas' },
  { id: 't-aug-pers-sav', date: '2026-08-05', description: 'Personal Savings', category: 'Personal savings', amount: 200.00, user: 'Tejas' },

  // ================= JULY 2026 =================
  { id: 't-jul-rogers', date: '2026-07-01', description: 'Rogers', category: 'Fix bills', amount: 23.01, user: 'Tejas' },
  { id: 't-jul-pillow', date: '2026-07-04', description: 'pillow', category: 'Personal expenses', amount: 24.80, user: 'Tejas' },
  { id: 't-jul-amz-t', date: '2026-07-08', description: 'Amazon-Tejas', category: 'Personal expenses', amount: 34.00, user: 'Tejas' },
  { id: 't-jul-dash', date: '2026-07-12', description: 'DashCam', category: 'Personal expenses', amount: 79.09, user: 'Tejas' },
  { id: 't-jul-mohan', date: '2026-07-16', description: 'Mohankhill', category: 'Personal expenses', amount: 38.14, user: 'Tejas' },
  { id: 't-jul-lyft', date: '2026-07-20', description: 'Siyam Lyft', category: 'Personal expenses', amount: 22.93, user: 'Tejas' },
  { id: 't-jul-cookies', date: '2026-07-25', description: 'cookies', category: 'Personal expenses', amount: 3.56, user: 'Tejas' },
  { id: 't-jul-rent', date: '2026-07-01', description: 'Rent', category: 'Rent', amount: 1400.00, user: 'Tejas' },
  { id: 't-jul-tfsa', date: '2026-07-05', description: 'TFSA', category: 'TFSA', amount: 650.00, user: 'Tejas' },
  { id: 't-jul-pers-sav', date: '2026-07-05', description: 'Personal Savings', category: 'Personal savings', amount: 200.00, user: 'Tejas' },
  { id: 't-jul-hdfc', date: '2026-07-15', description: 'HDFC India Transfer', category: 'Personal savings', amount: 144.24, user: 'Tejas' },

  // ================= JUNE 2026 =================
  { id: 't-jun-rogers', date: '2026-06-01', description: 'Rogers', category: 'Fix bills', amount: 23.01, user: 'Tejas' },
  { id: 't-jun-bell', date: '2026-06-01', description: 'Bell', category: 'Fix bills', amount: 53.11, user: 'Tejas' },
  { id: 't-jun-hydro', date: '2026-06-01', description: 'Hydro', category: 'Fix bills', amount: 51.76, user: 'Tejas' },
  { id: 't-jun-pizza', date: '2026-06-04', description: 'Pizza', category: 'Personal expenses', amount: 32.45, user: 'Tejas' },
  { id: 't-jun-ice', date: '2026-06-07', description: 'ice-Cream', category: 'Personal expenses', amount: 20.00, user: 'Tejas' },
  { id: 't-jun-catan', date: '2026-06-11', description: 'CATAN', category: 'Personal expenses', amount: 70.00, user: 'Tejas' },
  { id: 't-jun-kunjal', date: '2026-06-15', description: "Kunjal's", category: 'Personal expenses', amount: 20.31, user: 'Tejas' },
  { id: 't-jun-tommy', date: '2026-06-20', description: 'Tommy Hilfiger', category: 'Personal expenses', amount: 52.04, user: 'Tejas' },
  { id: 't-jun-kanza', date: '2026-06-25', description: 'Kanza Cafe', category: 'Personal expenses', amount: 46.72, user: 'Tejas' },
  { id: 't-jun-rent', date: '2026-06-01', description: 'Rent', category: 'Rent', amount: 1400.00, user: 'Tejas' },
  { id: 't-jun-tfsa', date: '2026-06-05', description: 'TFSA', category: 'TFSA', amount: 650.00, user: 'Tejas' },
  { id: 't-jun-pers-sav', date: '2026-06-05', description: 'Personal Savings', category: 'Personal savings', amount: 200.00, user: 'Tejas' },
  { id: 't-jun-honey', date: '2026-06-18', description: 'Honey-Shopping', category: 'Sent Honey', amount: 55.00, user: 'Tejas' }
];
