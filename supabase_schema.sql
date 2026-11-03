-- ==============================================================================
-- Supabase Schema for Tejas & Hetvi Household Expense Tracker
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Household Profiles (Only Tejas and Hetvi)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null check (name in ('Tejas', 'Hetvi')),
  avatar_color text default '#0284c7',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Income Settings
create table if not exists public.income_settings (
  id uuid default uuid_generate_v4() primary key,
  user_name text not null check (user_name in ('Tejas', 'Hetvi')),
  type text not null check (type in ('salary', 'bonus', 'freelance', 'other')),
  title text not null,
  annual_salary numeric(12, 2) not null default 0.00,
  pay_frequency text not null check (pay_frequency in ('weekly', 'biweekly', 'twice_monthly', 'monthly')),
  next_payday date not null,
  employer text not null default '',
  bonus_amount numeric(12, 2) default 0.00,
  notes text default '',
  is_active boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transactions Table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  description text not null,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  type text not null check (type in ('expense', 'income')),
  paid_by text not null check (paid_by in ('Tejas', 'Hetvi', 'Shared')),
  payment_method text not null default 'Credit Card',
  is_recurring boolean default false,
  created_by text not null check (created_by in ('Tejas', 'Hetvi')),
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Budgets Table
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  month text not null, -- Format: YYYY-MM
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  scope text not null check (scope in ('household', 'Tejas', 'Hetvi')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (month, category, scope)
);

-- 6. Recurring Expenses Table
create table if not exists public.recurring_expenses (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null,
  paid_by text not null check (paid_by in ('Tejas', 'Hetvi', 'Shared')),
  frequency text not null check (frequency in ('monthly', 'biweekly', 'weekly', 'annual')),
  next_payment_date date not null,
  is_active boolean default true,
  is_essential boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Savings Goals Table
create table if not exists public.savings_goals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount >= 0),
  current_amount numeric(12, 2) not null default 0.00 check (current_amount >= 0),
  target_date date not null,
  owner text not null check (owner in ('household', 'Tejas', 'Hetvi')),
  category text not null default 'General',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Ensures only authenticated users (Tejas and Hetvi) can access household data
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.income_settings enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.savings_goals enable row level security;

-- Profiles: Authenticated users can view profiles
create policy "Allow authenticated read profiles" on public.profiles
  for select to authenticated using (true);

create policy "Allow users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Shared Household Financial Data Policies
create policy "Allow authenticated all on income_settings" on public.income_settings
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on transactions" on public.transactions
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on budgets" on public.budgets
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on recurring_expenses" on public.recurring_expenses
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on savings_goals" on public.savings_goals
  for all to authenticated using (true) with check (true);

-- Helpful Trigger to automatically create a profile when Tejas or Hetvi signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) like '%tejas%' then 'Tejas'
      else 'Hetvi'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

