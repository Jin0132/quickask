'use client';

import { useCallback, useRef } from 'react';

export function useSecretTap(onTrigger: () => void, requiredTaps = 3, resetMs = 900) {
  const countRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    countRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { countRef.current = 0; }, resetMs);
    if (countRef.current >= requiredTaps) {
      countRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
      onTrigger();
    }
  }, [onTrigger, requiredTaps, resetMs]);

  return handleTap;
}
