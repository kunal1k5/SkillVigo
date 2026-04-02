import Button from '../common/Button';

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export default function SkillCard({
  skill,
  onBook,
  onSelect,
  isActive = false,
  actionLabel = 'Book Now',
}) {
  if (!skill) {
    return null;
  }

  const title = skill.title || 'Untitled skill';
  const provider = skill.instructor?.name || skill.instructorName || 'Local expert';
  const rating = Number(skill.rating ?? 4.5).toFixed(1);
  const distanceLabel = skill.distanceLabel || (typeof skill.distanceKm === 'number' ? `${skill.distanceKm.toFixed(1)} km away` : 'Nearby');
  const handleSelect = () => onSelect?.(skill);
  const location = skill.area || distanceLabel;

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`group flex flex-col rounded-2xl bg-white p-5 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none ${
        isActive ? 'ring-2 ring-blue-500' : 'border border-slate-100'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Profile Image / Initials */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
          {provider.charAt(0).toUpperCase()}
        </div>
        
        {/* Header Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{title}</h3>
              <p className="text-sm text-slate-500">{provider}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
              ⭐ {rating}
            </div>
          </div>
        </div>
      </div>

      {/* Meta details */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div className="flex flex-col rounded-xl bg-slate-50 p-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</span>
          <span className="font-semibold text-slate-900">{formatCurrency(skill.price, skill.currency)} {skill.priceType === 'hourly' ? '/ hr' : '/ mo'}</span>
        </div>
        <div className="flex flex-col rounded-xl bg-slate-50 p-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</span>
          <span className="font-semibold text-slate-900 line-clamp-1">{location}</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-slate-600 line-clamp-2">
        {skill.description || 'A useful nearby skill offering you can contact and hire through SkillVigo.'}
      </p>

      {/* Actions */}
      <div className="mt-auto pt-5 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          View Profile
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(skill);
          }}
          className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
