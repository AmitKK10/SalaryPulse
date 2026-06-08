import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function StatCard({ label, value, helper, tone = 'mint' }) {
  const toneClass = tone === 'coral' ? 'text-coral' : tone === 'ocean' ? 'text-ocean' : 'text-mint';

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass min-h-32 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-300 light:text-slate-500">{label}</p>
        <ArrowUpRight className={toneClass} size={18} />
      </div>
      <p className={`mt-4 text-2xl font-black ${toneClass}`}>{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400 light:text-slate-500">{helper}</p>}
    </motion.article>
  );
}
