'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, Eye, EyeOff, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import { ACCENT_OPTIONS, DEFAULT_CATEGORIES, ICON_OPTIONS } from '@/lib/defaults';
import { getIconComponent } from '@/lib/icons';
import { saveCategoriesRemote } from '@/hooks/useCategories';
import { clearAdminUiSession } from '@/components/AdminLoginModal';
import type { AnalyticsData, CategoryConfig } from '@/lib/types';

type Props = { onExit: () => void; initialCategories: CategoryConfig[] };

export function AdminDashboard({ onExit, initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backend, setBackend] = useState('memory');

  const loadAnalytics = useCallback(async () => {
    const res = await fetch('/api/track');
    if (res.ok) {
      const data = (await res.json()) as { analytics: AnalyticsData };
      setAnalytics(data.analytics);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 10000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setBackend(d.backend ?? 'memory')).catch(() => undefined);
  }, []);

  const updateCategory = (id: string, patch: Partial<CategoryConfig>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const maxTap = Math.max(1, ...Object.values(analytics?.categoryTaps ?? {}));
  const inputTotal = (analytics?.inputTypeSelections.text ?? 0) + (analytics?.inputTypeSelections.voice ?? 0) || 1;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <div className="mx-auto max-w-3xl px-5 py-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">Admin Dashboard</p>
            <h1 className="text-2xl font-black">QuickAsk Control</h1>
            <p className="mt-1 text-xs text-slate-500">Storage: {backend}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onExit} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
              <ArrowLeft className="h-4 w-4" /> App
            </button>
            <button type="button" onClick={async () => { await fetch('/api/admin/login', { method: 'DELETE' }); clearAdminUiSession(); onExit(); }} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
            <BarChart3 className="h-4 w-4" /> Analytics
          </h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Conversions</p>
              <p className="mt-1 text-3xl font-black text-emerald-400">{analytics?.conversions ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Text</p>
              <p className="mt-1 text-3xl font-black text-violet-400">{analytics?.inputTypeSelections.text ?? 0}</p>
              <p className="text-[10px] text-slate-500">{Math.round(((analytics?.inputTypeSelections.text ?? 0) / inputTotal) * 100)}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Voice</p>
              <p className="mt-1 text-3xl font-black text-pink-400">{analytics?.inputTypeSelections.voice ?? 0}</p>
              <p className="text-[10px] text-slate-500">{Math.round(((analytics?.inputTypeSelections.voice ?? 0) / inputTotal) * 100)}%</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category taps</p>
            <div className="space-y-3">
              {categories.map((cat) => {
                const count = analytics?.categoryTaps[cat.id] ?? 0;
                return (
                  <div key={cat.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="font-mono text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${(count / maxTap) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Categories</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCategories(DEFAULT_CATEGORIES)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400">Reset</button>
              <button type="button" onClick={() => setCategories((p) => [...p, { id: `custom-${Date.now()}`, label: 'New Category', icon: 'Star', accent: ACCENT_OPTIONS[0], visible: true }])} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-emerald-400">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => {
              const Icon = getIconComponent(cat.icon);
              return (
                <div key={cat.id} className={`rounded-2xl border p-4 ${cat.visible ? 'border-white/10 bg-[#111827]' : 'border-white/5 bg-[#0b0f19] opacity-60'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl bg-gradient-to-br ${cat.accent} p-2`}><Icon className="h-5 w-5 text-white" /></div>
                      <span className="text-xs font-mono text-slate-500">{cat.id}</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => updateCategory(cat.id, { visible: !cat.visible })} className="rounded-lg border border-white/10 p-2 text-slate-400">
                        {cat.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => categories.length > 1 && setCategories((p) => p.filter((c) => c.id !== cat.id))} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={cat.label} onChange={(e) => updateCategory(cat.id, { label: e.target.value })} className="rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2 text-sm text-white outline-none" placeholder="Label" />
                    <select value={cat.icon} onChange={(e) => updateCategory(cat.id, { icon: e.target.value })} className="rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2 text-sm text-white outline-none">
                      {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select value={cat.accent} onChange={(e) => updateCategory(cat.id, { accent: e.target.value })} className="rounded-lg border border-white/10 bg-[#0b0f19] px-3 py-2 text-sm text-white outline-none sm:col-span-2">
                      {ACCENT_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" disabled={saving} onClick={async () => { setSaving(true); const ok = await saveCategoriesRemote(categories); setSaving(false); if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); } }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-500 py-4 text-base font-bold disabled:opacity-50">
            <Save className="h-5 w-5" /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save & Publish'}
          </button>
        </section>
      </div>
    </div>
  );
}
