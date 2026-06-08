import Dexie from 'dexie';

export const db = new Dexie('SalaryPulseDB');

db.version(1).stores({
  attendance: 'date, createdAt, updatedAt',
  settings: 'key',
  salaryHistory: '++id, effectiveFrom, monthlySalary',
  simulations: '++id, createdAt, label',
  backups: '++id, createdAt, type',
});
