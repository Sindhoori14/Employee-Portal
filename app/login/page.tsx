'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api, ApiError } from '../../lib/api';
import { AuthFrame } from '../../components/AuthFrame';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  // Load remembered work email on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('elevateiq_saved_email');
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, []);

  async function forgot() {
    setErr('');
    setForgotMsg('');
    if (!email.trim()) {
      setErr('Please enter your work email above first, then click "Notify my admin".');
      return;
    }
    try {
      const r = await api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      });
      setForgotMsg(r.message || 'Notification sent to your administrator. A temporary password will be issued.');
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Could not contact administrator. Please try again.');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setForgotMsg('');
    setBusy(true);

    try {
      if (rememberMe) {
        try { localStorage.setItem('elevateiq_saved_email', email.trim().toLowerCase()); } catch {}
      } else {
        try { localStorage.removeItem('elevateiq_saved_email'); } catch {}
      }

      await login(email.trim().toLowerCase(), password);
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Invalid work email or password. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame>
      <div className="relative rounded-3xl border border-slate-200/85 bg-white p-7 sm:p-10 shadow-[0_20px_50px_rgba(11,36,71,0.08)] backdrop-blur-sm transition duration-300 hover:border-slate-300">
        {/* Mobile Header: Visible only on small screens */}
        <div className="mb-6 flex flex-col items-center justify-center lg:hidden">
          <img
            src="/elevateiq-logo.png"
            alt="ElevateIQ Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#006ADA] uppercase">
            EMPLOYEE PORTAL
          </span>
        </div>

        {/* Section Heading & Subtitle */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] tracking-tight">
            Welcome to your workspace
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-normal">
            Sign in to continue where your work happens.
          </p>
        </div>

        {/* Error Alert Message */}
        {err && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700 animate-fade"
            role="alert"
          >
            <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">{err}</span>
          </div>
        )}

        {/* Success / Notification Alert Message */}
        {forgotMsg && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-sm text-emerald-800 animate-fade"
            role="status"
          >
            <svg className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">{forgotMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Work Email Field */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600" htmlFor="email">
              Work Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                placeholder="name@elevateiq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition duration-150 focus:border-[#006ADA] focus:outline-none focus:ring-4 focus:ring-[#006ADA]/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600" htmlFor="pw">
                Password
              </label>
              <button
                type="button"
                onClick={forgot}
                disabled={busy}
                className="text-xs font-semibold text-[#006ADA] hover:text-[#0058B8] hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="pw"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition duration-150 focus:border-[#006ADA] focus:outline-none focus:ring-4 focus:ring-[#006ADA]/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                tabIndex={-1}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                {show ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#F03D0A] focus:ring-[#F03D0A]/30 transition"
              />
              <span className="text-xs text-slate-600 font-medium">Remember my email</span>
            </label>

            <button
              type="button"
              onClick={forgot}
              className="text-xs font-medium text-slate-500 hover:text-[#006ADA] transition"
            >
              Notify my admin
            </button>
          </div>

          {/* Prominent ElevateIQ Orange Sign-in Button */}
          <button
            type="submit"
            disabled={busy}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F03D0A] to-[#E03405] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(240,61,10,0.32)] transition duration-200 hover:from-[#E03405] hover:to-[#C92B00] hover:shadow-[0_6px_22px_rgba(240,61,10,0.42)] focus:outline-none focus:ring-4 focus:ring-[#F03D0A]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying credentials…</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Security & Access Notice */}
        <div className="mt-8 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Authorized ElevateIQ Personnel Only
          </p>
        </div>
      </div>
    </AuthFrame>
  );
}
