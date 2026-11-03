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
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, signUpWithSupabase, loginWithHouseholdPin } = useAuth();
  
  // Quick Passcode state (Primary, instant access)
  const [selectedUser, setSelectedUser] = useState<UserProfileName>('Tejas');
  const [pin, setPin] = useState('1234');

  // Supabase Email state
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const res = loginWithHouseholdPin(selectedUser, pin);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid passcode. Default is 1234.');
    }
  };

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

    try {
      if (emailMode === 'signup') {
        const result = await signUpWithSupabase(email, password);
        setIsSubmitting(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to create account.');
        } else if (result.needConfirmation) {
          setSuccessNotice('Account registered! If confirmation is required, tap Quick Unlock above to enter immediately.');
        }
      } else {
        const result = await loginWithSupabase(email, password);
        setIsSubmitting(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Authentication failed. Please check your credentials or tap Unlock Ledger above.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Connection timed out. Tap Unlock Ledger above to enter.');
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

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1 flex-1">
                <span className="font-bold block text-rose-200">Notice:</span>
                <span className="leading-relaxed block">{errorMessage}</span>
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

          {/* PRIMARY METHOD: Instant Household Passcode */}
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Profile
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedUser('Tejas')}
                  className={`py-3 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    selectedUser === 'Tejas'
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200 ring-2 ring-sky-500/30 shadow-md shadow-sky-950'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Tejas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser('Hetvi')}
                  className={`py-3 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    selectedUser === 'Hetvi'
                      ? 'bg-pink-500/25 border-pink-400 text-pink-200 ring-2 ring-pink-500/30 shadow-md shadow-pink-950'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Hetvi</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Household Passcode
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">Default: 1234</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Unlock Ledger as {selectedUser}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* SECONDARY METHOD: Supabase Email Sign In Accordion */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowEmailLogin(!showEmailLogin);
                setErrorMessage(null);
              }}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition py-1"
            >
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Or sign in with Supabase Email</span>
              </div>
              {showEmailLogin ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showEmailLogin && (
              <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-medium text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmailMode(emailMode === 'signin' ? 'signup' : 'signin')}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      {emailMode === 'signin' ? 'New user? Set password' : 'Have account? Sign in'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{emailMode === 'signup' ? 'Create Supabase Account' : 'Sign In with Email'}</span>
                  )}
                </button>
              </form>
            )}
          </div>

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
