import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE } from './types';

const SESSION_VALUE = 'authenticated';

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_SESSION_COOKIE)?.value === SESSION_VALUE;
}
