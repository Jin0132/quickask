import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { getCategories, saveCategories, storageBackend } from '@/lib/storage';
import type { CategoryConfig } from '@/lib/types';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories, backend: storageBackend() });
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await request.json()) as { categories?: CategoryConfig[] };
  if (!body.categories || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  await saveCategories(body.categories);
  return NextResponse.json({ ok: true, categories: body.categories });
}
