import { CategoryAllocation, MonthlyUserIncome, SimpleTransaction } from '../types';

export const SEED_INCOMES: MonthlyUserIncome[] = [
  // November 2026
  { month: '2026-11', user: 'Tejas', income: 4000 },
  { month: '2026-11', user: 'Hetvi', income: 3000 },

  // October 2026
  { month: '2026-10', user: 'Tejas', income: 2075.57 },
  { month: '2026-10', user: 'Hetvi', income: 2126.81 },

  // September 2026
  { month: '2026-09', user: 'Tejas', income: 2075.57 },
  { month: '2026-09', user: 'Hetvi', income: 2075.00 },

  // August 2026
  { month: '2026-08', user: 'Tejas', income: 2075.57 },
  { month: '2026-08', user: 'Hetvi', income: 2001.24 },

  // July 2026
  { month: '2026-07', user: 'Tejas', income: 2075.57 },
  { month: '2026-07', user: 'Hetvi', income: 2301.24 },

  // June 2026
  { month: '2026-06', user: 'Tejas', income: 2075.00 },
  { month: '2026-06', user: 'Hetvi', income: 2040.00 }
];

export const SEED_ALLOCATIONS: CategoryAllocation[] = [
  // November 2026 (Tejas)
  { id: 'alloc-t-nov-pers', month: '2026-11', user: 'Tejas', category: 'Personal', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-nov-inv', month: '2026-11', user: 'Tejas', category: 'Investment', plannedAmount: 1000, nature: 'investment' },
  { id: 'alloc-t-nov-sav', month: '2026-11', user: 'Tejas', category: 'Savings', plannedAmount: 1500, nature: 'savings' },
  { id: 'alloc-t-nov-bills', month: '2026-11', user: 'Tejas', category: 'Bills', plannedAmount: 1175, nature: 'expense' },

  // November 2026 (Hetvi)
  { id: 'alloc-h-nov-pers', month: '2026-11', user: 'Hetvi', category: 'Personal', plannedAmount: 300, nature: 'expense' },
  { id: 'alloc-h-nov-inv', month: '2026-11', user: 'Hetvi', category: 'Investment', plannedAmount: 600, nature: 'investment' },
  { id: 'alloc-h-nov-sav', month: '2026-11', user: 'Hetvi', category: 'Savings', plannedAmount: 1100, nature: 'savings' },
  { id: 'alloc-h-nov-bills', month: '2026-11', user: 'Hetvi', category: 'Bills', plannedAmount: 1000, nature: 'expense' },

  // October 2026 (From Google Sheet: Personal $325, TFSA $550, Hetvi savings $1000, Personal Savings $200)
  { id: 'alloc-t-oct-pers', month: '2026-10', user: 'Tejas', category: 'Personal', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-oct-inv', month: '2026-10', user: 'Tejas', category: 'Investment', plannedAmount: 550, nature: 'investment' },
  { id: 'alloc-t-oct-sav', month: '2026-10', user: 'Tejas', category: 'Savings', plannedAmount: 200, nature: 'savings' },
  { id: 'alloc-t-oct-bills', month: '2026-10', user: 'Tejas', category: 'Bills', plannedAmount: 1000, nature: 'expense' },

  { id: 'alloc-h-oct-pers', month: '2026-10', user: 'Hetvi', category: 'Personal', plannedAmount: 300, nature: 'expense' },
  { id: 'alloc-h-oct-sav', month: '2026-10', user: 'Hetvi', category: 'Savings', plannedAmount: 1000, nature: 'savings' },
  { id: 'alloc-h-oct-bills', month: '2026-10', user: 'Hetvi', category: 'Bills', plannedAmount: 826.81, nature: 'expense' },

  // September 2026 (Personal $325, TFSA $650, Hetvi savings $1400, Personal Savings $200)
  { id: 'alloc-t-sep-pers', month: '2026-09', user: 'Tejas', category: 'Personal', plannedAmount: 325, nature: 'expense' },
  { id: 'alloc-t-sep-inv', month: '2026-09', user: 'Tejas', category: 'Investment', plannedAmount: 650, nature: 'investment' },
  { id: 'alloc-t-sep-sav', month: '2026-09', user: 'Tejas', category: 'Savings', plannedAmount: 200, nature: 'savings' },
  { id: 'alloc-t-sep-bills', month: '2026-09', user: 'Tejas', category: 'Bills', plannedAmount: 900.57, nature: 'expense' },

  { id: 'alloc-h-sep-pers', month: '2026-09', user: 'Hetvi', category: 'Personal', plannedAmount: 300, nature: 'expense' },
  { id: 'alloc-h-sep-sav', month: '2026-09', user: 'Hetvi', category: 'Savings', plannedAmount: 1400, nature: 'savings' },
  { id: 'alloc-h-sep-bills', month: '2026-09', user: 'Hetvi', category: 'Bills', plannedAmount: 375, nature: 'expense' }
];

export const SEED_TRANSACTIONS: SimpleTransaction[] = [
  // ================= NOVEMBER 2026 =================
  { id: 't-nov-1', date: '2026-11-02', description: 'Coffee', category: 'Personal', amount: 8, user: 'Tejas' },
  { id: 't-nov-2', date: '2026-11-03', description: 'Restaurant', category: 'Personal', amount: 35, user: 'Tejas' },
  { id: 't-nov-3', date: '2026-11-04', description: 'Shopping', category: 'Personal', amount: 50, user: 'Tejas' },
  { id: 't-nov-4', date: '2026-11-05', description: 'Movie', category: 'Personal', amount: 20, user: 'Tejas' },
  { id: 't-nov-5', date: '2026-11-01', description: 'Rogers Phone Bill', category: 'Bills', amount: 23.22, user: 'Tejas' },
  { id: 't-nov-6', date: '2026-11-01', description: 'Bell Internet', category: 'Bills', amount: 53.11, user: 'Tejas' },
  { id: 't-nov-7', date: '2026-11-01', description: 'Hydro Electricity', category: 'Bills', amount: 51.00, user: 'Tejas' },
  { id: 't-nov-8', date: '2026-11-01', description: 'Rent', category: 'Bills', amount: 1400, user: 'Tejas' },
  { id: 't-nov-9', date: '2026-11-10', description: 'TFSA Index Fund Deposit', category: 'Investment', amount: 1000, user: 'Tejas' },
  
  { id: 'h-nov-1', date: '2026-11-02', description: 'Tims Iced Capp', category: 'Personal', amount: 6.50, user: 'Hetvi' },
  { id: 'h-nov-2', date: '2026-11-04', description: 'Zara Scarf', category: 'Personal', amount: 45.00, user: 'Hetvi' },
  { id: 'h-nov-3', date: '2026-11-05', description: 'Hetvi Monthly Savings Transfer', category: 'Savings', amount: 1100, user: 'Hetvi' },

  // ================= OCTOBER 2026 (From Google Sheet Screenshot) =================
  { id: 't-oct-rogers', date: '2026-10-01', description: 'Rogers', category: 'Bills', amount: 23.22, user: 'Tejas' },
  { id: 't-oct-bell', date: '2026-10-01', description: 'Bell', category: 'Bills', amount: 53.11, user: 'Tejas' },
  { id: 't-oct-hydro', date: '2026-10-01', description: 'Hydro', category: 'Bills', amount: 51.00, user: 'Tejas' },
  { id: 't-oct-tommy', date: '2026-10-03', description: 'Tommy', category: 'Personal', amount: 65.75, user: 'Tejas' },
  { id: 't-oct-hwy', date: '2026-10-06', description: '407 highway', category: 'Personal', amount: 14.49, user: 'Tejas' },
  { id: 't-oct-red', date: '2026-10-08', description: 'red ribbon', category: 'Personal', amount: 4.24, user: 'Tejas' },
  { id: 't-oct-post', date: '2026-10-10', description: 'CanadaPost', category: 'Personal', amount: 22.15, user: 'Tejas' },
  { id: 't-oct-gotrain', date: '2026-10-12', description: 'Go train', category: 'Personal', amount: 12.30, user: 'Tejas' },
  { id: 't-oct-tims', date: '2026-10-14', description: 'Tims', category: 'Personal', amount: 7.40, user: 'Tejas' },
  { id: 't-oct-cookies', date: '2026-10-18', description: 'Cookies', category: 'Personal', amount: 9.27, user: 'Tejas' },
  { id: 't-oct-aw', date: '2026-10-21', description: 'A&W', category: 'Personal', amount: 14.66, user: 'Tejas' },
  { id: 't-oct-drive', date: '2026-10-25', description: 'drive test', category: 'Personal', amount: 91.25, user: 'Tejas' },
  { id: 't-oct-rent', date: '2026-10-01', description: 'Rent', category: 'Bills', amount: 1400.00, user: 'Tejas' },
  { id: 't-oct-tfsa', date: '2026-10-05', description: 'TFSA', category: 'Investment', amount: 550.00, user: 'Tejas' },
  { id: 't-oct-pers-sav', date: '2026-10-05', description: 'Personal Savings', category: 'Savings', amount: 200.00, user: 'Tejas' },
  { id: 'h-oct-sav', date: '2026-10-05', description: "Hetvi's Savings", category: 'Savings', amount: 1000.00, user: 'Hetvi' },

  // ================= SEPTEMBER 2026 (From Google Sheet Screenshot) =================
  { id: 't-sep-rogers', date: '2026-09-01', description: 'Rogers', category: 'Bills', amount: 23.22, user: 'Tejas' },
  { id: 't-sep-bell', date: '2026-09-01', description: 'Bell', category: 'Bills', amount: 53.11, user: 'Tejas' },
  { id: 't-sep-hydro', date: '2026-09-01', description: 'Hydro', category: 'Bills', amount: 51.85, user: 'Tejas' },
  { id: 't-sep-fb', date: '2026-09-04', description: 'Facebook Adv.', category: 'Personal', amount: 10.71, user: 'Tejas' },
  { id: 't-sep-don', date: '2026-09-07', description: 'donation', category: 'Personal', amount: 20.87, user: 'Tejas' },
  { id: 't-sep-hair', date: '2026-09-11', description: 'haircut', category: 'Personal', amount: 30.25, user: 'Tejas' },
  { id: 't-sep-rest', date: '2026-09-15', description: 'Restaurant', category: 'Personal', amount: 164.15, user: 'Tejas' },
  { id: 't-sep-metro', date: '2026-09-18', description: 'metro', category: 'Personal', amount: 30.21, user: 'Tejas' },
  { id: 't-sep-vall', date: '2026-09-22', description: 'vall city', category: 'Personal', amount: 7.90, user: 'Tejas' },
  { id: 't-sep-photo', date: '2026-09-27', description: 'Photography', category: 'Personal', amount: 55.48, user: 'Tejas' },
  { id: 't-sep-rent', date: '2026-09-01', description: 'Rent', category: 'Bills', amount: 1400.00, user: 'Tejas' },
  { id: 't-sep-tfsa', date: '2026-09-05', description: 'TFSA', category: 'Investment', amount: 650.00, user: 'Tejas' },
  { id: 't-sep-pers-sav', date: '2026-09-05', description: 'Personal Savings', category: 'Savings', amount: 200.00, user: 'Tejas' },
  { id: 'h-sep-sav', date: '2026-09-05', description: "Hetvi's Savings", category: 'Savings', amount: 1400.00, user: 'Hetvi' },

  // ================= AUGUST 2026 (From Google Sheet Screenshot) =================
  { id: 't-aug-rogers', date: '2026-08-01', description: 'Rogers', category: 'Bills', amount: 28.21, user: 'Tejas' },
  { id: 't-aug-bell', date: '2026-08-01', description: 'Bell', category: 'Bills', amount: 53.11, user: 'Tejas' },
  { id: 't-aug-hydro', date: '2026-08-01', description: 'Hydro', category: 'Bills', amount: 56.21, user: 'Tejas' },
  { id: 't-aug-temu', date: '2026-08-04', description: 'temu', category: 'Personal', amount: 71.40, user: 'Tejas' },
  { id: 't-aug-amz-t', date: '2026-08-08', description: 'Amazon-Tejas', category: 'Personal', amount: 45.19, user: 'Tejas' },
  { id: 't-aug-amz-h', date: '2026-08-12', description: 'Amazon-Honey', category: 'Personal', amount: 27.76, user: 'Tejas' },
  { id: 't-aug-cine', date: '2026-08-19', description: 'skopolis-cinepl', category: 'Personal', amount: 59.24, user: 'Tejas' },
  { id: 't-aug-rex', date: '2026-08-25', description: 'Rexall Medicine', category: 'Personal', amount: 16.97, user: 'Tejas' },
  { id: 't-aug-rent', date: '2026-08-01', description: 'Rent', category: 'Bills', amount: 1400.00, user: 'Tejas' },
  { id: 't-aug-tfsa', date: '2026-08-05', description: 'TFSA', category: 'Investment', amount: 650.00, user: 'Tejas' },
  { id: 't-aug-pers-sav', date: '2026-08-05', description: 'Personal Savings', category: 'Savings', amount: 200.00, user: 'Tejas' },
  { id: 'h-aug-sav', date: '2026-08-05', description: "Hetvi's Savings", category: 'Savings', amount: 1400.00, user: 'Hetvi' },

  // ================= JULY 2026 (From Google Sheet Screenshot) =================
  { id: 't-jul-rogers', date: '2026-07-01', description: 'Rogers', category: 'Bills', amount: 23.01, user: 'Tejas' },
  { id: 't-jul-pillow', date: '2026-07-04', description: 'pillow', category: 'Personal', amount: 24.80, user: 'Tejas' },
  { id: 't-jul-amz-t', date: '2026-07-08', description: 'Amazon-Tejas', category: 'Personal', amount: 34.00, user: 'Tejas' },
  { id: 't-jul-dash', date: '2026-07-12', description: 'DashCam', category: 'Personal', amount: 79.09, user: 'Tejas' },
  { id: 't-jul-mohan', date: '2026-07-16', description: 'Mohankhill', category: 'Personal', amount: 38.14, user: 'Tejas' },
  { id: 't-jul-lyft', date: '2026-07-20', description: 'Siyam Lyft', category: 'Personal', amount: 22.93, user: 'Tejas' },
  { id: 't-jul-cookies', date: '2026-07-25', description: 'cookies', category: 'Personal', amount: 3.56, user: 'Tejas' },
  { id: 't-jul-rent', date: '2026-07-01', description: 'Rent', category: 'Bills', amount: 1400.00, user: 'Tejas' },
  { id: 't-jul-tfsa', date: '2026-07-05', description: 'TFSA', category: 'Investment', amount: 650.00, user: 'Tejas' },
  { id: 't-jul-pers-sav', date: '2026-07-05', description: 'Personal Savings', category: 'Savings', amount: 200.00, user: 'Tejas' },
  { id: 't-jul-hdfc', date: '2026-07-15', description: 'HDFC India Transfer', category: 'Savings', amount: 144.24, user: 'Tejas' },
  { id: 'h-jul-sav', date: '2026-07-05', description: "Hetvi's Savings", category: 'Savings', amount: 1100.00, user: 'Hetvi' },

  // ================= JUNE 2026 (From Google Sheet Screenshot) =================
  { id: 't-jun-rogers', date: '2026-06-01', description: 'Rogers', category: 'Bills', amount: 23.01, user: 'Tejas' },
  { id: 't-jun-bell', date: '2026-06-01', description: 'Bell', category: 'Bills', amount: 53.11, user: 'Tejas' },
  { id: 't-jun-hydro', date: '2026-06-01', description: 'Hydro', category: 'Bills', amount: 51.76, user: 'Tejas' },
  { id: 't-jun-pizza', date: '2026-06-04', description: 'Pizza', category: 'Personal', amount: 32.45, user: 'Tejas' },
  { id: 't-jun-ice', date: '2026-06-07', description: 'ice-Cream', category: 'Personal', amount: 20.00, user: 'Tejas' },
  { id: 't-jun-catan', date: '2026-06-11', description: 'CATAN', category: 'Personal', amount: 70.00, user: 'Tejas' },
  { id: 't-jun-kunjal', date: '2026-06-15', description: "Kunjal's", category: 'Personal', amount: 20.31, user: 'Tejas' },
  { id: 't-jun-tommy', date: '2026-06-20', description: 'Tommy Hilfiger', category: 'Personal', amount: 52.04, user: 'Tejas' },
  { id: 't-jun-kanza', date: '2026-06-25', description: 'Kanza Cafe', category: 'Personal', amount: 46.72, user: 'Tejas' },
  { id: 't-jun-rent', date: '2026-06-01', description: 'Rent', category: 'Bills', amount: 1400.00, user: 'Tejas' },
  { id: 't-jun-tfsa', date: '2026-06-05', description: 'TFSA', category: 'Investment', amount: 650.00, user: 'Tejas' },
  { id: 't-jun-pers-sav', date: '2026-06-05', description: 'Personal Savings', category: 'Savings', amount: 200.00, user: 'Tejas' },
  { id: 't-jun-honey', date: '2026-06-18', description: 'Honey-Shopping', category: 'Personal', amount: 55.00, user: 'Tejas' },
  { id: 'h-jun-sav', date: '2026-06-05', description: "Hetvi's Savings", category: 'Savings', amount: 1100.00, user: 'Hetvi' }
];
