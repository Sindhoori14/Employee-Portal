'use client';
import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api, ApiError } from '../../lib/api';
import { AuthFrame } from '../../components/AuthFrame';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  async function forgot() {
    setErr('');
    setForgotMsg('');
    if (!email.trim()) { setErr('Type your work email above first, then tap "Forgot password".'); return; }
    try {
      const r = await api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email: email.trim().toLowerCase() } });
      setForgotMsg(r.message);
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Could not send the request');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame>
      <h1 className="text-3xl font-bold text-ink-900">Welcome back 👋</h1>
      <p className="mb-8 mt-1 text-sm text-slate-500">Sign in with your work email to open your workspace.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Work email</label>
          <input id="email" className="input" type="email" autoComplete="username" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <div className="relative">
            <input id="pw" className="input pr-16" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent-600" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        {forgotMsg && <p className="ok" role="status">{forgotMsg}</p>}
        <button className="btn w-full !py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-400">
        Forgot your password?{' '}
        <button type="button" onClick={forgot} className="font-semibold text-accent-600 hover:underline">Notify my admin</button>
        {' '}— they will give you a temporary one.
      </p>
    </AuthFrame>
  );
}
