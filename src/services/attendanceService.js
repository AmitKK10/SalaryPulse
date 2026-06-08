import { db } from '../db/database.js';
import { calculateDay } from '../utils/salaryEngine.js';

export async function listAttendance() {
  return db.attendance.orderBy('date').reverse().toArray();
}

export async function getAttendance(date) {
  return db.attendance.get(date);
}

export async function saveAttendance(day, settings) {
  const now = new Date().toISOString();
  const calculated = calculateDay(day, settings);
  await db.attendance.put({
    ...day,
    ...calculated,
    updatedAt: now,
    createdAt: day.createdAt ?? now,
  });
}

export async function deleteAttendance(date) {
  await db.attendance.delete(date);
}
