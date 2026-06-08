export const DEFAULT_SETTINGS = {
  monthlySalary: 15000,
  attendanceBonus: 3000,
  overtimeRate: 75,
  requiredDailyHours: 8,
  currency: 'INR',
  theme: 'dark',
  workingDays: [1, 2, 3, 4, 5, 6],
  holidays: [],
};

export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'LayoutDashboard' },
  { path: '/attendance', label: 'Attend', icon: 'Clock3' },
  { path: '/live', label: 'Live', icon: 'Timer' },
  { path: '/analytics', label: 'Stats', icon: 'BarChart3' },
  { path: '/settings', label: 'Setup', icon: 'Settings' },
];

export const MORE_ROUTES = [
  { path: '/calendar', label: 'Calendar' },
  { path: '/bonus', label: 'Bonus Tracker' },
  { path: '/loss', label: 'Salary Loss' },
  { path: '/simulator', label: 'Simulator' },
  { path: '/reports', label: 'Reports' },
  { path: '/backups', label: 'Backups' },
];
