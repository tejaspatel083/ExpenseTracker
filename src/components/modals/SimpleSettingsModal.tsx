import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { saveSupabaseConfig, getSupabaseConfig, cleanSupabaseUrl } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Settings, Database, ShieldCheck, CheckCircle2, AlertCircle, X, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

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
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    details?: string[];
  }>({ status: 'idle', message: '' });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = cleanSupabaseUrl(supabaseUrl);
    const cleanKey = supabaseKey.trim();
    saveSupabaseConfig(cleanUrl, cleanKey);
    window.location.reload();
  };

  const handleTest = async () => {
    const cleanUrl = cleanSupabaseUrl(supabaseUrl);
    const cleanKey = supabaseKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestResult({
        status: 'error',
        message: 'Please enter both the Supabase Project URL and Anon API Key.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult({
      status: 'idle',
      message: 'Testing connection to Supabase...'
    });

    // Step 1: Network-level test
    try {
      const pingRes = await fetch(`${cleanUrl}/auth/v1/health`, {
        headers: { apikey: cleanKey }
      });

      if (!pingRes.ok && pingRes.status !== 401 && pingRes.status !== 404) {
        setTestResult({
          status: 'warning',
          message: `Server responded with HTTP ${pingRes.status}. Check your API Key.`
        });
        setIsTesting(false);
        return;
      }
    } catch (netErr: any) {
      setIsTesting(false);
      setTestResult({
        status: 'error',
        message: 'Network Error: Failed to reach your Supabase URL.',
        details: [
          'Verify your Project URL ends with .supabase.co (e.g. https://xyz.supabase.co).',
          'Do NOT paste your dashboard URL (like https://supabase.com/dashboard/...).',
          'Check if an Ad Blocker or Brave Shields is blocking *.supabase.co — disable it on this site.',
          'Verify your project is not paused in the Supabase Dashboard.'
        ]
      });
      return;
    }

    // Step 2: Database and Schema verification
    try {
      const testClient = createClient(cleanUrl, cleanKey);
      const { data, error } = await testClient
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      setIsTesting(false);

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('relation') && msg.includes('does not exist')) {
          setTestResult({
            status: 'warning',
            message: 'Connected to Supabase, but the "profiles" table does not exist!',
            details: [
              'Go to your Supabase Dashboard -> SQL Editor.',
              'Copy all code from supabase_schema.sql and click "Run".',
              'This creates the tables and security policies required for login.'
            ]
          });
        } else if (msg.includes('apikey') || error.code === 'PGRST301' || msg.includes('invalid api key')) {
          setTestResult({
            status: 'error',
            message: 'Invalid API Key. Copy the "anon" public key from Project Settings -> API.'
          });
        } else {
          setTestResult({
            status: 'warning',
            message: `Supabase reached, but table check returned: ${error.message}`,
            details: ['Make sure you ran supabase_schema.sql in the Supabase SQL Editor.']
          });
        }
      } else {
        setTestResult({
          status: 'success',
          message: '✅ Supabase connected successfully! Database tables are ready.'
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setTestResult({
        status: 'error',
        message: `Connection check error: ${err?.message || err}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl z-10 pb-safe max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Supabase Cloud Connection
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 inline mr-1 text-emerald-600" />
            Your credentials are saved locally in this browser for GitHub Pages and communicate directly with Supabase.
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Supabase Project URL
              </label>
              <span className="text-[10px] text-slate-400 font-mono">https://xyz.supabase.co</span>
            </div>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Found in Supabase: <strong>Project Settings</strong> → <strong>API</strong> → <strong>Project URL</strong>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Supabase Anon Public API Key
              </label>
              <span className="text-[10px] text-slate-400 font-mono">anon public</span>
            </div>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Found in Supabase: <strong>Project Settings</strong> → <strong>API</strong> → <strong>Project API keys (anon public)</strong>
            </p>
          </div>

          {/* Test connection results box */}
          {testResult.message && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : testResult.status === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : testResult.status === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2 font-bold">
                {testResult.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>

              {testResult.details && testResult.details.length > 0 && (
                <ul className="list-disc pl-5 text-[11px] space-y-1 font-medium opacity-90">
                  {testResult.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>

        {/* Local storage reset option */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Need to restore initial data?</span>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset local cache to default sample data?')) {
                resetToDefault();
                window.location.reload();
              }
            }}
            className="text-rose-500 hover:underline font-semibold"
          >
            Reset Local Data
          </button>
        </div>

      </div>
    </div>
  );
};
