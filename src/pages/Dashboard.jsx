import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { currency, hours, percent } from '../utils/formatters.js';
import { calculateMonth, salaryRates } from '../utils/salaryEngine.js';

export default function Dashboard() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const month = calculateMonth(attendance, settings);
  const rates = salaryRates(settings);
  const chartData = attendance
    .slice(0, 10)
    .reverse()
    .map((day) => ({ date: day.date.slice(5), income: Math.round(day.dailyIncome || 0) }));

  return (
    <>
      <PageHeader kicker="Today" title="Your salary pulse">
        <Link to="/attendance" className="rounded-2xl bg-mint px-5 py-3 text-sm font-bold text-ink">
          Add attendance
        </Link>
      </PageHeader>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Expected salary" value={currency(month.expectedSalary, settings)} helper="Current month projection" />
        <StatCard label="Salary secured" value={currency(month.totalIncome, settings)} helper={`${month.presentDays}/${month.requiredDays} working days`} tone="ocean" />
        <StatCard label="Overtime earnings" value={currency(month.overtimeIncome, settings)} helper={hours(month.overtimeHours)} />
        <StatCard label="Salary lost" value={currency(month.salaryLost, settings)} helper="Deficit-hour impact" tone="coral" />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 light:text-slate-500">Earnings trend</p>
              <h2 className="mt-1 text-xl font-bold">Recent daily income</h2>
            </div>
            <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{percent(month.attendancePercent)}</p>
          </div>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ee59d" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2ee59d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#2ee59d" fill="url(#incomeGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Salary engine</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Metric label="Working days" value={rates.workingDays} />
            <Metric label="Daily salary" value={currency(rates.dailySalary, settings)} />
            <Metric label="Hourly salary" value={currency(rates.hourlySalary, settings)} />
            <Metric label="Minute salary" value={currency(rates.minuteSalary, settings)} />
            <Metric label="Second salary" value={currency(rates.secondSalary, settings)} />
          </dl>
        </Panel>
      </section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance progress" value={percent(month.attendancePercent)} helper="Required days covered" />
        <StatCard label="Bonus status" value={month.bonusEligible ? 'Eligible' : 'At risk'} helper={currency(settings.attendanceBonus, settings)} tone={month.bonusEligible ? 'mint' : 'coral'} />
        <StatCard label="Active hours" value={hours(month.activeHours)} helper="This month" tone="ocean" />
        <StatCard label="Lifetime earnings" value={currency(attendance.reduce((sum, day) => sum + (day.dailyIncome || 0), 0), settings)} helper="All local records" />
      </motion.section>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 light:bg-slate-100">
      <dt className="text-slate-400 light:text-slate-500">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
