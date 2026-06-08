import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MORE_ROUTES } from '../constants/defaults.js';
import { BottomNav } from './BottomNav.jsx';

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen pb-24 text-slate-50 light:text-slate-950">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/75 px-4 py-3 backdrop-blur-xl light:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint font-black text-ink">SP</span>
            <div>
              <p className="text-base font-bold">SalaryPulse</p>
              <p className="text-xs text-slate-400 light:text-slate-500">Offline earnings command center</p>
            </div>
          </Link>
          <button className="rounded-xl p-3 text-slate-200 light:text-slate-700" onClick={() => setOpen((value) => !value)} aria-label="Open tools">
            <Menu size={22} />
          </button>
        </div>
        {open && (
          <nav className="mx-auto mt-3 grid max-w-6xl grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 light:border-slate-200 light:bg-white">
            {MORE_ROUTES.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-200 light:text-slate-700">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-5 md:py-8">{children}</main>
      <BottomNav />
    </div>
  );
}
