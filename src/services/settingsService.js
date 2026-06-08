import { DEFAULT_SETTINGS } from '../constants/defaults.js';
import { db } from '../db/database.js';

const SETTINGS_KEY = 'app';

export async function getSettings() {
  const record = await db.settings.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(record?.value ?? {}) };
}

export async function saveSettings(settings) {
  const value = { ...DEFAULT_SETTINGS, ...settings };
  await db.settings.put({ key: SETTINGS_KEY, value, updatedAt: new Date().toISOString() });
  return value;
}

export async function seedSettings() {
  const existing = await db.settings.get(SETTINGS_KEY);
  if (!existing) {
    await saveSettings(DEFAULT_SETTINGS);
  }
}
