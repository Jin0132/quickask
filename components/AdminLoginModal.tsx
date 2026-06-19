'use client';

import { Lock, X } from 'lucide-react';
import { useState } from 'react';
import { ADMIN_UI_SESSION_KEY } from '@/lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AdminLoginModal({ open, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        sessionStorage.setItem(ADMIN_UI_SESSION_KEY, 'true');
        setPassword('');
        onSuccess();
        onClose();
        return;
      }
      if (res.status === 503) {
        setError('Server: ADMIN_PASSWORD is not set. Configure it in Vercel or .env.local');
      } else {
        setError(data.error ?? 'Invalid password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-bold">Admin Login</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full rounded-xl border border-white/10 bg-[#0b0f19] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500/50"
            autoFocus
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={loading || !password} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 text-sm font-bold text-white disabled:opacity-50">
            {loading ? 'Signing in…' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function isAdminUiSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_UI_SESSION_KEY) === 'true';
}

export function clearAdminUiSession(): void {
  sessionStorage.removeItem(ADMIN_UI_SESSION_KEY);
}
