'use client';
import { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { AuthFrame } from '../../components/AuthFrame';

export default function ChangePasswordPage() {
  const { reload, logout } = useAuth();
  const [currentPassword, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setOk('');
    setBusy(true);
    try {
      await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword: next } });
      setOk('Password changed. Loading your workspace…');
      await reload();
      window.location.href = '/dashboard';
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Change failed');
    } finally {
      setBusy(false);
    }
  }

  const strong = next.length >= 8 && /[A-Za-z]/.test(next) && /\d/.test(next);
  return (
    <AuthFrame>
      <h1 className="text-3xl font-bold text-ink-900">Set a new password</h1>
      <p className="mb-8 mt-1 text-sm text-slate-500">Required on your first login. Use at least 8 characters with a letter and a number.</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="cur">Current / temporary password</label>
          <div className="relative">
            <input id="cur" className="input pr-16" type={showCur ? 'text' : 'password'} autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-brand-600" onClick={() => setShowCur(!showCur)}>{showCur ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="nxt">New password</label>
          <div className="relative">
            <input id="nxt" className="input pr-16" type={showNext ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-brand-600" onClick={() => setShowNext(!showNext)}>{showNext ? 'Hide' : 'Show'}</button>
          </div>
          {next && <p className={`mt-1.5 text-xs ${strong ? 'text-green-600' : 'text-amber-600'}`}>{strong ? '✓ Looks good' : 'Needs 8+ characters, a letter and a number'}</p>}
        </div>
        {err && <p className="err">{err}</p>}
        {ok && <p className="ok">{ok}</p>}
        <button className="btn w-full !py-3" disabled={busy || !strong}>{busy ? 'Saving…' : 'Save new password'}</button>
        <button type="button" className="btn-secondary w-full" onClick={logout}>Log out</button>
      </form>
    </AuthFrame>
  );
}
