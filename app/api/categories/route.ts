import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { getCategories, saveCategories, storageBackend } from '@/lib/storage';
import type { CategoryConfig } from '@/lib/types';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories, backend: storageBackend() });
  } catch (error) {
    console.error('GET /api/categories failed:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

async function handleSave(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { categories?: CategoryConfig[] };
  if (!body.categories || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    await saveCategories(body.categories);
    return NextResponse.json({ ok: true, categories: body.categories, backend: storageBackend() });
  } catch (error) {
    console.error('Save categories failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to save categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Admin: save categories to Vercel KV */
export async function POST(request: Request) {
  return handleSave(request);
}

/** @deprecated Use POST — kept for backward compatibility */
export async function PUT(request: Request) {
  return handleSave(request);
}
