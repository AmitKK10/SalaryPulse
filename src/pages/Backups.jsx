import toast from 'react-hot-toast';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';
import { exportBackup, resetData } from '../services/backupService.js';
import { downloadText } from '../utils/exporters.js';

export default function Backups() {
  const exportData = async () => {
    const payload = await exportBackup();
    downloadText(`salarypulse-backup-${payload.createdAt.slice(0, 10)}.json`, JSON.stringify(payload, null, 2));
    toast.success('Backup exported');
  };

  const reset = async () => {
    await resetData();
    toast.success('Local data reset');
  };

  return (
    <>
      <PageHeader kicker="Backups" title="Local data vault" />
      <Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="rounded-2xl bg-mint px-5 py-4 font-bold text-ink" onClick={exportData}>Export backup</button>
          <button className="rounded-2xl bg-coral px-5 py-4 font-bold text-white" onClick={reset}>Reset data</button>
        </div>
      </Panel>
    </>
  );
}
