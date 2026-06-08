import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
} from 'date-fns';

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');

export function monthDays(date = new Date()) {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
}

export function isConfiguredWorkingDay(date, settings) {
  const key = format(date, 'yyyy-MM-dd');
  if (settings.holidays?.includes(key)) return false;
  return settings.workingDays.includes(date.getDay());
}

export function workingDaysInMonth(settings, date = new Date()) {
  return monthDays(date).filter((day) => isConfiguredWorkingDay(day, settings));
}

export function sameDateKey(left, right) {
  return isSameDay(parseISO(left), parseISO(right));
}
