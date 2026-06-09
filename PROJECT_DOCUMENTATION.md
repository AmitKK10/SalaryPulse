# SalaryPulse Project Documentation

## Project Overview

SalaryPulse is an offline-first salary, attendance, overtime, bonus, and earnings tracker. It is built as a Vite + React single-page app and stores user data locally in the browser using IndexedDB through Dexie.

The app is designed for a worker who wants to:

- Log daily work sessions.
- See salary earned for each day.
- Track monthly expected salary.
- Track weekly and monthly work-hour progress with adjusted targets.
- Track overtime income.
- See salary lost from missing required hours.
- Check attendance bonus eligibility.
- Export attendance reports and full local backups.
- Use the app after deployment as a PWA-style offline-capable web app.

## Tech Stack

- React 18 for UI.
- Vite 6 for development and production build.
- React Router 7 for page routing.
- Tailwind CSS 3 for styling.
- Dexie 4 for IndexedDB persistence.
- date-fns for date calculations.
- Recharts for charts.
- Framer Motion for small UI animations.
- lucide-react for icons.
- react-hot-toast for toast notifications.

## Main Commands

Run these from the `SalaryPulse` project folder:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

- `npm run dev`: starts the local Vite dev server.
- `npm run build`: creates the production build in `dist/`.
- `npm run preview`: serves the built app locally.
- `npm run lint`: runs ESLint.

## High-Level App Flow

1. `src/main.jsx` boots the React app.
2. `BrowserRouter` enables client-side routing.
3. `SettingsProvider` loads and provides salary settings.
4. `App.jsx` defines all app routes.
5. `AppShell` renders the shared header, menu, bottom navigation, and page container.
6. Pages load attendance/settings data through hooks and services.
7. Salary calculations happen in `src/utils/salaryEngine.js`.
8. Data is saved in IndexedDB via `src/db/database.js` and service files.

## Routing

Routes are defined in `src/App.jsx`.

| Route | Page File | Purpose |
| --- | --- | --- |
| `/` | `src/pages/Dashboard.jsx` | Main overview of salary, attendance, overtime, loss, and trends. |
| `/attendance` | `src/pages/Attendance.jsx` | Add, edit, and delete daily attendance sessions. |
| `/live` | `src/pages/LiveWork.jsx` | Real-time work timer and live earnings estimate. |
| `/calendar` | `src/pages/Calendar.jsx` | Current month calendar with attendance status colors. |
| `/analytics` | `src/pages/Analytics.jsx` | Charts and summary analytics. |
| `/bonus` | `src/pages/Bonus.jsx` | Attendance bonus status and progress. |
| `/loss` | `src/pages/SalaryLoss.jsx` | Salary loss and lost bonus visualization. |
| `/simulator` | `src/pages/Simulator.jsx` | Future salary projection based on absence/overtime assumptions. |
| `/reports` | `src/pages/Reports.jsx` | Export attendance as JSON or CSV. |
| `/backups` | `src/pages/Backups.jsx` | Export full backup or reset local data. |
| `/settings` | `src/pages/Settings.jsx` | Configure salary rules, currency, and theme. |
| `/home` | Redirect | Redirects to `/`. |
| `*` | `src/pages/NotFound.jsx` | 404 fallback page. |

All pages are lazy-loaded with React `lazy()` and wrapped in `Suspense` with `LoadingScreen`.

## Navigation

Navigation configuration lives in `src/constants/defaults.js`.

- `NAV_ITEMS`: controls the fixed bottom navigation.
- `MORE_ROUTES`: controls the extra routes shown in the header menu.
- `src/routes/routeMeta.js`: maps icon names to lucide-react icon components.

To add a new main bottom-nav page:

1. Create a page in `src/pages/`.
2. Add a lazy import and route in `src/App.jsx`.
3. Add an item to `NAV_ITEMS`.
4. Add the icon to `iconMap` in `src/routes/routeMeta.js` if needed.

To add a secondary menu page, use `MORE_ROUTES` instead of `NAV_ITEMS`.

## Data Storage

The app stores data locally in IndexedDB. There is no backend API in the current project.

Database setup is in `src/db/database.js`.

Database name:

```js
SalaryPulseDB
```

Tables:

