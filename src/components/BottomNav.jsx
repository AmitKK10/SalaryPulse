import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants/defaults.js';
import { iconMap } from '../routes/routeMeta.js';

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl light:bg-white/90">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold ${
                  isActive ? 'bg-mint text-ink' : 'text-slate-400 light:text-slate-500'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
