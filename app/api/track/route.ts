import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { getAnalytics, saveAnalytics } from '@/lib/storage';
import type { AnalyticsData, TrackEvent } from '@/lib/types';

function applyEvent(analytics: AnalyticsData, event: TrackEvent): AnalyticsData {
  const next = structuredClone(analytics);
  switch (event.type) {
    case 'category_select':
      next.categoryTaps[event.categoryId] = (next.categoryTaps[event.categoryId] ?? 0) + 1;
      break;
    case 'input_type':
      next.inputTypeSelections[event.inputType] += 1;
      break;
    case 'conversion':
      next.conversions += 1;
      break;
  }
  return next;
}

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ analytics: await getAnalytics() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as TrackEvent;
  if (!body?.type) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }
  const updated = applyEvent(await getAnalytics(), body);
  await saveAnalytics(updated);
  return NextResponse.json({ ok: true });
}
