export default function BookingStats({ stats }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <article
          key={item.label}
          className="grid gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
          style={{ borderTop: `3px solid ${item.accent || '#0f172a'}` }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {item.label}
          </span>
          <strong className="text-[clamp(1.2rem,2.6vw,1.6rem)] font-semibold leading-tight text-slate-900">
            {item.value}
          </strong>
          <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
