export function PageHeader({ kicker, title, children }) {
  return (
    <section className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">{kicker}</p>
      <div className="mt-2 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <h1 className="text-3xl font-black leading-tight md:text-5xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
