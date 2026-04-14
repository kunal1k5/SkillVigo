export default function BookingStats({ stats }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <article
          key={item.label}
          className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          style={{ borderTop: `4px solid ${item.accent || '#0f172a'}` }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {item.label}
          </span>
          <strong className="text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight text-slate-900">
            {item.value}
          </strong>
          <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
