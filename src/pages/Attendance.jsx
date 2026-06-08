import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Field, inputClass } from '../components/Field.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { deleteAttendance, saveAttendance } from '../services/attendanceService.js';
import { todayKey } from '../utils/date.js';
import { currency, hours } from '../utils/formatters.js';
import { calculateDay } from '../utils/salaryEngine.js';

const blankSession = () => ({ entry: '', exit: '' });

export default function Attendance() {
  const { settings } = useSettings();
  const { attendance, refresh } = useAttendance();
  const [day, setDay] = useState({ date: todayKey(), sessions: [blankSession()], notes: '' });
  const calculated = calculateDay(day, settings);

  useEffect(() => {
    const existing = attendance.find((item) => item.date === day.date);
    if (existing) setDay({ date: existing.date, sessions: existing.sessions?.length ? existing.sessions : [blankSession()], notes: existing.notes ?? '' });
  }, [attendance, day.date]);

  const updateSession = (index, patch) => {
    setDay((current) => ({
      ...current,
      sessions: current.sessions.map((session, i) => (i === index ? { ...session, ...patch } : session)),
    }));
  };

  const onSave = async () => {
    await saveAttendance(day, settings);
    toast.success('Attendance saved');
    refresh();
  };

  const onDelete = async (date) => {
    await deleteAttendance(date);
    toast.success('Attendance deleted');
    setDay({ date: todayKey(), sessions: [blankSession()], notes: '' });
    refresh();
  };

  return (
    <>
      <PageHeader kicker="Attendance" title="Log work sessions" />
      <section className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Panel>
          <div className="grid gap-4">
            <Field label="Date">
              <input className={inputClass} type="date" value={day.date} onChange={(event) => setDay({ ...day, date: event.target.value })} />
            </Field>

            {day.sessions.map((session, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3 light:border-slate-200 light:bg-slate-50">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">Session {index + 1}</p>
                  <button
                    className="rounded-xl p-2 text-coral"
                    aria-label="Remove session"
                    onClick={() => setDay((current) => ({ ...current, sessions: current.sessions.filter((_, i) => i !== index) }))}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Entry time">
                    <input className={inputClass} type="time" value={session.entry} onChange={(event) => updateSession(index, { entry: event.target.value })} />
                  </Field>
                  <Field label="Exit time">
                    <input className={inputClass} type="time" value={session.exit} onChange={(event) => updateSession(index, { exit: event.target.value })} />
                  </Field>
                </div>
              </div>
            ))}

            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-semibold light:border-slate-200" onClick={() => setDay((current) => ({ ...current, sessions: [...current.sessions, blankSession()] }))}>
              <Plus size={18} /> Add session
            </button>

            <Field label="Notes">
              <textarea className={`${inputClass} min-h-24 resize-none`} value={day.notes} onChange={(event) => setDay({ ...day, notes: event.target.value })} />
            </Field>

            <button className="flex items-center justify-center gap-2 rounded-2xl bg-mint px-5 py-4 font-black text-ink" onClick={onSave}>
              <Save size={19} /> Save attendance
            </button>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold">Auto calculation</h2>
          <div className="mt-4 grid gap-3">
            <Metric label="Active hours" value={hours(calculated.activeHours)} />
            <Metric label="Deficit hours" value={hours(calculated.deficitHours)} />
            <Metric label="Overtime hours" value={hours(calculated.overtimeHours)} />
            <Metric label="Daily income" value={currency(calculated.dailyIncome, settings)} />
          </div>
          <h3 className="mt-6 font-bold">Recent entries</h3>
          <div className="mt-3 space-y-2">
            {attendance.slice(0, 8).map((item) => (
              <button key={item.date} className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left light:bg-slate-100" onClick={() => setDay(item)}>
                <span>
                  <span className="block font-semibold">{item.date}</span>
                  <span className="text-xs text-slate-400">{hours(item.activeHours)}</span>
                </span>
                <span className="flex items-center gap-3 font-bold">
                  {currency(item.dailyIncome, settings)}
                  <Trash2 size={16} className="text-coral" onClick={(event) => { event.stopPropagation(); onDelete(item.date); }} />
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 light:bg-slate-100">
      <span className="text-sm text-slate-400">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
