-- ==============================================================================
-- Simple Personal & Household Expense Tracker Schema (Tejas & Hetvi)
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. Profiles (Strictly Tejas and Hetvi)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null check (name in ('Tejas', 'Hetvi')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Monthly Incomes
create table if not exists public.monthly_incomes (
  id uuid default uuid_generate_v4() primary key,
  month text not null, -- Format: YYYY-MM
  user_name text not null check (user_name in ('Tejas', 'Hetvi')),
  income numeric(12, 2) not null default 0.00 check (income >= 0),
  unique (month, user_name)
);

-- 3. Monthly Allocations / Categories
create table if not exists public.allocations (
  id uuid default uuid_generate_v4() primary key,
  month text not null, -- Format: YYYY-MM
  user_name text not null check (user_name in ('Tejas', 'Hetvi')),
  category text not null,
  planned_amount numeric(12, 2) not null default 0.00 check (planned_amount >= 0),
  nature text not null default 'expense' check (nature in ('expense', 'investment', 'savings')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Simple Transactions
create table if not exists public.simple_transactions (
  id uuid default uuid_generate_v4() primary key,
  date date not null default current_date,
  description text not null,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  user_name text not null check (user_name in ('Tejas', 'Hetvi')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.monthly_incomes enable row level security;
alter table public.allocations enable row level security;
alter table public.simple_transactions enable row level security;

-- Policies: Authenticated Tejas & Hetvi can access household financial records
create policy "Allow authenticated read profiles" on public.profiles
  for select to authenticated using (true);

create policy "Allow authenticated all on monthly_incomes" on public.monthly_incomes
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on allocations" on public.allocations
  for all to authenticated using (true) with check (true);

create policy "Allow authenticated all on simple_transactions" on public.simple_transactions
  for all to authenticated using (true) with check (true);

-- Auto create profile on auth signup
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
