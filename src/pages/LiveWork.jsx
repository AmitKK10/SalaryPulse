import { Pause, Play, Square } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { WorkProgressCard } from '../components/WorkProgressCard.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useLiveWork } from '../hooks/useLiveWork.js';
import { useTicker } from '../hooks/useTicker.js';
import { currency, hours, hoursMinutes, percent } from '../utils/formatters.js';
import { liveEarnings } from '../utils/salaryEngine.js';

export default function LiveWork() {
  const { settings } = useSettings();

  const {
    state,
    start,
    pause,
    resume,
    end,
  } = useLiveWork();

  useTicker(state.status === 'running');

  const live = liveEarnings(
    state.startedAt,
    state.pausedMs,
    settings,
    state.pausedAt,
  );

  const progress = {
    progress: settings.requiredDailyHours
      ? (live.activeHours /
          settings.requiredDailyHours) *
        100
      : 100,

    workedHours: live.activeHours,

    adjustedTargetHours:
      settings.requiredDailyHours,

    remainingHours:
      live.remainingHours,

    overtimeHours:
      live.overtimeHours,
  };

  const handleStart = () => {
    const currentTime =
      new Date().toLocaleTimeString(
        'en-GB',
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      );

    const entryTime = prompt(
      'Enter Office Entry Time (HH:MM)',
      currentTime,
    );

    if (!entryTime) return;

    start(entryTime);
  };

  return (
    <>
      <PageHeader
        kicker="Live work"
        title="Real-time earnings"
      />

      <Panel>
        <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint">
              {state.status}
            </p>

            <h2 className="mt-3 text-4xl font-black">
              {hoursMinutes(
                live.activeHours,
              )}
            </h2>

            <p className="mt-2 text-slate-400 light:text-slate-500">
              Active time today
            </p>

            {state.officeEntryTime && (
              <p className="mt-2 text-sm text-mint">
                Started From:{' '}
                {
                  state.officeEntryTime
                }
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-sm text-slate-400 light:text-slate-500">
              Live salary
            </p>

            <p className="mt-2 text-4xl font-black text-mint">
              {currency(
                live.earnings,
                settings,
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
          {state.status ===
            'idle' && (
            <Action
              icon={Play}
              label="Start"
              onClick={
                handleStart
              }
            />
          )}

          {state.status ===
            'running' && (
            <Action
              icon={Pause}
              label="Pause"
              onClick={pause}
            />
          )}

          {state.status ===
            'paused' && (
            <Action
              icon={Play}
              label="Resume"
              onClick={resume}
            />
          )}

          {state.status !==
            'idle' && (
            <Action
              icon={Square}
              label="End"
              onClick={end}
              tone="danger"
            />
          )}
        </div>
      </Panel>

      <section className="mt-4">
        <WorkProgressCard
          title="Today Work Progress"
          progress={progress}
          live={
            state.status ===
            'running'
          }
        />
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Remaining work"
          value={hours(
            live.remainingHours,
          )}
        />

        <StatCard
          label="Overtime"
          value={hours(
            live.overtimeHours,
          )}
          tone="ocean"
        />

        <StatCard
          label="Daily target progress"
          value={percent(
            progress.progress,
          )}
          helper={currency(
            live.earnings,
            settings,
          )}
        />
      </section>
    </>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
  tone = 'primary',
}) {
  return (
    <button
      className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${
        tone === 'danger'
          ? 'bg-coral text-white'
          : 'bg-mint text-ink'
      }`}
      onClick={onClick}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}