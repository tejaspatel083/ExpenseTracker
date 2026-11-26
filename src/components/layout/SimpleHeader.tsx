import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  LogOut,
  Moon,
  Sun,
  Settings,
  User
} from 'lucide-react';

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
                  Tejas&apos;s Expense Tracker
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Personal
                </span>
              </div>
            </div>
          </div>

          {/* User Badge & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* User Profile Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tejas</span>
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

