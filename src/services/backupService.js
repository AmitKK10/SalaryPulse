import { db } from '../db/database.js';

const TABLES = ['attendance', 'settings', 'salaryHistory', 'simulations', 'backups'];

export async function exportBackup() {
  const payload = {
    app: 'SalaryPulse',
    version: 1,
    createdAt: new Date().toISOString(),
    data: {},
  };

  for (const table of TABLES) {
    payload.data[table] = await db[table].toArray();
  }

  await db.backups.add({ createdAt: payload.createdAt, type: 'export', size: JSON.stringify(payload).length });
  return payload;
}

export async function importBackup(payload) {
  if (payload?.app !== 'SalaryPulse' || !payload.data) {
    throw new Error('Invalid SalaryPulse backup');
  }

  await db.transaction('rw', TABLES, async () => {
    for (const table of TABLES) {
      if (Array.isArray(payload.data[table])) {
        await db[table].clear();
        await db[table].bulkPut(payload.data[table]);
      }
    }
  });
}

export async function resetData() {
  await db.transaction('rw', TABLES, async () => {
    await Promise.all(TABLES.map((table) => db[table].clear()));
  });
}
