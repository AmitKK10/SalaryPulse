import { useCallback, useEffect, useState } from 'react';

export const LIVE_WORK_STORAGE_KEY = 'salarypulse-live-work';
export const LIVE_WORK_INITIAL_STATE = { status: 'idle', startedAt: null, pausedAt: null, pausedMs: 0 };

function readLiveWorkState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIVE_WORK_STORAGE_KEY) || 'null');
    return saved ? { ...LIVE_WORK_INITIAL_STATE, ...saved } : LIVE_WORK_INITIAL_STATE;
  } catch {
    return LIVE_WORK_INITIAL_STATE;
  }
}

export function useLiveWork() {
  const [state, setState] = useState(readLiveWorkState);

  useEffect(() => {
    localStorage.setItem(LIVE_WORK_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const start = useCallback(() => {
    setState({ status: 'running', startedAt: new Date().toISOString(), pausedAt: null, pausedMs: 0 });
  }, []);

  const pause = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') return current;
      return { ...current, status: 'paused', pausedAt: new Date().toISOString() };
    });
  }, []);

  const resume = useCallback(() => {
    setState((current) => {
      if (current.status !== 'paused' || !current.pausedAt) return current;
      return {
        ...current,
        status: 'running',
        pausedMs: current.pausedMs + (Date.now() - new Date(current.pausedAt).getTime()),
        pausedAt: null,
      };
    });
  }, []);

  const end = useCallback(() => {
    setState(LIVE_WORK_INITIAL_STATE);
  }, []);

  return { state, start, pause, resume, end };
}
