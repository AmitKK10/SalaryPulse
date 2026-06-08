import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { useAttendance } from '../hooks/useAttendance.js';
import { downloadText, toCsv } from '../utils/exporters.js';

export default function Reports() {
  const { attendance } = useAttendance();

  const exportJson = () => {
    downloadText('salarypulse-attendance.json', JSON.stringify(attendance, null, 2));
    toast.success('JSON exported');
  };

  const exportCsv = () => {
    downloadText('salarypulse-attendance.csv', toCsv(attendance), 'text/csv');
    toast.success('CSV exported');
  };

  return (
    <>
      <PageHeader kicker="Reports" title="Export reports" />
      <Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="rounded-2xl bg-mint px-5 py-4 font-bold text-ink" onClick={exportJson}>Export JSON</button>
          <button className="rounded-2xl bg-ocean px-5 py-4 font-bold text-white" onClick={exportCsv}>Export CSV</button>
        </div>
      </Panel>
    </>
  );
}
