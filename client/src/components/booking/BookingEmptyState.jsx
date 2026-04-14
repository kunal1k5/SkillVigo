export default function BookingEmptyState({ onReset }) {
  return (
    <section className="grid min-h-[180px] content-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[210px] sm:p-5">
      <span className="w-fit rounded-sm border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-700 sm:text-[11px]">
        No matching booking
      </span>
      <h2 className="m-0 text-[clamp(1.05rem,2.5vw,1.5rem)] font-semibold text-slate-900">
        Your filter is sharper than the current list.
      </h2>
      <p className="m-0 max-w-[56ch] text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
        Try a different keyword or reset the filters to bring back your full booking list.
      </p>
      <div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-slate-900 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(15,23,42,0.08)] transition hover:bg-black sm:text-sm"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}
