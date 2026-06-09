import { useCallback, useEffect, useState } from 'react';

export const LIVE_WORK_STORAGE_KEY = 'salarypulse-live-work';

export const LIVE_WORK_INITIAL_STATE = {
  status: 'idle',

  startedAt: null,
  pausedAt: null,

  pausedMs: 0,

  officeEntryTime: null,

  officeClockOffset: 0,
};

function readLiveWorkState() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(LIVE_WORK_STORAGE_KEY) || 'null',
    );

    return saved
      ? {
          ...LIVE_WORK_INITIAL_STATE,
          ...saved,
        }
      : LIVE_WORK_INITIAL_STATE;
  } catch {
    return LIVE_WORK_INITIAL_STATE;
  }
}

function buildStartDate(timeString) {
  const now = new Date();

  // FIXED: prevents split errors
  if (
    !timeString ||
    typeof timeString !== 'string'
  ) {
    return now.toISOString();
  }

  const parts = timeString.split(':');

  if (parts.length !== 2) {
    return now.toISOString();
  }

  const [hours, minutes] =
    parts.map(Number);

  const start = new Date();

  start.setHours(hours || 0);
  start.setMinutes(minutes || 0);
  start.setSeconds(0);
  start.setMilliseconds(0);

  return start.toISOString();
}

export function useLiveWork() {
  const [state, setState] =
    useState(readLiveWorkState);

  useEffect(() => {
    localStorage.setItem(
      LIVE_WORK_STORAGE_KEY,
      JSON.stringify(state),
    );
  }, [state]);

  const start = useCallback(
    (entryTime = null) => {
      const startedAt =
        buildStartDate(entryTime);

      setState({
        status: 'running',

        startedAt,

        pausedAt: null,

        pausedMs: 0,

        officeEntryTime:
          typeof entryTime === 'string'
            ? entryTime
            : null,

        officeClockOffset: 0,
      });
    },
    [],
  );

  const pause = useCallback(() => {
    setState((current) => {
      if (
        current.status !== 'running'
      ) {
        return current;
      }

      return {
        ...current,

        status: 'paused',

        pausedAt:
          new Date().toISOString(),
      };
    });
  }, []);

  const resume = useCallback(() => {
    setState((current) => {
      if (
        current.status !== 'paused' ||
        !current.pausedAt
      ) {
        return current;
      }

      return {
        ...current,

        status: 'running',

        pausedMs:
          current.pausedMs +
          (Date.now() -
            new Date(
              current.pausedAt,
            ).getTime()),

        pausedAt: null,
      };
    });
  }, []);

  const editStartTime =
    useCallback((newTime) => {
      if (
        !newTime ||
        typeof newTime !== 'string'
      ) {
        return;
      }

      setState((current) => ({
        ...current,

        startedAt:
          buildStartDate(newTime),

        officeEntryTime:
          newTime,
      }));
    }, []);

  const setOfficeOffset =
    useCallback((minutes) => {
      setState((current) => ({
        ...current,

        officeClockOffset:
          Number(minutes) || 0,
      }));
    }, []);

  const end = useCallback(() => {
    setState(
      LIVE_WORK_INITIAL_STATE,
    );
  }, []);

  return {
    state,

    start,

    pause,

    resume,

    end,

    editStartTime,

    setOfficeOffset,
  };
}