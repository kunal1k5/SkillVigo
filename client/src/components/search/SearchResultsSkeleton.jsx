export default function SearchResultsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="animate-pulse space-y-5">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 rounded-full bg-slate-200" />
                <div className="h-7 w-3/4 rounded-full bg-slate-200" />
              </div>
              <div className="h-8 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="h-4 w-full rounded-full bg-slate-200" />
            <div className="h-4 w-5/6 rounded-full bg-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-[22px] bg-slate-200" />
              <div className="h-20 rounded-[22px] bg-slate-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-full bg-slate-200" />
              <div className="h-8 w-28 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
