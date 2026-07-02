import { createClient, type VercelKV } from '@vercel/kv';
import { DEFAULT_ANALYTICS, DEFAULT_CATEGORIES, STORAGE_KEYS } from './defaults';
import type { AnalyticsData, CategoryConfig } from './types';

const CATEGORIES_KEY = STORAGE_KEYS.categories;
const ANALYTICS_KEY = STORAGE_KEYS.analytics;

/** Resolve KV credentials — supports standard and Upstash-prefixed env var names */
function getKvCredentials(): { url?: string; token?: string } {
  const url =
    process.env.KV_REST_API_URL ??
    process.env.QUICKASK_KV_REST_API_URL ??
    process.env.quickask_KV_REST_API_URL;

  const token =
    process.env.KV_REST_API_TOKEN ??
    process.env.QUICKASK_KV_REST_API_TOKEN ??
    process.env.quickask_KV_REST_API_TOKEN;

  return { url, token };
}

function getKvClient(): VercelKV | null {
  const { url, token } = getKvCredentials();
  if (!url || !token) return null;
  return createClient({ url, token });
}

function isValidCategories(data: unknown): data is CategoryConfig[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0]?.id === 'string';
}

/** Read categories from Vercel KV; seed defaults on first access */
export async function getCategories(): Promise<CategoryConfig[]> {
  const kv = getKvClient();
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
  const kv = getKvClient();
  if (!kv) {
    throw new Error(
      'Vercel KV is not configured. Set KV_REST_API_URL/KV_REST_API_TOKEN or quickask_KV_REST_API_URL/quickask_KV_REST_API_TOKEN.'
    );
  }
  await kv.set(CATEGORIES_KEY, categories);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const kv = getKvClient();
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
  const kv = getKvClient();
  if (!kv) {
    return;
  }
  await kv.set(ANALYTICS_KEY, analytics);
}

export function storageBackend(): 'kv' | 'local' {
  const { url, token } = getKvCredentials();
  return url && token ? 'kv' : 'local';
}
