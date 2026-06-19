import type { TrackEvent } from './types';

export async function trackEvent(event: TrackEvent): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // Non-blocking analytics
  }
}
