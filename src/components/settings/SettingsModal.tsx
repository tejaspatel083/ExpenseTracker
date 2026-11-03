import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { IncomeSetting, PayFrequency, UserProfileName } from '../../types';
import { saveSupabaseConfig, getSupabaseConfig, getSupabase } from '../../lib/supabase';
import {
  Settings,
  DollarSign,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Calendar,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'income' | 'supabase' | 'backup';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'income'
}) => {
  const {
    incomeSettings,
    updateIncomeSetting,
    calculatePaycheckAmount,
    calculateMonthlyProjectedIncome,
    exportDataJSON,
    importDataJSON,
    resetToSampleData
  } = useFinance();
  const { isSupabaseConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'income' | 'supabase' | 'backup'>(initialTab);

  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseKey, setSupabaseKey] = useState(config.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const tejasIncome = incomeSettings.find(s => s.userName === 'Tejas') || incomeSettings[0];
  const hetviIncome = incomeSettings.find(s => s.userName === 'Hetvi') || incomeSettings[1];

  const [tSalary, setTSalary] = useState(tejasIncome?.annualSalary?.toString() || '80000');
  const [tFreq, setTFreq] = useState<PayFrequency>(tejasIncome?.payFrequency || 'biweekly');
  const [tEmployer, setTEmployer] = useState(tejasIncome?.employer || 'TechCorp Canada');
  const [tNextPay, setTNextPay] = useState(tejasIncome?.nextPayday || '2026-11-05');
  const [tBonus, setTBonus] = useState(tejasIncome?.bonusAmount?.toString() || '5000');

  const [hSalary, setHSalary] = useState(hetviIncome?.annualSalary?.toString() || '55000');
  const [hFreq, setHFreq] = useState<PayFrequency>(hetviIncome?.payFrequency || 'biweekly');
  const [hEmployer, setHEmployer] = useState(hetviIncome?.employer || 'Scotiabank');
  const [hNextPay, setHNextPay] = useState(hetviIncome?.nextPayday || '2026-11-12');
  const [hBonus, setHBonus] = useState(hetviIncome?.bonusAmount?.toString() || '2500');

  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [incomeSaveSuccess, setIncomeSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIncome(true);

    if (tejasIncome) {
      await updateIncomeSetting(tejasIncome.id, {
        annualSalary: parseFloat(tSalary) || 0,
        payFrequency: tFreq,
        employer: tEmployer.trim(),
        nextPayday: tNextPay,
        bonusAmount: parseFloat(tBonus) || 0
      });
    }

    if (hetviIncome) {
      await updateIncomeSetting(hetviIncome.id, {
        annualSalary: parseFloat(hSalary) || 0,
        payFrequency: hFreq,
        employer: hEmployer.trim(),
        nextPayday: hNextPay,
        bonusAmount: parseFloat(hBonus) || 0
      });
    }

    setIsSavingIncome(false);
    setIncomeSaveSuccess(true);
    setTimeout(() => setIncomeSaveSuccess(false), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleTestSupabase = async () => {
    setTestResult('Testing connection...');
    const client = getSupabase();
    if (!client) {
      setTestResult('❌ Client initialization failed. Check your URL format.');
      return;
    }

    try {
      const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        setTestResult(`⚠️ Connected to Supabase, but query returned: ${error.message}. Make sure to execute supabase_schema.sql in SQL Editor.`);
      } else {
        setTestResult('✅ Supabase connected successfully! Database tables are reachable.');
      }
    } catch (err: any) {
      setTestResult(`❌ Connection failed: ${err?.message || err}`);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `household_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('✅ Backup successfully imported!');
      } else {
        setImportStatus('❌ Error importing backup. Verify JSON structure.');
      }
    };
    reader.readAsText(file);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

  const tPaycheck = tejasIncome ? calculatePaycheckAmount({ ...tejasIncome, annualSalary: parseFloat(tSalary) || 0, payFrequency: tFreq }) : 0;
  const tMonthly = tejasIncome ? calculateMonthlyProjectedIncome({ ...tejasIncome, annualSalary: parseFloat(tSalary) || 0, payFrequency: tFreq }) : 0;

  const hPaycheck = hetviIncome ? calculatePaycheckAmount({ ...hetviIncome, annualSalary: parseFloat(hSalary) || 0, payFrequency: hFreq }) : 0;
  const hMonthly = hetviIncome ? calculateMonthlyProjectedIncome({ ...hetviIncome, annualSalary: parseFloat(hSalary) || 0, payFrequency: hFreq }) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 pb-safe">
        
        {/* Mobile handle */}
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Household Settings
              </h3>
              <p className="text-[11px] text-slate-500">
                Income modeling, Supabase cloud sync & backups.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Scrollable on small screens) */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 sm:px-6 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('income')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'income'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salary & Income</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Export</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          
          {/* TAB 1: INCOME SETTINGS */}
          {activeTab === 'income' && (
            <form onSubmit={handleSaveIncome} className="space-y-4 sm:space-y-6">
              
              {incomeSaveSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Income settings updated and recalculated across all views!</span>
                </div>
              )}

              {/* Tejas Profile */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tejas Income Settings
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold self-start sm:self-auto">
                    Paycheck: {fmt(tPaycheck)} ({tFreq})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Salary (CAD $)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={tSalary}
                      onChange={(e) => setTSalary(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pay Frequency
                    </label>
                    <select
                      value={tFreq}
                      onChange={(e) => setTFreq(e.target.value as PayFrequency)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="weekly">Weekly (52 / yr)</option>
                      <option value="biweekly">Biweekly (26 / yr)</option>
                      <option value="twice_monthly">Twice Monthly (24 / yr)</option>
                      <option value="monthly">Monthly (12 / yr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employer
                    </label>
                    <input
                      type="text"
                      value={tEmployer}
                      onChange={(e) => setTEmployer(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Next Payday Date
                    </label>
                    <input
                      type="date"
                      value={tNextPay}
                      onChange={(e) => setTNextPay(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
                  <span>Projected: <strong>{fmt(tMonthly)}/mo</strong></span>
                </div>
              </div>

              {/* Hetvi Profile */}
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Hetvi Income Settings
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-pink-600 dark:text-pink-400 font-bold self-start sm:self-auto">
                    Paycheck: {fmt(hPaycheck)} ({hFreq})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Salary (CAD $)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={hSalary}
                      onChange={(e) => setHSalary(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pay Frequency
                    </label>
                    <select
                      value={hFreq}
                      onChange={(e) => setHFreq(e.target.value as PayFrequency)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="weekly">Weekly (52 / yr)</option>
                      <option value="biweekly">Biweekly (26 / yr)</option>
                      <option value="twice_monthly">Twice Monthly (24 / yr)</option>
                      <option value="monthly">Monthly (12 / yr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employer
                    </label>
                    <input
                      type="text"
                      value={hEmployer}
                      onChange={(e) => setHEmployer(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Next Payday Date
                    </label>
                    <input
                      type="date"
                      value={hNextPay}
                      onChange={(e) => setHNextPay(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
                  <span>Projected: <strong>{fmt(hMonthly)}/mo</strong></span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingIncome}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {isSavingIncome ? 'Saving Changes...' : 'Save Income Settings'}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SUPABASE CLOUD SYNC */}
          {activeTab === 'supabase' && (
            <div className="space-y-4 sm:space-y-6">
              
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  GitHub Pages & Supabase
                </div>
                Your credentials are stored securely in browser local storage. Transactions and budgets sync directly with your private Supabase database.
              </div>

              <form onSubmit={handleSaveSupabase} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon Public API Key *
                  </label>
                  <input
                    type="password"
                    required
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                  >
                    Test Connection
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Save & Reconnect
                  </button>
                </div>
              </form>

              {testResult && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {testResult}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Database Setup:
                </h5>
                <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Run <code>supabase_schema.sql</code> in your Supabase SQL Editor.</li>
                  <li>Create user accounts for Tejas and Hetvi under Supabase Auth.</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 3: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4 sm:space-y-6">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Household Backup
                  </h4>
                  <p className="text-xs text-slate-500">
                    Download an offline JSON ledger of all transactions and goals.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Restore from Backup
                  </h4>
                  <p className="text-xs text-slate-500">
                    Import previously saved household JSON archive.
                  </p>
                </div>
                <div>
                  <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Select File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                  {importStatus}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Reset to 2026 Reference Sheet
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Reloads the original numbers from your Google Sheet screenshot.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset ledger back to original Google Sheets data?')) {
                      resetToSampleData();
                      alert('Data reset to Google Sheets 2026 baseline.');
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 text-xs font-semibold"
                >
                  Reset Baseline
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
