const STATUS_STYLES = {
  pending: {
    label: 'Pending approval',
    pill: 'border-slate-300 bg-slate-100 text-slate-800',
    dot: 'bg-slate-500',
  },
  confirmed: {
    label: 'Confirmed',
    pill: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-600',
  },
  completed: {
    label: 'Completed',
    pill: 'border-blue-300 bg-blue-50 text-blue-700',
    dot: 'bg-blue-600',
  },
  canceled: {
    label: 'Canceled',
    pill: 'border-rose-300 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
  },
};

const TIMELINE_STEPS = [
  { key: 'requested', title: 'Request created', description: 'Booking request was captured and saved.' },
  { key: 'confirmed', title: 'Slot confirmed', description: 'Provider approved the timing and format.' },
  { key: 'session', title: 'Session delivery', description: 'Live class or mentoring session runs here.' },
  { key: 'followup', title: 'Wrap-up', description: 'Session notes and follow-up actions are finalized.' },
];

function formatLongDate(dateValue) {
  if (!dateValue) {
    return 'Date and time will appear here';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
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

function getCompletedSteps(status) {
  return {
    pending: 1,
    confirmed: 2,
    completed: 4,
    canceled: 2,
  }[status] || 1;
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

export default function BookingDetailsPanel({
  booking,
  onConfirm,
  onCancel,
  onComplete,
  actionBusyId = '',
  currentUser = null,
}) {
  if (!booking) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Booking details</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
          Select a booking card to review the full session timeline, key details, and actions.
        </p>
      </aside>
    );
  }

  const status = String(booking.status || 'pending').toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const completedSteps = getCompletedSteps(status);
  const title = booking.skill?.title || booking.skillTitle || booking.title || 'Skill session';
  const counterpart = getCounterpartMeta(booking, currentUser);
  const isBusy = String(actionBusyId) === String(booking.id);

  const keyDetails = [
    { label: 'Scheduled', value: formatLongDate(booking.scheduledAt || booking.createdAt) },
    { label: 'Mode', value: booking.mode || 'Session' },
    { label: 'Location', value: booking.location || 'Online room' },
    { label: 'Duration', value: booking.duration || '60 min' },
  ];

  return (
    <aside className="sticky top-20 grid gap-3">
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyle.pill}`}>
            {statusStyle.label}
          </span>
          <strong className="text-base font-semibold text-slate-900 sm:text-lg">
            {formatCurrency(booking.price, booking.currency)}
          </strong>
        </div>

        <div className="grid gap-1.5">
          <h2 className="text-xl font-semibold leading-tight text-slate-900">{title}</h2>
          <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            {booking.note || 'Detailed session notes will be visible here before and after the booking.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {counterpart.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{counterpart.name}</p>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">{booking.category || 'Session'} | {booking.mode || 'Live format'}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {keyDetails.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-900 sm:text-sm sm:leading-6">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {onConfirm ? (
            <button
              type="button"
              onClick={() => onConfirm(booking)}
              disabled={isBusy}
              className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Confirm booking'}
            </button>
          ) : null}

          {onComplete ? (
            <button
              type="button"
              onClick={() => onComplete(booking)}
              disabled={isBusy}
              className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Mark completed'}
            </button>
          ) : null}

          {onCancel ? (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              disabled={isBusy}
              className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
            >
              {isBusy ? 'Updating...' : 'Cancel booking'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Session journey</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            Simple progress trail for this booking lifecycle.
          </p>
        </div>

        <div className="grid gap-2.5">
          {TIMELINE_STEPS.map((step, index) => {
            const isComplete = index < completedSteps;
            const isCurrent = index + 1 === completedSteps && status !== 'completed';

            return (
              <div key={step.key} className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5">
                <div className="relative flex justify-center">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      isComplete ? statusStyle.dot : 'bg-slate-300'
                    } ${isCurrent ? 'ring-4 ring-slate-200' : ''}`}
                  />
                  {index < TIMELINE_STEPS.length - 1 ? (
                    <span className={`absolute top-4 h-full w-[2px] ${isComplete ? 'bg-slate-300' : 'bg-slate-200'}`} />
                  ) : null}
                </div>
                <div className="pb-1.5">
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Session brief</h3>
        {(booking.agenda || []).length ? (
          <div className="grid gap-2">
            {(booking.agenda || []).map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
            No agenda notes have been added for this booking yet.
          </div>
        )}
      </section>
    </aside>
  );
}
