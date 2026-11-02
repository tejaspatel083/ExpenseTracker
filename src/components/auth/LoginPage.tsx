import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Users, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfileName } from '../../types';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, loginAsDemo, isSupabaseConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithSupabase(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleDemoSelect = (name: UserProfileName) => {
    loginAsDemo(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Tejas & Hetvi
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Private Household
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personal finance & shared wealth management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-pink-500" />

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Household Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly restricted to registered household members.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tejas@... or hetvi@..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Profile Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Select Profile
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSelect('Tejas')}
                className="group p-3 rounded-2xl bg-slate-800/60 hover:bg-sky-950/40 border border-slate-700/80 hover:border-sky-500/50 transition text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-base group-hover:scale-105 transition">
                  T
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition">
                    Tejas
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Co-Head
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('Hetvi')}
                className="group p-3 rounded-2xl bg-slate-800/60 hover:bg-pink-950/40 border border-slate-700/80 hover:border-pink-500/50 transition text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-bold text-base group-hover:scale-105 transition">
                  H
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-white group-hover:text-pink-300 transition">
                    Hetvi
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Co-Head
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isSupabaseConnected ? 'Connected to Supabase Database' : 'Supabase configured or Instant Preview active'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Encrypted private ledger. Public registration disabled.
        </p>
      </div>
    </div>
  );
};
