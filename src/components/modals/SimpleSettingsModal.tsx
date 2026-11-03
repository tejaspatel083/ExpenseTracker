import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { saveSupabaseConfig, getSupabaseConfig, getSupabase } from '../../lib/supabase';
import { Settings, Database, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface SimpleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleSettingsModal: React.FC<SimpleSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isSupabaseConnected } = useAuth();
  const { resetToDefault } = useFinance();

  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseKey, setSupabaseKey] = useState(config.anonKey);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    window.location.reload();
  };

  const handleTest = async () => {
    setTestResult('Connecting...');
    const client = getSupabase();
    if (!client) {
      setTestResult('❌ Check URL format.');
      return;
    }
    try {
      const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        setTestResult(`⚠️ ${error.message} (Run supabase_schema.sql in Supabase SQL editor)`);
      } else {
        setTestResult('✅ Supabase connected successfully!');
      }
    } catch (e: any) {
      setTestResult(`❌ Connection error: ${e?.message || e}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl z-10 pb-safe">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Settings & Cloud Database
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 inline mr-1 text-emerald-600" />
            Designed for <strong>GitHub Pages</strong>. Credentials persist locally in your browser and sync securely with Supabase.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUz..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          {testResult && (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
              {testResult}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Test
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25"
            >
              Save Configuration
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Reset default sample numbers</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial sample budget values?')) {
                  resetToDefault();
                  window.location.reload();
                }
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              Reset Baseline
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
