import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS } from '../constants/defaults.js';
import { getSettings, saveSettings, seedSettings } from '../services/settingsService.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedSettings()
      .then(getSettings)
      .then((value) => {
        setSettings(value);
        document.documentElement.classList.toggle('light', value.theme === 'light');
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      ready,
      updateSettings: async (patch) => {
        const next = await saveSettings({ ...settings, ...patch });
        setSettings(next);
        document.documentElement.classList.toggle('light', next.theme === 'light');
      },
    }),
    [ready, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
}
