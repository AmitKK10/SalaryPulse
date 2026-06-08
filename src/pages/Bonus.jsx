import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { currency } from '../utils/formatters.js';
import { calculateMonth } from '../utils/salaryEngine.js';

export default function Bonus() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const month = calculateMonth(attendance, settings);
  const remaining = Math.max(month.requiredDays - month.presentDays, 0);

  return (
    <>
      <PageHeader kicker="Bonus" title="Attendance bonus" />
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Attendance days" value={`${month.presentDays}/${month.requiredDays}`} />
        <StatCard label="Bonus status" value={month.bonusEligible ? 'Eligible' : 'At risk'} tone={month.bonusEligible ? 'mint' : 'coral'} />
        <StatCard label="Potential bonus" value={currency(settings.attendanceBonus, settings)} />
      </section>
      <Panel className="mt-4">
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-mint" style={{ width: `${Math.min((month.presentDays / month.requiredDays) * 100, 100)}%` }} />
        </div>
        <p className="mt-4 text-sm text-slate-400">Need {remaining} more required working day records to complete this month.</p>
      </Panel>
    </>
  );
}
