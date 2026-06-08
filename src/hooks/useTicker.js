import { useEffect, useState } from 'react';

export function useTicker(enabled = true, interval = 1000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => setTick((value) => value + 1), interval);
    return () => window.clearInterval(id);
  }, [enabled, interval]);

  return tick;
}
