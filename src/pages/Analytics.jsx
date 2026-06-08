import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { currency, hours, percent } from '../utils/formatters.js';
import { calculateMonth } from '../utils/salaryEngine.js';

export default function Analytics() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const month = calculateMonth(attendance, settings);
  const chartData = attendance.slice(0, 14).reverse().map((day) => ({ date: day.date.slice(5), income: Math.round(day.dailyIncome || 0), hours: Number(day.activeHours || 0).toFixed(2) }));

  return (
    <>
      <PageHeader kicker="Analytics" title="Trends and projections" />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={percent(month.attendancePercent)} />
        <StatCard label="Active hours" value={hours(month.activeHours)} tone="ocean" />
        <StatCard label="Average daily income" value={currency(month.presentDays ? month.totalIncome / month.presentDays : 0, settings)} />
        <StatCard label="Average daily hours" value={hours(month.presentDays ? month.activeHours / month.presentDays : 0)} />
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-xl font-bold">Weekly earnings</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="income" fill="#2ee59d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h2 className="text-xl font-bold">Attendance trend</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#1687ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>
    </>
  );
}
