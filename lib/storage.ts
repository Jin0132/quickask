import { DEFAULT_ANALYTICS, DEFAULT_CATEGORIES, STORAGE_KEYS } from './defaults';
import type { AnalyticsData, CategoryConfig } from './types';

const memory = new Map<string, unknown>();

function hasKvEnv(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!hasKvEnv()) return null;
  const { kv } = await import('@vercel/kv');
  return kv.get<T>(key);
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!hasKvEnv()) return;
  const { kv } = await import('@vercel/kv');
  await kv.set(key, value);
}

async function read<T>(key: string, fallback: T): Promise<T> {
  const fromKv = await kvGet<T>(key);
  if (fromKv !== null) return fromKv;
  if (memory.has(key)) return memory.get(key) as T;
  return fallback;
}

async function write<T>(key: string, value: T): Promise<void> {
  await kvSet(key, value);
  memory.set(key, value);
}

export async function getCategories(): Promise<CategoryConfig[]> {
  return read(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
}

export async function saveCategories(categories: CategoryConfig[]): Promise<void> {
  await write(STORAGE_KEYS.categories, categories);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  return read(STORAGE_KEYS.analytics, DEFAULT_ANALYTICS);
}

export async function saveAnalytics(analytics: AnalyticsData): Promise<void> {
  await write(STORAGE_KEYS.analytics, analytics);
}

export function storageBackend(): 'kv' | 'memory' {
  return hasKvEnv() ? 'kv' : 'memory';
}
