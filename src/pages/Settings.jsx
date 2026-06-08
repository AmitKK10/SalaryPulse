import toast from 'react-hot-toast';
import { Field, inputClass } from '../components/Field.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  const save = async (patch) => {
    await updateSettings(patch);
    toast.success('Settings saved');
  };

  return (
    <>
      <PageHeader kicker="Settings" title="Salary rules" />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Monthly salary" value={settings.monthlySalary} onChange={(monthlySalary) => save({ monthlySalary })} />
          <NumberField label="Attendance bonus" value={settings.attendanceBonus} onChange={(attendanceBonus) => save({ attendanceBonus })} />
          <NumberField label="Overtime rate" value={settings.overtimeRate} onChange={(overtimeRate) => save({ overtimeRate })} />
          <NumberField label="Required daily hours" value={settings.requiredDailyHours} onChange={(requiredDailyHours) => save({ requiredDailyHours })} />
          <Field label="Theme">
            <select className={inputClass} value={settings.theme} onChange={(event) => save({ theme: event.target.value })}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Field>
          <Field label="Currency">
            <select className={inputClass} value={settings.currency} onChange={(event) => save({ currency: event.target.value })}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </Field>
        </div>
      </Panel>
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
