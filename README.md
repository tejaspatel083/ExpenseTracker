# Personal Expense Tracker (Tejas) 💰

A modern, responsive, private personal finance and expense tracking web application crafted exclusively for **Tejas**. Designed for deployment as a static frontend on **GitHub Pages** with **Supabase Authentication and Supabase Database** for secure persistent ledger storage.

Pre-seeded with real Canadian financial records (Rogers, Bell, Hydro, Rent, TFSA, Savings allocations) inspired by your **2026 Monthly Expenses** spreadsheet.

---

## 🌟 Key Features

### 1. 🔒 Strict Single-User Privacy & Authentication
- **Restricted Access**: Exactly one profile: **Tejas**.
- **No Public Sign-Up**: Registration is disabled to keep personal finances strictly confidential.
- **Supabase Auth**: Secure email/password login. Passwords are never stored in localStorage or hard-coded.
- **Clean UI**: Direct email and password login without cluttered public labels.

### 2. 📊 Personal Financial Dashboard
- **Monthly Overview**: Personal Income, Monthly Expenses, Available Cash, and Savings Surplus.
- **Bi-Weekly Payday Schedule**: Automatic projection of every 2nd Thursday paycheck ($2,075.57) with 3-paycheck month recognition.
- **Automated Budget Alerts**: Warns when spending hits 75%, 90%, or exceeds 100% of category limits ($325 Personal allowance, etc.).

### 3. 📑 2026 Monthly Sheet Matrix
- **Spreadsheet View**: Multi-column matrix covering months in 2026 matching your Google Sheets workbook.
- **Fixed Bills**: Rogers (phone), Bell (internet), Hydro (utilities), Apartment Rent.
- **Discretionary List**: Full monthly breakdown of items like Amazon, Pizza, CATAN, Kanzos Cafe, DashCam, Rexall, Tommy Hilfiger, Metro, 407 Highway, GO Train, and Tim Hortons.
- **Financial Allocation**:
  - Salary (Tejas)
  - Rent ($1,400)
  - TFSA Contribution ($650)
  - Personal Savings ($200)
  - **Surplus / Savings Remaining**: Automatically recalculated real-time surplus.

### 4. 💳 Full Transaction Management
- **Columns**: Date, Description, Category, Amount.
- **Filters**: Search query, Category filter, and Month selector.
- **CRUD**: Full Add, Edit, and Delete capabilities with confirmation prompts.
