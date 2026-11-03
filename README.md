# Private Household Expense Tracker (Tejas & Hetvi) 🏠💰

A modern, responsive, private personal finance and shared household expense tracking web application crafted exclusively for **Tejas** and **Hetvi**. Designed for deployment as a static frontend on **GitHub Pages** with **Supabase Authentication and Supabase Database** for secure multi-user persistent ledger storage.

Pre-seeded with real Canadian financial records (Rogers, Bell, Hydro, Rent, TFSA, Savings allocations) inspired by your **2026 Monthly Expenses** spreadsheet.

---

## 🌟 Key Features

### 1. 🔒 Strict Two-User Privacy & Authentication
- **Restricted Access**: Exactly two profiles: **Tejas** and **Hetvi**.
- **No Public Sign-Up**: Registration is disabled to keep personal household finances strictly confidential.
- **Supabase Auth**: Secure email/password login. Passwords are never stored in localStorage or hard-coded.
- **Personalized Greeting**: Dynamic `"Welcome back, Tejas 👋"` or `"Welcome back, Hetvi 👋"`.
- **Audit Trail ("Added By")**: Every transaction explicitly marks who created it (e.g. *Groceries — $125 | Added by Hetvi*, *Rent — $1,400 | Added by Tejas*).
- **Fast Switcher**: Quick toggle between Tejas and Hetvi accounts for seamless joint sessions.

### 2. 📊 Executive Household Dashboard
- **Monthly Overview**: Combined Household Income, Expenses, Available Cash, and Savings Surplus.
- **Individual Contribution Breakdown**:
  - **Income Split**: Tejas vs. Hetvi earnings with visual contribution percentages.
  - **Expense Split**: Tejas Direct, Hetvi Direct, and Shared Household expenses.
- **Interactive Scope Switcher**: Seamlessly toggle views:
  - `Household`: Combined joint finances.
  - `Tejas`: Filter to Tejas's personal income and spending.
  - `Hetvi`: Filter to Hetvi's personal income and spending.
- **Automated Budget Alerts**: Warns when spending hits 75%, 90%, or exceeds 100%.

### 3. 📑 2026 Monthly Sheet Matrix (Homage to Your Reference Image)
- **Spreadsheet View**: Multi-column matrix covering January through December 2026 matching your Google Sheets workbook.
- **Fixed Bills**: Rogers (phone), Bell (internet), Hydro (utilities), Apartment Rent.
- **Discretionary List**: Full monthly breakdown of items like Amazon, Pizza, CATAN, Kanzos Cafe, DashCam, Rexall, Tommy Hilfiger, Metro, 407 Highway, GO Train, and Tim Hortons.
- **Bottom Financial Allocation**:
  - Salary 1 (Tejas)
  - Salary 2 (Hetvi)
  - Rent ($1,400)
  - TFSA Contribution ($650)
  - Hetvi's Savings ($1,100)
  - Personal Savings ($200)
  - **Extra Left (Surplus)**: Automatically recalculated real-time surplus.

### 4. 💳 Full Transaction Management
- **Columns**: Date, Description, Category, Amount, Type (Expense/Income), Paid by (Tejas, Hetvi, Shared), Payment method, Created by.
- **Filters**: Search query, Category filter, Person filter (Tejas, Hetvi, Shared), Type filter, and Month selector.
- **Sorting**: Multi-directional sort by Date and Amount.
- **Export to CSV**: 1-click export of filtered records for Excel / Google Sheets backups.
- **CRUD**: Full Add, Edit, and Delete capabilities with confirmation prompts.

### 5. 🎯 Household & Personal Budgets
- **Distinction**: Dedicated Household Budgets alongside personal spending caps for Tejas and Hetvi ($300/mo personal allowances).
- **Visual Progress Bars**:
  - 🟢 Normal: Under 75%
  - 🟡 Warning: At 75% threshold
  - 🟠 Alert: At 90% threshold
  - 🔴 Exceeded: Over 100% capacity

### 6. 📅 Payday & Bill Cash Flow Planner
- **Synchronized Paydays**: Projects upcoming paychecks for both Tejas (e.g., Nov 5) and Hetvi (e.g., Nov 12).
- **Recurring Bills**: Rent, Bell, Rogers, Hydro, Insurance, and Streaming subscriptions.
- **Running Balance**: Chronological timeline displaying expected bank cash balances after each paycheck and recurring bill.

### 7. 🏆 Savings & Wealth Goals
- **Joint & Personal Targets**: TFSA Investment Fund ($20,000), Emergency Fund ($25,000), Hetvi's Vacation Fund ($5,000), and Tejas's Car Fund ($12,000).
- **Deposit Tracker**: Deposit modal to add funds toward any goal with real-time percentage progress.

### 8. 📈 Analytics & Financial Intelligence
- **Spending by Category**: Donut chart with category breakdown percentages.
- **Income vs Expenses vs Savings**: 6-month comparative trend chart.
- **Payer Comparison**: Visual distribution of Tejas vs. Hetvi vs. Shared living costs.
- **Date Ranges**: View This Month, Last 3 Months, Last 6 Months, or Full Year.

### 9. ⚙️ Income Settings & Backup
- **Customizable Salaries**: Annual salaries, pay frequencies (Weekly, Biweekly, Twice monthly, Monthly), next pay dates, and employers.
- **Auto-Calculations**: Computes expected paycheck amounts and monthly projected incomes.
- **Backup & Restore**: Export full household state as JSON or restore anytime.

---

## 🚀 Supabase Setup (Under 2 Minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) in this repository, paste the contents, and click **Run**.
4. Go to **Authentication -> Users** and click **Add User**:
   - Create account for **Tejas**: `tejas@yourdomain.com` (with a secure password).
   - Create account for **Hetvi**: `hetvi@yourdomain.com` (with a secure password).
5. In your Supabase Project **Settings -> API**, copy:
   - **Project URL**
   - **anon public API Key**
6. In the app:
   - Click the **Connect Cloud** button in the header (or go to **Settings -> Supabase Cloud Sync**).
   - Enter your Project URL and Anon Key and click **Save & Reconnect**.

*(Note: The app also operates in instant preview / local cache mode so you can test all features right out of the box!)*

---

## 🌐 Deploy to GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of household expense tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings -> Secrets and variables -> Actions**.
   - (Optional) Add repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Go to **Settings -> Pages**.
   - Under **Build and deployment -> Source**, select **GitHub Actions**.
3. The included workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) will automatically build and publish your site to `https://<your-username>.github.io/<your-repo-name>/`!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

