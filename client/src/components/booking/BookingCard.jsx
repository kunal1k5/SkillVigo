const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    color: '#111827',
    background: '#f5f5f5',
    border: '#d4d4d8',
    progress: '#3f3f46',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#ffffff',
    background: '#111827',
    border: '#111827',
    progress: '#111827',
  },
  completed: {
    label: 'Completed',
    color: '#111827',
    background: '#e5e7eb',
    border: '#d4d4d8',
    progress: '#52525b',
  },
  canceled: {
    label: 'Canceled',
    color: '#7f1d1d',
    background: '#fef2f2',
    border: '#fecaca',
    progress: '#a8a29e',
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
  }).format(new Date(dateValue));
}

function formatTime(dateValue) {
  if (!dateValue) {
    return 'Time TBD';
  }

  return new Intl.DateTimeFormat('en-IN', {
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
    pending: '35%',
    confirmed: '72%',
    completed: '100%',
    canceled: '18%',
  }[status] || '20%';
}

export default function BookingCard({
  booking,
  onCancel,
  onConfirm,
  onSelect,
  isActive = false,
}) {
  if (!booking) {
    return null;
  }

  const status = (booking.status || 'pending').toLowerCase();
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const bookingDate = booking.date || booking.scheduledAt || booking.createdAt;
  const title = booking.skill?.title || booking.skillTitle || booking.title || 'Skill session';
  const instructor =
    booking.skill?.instructor?.name ||
    booking.instructor?.name ||
    booking.instructorName ||
    'Instructor assigned soon';

  const infoCards = [
    {
      label: 'Session date',
      value: formatSchedule(bookingDate),
    },
    {
      label: 'Time and length',
      value: `${formatTime(bookingDate)} | ${booking.duration || '60 min'}`,
    },
    {
      label: 'Coach and format',
      value: `${instructor} | ${booking.mode || 'Live mentoring'}`,
    },
  ];

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
      className={`booking-card-shell${isActive ? ' booking-card-active' : ''}`}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        border: isActive ? '1px solid #111827' : '1px solid #e7e5e4',
        background: '#ffffff',
        boxShadow: isActive
          ? '0 16px 30px rgba(15, 23, 42, 0.1)'
          : '0 8px 22px rgba(15, 23, 42, 0.05)',
        padding: '24px',
        display: 'grid',
        gap: '18px',
        outline: 'none',
        cursor: 'pointer',
      }}
      aria-pressed={isActive}
    >
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: '4px',
          background: statusStyle.progress,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                color: statusStyle.color,
                background: statusStyle.background,
                border: `1px solid ${statusStyle.border}`,
              }}
            >
              {statusStyle.label}
            </span>

            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              {booking.category || 'Curated booking'}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <h3
              style={{
                margin: 0,
                fontSize: 'clamp(1.1rem, 2vw, 1.45rem)',
                lineHeight: 1.2,
                color: '#0f172a',
              }}
            >
              {title}
            </h3>

            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
              {booking.note || 'A carefully structured session designed to move your learning forward.'}
            </p>
          </div>
        </div>

        <div
          style={{
            minWidth: '154px',
            borderRadius: '20px',
            padding: '16px',
            background: '#fafaf9',
            color: '#0f172a',
            border: '1px solid #e7e5e4',
            display: 'grid',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#78716c',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Session fee
          </span>
          <strong style={{ fontSize: '1.3rem', lineHeight: 1.1 }}>
            {formatCurrency(booking.price ?? booking.skill?.price, booking.currency)}
          </strong>
          <span style={{ fontSize: '13px', color: '#57534e' }}>
            {booking.location || 'Online room'}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {infoCards.map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: '18px',
              border: '1px solid #e7e5e4',
              background: '#fafaf9',
              padding: '14px 15px',
              display: 'grid',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                fontWeight: 700,
              }}
            >
              {item.label}
            </span>
            <span style={{ color: '#111827', fontWeight: 700, lineHeight: 1.45 }}>{item.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Booking progress</span>
          <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{statusStyle.label}</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: getProgressWidth(status),
              height: '100%',
              borderRadius: '999px',
              background: statusStyle.progress,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {status === 'pending' && onConfirm ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onConfirm(booking);
            }}
            type="button"
            style={{
              background: '#111827',
              color: '#ffffff',
              border: '1px solid #111827',
              borderRadius: '999px',
              minWidth: '140px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Confirm slot
          </button>
        ) : null}

        {(status === 'pending' || status === 'confirmed') && onCancel ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onCancel(booking);
            }}
            type="button"
            style={{
              color: '#0f172a',
              border: '1px solid #d6d3d1',
              borderRadius: '999px',
              minWidth: '120px',
              background: '#ffffff',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        ) : null}

        <button
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          type="button"
          style={{
            color: '#0f172a',
            border: '1px solid #e7e5e4',
            borderRadius: '999px',
            minWidth: '130px',
            background: '#f5f5f4',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View details
        </button>
      </div>
    </article>
  );
}
