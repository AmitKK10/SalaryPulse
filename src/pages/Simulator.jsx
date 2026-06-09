import { useMemo, useState } from 'react';
import { Field, inputClass } from '../components/Field.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { currency } from '../utils/formatters.js';
import { salaryRates } from '../utils/salaryEngine.js';

export default function Simulator() {
  const { settings } = useSettings();
  const [futureAbsentDays, setFutureAbsentDays] = useState(0);
  const [futureOvertime, setFutureOvertime] = useState(0);
  const [futureWorkingHours, setFutureWorkingHours] = useState(settings.requiredDailyHours);
  const rates = salaryRates(settings);
  const result = useMemo(() => {
    const base = Math.max(rates.workingDays - futureAbsentDays, 0) * Math.min(futureWorkingHours, settings.requiredDailyHours) * rates.hourlySalary;
    const ot = futureOvertime * settings.overtimeRate;
    const bonus = futureAbsentDays === 0 ? settings.attendanceBonus : 0;
    return { base, ot, bonus, final: base + ot + bonus };
  }, [futureAbsentDays, futureOvertime, futureWorkingHours, rates, settings]);

  return (
    <>
      <PageHeader kicker="Simulator" title="Project future salary" />
      <section className="grid gap-4 lg:grid-cols-[.8fr_1fr]">
        <Panel>
          <div className="grid gap-4">
            <NumberField label="Future absent days" value={futureAbsentDays} onChange={setFutureAbsentDays} />
            <NumberField label="Future overtime hours" value={futureOvertime} onChange={setFutureOvertime} />
            <NumberField label="Future daily working hours" value={futureWorkingHours} onChange={setFutureWorkingHours} />
          </div>
        </Panel>
        <section className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Projected salary" value={currency(result.base, settings)} />
          <StatCard label="Projected bonus" value={currency(result.bonus, settings)} />
          <StatCard label="Projected OT" value={currency(result.ot, settings)} tone="ocean" />
          <StatCard label="Final expected earnings" value={currency(result.final, settings)} />
        </section>
      </section>
    </>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input className={inputClass} type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  );
}