| Table | Key / Indexes | Purpose |
| --- | --- | --- |
| `attendance` | `date, createdAt, updatedAt` | Daily attendance records keyed by date. |
| `settings` | `key` | App settings stored under the `app` key. |
| `salaryHistory` | `++id, effectiveFrom, monthlySalary` | Reserved for salary history. Not currently used by UI. |
| `simulations` | `++id, createdAt, label` | Reserved for saved simulations. Not currently used by UI. |
| `backups` | `++id, createdAt, type` | Backup/export history records. |

## Settings

Default settings live in `src/constants/defaults.js`.

```js
{
  monthlySalary: 15000,
  attendanceBonus: 3000,
  overtimeRate: 75,
  requiredDailyHours: 8,
  currency: 'INR',
  theme: 'dark',
  workingDays: [1, 2, 3, 4, 5, 6],
  holidays: [],
}
```

Important details:

- `workingDays` uses JavaScript weekday numbers.
- Sunday is `0`, Monday is `1`, Saturday is `6`.
- Current default working days are Monday through Saturday.
- `holidays` stores date strings like `2026-06-09`.
- The Settings page currently edits salary, bonus, overtime, required hours, theme, and currency.
- Working days and holidays are supported by the engine but do not yet have a dedicated UI editor.

Settings service:

- `getSettings()`: loads settings and merges them with defaults.
- `saveSettings(settings)`: saves settings under the `app` key.
- `seedSettings()`: creates default settings on first app load.

Settings context:

- `src/contexts/SettingsContext.jsx`
- Provides `settings`, `ready`, and `updateSettings`.
- Applies light theme by toggling the `light` class on `document.documentElement`.

## Attendance Data Shape

Attendance records are saved through `src/services/attendanceService.js`.

A typical record looks like this:

```js
{
  date: '2026-06-09',
  sessions: [
    { entry: '09:00', exit: '13:00' },
    { entry: '14:00', exit: '18:00' }
  ],
  notes: '',
  activeHours: 8,
  deficitHours: 0,
  overtimeHours: 0,
  dailyIncome: 600,
  overtimeIncome: 0,
  salaryLoss: 0,
  createdAt: '2026-06-09T...',
  updatedAt: '2026-06-09T...'
}
```

When saving attendance:

1. The page sends the raw `day` object to `saveAttendance(day, settings)`.
2. `saveAttendance` calls `calculateDay(day, settings)`.
3. The calculated fields are merged into the saved record.
4. The record is saved to `db.attendance` using the date as the primary key.

## Salary Calculation Rules

The calculation engine lives in `src/utils/salaryEngine.js`.

### Salary Rates

`salaryRates(settings, date)` calculates:

- Number of configured working days in the month.
- Daily salary.
- Hourly salary.
- Minute salary.
- Second salary.

Formula:

```text
dailySalary = monthlySalary / workingDaysInMonth
hourlySalary = dailySalary / requiredDailyHours
minuteSalary = hourlySalary / 60
secondSalary = minuteSalary / 60
```

### Session Hours

`sessionHours(session)` calculates hours from one entry/exit pair.

Rules:

- Missing entry or exit gives `0`.
- Invalid time gives `0`.
- Exit time must be after entry time.
- Overnight sessions are not supported right now because exit must be greater than entry on the same day.

### Daily Calculation

`calculateDay(day, settings)` calculates:

- `activeHours`: total hours across all sessions.
- `deficitHours`: required daily hours minus active hours.
- `overtimeHours`: active hours beyond required daily hours.
- `dailyIncome`: base income plus overtime income.
- `overtimeIncome`: overtime hours multiplied by overtime rate.
- `salaryLoss`: deficit hours multiplied by hourly salary.

Formula:

```text
earnedBase = min(activeHours, requiredDailyHours) * hourlySalary
overtimeIncome = overtimeHours * overtimeRate
dailyIncome = earnedBase + overtimeIncome
salaryLoss = deficitHours * hourlySalary
```

### Monthly Calculation

`calculateMonth(attendance, settings, date)` calculates current month summary:

- Required working days.
- Present days.
- Absent days.
- Bonus eligibility.
- Active hours.
- Overtime hours.
- Overtime income.
- Total income.
- Salary lost.
- Expected salary.
- Attendance percentage.

Bonus eligibility:

```text
bonusEligible = absentDays === 0
```

Expected salary:

```text
expectedSalary = totalIncome + attendanceBonus when bonusEligible
expectedSalary = totalIncome when not bonusEligible
```

### Weekly and Monthly Work Progress

`calculateWorkProgress(attendance, settings, period, date)` powers the Dashboard progress system.

Supported periods:

