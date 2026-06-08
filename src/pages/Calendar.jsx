import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { useSettings } from '../contexts/SettingsContext.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { isConfiguredWorkingDay, monthDays } from '../utils/date.js';

export default function Calendar() {
  const { settings } = useSettings();
  const { attendance } = useAttendance();
  const byDate = new Map(attendance.map((day) => [day.date, day]));

  return (
    <>
      <PageHeader kicker="Calendar" title={format(new Date(), 'MMMM yyyy')} />
      <Panel>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {monthDays().map((date) => {
            const key = format(date, 'yyyy-MM-dd');
            const record = byDate.get(key);
            const isHoliday = !isConfiguredWorkingDay(date, settings);
            const tone = isHoliday ? 'bg-slate-500/30' : record?.overtimeHours > 0 ? 'bg-ocean' : record?.deficitHours > 0 ? 'bg-amberPulse text-ink' : record ? 'bg-mint text-ink' : 'bg-coral/80';
            return (
              <div key={key} className={`grid aspect-square place-items-center rounded-xl text-sm font-black ${tone}`}>
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
