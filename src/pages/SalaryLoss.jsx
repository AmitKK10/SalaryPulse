import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { currency } from '../utils/formatters.js';
import { calculateMonth } from '../utils/salaryEngine.js';

export default function SalaryLoss() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const month = calculateMonth(attendance, settings);
  const lostBonus = month.bonusEligible ? 0 : settings.attendanceBonus;
  const data = [
    { name: 'Deficit', value: Math.round(month.salaryLost), fill: '#ff6b6b' },
    { name: 'Lost bonus', value: lostBonus, fill: '#ffb84d' },
  ];

  return (
    <>
      <PageHeader kicker="Loss tracker" title="Salary leakage" />
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Deficit loss" value={currency(month.salaryLost, settings)} tone="coral" />
        <StatCard label="Lost bonus" value={currency(lostBonus, settings)} tone="coral" />
        <StatCard label="Total loss" value={currency(month.salaryLost + lostBonus, settings)} tone="coral" />
      </section>
      <Panel className="mt-4">
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