- `week`: Monday through Sunday, with normal working days coming from settings.
- `month`: full calendar month.

It returns base target hours, adjusted target hours, worked hours, remaining hours, progress percentage, overtime hours, unresolved deficit hours, and deficit-fill hours.

Important Sunday/non-working-day rule:

- Missing or partial required days reduce the target.
- Non-working-day hours first fill missing required hours.
- Only non-working-day hours beyond the missing required hours become overtime.

Example:

```text
Normal week target = 48h
Wednesday absent = 8h unresolved deficit
Adjusted target without Sunday work = 40h
Sunday worked 10h
First 8h fills Wednesday
Remaining 2h becomes overtime
Adjusted target returns to 48h
```

### Live Earnings

`liveEarnings(startedAt, pausedMs, settings)` powers the Live Work page.

It calculates active elapsed time, current earnings, overtime, and remaining required hours. The timer state is stored in `localStorage`, not IndexedDB.

LocalStorage key:

```text
salarypulse-live-work
```

## Pages

### `src/pages/Dashboard.jsx`

Main landing screen after opening the app.

Shows:

- Weekly Work Progress card.
- Monthly Work Progress card.
- Animated circular progress rings.
- Animated gradient progress bars.
- Sticky live work widget while a timer is active.
- Weekly earnings.
- Monthly earnings.
- Hours remaining this week.
- Hours remaining this month.
- Weekly overtime.
- Monthly overtime.
- Salary secured so far.
- Projected salary.
- Recent daily income chart.
- Salary engine rates.
- Attendance progress.
- Bonus status.
- Active hours.
- Lifetime earnings from all local attendance records.

Uses:

- `useSettings`
- `useAttendance`
- `useLiveWork`
- `calculateMonth`
- `calculateWorkProgress`
- `liveEarnings`
- `salaryRates`
- Recharts `AreaChart`

### `src/pages/Attendance.jsx`

Attendance entry screen.

Features:

- Select date.
- Add multiple entry/exit sessions.
- Remove sessions.
- Add notes.
- Preview auto calculation before saving.
- Save attendance.
- Load recent entries.
- Delete attendance.

Important behavior:

- If the selected date already exists, it loads the existing record.
- Saving recalculates all derived salary fields.
- Deleting removes the record from IndexedDB.

### `src/pages/LiveWork.jsx`

Real-time work timer.

Features:

- Start, pause, resume, and end timer.
- Shows active time.
- Shows live earnings.
- Shows remaining work time and overtime.

Storage:

- Uses `localStorage`, so it can survive refreshes.
- Does not automatically save a completed timer into attendance.
- Dashboard reads the same live timer state and updates progress/earnings while work is active.

### `src/pages/Calendar.jsx`

Current month visual calendar.

Colors:

- Holiday/non-working day: gray.
- Overtime day: ocean blue.
- Deficit day: amber.
- Completed/present day: mint.
- Missing working day: coral.

Uses:

- `monthDays`
- `isConfiguredWorkingDay`
- Attendance records mapped by date.

### `src/pages/Analytics.jsx`

Analytics dashboard.

Shows:

- Attendance percentage.
- Active hours.
- Average daily income.
- Average daily hours.
- Bar chart for recent earnings.
- Line chart for recent attendance hours.

Uses the latest 14 attendance records.

### `src/pages/Bonus.jsx`

Attendance bonus tracker.

Shows:

- Present days out of required days.
- Bonus status.
- Potential bonus amount.
- Progress bar.
- Remaining required working day records.

### `src/pages/SalaryLoss.jsx`

Salary loss tracker.

Shows:

- Deficit-hour salary loss.
- Lost bonus.
- Total loss.
- Pie chart of deficit loss and lost bonus.

Lost bonus is counted when monthly bonus eligibility is false.

### `src/pages/Simulator.jsx`

Future salary projection screen.

Inputs:

- Future absent days.
- Future overtime hours.
- Future daily working hours.

Outputs:

- Projected salary.
- Projected bonus.
- Projected overtime.
- Final expected earnings.

Current note:

- Simulations are calculated in component state only.
- The `simulations` IndexedDB table exists but this page does not save simulations yet.

### `src/pages/Reports.jsx`

Attendance export screen.

Exports:

- `salarypulse-attendance.json`
- `salarypulse-attendance.csv`

Uses:

- `toCsv`
- `downloadText`

### `src/pages/Backups.jsx`

Local data backup/reset screen.

