import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { workingDaysInMonth } from './date.js';

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

export function liveEarnings(startedAt, pausedMs, settings) {
  if (!startedAt) return { elapsedMs: 0, activeHours: 0, earnings: 0, remainingHours: settings.requiredDailyHours };
  const elapsedMs = Math.max(Date.now() - new Date(startedAt).getTime() - pausedMs, 0);
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
