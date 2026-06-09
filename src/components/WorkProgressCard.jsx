import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { hoursMinutes, precisePercent } from '../utils/formatters.js';

const CIRCLE_SIZE = 168;
const STROKE = 14;
const RADIUS = (CIRCLE_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WorkProgressCard({ title, progress, live = false, tone = 'mint' }) {
  const progressValue = Math.min(Math.max(progress.progress || 0, 0), 100);
  const strokeColor = tone === 'ocean' ? '#1687ff' : '#2ee59d';
  const motionProgress = useMotionValue(progressValue);
  const smoothProgress = useSpring(motionProgress, { stiffness: 70, damping: 18, mass: 0.7 });
  const dashOffset = useTransform(smoothProgress, (value) => CIRCUMFERENCE - (CIRCUMFERENCE * value) / 100);

  useEffect(() => {
    motionProgress.set(progressValue);
  }, [motionProgress, progressValue]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="glass overflow-hidden rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 light:text-slate-500">{title}</p>
          <h2 className="mt-2 text-2xl font-black">{precisePercent(progress.progress)}</h2>
        </div>
        {live && (
          <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-black text-mint ring-1 ring-mint/30">
            Live
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto h-[168px] w-[168px]">
          <svg viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} className="-rotate-90">
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(148,163,184,.22)"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={strokeColor}
              strokeLinecap="round"
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 14px ${strokeColor}66)` }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-3xl font-black">{precisePercent(progress.progress)}</p>
              <p className="text-xs font-semibold text-slate-400 light:text-slate-500">complete</p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Worked" value={hoursMinutes(progress.workedHours)} />
            <Metric label="Target" value={hoursMinutes(progress.adjustedTargetHours)} />
            <Metric label="Remaining" value={hoursMinutes(progress.remainingHours)} />
            <Metric label="Overtime" value={hoursMinutes(progress.overtimeHours)} />
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/10 light:bg-slate-200">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: tone === 'ocean'
                  ? 'linear-gradient(90deg,#1687ff,#2ee59d)'
                  : 'linear-gradient(90deg,#2ee59d,#ffb84d)',
                boxShadow: `0 0 24px ${strokeColor}66`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressValue, 100)}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 light:bg-slate-100">
      <p className="text-xs font-semibold text-slate-400 light:text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
