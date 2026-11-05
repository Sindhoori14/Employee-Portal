'use client';
import { Loading } from '../../components/ui';
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth-context';

interface Goal {
  id: string;
  title: string;
  type: string;
  status: string;
}

export default function GoalsPage() {
  const { user, loading } = useRequireAuth();
  const [rows, setRows] = useState<Goal[]>([]);
  const [err, setErr] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setRows(await api<Goal[]>('/goals'));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Load failed');
    }
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/goals', { method: 'POST', body: { title, teamId: user?.teamId ?? undefined } });
      setTitle('');
      await load();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return <Loading />;
  const canCreate = user.role === 'ADMIN' || user.role === 'TEAM_LEAD' || user.role === 'COORDINATOR';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Goals</h1>
      {err && <p className="err">{err}</p>}
      {canCreate && (
        <form onSubmit={create} className="card flex gap-2">
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 12 onboarding goal" />
          <button className="btn" disabled={busy}>Create</button>
        </form>
      )}
      <div className="card">
        <ul className="divide-y divide-slate-100">
          {rows.map((g) => (
            <li key={g.id} className="py-2 text-sm"><b>{g.title}</b> <span className="text-slate-500">· {g.type} · {g.status}</span></li>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-500">No goals yet.</p>}
        </ul>
      </div>
    </div>
  );
}
