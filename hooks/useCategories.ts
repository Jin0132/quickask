'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CATEGORIES } from '@/lib/defaults';
import type { CategoryConfig } from '@/lib/types';

const LOCAL_KEY = 'quickask:categories';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { categories: CategoryConfig[] };
        setCategories(data.categories);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data.categories));
        }
        return;
      }
    } catch { /* fallback */ }
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(LOCAL_KEY);
    if (cached) {
      try { setCategories(JSON.parse(cached) as CategoryConfig[]); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    fetchCategories().finally(() => setLoading(false));
    const onUpdate = () => fetchCategories();
    window.addEventListener('quickask:categories-updated', onUpdate);
    const interval = setInterval(fetchCategories, 15000);
    return () => {
      window.removeEventListener('quickask:categories-updated', onUpdate);
      clearInterval(interval);
    };
  }, [fetchCategories]);

  return { categories, visibleCategories: categories.filter((c) => c.visible), loading, refetch: fetchCategories };
}

export async function saveCategoriesRemote(categories: CategoryConfig[]): Promise<boolean> {
  const res = await fetch('/api/categories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories }),
  });
  if (res.ok) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(categories));
      window.dispatchEvent(new Event('quickask:categories-updated'));
    }
    return true;
  }
  return false;
}
