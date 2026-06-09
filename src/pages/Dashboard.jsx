import { motion } from 'framer-motion';
import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { WorkProgressCard } from '../components/WorkProgressCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { useLiveWork } from '../hooks/useLiveWork.js';
import { useTicker } from '../hooks/useTicker.js';
import { currency, hours, hoursMinutes, percent } from '../utils/formatters.js';
import { todayKey } from '../utils/date.js';
import { calculateMonth, calculateWorkProgress, liveEarnings, salaryRates } from '../utils/salaryEngine.js';

export default function Dashboard() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const { state: liveState } = useLiveWork();
  useTicker(liveState.status === 'running', 60000);
  const live = liveEarnings(liveState.startedAt, liveState.pausedMs, settings, liveState.pausedAt);
  const attendanceWithLive = useMemo(() => {
    if (!live.activeHours || liveState.status === 'idle') return attendance;
    const key = todayKey();
    const found = attendance.find((day) => day.date === key);
    const liveRecord = {
      ...(found ?? { date: key, sessions: [] }),
      activeHours: (found?.activeHours || 0) + live.activeHours,
    };

    return found
      ? attendance.map((day) => (day.date === key ? liveRecord : day))
      : [liveRecord, ...attendance];
  }, [attendance, live.activeHours, liveState.status]);
  const month = calculateMonth(attendance, settings);
  const rates = salaryRates(settings);
  const weeklyProgress = calculateWorkProgress(attendanceWithLive, settings, 'week');
  const monthlyProgress = calculateWorkProgress(attendanceWithLive, settings, 'month');
  const weekRange = { start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) };
  const weeklyEarnings = attendance
    .filter((day) => isWithinInterval(parseISO(day.date), weekRange))
    .reduce((sum, day) => sum + (day.dailyIncome || 0), 0) + live.earnings;
  const monthlyEarnings = month.totalIncome + live.earnings;
  const projectedSalary = monthlyEarnings
    + monthlyProgress.remainingHours * rates.hourlySalary
    + (monthlyProgress.unresolvedDeficitHours === 0 ? settings.attendanceBonus : 0);
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

      <section className="grid gap-4 lg:grid-cols-2">
        <WorkProgressCard title="Weekly Work Progress" progress={weeklyProgress} live={liveState.status === 'running'} />
        <WorkProgressCard title="Monthly Work Progress" progress={monthlyProgress} live={liveState.status === 'running'} tone="ocean" />
      </section>

      {liveState.status !== 'idle' && (
        <section className="sticky top-[74px] z-10 mt-4 rounded-2xl border border-mint/25 bg-ink/90 p-4 shadow-glow backdrop-blur-xl light:bg-white/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-mint">{liveState.status}</p>
              <p className="mt-1 text-xl font-black">{hoursMinutes(live.activeHours)} active</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 light:text-slate-500">Live salary</p>
              <p className="text-2xl font-black text-mint">{currency(live.earnings, settings)}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Weekly earnings" value={currency(weeklyEarnings, settings)} helper="Includes active live work" />
        <StatCard label="Monthly earnings" value={currency(monthlyEarnings, settings)} helper="Salary secured this month" tone="ocean" />
        <StatCard label="Hours remaining this week" value={hoursMinutes(weeklyProgress.remainingHours)} helper={`${percent(weeklyProgress.progress)} complete`} />
        <StatCard label="Hours remaining this month" value={hoursMinutes(monthlyProgress.remainingHours)} helper={`${percent(monthlyProgress.progress)} complete`} />
        <StatCard label="Weekly overtime" value={hoursMinutes(weeklyProgress.overtimeHours)} helper="After Sunday deficit fill" tone="ocean" />
        <StatCard label="Monthly overtime" value={hoursMinutes(monthlyProgress.overtimeHours)} helper="Adjusted target logic" tone="ocean" />
        <StatCard label="Salary secured so far" value={currency(monthlyEarnings, settings)} helper={`${month.presentDays}/${month.requiredDays} working days`} />
        <StatCard label="Projected salary" value={currency(projectedSalary, settings)} helper="Remaining hours plus possible bonus" />
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
