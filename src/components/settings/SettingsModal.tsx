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

  // Supabase keys state
  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseKey, setSupabaseKey] = useState(config.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Income edits local state
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

  // Import JSON input ref
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

  // Compute live expected paycheck previews
  const tPaycheck = tejasIncome ? calculatePaycheckAmount({ ...tejasIncome, annualSalary: parseFloat(tSalary) || 0, payFrequency: tFreq }) : 0;
  const tMonthly = tejasIncome ? calculateMonthlyProjectedIncome({ ...tejasIncome, annualSalary: parseFloat(tSalary) || 0, payFrequency: tFreq }) : 0;

  const hPaycheck = hetviIncome ? calculatePaycheckAmount({ ...hetviIncome, annualSalary: parseFloat(hSalary) || 0, payFrequency: hFreq }) : 0;
  const hMonthly = hetviIncome ? calculateMonthlyProjectedIncome({ ...hetviIncome, annualSalary: parseFloat(hSalary) || 0, payFrequency: hFreq }) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Household Settings & Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Income modeling, Supabase cloud sync, and backup exports.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('income')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'income'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary & Income Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup & Export</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: INCOME SETTINGS */}
          {activeTab === 'income' && (
            <form onSubmit={handleSaveIncome} className="space-y-6">
              
              {incomeSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Income settings updated and recalculated across all projections!</span>
                </div>
              )}

              {/* Tejas Profile */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tejas Income Settings
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/70 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                    Est. Paycheck: {fmt(tPaycheck)} ({tFreq})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Salary (CAD $)
                    </label>
                    <input
                      type="number"
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

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Projected Monthly Contribution: <strong>{fmt(tMonthly)}/mo</strong></span>
                  <span>Annual Bonus Target: {fmt(parseFloat(tBonus) || 0)}</span>
                </div>
              </div>

              {/* Hetvi Profile */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Hetvi Income Settings
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-pink-600 dark:text-pink-400 font-bold bg-pink-50 dark:bg-pink-950/70 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-800">
                    Est. Paycheck: {fmt(hPaycheck)} ({hFreq})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Annual Salary (CAD $)
                    </label>
                    <input
                      type="number"
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

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Projected Monthly Contribution: <strong>{fmt(hMonthly)}/mo</strong></span>
                  <span>Annual Bonus Target: {fmt(parseFloat(hBonus) || 0)}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingIncome}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {isSavingIncome ? 'Saving Changes...' : 'Save Income Settings'}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: SUPABASE CLOUD SYNC */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  GitHub Pages + Supabase Integration
                </div>
                Because this app is deployed as a static site on <strong>GitHub Pages</strong>, your credentials are saved directly in browser storage or injected at build-time. All data is synchronized securely with your private Supabase database.
              </div>

              <form onSubmit={handleSaveSupabase} className="space-y-4">
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                  >
                    Test Connection
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
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

              {/* SQL Schema helper */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Database Initialization Instructions:
                </h5>
                <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Open your Supabase Dashboard: <code>SQL Editor</code></li>
                  <li>Open the file <code>supabase_schema.sql</code> included in this project</li>
                  <li>Copy and paste all SQL into the SQL Editor, then click <strong>Run</strong></li>
                  <li>Create two user accounts in Supabase Auth: one for Tejas and one for Hetvi</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 3: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Household Ledger (JSON)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download an offline encrypted backup of all transactions, recurring items, and goals.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJSON}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Restore from Backup File
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Import previously saved household JSON archive.
                  </p>
                </div>
                <div>
                  <label className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Select JSON File</span>
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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Reset to 2026 Reference Sheet Data
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Reloads the exact historical numbers from your Google Sheet image.
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
                  className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
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
