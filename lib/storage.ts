import { DEFAULT_ANALYTICS, DEFAULT_CATEGORIES, STORAGE_KEYS } from './defaults';
import type { AnalyticsData, CategoryConfig } from './types';

const CATEGORIES_KEY = STORAGE_KEYS.categories;
const ANALYTICS_KEY = STORAGE_KEYS.analytics;

async function getKvClient() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  const { kv } = await import('@vercel/kv');
  return kv;
}

function isValidCategories(data: unknown): data is CategoryConfig[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0]?.id === 'string';
}

/** Read categories from Vercel KV; seed defaults on first access */
export async function getCategories(): Promise<CategoryConfig[]> {
  const kv = await getKvClient();
  if (!kv) {
    return DEFAULT_CATEGORIES;
  }

  const stored = await kv.get<CategoryConfig[]>(CATEGORIES_KEY);
  if (isValidCategories(stored)) {
    return stored;
  }

  await kv.set(CATEGORIES_KEY, DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

/** Persist categories to Vercel KV */
export async function saveCategories(categories: CategoryConfig[]): Promise<void> {
  const kv = await getKvClient();
  if (!kv) {
    throw new Error('Vercel KV is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }
  await kv.set(CATEGORIES_KEY, categories);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const kv = await getKvClient();
  if (!kv) {
    return DEFAULT_ANALYTICS;
  }

  const stored = await kv.get<AnalyticsData>(ANALYTICS_KEY);
  if (stored && typeof stored === 'object') {
    return stored;
  }

  await kv.set(ANALYTICS_KEY, DEFAULT_ANALYTICS);
  return DEFAULT_ANALYTICS;
}

export async function saveAnalytics(analytics: AnalyticsData): Promise<void> {
  const kv = await getKvClient();
  if (!kv) {
    return;
  }
  await kv.set(ANALYTICS_KEY, analytics);
}

export function storageBackend(): 'kv' | 'local' {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN ? 'kv' : 'local';
}
