import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  Users,
  LogOut,
  Moon,
  Sun,
  Calendar,
  ChevronDown,
  Settings,
  Sparkles,
  User
} from 'lucide-react';
import { UserViewScope } from '../../types';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSetup: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const SimpleHeader: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenSetup,
  darkMode,
  toggleDarkMode
}) => {
  const { currentUser, logout, updateProfileName } = useAuth();
  const { selectedMonth, setSelectedMonth, selectedScope, setSelectedScope } = useFinance();

  const months = [
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-09', label: 'September 2026' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors pt-safe">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand & Active User */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-emerald-500/30 shrink-0">
              $
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Tejas & Hetvi
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Household
                </span>
              </div>
            </div>
          </div>

          {/* Profile Switcher Dropdown (Household | Tejas | Hetvi) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Scope Switcher Dropdown */}
            <div className="relative">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                selectedScope === 'household'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : selectedScope === 'Tejas'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : 'bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800'
              }`}>
                {selectedScope === 'household' ? (
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <User className={`w-3.5 h-3.5 ${selectedScope === 'Tejas' ? 'text-sky-600' : 'text-pink-600'}`} />
                )}
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value as UserViewScope)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-3 text-xs font-bold appearance-none text-current"
                >
                  <option value="household" className="dark:bg-slate-900 text-slate-900 dark:text-white">Household</option>
                  <option value="Tejas" className="dark:bg-slate-900 text-slate-900 dark:text-white">Tejas</option>
                  <option value="Hetvi" className="dark:bg-slate-900 text-slate-900 dark:text-white">Hetvi</option>
                </select>
                <ChevronDown className="w-3 h-3 opacity-60 pointer-events-none -ml-3" />
              </div>
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings Gear (Monthly Setup & Supabase) */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Settings & Cloud Config"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
