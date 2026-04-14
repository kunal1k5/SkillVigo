const STATUS_STYLES = {
  pending: {
    label: 'Pending approval',
    color: '#111827',
    background: '#f5f5f5',
    border: '#d4d4d8',
    dot: '#3f3f46',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#ffffff',
    background: '#111827',
    border: '#111827',
    dot: '#111827',
  },
  completed: {
    label: 'Completed',
    color: '#111827',
    background: '#e5e7eb',
    border: '#d4d4d8',
    dot: '#52525b',
  },
  canceled: {
    label: 'Canceled',
    color: '#b91c1c',
    background: '#fef2f2',
    border: '#fecaca',
    dot: '#a8a29e',
  },
};

const TIMELINE_STEPS = [
  { key: 'requested', title: 'Request captured', description: 'Your learning request is saved in SkillVigo.' },
  { key: 'confirmed', title: 'Slot aligned', description: 'Coach availability and timing are ready.' },
  { key: 'session', title: 'Session delivery', description: 'The actual live experience happens here.' },
  { key: 'followup', title: 'Follow-up notes', description: 'Resources, actions and feedback stay organized.' },
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

export default function BookingDetailsPanel({ booking, onConfirm, onCancel }) {
  if (!booking) {
    return (
      <aside
        className="booking-detail-panel"
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Booking detail panel</h2>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
          Pick a booking from the list to inspect its agenda, timing and next actions.
        </p>
      </aside>
    );
  }

  const status = (booking.status || 'pending').toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const completedSteps = getCompletedSteps(status);
  const title = booking.skill?.title || booking.skillTitle || booking.title || 'Skill session';
  const instructor =
    booking.skill?.instructor?.name ||
    booking.instructor?.name ||
    booking.instructorName ||
    'Instructor assigned soon';

  const keyDetails = [
    { label: 'Session date', value: formatLongDate(booking.scheduledAt || booking.date || booking.createdAt) },
    { label: 'Mode', value: booking.mode || 'Private live session' },
    { label: 'Location', value: booking.location || 'Online room' },
    { label: 'Duration', value: booking.duration || '60 min' },
  ];

  return (
    <aside
      className="booking-detail-panel"
      style={{
        position: 'sticky',
        top: '24px',
        display: 'grid',
        gap: '18px',
      }}
    >
      <section
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
          display: 'grid',
          gap: '18px',
        }}
      >
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                width: 'fit-content',
                padding: '7px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                color: statusStyle.color,
                background: statusStyle.background,
                border: `1px solid ${statusStyle.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {statusStyle.label}
            </span>
            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
              {formatCurrency(booking.price, booking.currency)}
            </strong>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.35rem, 3vw, 1.9rem)',
                color: '#0f172a',
                lineHeight: 1.15,
              }}
            >
              {title}
            </h2>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
              {booking.note || 'Everything your session needs is kept here for quick review before you go live.'}
            </p>
          </div>
        </div>

        <div
          style={{
            borderRadius: '22px',
            padding: '18px',
            background: '#fafaf9',
            color: '#0f172a',
            border: '1px solid #e7e5e4',
            display: 'grid',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#78716c',
              fontWeight: 700,
            }}
          >
            Mentor overview
          </span>
          <strong style={{ fontSize: '1.15rem' }}>{instructor}</strong>
          <span style={{ color: '#57534e', lineHeight: 1.6 }}>
            {booking.category || 'Coaching track'} | {booking.mode || 'Live learning format'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '12px',
          }}
        >
          {keyDetails.map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: '18px',
                border: '1px solid #e7e5e4',
                padding: '15px',
                background: '#ffffff',
                display: 'grid',
                gap: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                }}
              >
                {item.label}
              </span>
              <strong style={{ color: '#0f172a', lineHeight: 1.5 }}>{item.value}</strong>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {status === 'pending' && onConfirm ? (
            <button
              onClick={() => onConfirm(booking)}
              type="button"
              style={{
                background: '#111827',
                color: '#ffffff',
                border: '1px solid #111827',
                borderRadius: '999px',
                minWidth: '148px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Confirm booking
            </button>
          ) : null}

          {(status === 'pending' || status === 'confirmed') && onCancel ? (
            <button
              onClick={() => onCancel(booking)}
              type="button"
              style={{
                minWidth: '128px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #d6d3d1',
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel slot
            </button>
          ) : null}
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
          display: 'grid',
          gap: '18px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem' }}>Session journey</h3>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            A clean snapshot of where this booking sits right now.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {TIMELINE_STEPS.map((step, index) => {
            const isComplete = index < completedSteps;
            const isCurrent = index + 1 === completedSteps && status !== 'completed';

            return (
              <div key={step.key} style={{ display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr)', gap: '14px' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      marginTop: '3px',
                      borderRadius: '999px',
                      background: isComplete ? statusStyle.dot : '#d6d3d1',
                      boxShadow: isCurrent ? '0 0 0 5px rgba(24, 24, 27, 0.08)' : 'none',
                    }}
                  />
                  {index < TIMELINE_STEPS.length - 1 ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: '20px',
                        width: '2px',
                        bottom: '-18px',
                        background: isComplete ? 'rgba(24, 24, 27, 0.28)' : '#e7e5e4',
                      }}
                    />
                  ) : null}
                </div>
                <div style={{ display: 'grid', gap: '4px', paddingBottom: '10px' }}>
                  <strong style={{ color: '#0f172a' }}>{step.title}</strong>
                  <span style={{ color: '#475569', lineHeight: 1.6 }}>{step.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e7e5e4',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Session brief</h3>
          <p style={{ margin: 0, color: '#57534e', lineHeight: 1.6 }}>
            Quick agenda points to keep you prepared before the call starts.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {(booking.agenda || []).length ? (
            (booking.agenda || []).map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: '18px',
                  padding: '14px 16px',
                  background: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  lineHeight: 1.6,
                }}
              >
                {item}
              </div>
            ))
          ) : (
            <div
              style={{
                borderRadius: '18px',
                padding: '14px 16px',
                background: '#fafaf9',
                border: '1px solid #e7e5e4',
                color: '#57534e',
                lineHeight: 1.6,
              }}
            >
              No agenda notes have been added for this booking yet.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
