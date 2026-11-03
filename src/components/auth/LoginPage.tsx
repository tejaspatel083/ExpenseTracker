import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileName } from '../../types';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, signUpWithSupabase, loginWithHouseholdPin } = useAuth();
  
  // Auth Mode: 'email_signin' | 'email_signup' | 'pin'
  const [authMode, setAuthMode] = useState<'email_signin' | 'email_signup' | 'pin'>('email_signin');
  
  // Email & Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Household PIN state
  const [selectedUser, setSelectedUser] = useState<UserProfileName>('Tejas');
  const [pin, setPin] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

    if (authMode === 'email_signup') {
      const result = await signUpWithSupabase(email, password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create account.');
      } else if (result.needConfirmation) {
        setSuccessNotice('Account registered! Confirmation email sent. You can also use the Household Passcode (1234) below to enter immediately.');
      }
    } else {
      const result = await loginWithSupabase(email, password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!pin) {
      setErrorMessage('Please enter the household passcode.');
      return;
    }

    const res = loginWithHouseholdPin(selectedUser, pin);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid passcode.');
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

          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-800/90 p-1 mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email_signin');
                setErrorMessage(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode !== 'pin'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Account</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setErrorMessage(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMode === 'pin'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Household Passcode</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1.5 flex-1">
                <span className="font-bold block text-rose-200">Notice:</span>
                <span className="leading-relaxed block">{errorMessage}</span>
                {authMode !== 'pin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('pin');
                      setErrorMessage(null);
                    }}
                    className="mt-1 text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>👉 Tap to unlock with Household Passcode (1234)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Notice Box */}
          {successNotice && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed">{successNotice}</div>
            </div>
          )}

          {/* MODE 1: Email & Password (Sign In or Sign Up) */}
          {authMode !== 'pin' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {authMode === 'email_signin' ? (
                    <button
                      type="button"
                      onClick={() => setAuthMode('email_signup')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      New user? Set password
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthMode('email_signin')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Have an account? Sign In
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'email_signup' ? 'Create a secure password' : '••••••••••••'}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoComplete={authMode === 'email_signup' ? 'new-password' : 'current-password'}
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
                    <span>{authMode === 'email_signup' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('pin')}
                  className="text-xs text-slate-400 hover:text-emerald-300 transition underline underline-offset-4"
                >
                  Or enter immediately with Household Passcode
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: Household Passcode (Instant Offline / Direct Access) */
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Profile
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedUser('Tejas')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedUser === 'Tejas'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-500/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Tejas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUser('Hetvi')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      selectedUser === 'Hetvi'
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200 ring-2 ring-pink-500/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Hetvi</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Household Passcode
                  </label>
                  <span className="text-[10px] text-slate-400">Default: 1234</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 1234"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-medium py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Unlock Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('email_signin')}
                  className="text-xs text-slate-400 hover:text-emerald-300 transition underline underline-offset-4"
                >
                  Back to Supabase Email Sign In
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-slate-400">
            🔒 Private Encrypted Household Ledger
          </p>
          <p className="text-[11px] text-slate-500">
            Tejas & Hetvi Family Accounts
          </p>
        </div>
      </div>
    </div>
  );
};
