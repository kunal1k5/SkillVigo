function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-36 rounded-full bg-slate-200" />
          <div className="h-3 w-24 rounded-full bg-slate-200" />
          <div className="h-3 w-full rounded-full bg-slate-200" />
          <div className="h-3 w-5/6 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 h-36 rounded-xl bg-slate-200" />
    </div>
  );
}

export default function FeedSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