Features:

- Export full backup JSON.
- Reset local IndexedDB data.

Backup export includes:

- `attendance`
- `settings`
- `salaryHistory`
- `simulations`
- `backups`

Current note:

- `importBackup(payload)` exists in `src/services/backupService.js`.
- There is no import UI yet.

### `src/pages/Settings.jsx`

Salary rules screen.

Editable settings:

- Monthly salary.
- Attendance bonus.
- Overtime rate.
- Required daily hours.
- Theme.
- Currency.

Changes save immediately on field change.

### `src/pages/NotFound.jsx`

404 fallback page with a link back to home.

## Shared Components

### `src/components/AppShell.jsx`

Shared app layout.

Includes:

- Sticky header.
- App logo/name.
- Header menu button.
- Secondary route menu.
- Main content container.
- Bottom navigation.

### `src/components/BottomNav.jsx`

Fixed mobile-style bottom navigation.

Reads:

- `NAV_ITEMS` from `src/constants/defaults.js`.
- `iconMap` from `src/routes/routeMeta.js`.

Uses React Router `NavLink` to style active route.

### `src/components/PageHeader.jsx`

Reusable page title area.

Props:

- `kicker`
- `title`
- `children` for optional actions.

### `src/components/Panel.jsx`

Reusable glass-style content section.

### `src/components/StatCard.jsx`

Reusable metric card with animation and tone color.

Supported tones:

- `mint`
- `ocean`
- `coral`

### `src/components/WorkProgressCard.jsx`

Premium dashboard card for weekly/monthly work progress.

Shows:

- Circular animated progress ring.
- Worked hours.
- Target hours.
- Remaining hours.
- Overtime hours.
- Animated gradient progress bar.
- Live badge when an active work session is running.

### `src/components/Field.jsx`

Reusable form label wrapper.

Exports:

- `Field`
- `inputClass`

### `src/components/ErrorBoundary.jsx`

Catches React render errors and shows a refresh screen.

### `src/components/LoadingScreen.jsx`

Spinner used while lazy-loaded routes are loading.

## Utility Files

### `src/utils/date.js`

Date helpers:

- `todayKey()`: returns today as `yyyy-MM-dd`.
- `monthDays(date)`: returns all days in a month.
- `isConfiguredWorkingDay(date, settings)`: checks working days and holidays.
- `workingDaysInMonth(settings, date)`: returns configured working days for a month.
- `sameDateKey(left, right)`: compares date strings.

### `src/utils/formatters.js`

Display helpers:

- `currency(value, settings)`: formats money with `Intl.NumberFormat`.
- `hours(value)`: formats number as `0.00h`.
- `percent(value)`: rounds and adds `%`.

### `src/utils/exporters.js`

Export helpers:

- `toCsv(rows)`: converts an array of objects to CSV.
- `downloadText(filename, content, type)`: triggers browser download.

### `src/utils/salaryEngine.js`

Core business logic for salary rates, day calculations, month calculations, and live earnings.

This is the most important file to inspect before changing salary rules.

## Services

### `src/services/attendanceService.js`

Attendance data access:

- `listAttendance()`: returns records newest first.
- `getAttendance(date)`: gets one record.
- `saveAttendance(day, settings)`: calculates and saves a day.
- `deleteAttendance(date)`: deletes one record.

### `src/services/settingsService.js`

Settings data access:

- `getSettings()`
- `saveSettings(settings)`
- `seedSettings()`

### `src/services/backupService.js`

Backup and reset logic:

- `exportBackup()`: creates full backup payload and logs export.
- `importBackup(payload)`: validates and imports backup data.
- `resetData()`: clears local app tables.

## Styling

Global styles live in `src/styles.css`.

Tailwind config lives in `tailwind.config.js`.

Custom colors:

- `ink`: dark app background.
- `mint`: primary success/accent.
- `ocean`: blue accent.
- `coral`: danger/loss accent.
- `amberPulse`: warning/deficit accent.

Theme behavior:

- Dark theme is the default.
- Light theme is applied by adding the `light` class to the root HTML element.
- Tailwind is configured with `darkMode: 'class'`, but the app mostly uses custom `.light` selectors and Tailwind `light:` class names.

## PWA and Offline Behavior

