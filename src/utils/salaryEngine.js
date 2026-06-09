import { eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isWithinInterval, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { isConfiguredWorkingDay, workingDaysInMonth } from './date.js';

const MS_PER_HOUR = 1000 * 60 * 60;

export function salaryRates(settings, date = new Date()) {
  const workingDays = workingDaysInMonth(settings, date).length || 1;
  const dailySalary = settings.monthlySalary / workingDays;
  const hourlySalary = dailySalary / settings.requiredDailyHours;
  const minuteSalary = hourlySalary / 60;
  const secondSalary = minuteSalary / 60;

  return { workingDays, dailySalary, hourlySalary, minuteSalary, secondSalary };
}

export function sessionHours(session) {
  if (!session.entry || !session.exit) return 0;
  const [entryHours, entryMinutes] = session.entry.split(':').map(Number);
  const [exitHours, exitMinutes] = session.exit.split(':').map(Number);
  const start = entryHours * 60 + entryMinutes;
  const end = exitHours * 60 + exitMinutes;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / 60;
}

export function calculateDay(day, settings) {
  const activeHours = (day.sessions ?? []).reduce((sum, session) => sum + sessionHours(session), 0);
  const rates = salaryRates(settings, parseISO(day.date));
  const deficitHours = Math.max(settings.requiredDailyHours - activeHours, 0);
  const overtimeHours = Math.max(activeHours - settings.requiredDailyHours, 0);
  const earnedBase = Math.min(activeHours, settings.requiredDailyHours) * rates.hourlySalary;
  const overtimeIncome = overtimeHours * settings.overtimeRate;

  return {
    activeHours,
    deficitHours,
    overtimeHours,
    dailyIncome: earnedBase + overtimeIncome,
    overtimeIncome,
    salaryLoss: deficitHours * rates.hourlySalary,
  };
}

export function calculateMonth(attendance, settings, date = new Date()) {
  const range = { start: startOfMonth(date), end: endOfMonth(date) };
  const monthAttendance = attendance.filter((day) => isWithinInterval(parseISO(day.date), range));
  const requiredDays = workingDaysInMonth(settings, date);
  const requiredKeys = requiredDays.map((day) => format(day, 'yyyy-MM-dd'));
  const presentKeys = new Set(monthAttendance.filter((day) => day.activeHours > 0).map((day) => day.date));
  const absentDays = requiredKeys.filter((key) => !presentKeys.has(key)).length;
  const bonusEligible = absentDays === 0;
  const totalIncome = monthAttendance.reduce((sum, day) => sum + (day.dailyIncome || 0), 0);
  const overtimeIncome = monthAttendance.reduce((sum, day) => sum + (day.overtimeIncome || 0), 0);
  const salaryLost = monthAttendance.reduce((sum, day) => sum + (day.salaryLoss || 0), 0);
  const activeHours = monthAttendance.reduce((sum, day) => sum + (day.activeHours || 0), 0);
  const overtimeHours = monthAttendance.reduce((sum, day) => sum + (day.overtimeHours || 0), 0);
  const expectedSalary = totalIncome + (bonusEligible ? settings.attendanceBonus : 0);

  return {
    requiredDays: requiredDays.length,
    presentDays: presentKeys.size,
    absentDays,
    bonusEligible,
    activeHours,
    overtimeHours,
    overtimeIncome,
    totalIncome,
    salaryLost,
    expectedSalary,
    attendancePercent: requiredDays.length ? (presentKeys.size / requiredDays.length) * 100 : 0,
  };
}

function recordHours(record) {
  if (!record) return 0;
  if (Number.isFinite(record.activeHours)) return record.activeHours;
  return (record.sessions ?? []).reduce((sum, session) => sum + sessionHours(session), 0);
}

function periodDays(period, date) {
  if (period === 'week') {
    return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
  }

  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function calculateWorkProgress(attendance, settings, period = 'week', date = new Date()) {
  const range = periodDays(period, date);
  const records = new Map(
    attendance
      .filter((day) => isWithinInterval(parseISO(day.date), range))
      .map((day) => [day.date, day]),
  );
  const requiredDays = eachDayOfInterval(range).filter((day) => isConfiguredWorkingDay(day, settings));
  const requiredKeys = requiredDays.map((day) => format(day, 'yyyy-MM-dd'));
  const requiredKeySet = new Set(requiredKeys);
  const requiredHours = settings.requiredDailyHours;
  const baseTargetHours = requiredDays.length * requiredHours;
  let requiredWorkedHours = 0;
  let unresolvedDeficitHours = 0;

  requiredDays.forEach((day) => {
    const key = format(day, 'yyyy-MM-dd');
    const hours = recordHours(records.get(key));
    requiredWorkedHours += Math.min(hours, requiredHours);

    if (!isAfter(day, date)) {
      unresolvedDeficitHours += Math.max(requiredHours - hours, 0);
    }
  });

  const nonRequiredHours = [...records.values()].reduce((sum, record) => {
    if (requiredKeySet.has(record.date)) return sum;
    return sum + recordHours(record);
  }, 0);
  const deficitFillHours = Math.min(nonRequiredHours, unresolvedDeficitHours);
  const overtimeHours = Math.max(nonRequiredHours - unresolvedDeficitHours, 0)
    + [...records.values()].reduce((sum, record) => {
      if (!requiredKeySet.has(record.date)) return sum;
      return sum + Math.max(recordHours(record) - requiredHours, 0);
    }, 0);
  const adjustedTargetHours = Math.max(baseTargetHours - Math.max(unresolvedDeficitHours - deficitFillHours, 0), 0);
  const workedHours = Math.min(requiredWorkedHours + deficitFillHours, adjustedTargetHours);
  const remainingHours = Math.max(adjustedTargetHours - workedHours, 0);
  const progress = adjustedTargetHours ? (workedHours / adjustedTargetHours) * 100 : 100;

  return {
    period,
    baseTargetHours,
    adjustedTargetHours,
    workedHours,
    remainingHours,
    progress,
    overtimeHours,
    unresolvedDeficitHours: Math.max(unresolvedDeficitHours - deficitFillHours, 0),
    deficitFillHours,
    requiredDays: requiredDays.length,
  };
}

export function liveEarnings(startedAt, pausedMs, settings, pausedAt = null) {
  if (!startedAt) return { elapsedMs: 0, activeHours: 0, earnings: 0, remainingHours: settings.requiredDailyHours };
  const currentTime = pausedAt ? new Date(pausedAt).getTime() : Date.now();
  const elapsedMs = Math.max(currentTime - new Date(startedAt).getTime() - pausedMs, 0);
  const activeHours = elapsedMs / MS_PER_HOUR;
  const rates = salaryRates(settings);
  const baseHours = Math.min(activeHours, settings.requiredDailyHours);
  const overtimeHours = Math.max(activeHours - settings.requiredDailyHours, 0);
  return {
    elapsedMs,
    activeHours,
    overtimeHours,
    earnings: baseHours * rates.hourlySalary + overtimeHours * settings.overtimeRate,
    remainingHours: Math.max(settings.requiredDailyHours - activeHours, 0),
  };
}
