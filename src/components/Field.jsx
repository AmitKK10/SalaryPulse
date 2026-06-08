export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300 light:text-slate-600">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-base outline-none transition focus:border-mint light:border-slate-200 light:bg-white';
