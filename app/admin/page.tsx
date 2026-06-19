'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickAskApp } from '@/components/QuickAskApp';
import { AdminLoginModal, isAdminUiSession } from '@/components/AdminLoginModal';

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAdminUiSession());
    setReady(true);
  }, []);

  if (!ready) return null;
  if (authed) return <QuickAskApp startInAdmin />;
  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <AdminLoginModal open onClose={() => router.push('/')} onSuccess={() => setAuthed(true)} />
    </div>
  );
}
