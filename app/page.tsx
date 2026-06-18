'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Utensils,
  Camera,
  MapPin,
  Cigarette,
  Mic,
  Keyboard,
  Copy,
  ClipboardCheck,
  ExternalLink,
  X,
} from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const INSTAGRAM_USERNAME = 'icl_tokyo';
const INSTAGRAM_DM_WEB = `https://ig.me/m/${INSTAGRAM_USERNAME}`;
const INSTAGRAM_DM_APP = `instagram://direct?username=${INSTAGRAM_USERNAME}`;

type CategoryId = 'food' | 'photo' | 'lost' | 'smoking';

type Category = {
  id: CategoryId;
  label: string;
  icon: React.ReactNode;
  accent: string;
};

const categories: Category[] = [
  {
    id: 'food',
    label: 'Food / Bar',
    icon: <Utensils className="w-7 h-7" />,
    accent: 'from-orange-400 to-rose-500',
  },
  {
    id: 'photo',
    label: 'Photo Spot',
    icon: <Camera className="w-7 h-7" />,
    accent: 'from-violet-400 to-purple-600',
  },
  {
    id: 'lost',
    label: 'Lost / Train',
    icon: <MapPin className="w-7 h-7" />,
    accent: 'from-sky-400 to-blue-600',
  },
  {
    id: 'smoking',
    label: 'Smoking Area',
    icon: <Cigarette className="w-7 h-7" />,
    accent: 'from-emerald-400 to-teal-600',
  },
];

export default function QuickAsk() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [inputType, setInputType] = useState<'voice' | 'text'>('text');
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState('');
  const [copySucceeded, setCopySucceeded] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuestion(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognition.start();
    }
  }, [isRecording]);

  const buildMessage = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    const lines = [
      '🤖 QuickAsk — Local Support',
      '',
      `🏷 Category: ${category?.label ?? '—'}`,
      '',
      `💬 Question:`,
      `"${question.trim()}"`,
    ];

    return lines.join('\n');
  };

  const canSend = question.trim().length > 0 && selectedCategory !== null;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) return true;
    } catch {
      // Fall through
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  };

  const handleSend = async () => {
    if (!canSend) return;

    const message = buildMessage();
    const copied = await copyToClipboard(message);

    setCopiedMessage(message);
    setCopySucceeded(copied);
    setShowSuccessModal(true);
  };

  const openInstagramApp = () => {
    // Opens DM compose screen for @icl_tokyo in the native Instagram app
    window.location.href = INSTAGRAM_DM_APP;
  };

  const openInstagramWeb = () => {
    // Universal link — opens DM to @icl_tokyo (app if installed, else browser)
    window.location.href = INSTAGRAM_DM_WEB;
  };

  const handleCopyAgain = async () => {
    const ok = await copyToClipboard(copiedMessage);
    setCopySucceeded(ok);
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setCopiedMessage('');
    setCopySucceeded(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink-400">
            Tokyo Local Help
          </p>
          <h1 className="text-3xl font-black tracking-tight">
            Quick<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Ask</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Ask anything — we&apos;ll help you out
          </p>
        </header>

        {/* Category Grid */}
        <section className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            What do you need?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-5 transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-white/30 bg-white/10 shadow-lg shadow-pink-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  {isSelected && (
                    <span
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.accent} opacity-10`}
                    />
                  )}
                  <div
                    className={`relative rounded-xl bg-gradient-to-br ${cat.accent} p-2.5 text-white shadow-md`}
                  >
                    {cat.icon}
                  </div>
                  <span className="relative text-sm font-semibold text-slate-200">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Input Section */}
        <section className="mb-5 flex flex-1 flex-col">
          <div className="mb-3 flex rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setInputType('text')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                inputType === 'text'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setInputType('voice')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                inputType === 'voice'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              Voice
            </button>
          </div>

          <div className="flex min-h-[160px] flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
            {inputType === 'text' ? (
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question in English…"
                className="flex-1 resize-none bg-transparent text-base text-white outline-none placeholder:text-slate-500"
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
                <button
                  onClick={toggleRecording}
                  className={`relative rounded-full p-7 transition-all active:scale-95 ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                      : 'bg-gradient-to-br from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/30'
                  }`}
                >
                  {isRecording && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
                  )}
                  <Mic className="relative w-8 h-8" />
                </button>
                <p className="text-xs text-slate-400">
                  {isRecording ? 'Listening… tap to stop' : 'Tap to speak your question'}
                </p>
                {question && (
                  <p className="w-full border-t border-white/10 pt-3 text-center text-sm italic text-slate-300">
                    &ldquo;{question}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Send Button */}
        <footer className="mt-auto space-y-3 pt-2">
          <p className="text-center text-[11px] text-slate-500">
            Follow us for tips —{' '}
            <span className="font-semibold text-pink-400">@{INSTAGRAM_USERNAME}</span>
          </p>

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-4 transition-all active:scale-[0.98] ${
              canSend
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl shadow-pink-500/25 hover:opacity-95'
                : 'cursor-not-allowed bg-white/10 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-2.5 text-base font-bold">
              <Copy className="w-5 h-5" />
              Send via Instagram DM
            </span>
            {canSend && (
              <span className="text-[11px] font-normal text-white/80">
                Copies your message, then opens Instagram
              </span>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-600">
            No login required · &copy; 2026 QuickAsk
          </p>
        </footer>
      </div>

      {/* Success modal — copy confirmation + Instagram steps */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2.5 ${
                    copySucceeded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {copySucceeded ? (
                    <ClipboardCheck className="h-6 w-6" />
                  ) : (
                    <Copy className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {copySucceeded ? 'Message copied!' : 'Copy your message'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {copySucceeded
                      ? 'Ready to paste in Instagram'
                      : 'Auto-copy failed — select & copy below'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Your message
              </p>
              <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-slate-200">
                {copiedMessage}
              </pre>
            </div>

            {!copySucceeded && (
              <button
                onClick={handleCopyAgain}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-white hover:bg-white/5"
              >
                <Copy className="h-4 w-4" />
                Try copy again
              </button>
            )}

            <div className="mb-5 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Next steps
              </p>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-xs font-bold text-pink-400">
                    1
                  </span>
                  <span>
                    Tap &ldquo;Message @{INSTAGRAM_USERNAME}&rdquo; below
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-xs font-bold text-pink-400">
                    2
                  </span>
                  <span>
                    <strong className="text-white">Long-press</strong> the chat box →{' '}
                    <strong className="text-white">Paste</strong> → Send
                  </span>
                </li>
              </ol>
            </div>

            <div className="space-y-2.5">
              <a
                href={INSTAGRAM_DM_APP}
                onClick={(e) => {
                  e.preventDefault();
                  openInstagramApp();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 py-4 text-base font-bold text-white shadow-lg active:scale-[0.98]"
              >
                <ExternalLink className="h-5 w-5" />
                Message @{INSTAGRAM_USERNAME}
              </a>
              <a
                href={INSTAGRAM_DM_WEB}
                onClick={(e) => {
                  e.preventDefault();
                  openInstagramWeb();
                }}
                className="block w-full py-2.5 text-center text-xs text-slate-500 underline hover:text-slate-300"
              >
                App didn&apos;t open? Message @{INSTAGRAM_USERNAME} in browser
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
