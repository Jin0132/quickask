'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Keyboard, Copy, ClipboardCheck, ExternalLink, X, Lock } from 'lucide-react';
import { AdminLoginModal, isAdminUiSession } from '@/components/AdminLoginModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useCategories } from '@/hooks/useCategories';
import { useSecretTap } from '@/hooks/useSecretTap';
import { getCategoryIcon } from '@/lib/icons';
import { trackEvent } from '@/lib/track-client';

interface SpeechRecognitionEvent extends Event {
  results: { length: number; [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string; interimResults: boolean; continuous: boolean;
  start(): void; stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const INSTAGRAM_USERNAME = 'icl_tokyo';
const INSTAGRAM_PROFILE_WEB = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_USERNAME}`;

function isMobile() { return typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); }
function isAndroid() { return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent); }
function isInstagramInAppBrowser() { return typeof navigator !== 'undefined' && /Instagram/i.test(navigator.userAgent); }

function openInstagramProfile() {
  const appUrl = isAndroid()
    ? `intent://instagram.com/_u/${INSTAGRAM_USERNAME}/#Intent;package=com.instagram.android;scheme=https;end`
    : `instagram://user?username=${INSTAGRAM_USERNAME}`;
  if (isMobile() || isInstagramInAppBrowser()) { window.location.href = appUrl; return; }
  const opened = window.open(INSTAGRAM_PROFILE_WEB, '_blank', 'noopener,noreferrer');
  if (!opened) window.location.href = INSTAGRAM_PROFILE_WEB;
}

function openInstagramDm() { window.location.href = INSTAGRAM_DM_URL; }

type Props = { startInAdmin?: boolean };

export function QuickAskApp({ startInAdmin = false }: Props) {
  const { categories, visibleCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'voice' | 'text'>('text');
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('');
  const [copySucceeded, setCopySucceeded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => { if (startInAdmin && isAdminUiSession()) setAdminMode(true); }, [startInAdmin]);
  const openAdminLogin = useCallback(() => setShowLoginModal(true), []);
  const handleSecretTap = useSecretTap(openAdminLogin);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = 'en-US'; r.interimResults = true; r.continuous = false;
    r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setQuestion(t); };
    r.onerror = () => setIsRecording(false); r.onend = () => setIsRecording(false);
    recognitionRef.current = r;
  }, []);

  const toggleRecording = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) { alert('Voice recognition is not supported in this browser.'); return; }
    if (isRecording) { r.stop(); setIsRecording(false); } else { setIsRecording(true); r.start(); }
  }, [isRecording]);

  const handleCategorySelect = (id: string) => { setSelectedCategory(id); trackEvent({ type: 'category_select', categoryId: id }); };
  const handleInputTypeChange = (type: 'text' | 'voice') => { setInputType(type); trackEvent({ type: 'input_type', inputType: type }); };

  const buildMessage = () => {
    const cat = categories.find((c) => c.id === selectedCategory);
    return ['🤖 QuickAsk — Local Support', '', `🏷 Category: ${cat?.label ?? '—'}`, '', '💬 Question:', `"${question.trim()}"`].join('\n');
  };

  const canSend = question.trim().length > 0 && selectedCategory !== null;

  const copyToClipboard = async (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta);
      if (ok) return true;
    } catch { /* fall through */ }
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  };

  const handleSend = async () => {
    if (!canSend) return;
    const message = buildMessage();
    const copied = await copyToClipboard(message);
    trackEvent({ type: 'conversion' });
    setCopiedMessage(message); setCopySucceeded(copied); setShowSuccessModal(true);
  };

  if (adminMode) {
    return (
      <>
        <AdminDashboard initialCategories={categories} onExit={() => setAdminMode(false)} />
        <AdminLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setAdminMode(true)} />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="relative mb-8 text-center">
          <button type="button" onClick={handleSecretTap} className="absolute right-0 top-0 rounded-full p-2 text-slate-600 hover:bg-white/5 hover:text-slate-400" aria-label="Admin">
            <Lock className="h-4 w-4" />
          </button>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink-400">Tokyo Local Help</p>
          <h1 className="cursor-default select-none text-3xl font-black tracking-tight" onClick={handleSecretTap}>
            Quick<span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Ask</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Ask anything — we&apos;ll help you out</p>
        </header>

        <section className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">What do you need?</h2>
          <div className="grid grid-cols-2 gap-3">
            {visibleCategories.map((cat) => {
              const sel = selectedCategory === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => handleCategorySelect(cat.id)}
                  className={`relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-5 transition-all active:scale-[0.97] ${sel ? 'border-white/30 bg-white/10 shadow-lg shadow-pink-500/10' : 'border-white/10 bg-[#111827] hover:border-white/20'}`}>
                  {sel && <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.accent} opacity-10`} />}
                  <div className={`relative rounded-xl bg-gradient-to-br ${cat.accent} p-2.5 text-white shadow-md`}>{getCategoryIcon(cat.icon)}</div>
                  <span className="relative text-sm font-semibold text-slate-200">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5 flex flex-1 flex-col">
          <div className="mb-3 flex rounded-xl bg-white/5 p-1">
            <button type="button" onClick={() => handleInputTypeChange('text')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${inputType === 'text' ? 'bg-white text-slate-900' : 'text-slate-400'}`}><Keyboard className="h-4 w-4" /> Text</button>
            <button type="button" onClick={() => handleInputTypeChange('voice')} className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${inputType === 'voice' ? 'bg-white text-slate-900' : 'text-slate-400'}`}><Mic className="h-4 w-4" /> Voice</button>
          </div>
          <div className="flex min-h-[160px] flex-col rounded-2xl border border-white/10 bg-[#111827] p-4">
            {inputType === 'text' ? (
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question in English…" className="flex-1 resize-none bg-transparent text-base text-white outline-none placeholder:text-slate-500" />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
                <button type="button" onClick={toggleRecording} className={`relative rounded-full p-7 ${isRecording ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-pink-500 to-orange-500 text-white'}`}>
                  {isRecording && <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />}
                  <Mic className="relative h-8 w-8" />
                </button>
                <p className="text-xs text-slate-400">{isRecording ? 'Listening… tap to stop' : 'Tap to speak your question'}</p>
                {question && <p className="w-full border-t border-white/10 pt-3 text-center text-sm italic text-slate-300">&ldquo;{question}&rdquo;</p>}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-auto space-y-3 pt-2">
          <p className="text-center text-[11px] text-slate-500">
            Follow us for tips —{' '}
            <a href={INSTAGRAM_PROFILE_WEB} onClick={(e) => { e.preventDefault(); openInstagramProfile(); }} className="font-semibold text-pink-400 underline hover:text-pink-300">@{INSTAGRAM_USERNAME}</a>
          </p>
          <button type="button" onClick={handleSend} disabled={!canSend} className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-4 ${canSend ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl' : 'cursor-not-allowed bg-white/10 text-slate-500'}`}>
            <span className="flex items-center gap-2.5 text-base font-bold"><Copy className="h-5 w-5" /> Send via Instagram DM</span>
            {canSend && <span className="text-[11px] font-normal text-white/80">Copies your message, then opens Instagram</span>}
          </button>
          <p className="text-center text-[10px] text-slate-600">No login required · © 2026 QuickAsk</p>
        </footer>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-2.5 ${copySucceeded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {copySucceeded ? <ClipboardCheck className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{copySucceeded ? 'Message copied!' : 'Copy your message'}</h2>
                  <p className="text-sm text-slate-400">{copySucceeded ? 'Ready to paste in Instagram' : 'Auto-copy failed — copy below'}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setShowSuccessModal(false); setCopiedMessage(''); setCopySucceeded(false); }} className="rounded-full p-1.5 text-slate-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <pre className="mb-5 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0b0f19] p-3 text-sm text-slate-200">{copiedMessage}</pre>
            {!copySucceeded && (
              <button type="button" onClick={async () => setCopySucceeded(await copyToClipboard(copiedMessage))} className="mb-4 w-full rounded-xl border border-white/20 py-3 text-sm">Try copy again</button>
            )}
            <ol className="mb-5 space-y-2 text-sm text-slate-300">
              <li>1. Tap &ldquo;Open Instagram&rdquo; below</li>
              <li>2. <strong className="text-white">Long-press</strong> → <strong className="text-white">Paste</strong> → Send</li>
            </ol>
            <a href={INSTAGRAM_DM_URL} onClick={(e) => { e.preventDefault(); openInstagramDm(); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 py-4 font-bold">
              <ExternalLink className="h-5 w-5" /> Open Instagram
            </a>
          </div>
        </div>
      )}

      <AdminLoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setAdminMode(true)} />
    </main>
  );
}