PWA files:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon-192.svg`
- `public/icons/icon-512.svg`

Service worker behavior:

- Registered only in production from `src/main.jsx`.
- Cache name is `salarypulse-v1`.
- Pre-caches app shell files.
- Caches fetched GET requests.
- Falls back to `/index.html` when offline.

Important deployment note:

- Because the service worker is manually cached, if static assets or shell behavior changes and users do not see updates, bump `CACHE_NAME` in `public/sw.js`.

## Build Output

Production build output goes to:

```text
dist/
```

The `dist/` folder is generated by Vite and should be treated as build output.

## Current Limitations and Future Ideas

Known current limitations:

- No backend or cloud sync.
- All data is stored only in the user's browser.
- Backup import function exists but no UI is built for it.
- `salaryHistory` table exists but is not used by UI.
- `simulations` table exists but simulator results are not saved.
- Working days and holidays are supported in settings data but do not have a full UI editor.
- Live Work timer does not save completed sessions into attendance automatically.
- Overnight work sessions are not supported by `sessionHours`.
- Reset data has no confirmation dialog.

Good future improvements:

- Add backup import UI.
- Add confirmation before reset.
- Add working days and holidays editor.
- Save completed Live Work timer into Attendance.
- Support overnight shifts.
- Add salary history and effective date handling.
- Add tests for `salaryEngine.js`, especially attendance bonus, deficit hours, overtime, and working-day logic.
- Add route-level empty states for first-time users with no attendance data.

## Common Change Guide

### Change Salary Formula

Start with:

```text
src/utils/salaryEngine.js
```

Then check affected pages:

```text
src/pages/Dashboard.jsx
src/pages/Attendance.jsx
src/pages/Analytics.jsx
src/pages/Bonus.jsx
src/pages/SalaryLoss.jsx
src/pages/Simulator.jsx
src/pages/LiveWork.jsx
```

### Change Default Salary or Bonus

Edit:

```text
src/constants/defaults.js
```

Existing users already have settings stored in IndexedDB, so changing defaults affects new users or missing fields after settings are merged.

### Add a New Page

Edit:

```text
src/App.jsx
src/constants/defaults.js
src/routes/routeMeta.js
```

Add the page file under:

```text
src/pages/
```

### Add a New Stored Data Type

Edit:

```text
src/db/database.js
```

Dexie schema changes should use a new database version:

```js
db.version(2).stores({
  ...
});
```

Also update backup export/import tables in:

```text
src/services/backupService.js
```

### Change Visual Theme

Edit:

```text
src/styles.css
tailwind.config.js
```

Shared visual wrappers are:

```text
src/components/Panel.jsx
src/components/StatCard.jsx
src/components/AppShell.jsx
src/components/BottomNav.jsx
```

### Change Export Format

Edit:

```text
src/utils/exporters.js
src/pages/Reports.jsx
src/services/backupService.js
```

## File Responsibility Map

```text
src/main.jsx                       React entrypoint, providers, service worker registration.
src/App.jsx                        Route definitions and lazy-loaded pages.
src/styles.css                     Global styles, glass effect, light theme, toast style.
src/constants/defaults.js          Default settings, bottom nav items, more menu routes.
src/db/database.js                 Dexie IndexedDB database and table schema.
src/contexts/SettingsContext.jsx   Loads, stores, updates, and provides app settings.
src/hooks/useAttendance.js         Loads attendance list and exposes refresh.
src/hooks/useTicker.js             Simple interval tick hook for live timer updates.
src/routes/routeMeta.js            Icon registry for route/navigation config.
src/services/attendanceService.js  Attendance CRUD plus save-time salary calculation.
src/services/settingsService.js    Settings load/save/seed functions.
src/services/backupService.js      Full backup export/import and data reset.
src/utils/salaryEngine.js          Core salary, attendance, monthly, and live earning math.
src/utils/date.js                  Month and working-day date helpers.
src/utils/formatters.js            Currency, hours, and percent display helpers.
src/utils/exporters.js             CSV conversion and browser download helper.
```

## Maintenance Notes for Future AI or Human Developers

- Treat `salaryEngine.js` as the business-rule source of truth.
- Do not duplicate salary formulas inside pages.
- Keep IndexedDB schema changes versioned.
- Update backup table list when adding persistent tables.
- Existing user settings are stored in IndexedDB, so changed defaults may not appear for existing users unless migration/update logic is added.
- The app is browser-only and offline-first; avoid adding server assumptions unless the architecture intentionally changes.
- After changing routes or static assets, test both dev mode and production build/preview.
- After changing service worker cache behavior, test update behavior carefully because users may keep old cached files.
