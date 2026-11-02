import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Users,
  LogOut,
  Database,
  Moon,
  Sun,
  Calendar,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { UserViewScope } from '../../types';

interface HeaderProps {
  onOpenSettings: (initialTab?: 'income' | 'supabase' | 'backup') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, darkMode, toggleDarkMode }) => {
  const { currentUser, logout, updateProfileName, isSupabaseConnected } = useAuth();
  const { selectedMonth, setSelectedMonth, selectedScope, setSelectedScope } = useFinance();

  const months = [
    { value: '2026-12', label: 'December 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' }
  ];

  const handleScopeChange = (scope: UserViewScope) => {
    setSelectedScope(scope);
  };

  const handleSwitchUser = () => {
    if (currentUser?.name === 'Tejas') {
      updateProfileName('Hetvi');
    } else {
      updateProfileName('Tejas');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Brand & Welcome greeting */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-extrabold shadow-md shadow-emerald-500/20 text-lg">
              ₹$
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Welcome back, {currentUser?.name || 'Partner'} 👋
                </h1>
                <span className="hidden md:inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Household
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in as <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser?.name}</span> • {currentUser?.role}
              </p>
            </div>
          </div>

          {/* Center: Scope Switcher (Household / Tejas / Hetvi) */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => handleScopeChange('household')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedScope === 'household'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Household</span>
            </button>

            <button
              onClick={() => handleScopeChange('Tejas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedScope === 'Tejas'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Tejas</span>
            </button>

            <button
              onClick={() => handleScopeChange('Hetvi')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedScope === 'Hetvi'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Hetvi</span>
            </button>
          </div>

          {/* Right: Month Picker, Supabase Indicator, Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Month Selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-4 text-xs font-semibold appearance-none text-slate-800 dark:text-slate-100"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value} className="dark:bg-slate-900 dark:text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-4" />
              </div>
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={() => onOpenSettings('supabase')}
              title={isSupabaseConnected ? 'Supabase Connected' : 'Configure Supabase Cloud Database'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                isSupabaseConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {isSupabaseConnected ? 'Supabase' : 'Connect Cloud'}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Switch Active User Fast Action */}
            <button
              onClick={handleSwitchUser}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                currentUser?.name === 'Tejas'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
              }`}
              title="Quick switch active user profile"
            >
              <span className="w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs bg-white dark:bg-slate-800 shadow-sm">
                {currentUser?.name[0]}
              </span>
              <span className="hidden md:inline">Switch to {currentUser?.name === 'Tejas' ? 'Hetvi' : 'Tejas'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700/80 transition"
              title="Log out of household"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Scope Bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 w-full bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            <button
              onClick={() => handleScopeChange('household')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg text-center transition ${
                selectedScope === 'household' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Household
            </button>
            <button
              onClick={() => handleScopeChange('Tejas')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg text-center transition ${
                selectedScope === 'Tejas' ? 'bg-sky-500 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Tejas
            </button>
            <button
              onClick={() => handleScopeChange('Hetvi')}
              className={`flex-1 py-1 text-xs font-medium rounded-lg text-center transition ${
                selectedScope === 'Hetvi' ? 'bg-pink-500 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Hetvi
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
