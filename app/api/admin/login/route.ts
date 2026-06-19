import { NextResponse } from 'next/server';
import { clearAdminSession, isAdminPasswordConfigured, setAdminSession, verifyAdminPassword } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD is not configured on the server' },
      { status: 503 }
    );
  }

  const { password } = (await request.json()) as { password?: string };
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }
  await setAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
