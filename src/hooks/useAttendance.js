import { useCallback, useEffect, useState } from 'react';
import { listAttendance } from '../services/attendanceService.js';

export function useAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return listAttendance()
      .then(setAttendance)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { attendance, loading, refresh };
}
