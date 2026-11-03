import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, signUpWithSupabase } = useAuth();
  
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (emailMode === 'signup') {
        const result = await signUpWithSupabase(email, password);
        setIsSubmitting(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
        } else if (result.needConfirmation) {
          setSuccessNotice('Account registered! A confirmation email has been sent. Please verify your email to complete sign in.');
        }
      } else {
        const result = await loginWithSupabase(email, password);
        setIsSubmitting(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please check your email and password.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Login request failed. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white pt-safe pb-safe">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-3 sm:mb-4 ring-4 ring-emerald-500/10">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Household Ledger
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Private
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Personal finance & wealth management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-400 to-pink-500" />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                {emailMode === 'signup' ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentication required to access records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmailMode(emailMode === 'signin' ? 'signup' : 'signin');
                setErrorMessage(null);
                setSuccessNotice(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition"
            >
              {emailMode === 'signin' ? 'New user? Sign up' : 'Have account? Sign in'}
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 sm:mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1 flex-1">
                <span className="font-bold block text-rose-200">Access Denied:</span>
                <span className="leading-relaxed block">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Notice Box */}
          {successNotice && (
            <div className="mb-4 sm:mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed">{successNotice}</div>
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
                  inputMode="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoComplete="email"
                  required
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
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-medium py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{emailMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-slate-400">
            🔒 Private Encrypted Ledger
          </p>
          <p className="text-[11px] text-slate-500">
            Authorized accounts only.
          </p>
        </div>
      </div>
    </div>
  );
};
