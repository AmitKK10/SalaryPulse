import { Pause, Play, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useTicker } from '../hooks/useTicker.js';
import { currency, hours } from '../utils/formatters.js';
import { liveEarnings } from '../utils/salaryEngine.js';

const STORAGE_KEY = 'salarypulse-live-work';
const initialState = { status: 'idle', startedAt: null, pausedAt: null, pausedMs: 0 };

export default function LiveWork() {
  const { settings } = useSettings();
  const [state, setState] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') ?? initialState);
  useTicker(state.status === 'running');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const live = liveEarnings(state.startedAt, state.pausedMs, settings);

  const start = () => setState({ status: 'running', startedAt: new Date().toISOString(), pausedAt: null, pausedMs: 0 });
  const pause = () => setState((current) => ({ ...current, status: 'paused', pausedAt: new Date().toISOString() }));
  const resume = () =>
    setState((current) => ({
      ...current,
      status: 'running',
      pausedMs: current.pausedMs + (Date.now() - new Date(current.pausedAt).getTime()),
      pausedAt: null,
    }));
  const end = () => setState(initialState);

  return (
    <>
      <PageHeader kicker="Live work" title="Real-time earnings" />
      <Panel className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">{state.status}</p>
        <p className="mt-4 text-5xl font-black">{hours(live.activeHours)}</p>
        <p className="mt-2 text-slate-400">Active time today</p>
        <p className="mt-6 text-4xl font-black text-mint">{currency(live.earnings, settings)}</p>
        <div className="mt-6 flex justify-center gap-3">
          {state.status === 'idle' && <Action icon={Play} label="Start" onClick={start} />}
          {state.status === 'running' && <Action icon={Pause} label="Pause" onClick={pause} />}
          {state.status === 'paused' && <Action icon={Play} label="Resume" onClick={resume} />}
          {state.status !== 'idle' && <Action icon={Square} label="End" onClick={end} tone="danger" />}
        </div>
      </Panel>
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Remaining work" value={hours(live.remainingHours)} />
        <StatCard label="Overtime" value={hours(live.overtimeHours)} tone="ocean" />
        <StatCard label="Projected daily income" value={currency(live.earnings, settings)} />
      </section>
    </>
  );
}

function Action({ icon: Icon, label, onClick, tone = 'primary' }) {
  return (
    <button className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${tone === 'danger' ? 'bg-coral text-white' : 'bg-mint text-ink'}`} onClick={onClick}>
      <Icon size={18} /> {label}
    </button>
  );
}
