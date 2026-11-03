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
  Layers,
  ArrowRightLeft
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
    { value: '2026-12', label: 'Dec 2026' },
    { value: '2026-11', label: 'Nov 2026' },
    { value: '2026-10', label: 'Oct 2026' },
    { value: '2026-09', label: 'Sep 2026' },
    { value: '2026-08', label: 'Aug 2026' },
    { value: '2026-07', label: 'Jul 2026' },
    { value: '2026-06', label: 'Jun 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-04', label: 'Apr 2026' },
    { value: '2026-03', label: 'Mar 2026' },
    { value: '2026-02', label: 'Feb 2026' },
    { value: '2026-01', label: 'Jan 2026' }
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Left: Brand & Welcome greeting */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-extrabold shadow-sm text-sm shrink-0">
              ₹$
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  Hi, {currentUser?.name || 'Partner'} 👋
                </h1>
                <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Household
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Logged in as <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentUser?.name}</strong>
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Center: Scope Switcher (Household / Tejas / Hetvi) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => handleScopeChange('household')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedScope === 'Tejas'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Tejas</span>
            </button>

            <button
              onClick={() => handleScopeChange('Hetvi')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                selectedScope === 'Hetvi'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-pink-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Hetvi</span>
            </button>
          </div>

          {/* Right Controls: Month Picker, User Switcher, Dark mode, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Month Selector */}
            <div className="relative">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-3 sm:pr-4 text-xs font-bold appearance-none text-slate-800 dark:text-slate-100"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value} className="dark:bg-slate-900 dark:text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none -ml-3" />
              </div>
            </div>

            {/* Quick Switch User (Mobile Touch Friendly) */}
            <button
              onClick={handleSwitchUser}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
                currentUser?.name === 'Tejas'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
              }`}
              title={`Switch active user to ${currentUser?.name === 'Tejas' ? 'Hetvi' : 'Tejas'}`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">To {currentUser?.name === 'Tejas' ? 'Hetvi' : 'Tejas'}</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
            </button>

            {/* Supabase status (desktop) */}
            <button
              onClick={() => onOpenSettings('supabase')}
              title={isSupabaseConnected ? 'Supabase Connected' : 'Connect Cloud Database'}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                isSupabaseConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConnected ? 'Cloud Sync' : 'Connect'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700/80 transition"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Scope Bar (Prominent tap pills on mobile phones) */}
        <div className="flex md:hidden items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 w-full bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => handleScopeChange('household')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg text-center transition flex items-center justify-center gap-1 ${
                selectedScope === 'household'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Users className="w-3 h-3 text-emerald-500" />
              <span>Household</span>
            </button>
            <button
              onClick={() => handleScopeChange('Tejas')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg text-center transition ${
                selectedScope === 'Tejas'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Tejas
            </button>
            <button
              onClick={() => handleScopeChange('Hetvi')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg text-center transition ${
                selectedScope === 'Hetvi'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-500'
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
