import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { LoadingScreen } from './components/LoadingScreen.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const LiveWork = lazy(() => import('./pages/LiveWork.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Bonus = lazy(() => import('./pages/Bonus.jsx'));
const SalaryLoss = lazy(() => import('./pages/SalaryLoss.jsx'));
const Simulator = lazy(() => import('./pages/Simulator.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const Backups = lazy(() => import('./pages/Backups.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/live" element={<LiveWork />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/bonus" element={<Bonus />} />
          <Route path="/loss" element={<SalaryLoss />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/backups" element={<Backups />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
