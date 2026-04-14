const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    pill: 'border-slate-300 bg-slate-100 text-slate-800',
    progress: 'bg-slate-500',
  },
  confirmed: {
    label: 'Confirmed',
    pill: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    progress: 'bg-emerald-600',
  },
  completed: {
    label: 'Completed',
    pill: 'border-blue-300 bg-blue-50 text-blue-700',
    progress: 'bg-blue-600',
  },
  canceled: {
    label: 'Canceled',
    pill: 'border-rose-300 bg-rose-50 text-rose-700',
    progress: 'bg-rose-500',
  },
};

function formatSchedule(dateValue) {
  if (!dateValue) {
    return 'Date not set';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function getProgressWidth(status) {
  return {
    pending: '30%',
    confirmed: '68%',
    completed: '100%',
    canceled: '18%',
  }[status] || '20%';
}

function isProviderRole(role = '') {
  return role === 'provider' || role === 'admin';
}

function getCounterpartMeta(booking = {}, currentUser = null) {
  if (isProviderRole(currentUser?.role || '')) {
    return {
      label: 'Learner',
      name: booking.student?.name || 'Learner',
    };
  }

  return {
    label: 'Provider',
    name:
      booking.instructor?.name ||
      booking.skill?.instructor?.name ||
      booking.instructorName ||
      'Provider',
  };
}

export default function BookingCard({
  booking,
  onCancel,
  onConfirm,
  onComplete,
  onSelect,
  isActive = false,
  actionBusyId = '',
  currentUser = null,
}) {
  if (!booking) {
    return null;
  }

  const status = String(booking.status || 'pending').toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const bookingDate = booking.scheduledAt || booking.createdAt;
  const title = booking.skill?.title || booking.skillTitle || booking.title || 'Skill session';
  const counterpart = getCounterpartMeta(booking, currentUser);
  const isBusy = String(actionBusyId) === String(booking.id);

  const handleSelect = () => {
    onSelect?.(booking);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
      className={`group relative overflow-hidden rounded-lg border bg-white p-4 text-left transition ${
        isActive
          ? 'border-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.1)]'
          : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-[0_10px_22px_rgba(15,23,42,0.07)]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-100">
        <div className={`h-full ${statusStyle.progress}`} style={{ width: getProgressWidth(status) }} />
      </div>

      <div className="mt-1.5 grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid min-w-0 gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-sm border px-2.5 py-1 text-xs font-semibold ${statusStyle.pill}`}>
                {statusStyle.label}
              </span>
              <span className="rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {booking.category || 'Session'}
              </span>
            </div>
            <h3 className="text-base font-semibold leading-tight text-slate-900 sm:text-lg">{title}</h3>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fee</p>
            <p className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
              {formatCurrency(booking.price ?? booking.skill?.price, booking.currency)}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Schedule</p>
            <p className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm">{formatSchedule(bookingDate)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{counterpart.label}</p>
            <p className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm">{counterpart.name}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Mode</p>
            <p className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm">{booking.mode || 'Session'}</p>
          </div>
        </div>

        <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
          {booking.note || 'Review key session details and keep this booking updated as it progresses.'}
        </p>

        <div className="flex flex-wrap gap-2">
          {onConfirm ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onConfirm(booking);
              }}
              disabled={isBusy}
              className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Confirm'}
            </button>
          ) : null}

          {onComplete ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onComplete(booking);
              }}
              disabled={isBusy}
              className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Mark completed'}
            </button>
          ) : null}

          {onCancel ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCancel(booking);
              }}
              disabled={isBusy}
              className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Cancel'}
            </button>
          ) : null}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            className="rounded-md border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 sm:text-sm"
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
