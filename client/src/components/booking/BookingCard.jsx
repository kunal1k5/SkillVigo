import Button from '../common/Button';

const STATUS_STYLES = {
  pending: {
    label: 'Pending',
    color: '#b45309',
    background: 'rgba(245, 158, 11, 0.16)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#047857',
    background: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.28)',
  },
  completed: {
    label: 'Completed',
    color: '#1d4ed8',
    background: 'rgba(59, 130, 246, 0.13)',
    border: 'rgba(59, 130, 246, 0.24)',
  },
  canceled: {
    label: 'Canceled',
    color: '#b91c1c',
    background: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.24)',
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
  const title = booking.skill?.title || booking.skillTitle || booking.title || 'Premium skill session';
  const instructor =
    booking.skill?.instructor?.name ||
    booking.instructor?.name ||
    booking.instructorName ||
    'Instructor assigned soon';

  const infoCards = [
    {
      label: 'Session date',
      value: formatSchedule(bookingDate),
      accent: '#0f172a',
    },
    {
      label: 'Time and length',
      value: `${formatTime(bookingDate)} | ${booking.duration || '60 min'}`,
      accent: '#0f766e',
    },
    {
      label: 'Coach and format',
      value: `${instructor} | ${booking.mode || 'Live mentoring'}`,
      accent: '#7c3aed',
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
        border: isActive ? '1px solid rgba(37, 99, 235, 0.35)' : '1px solid rgba(148, 163, 184, 0.24)',
        background:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%)',
        boxShadow: isActive
          ? '0 22px 44px rgba(15, 23, 42, 0.14)'
          : '0 16px 32px rgba(15, 23, 42, 0.08)',
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
          height: '5px',
          background: booking.accent || 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
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
                fontFamily: '"Sora", "Segoe UI", sans-serif',
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
            background: 'rgba(15, 23, 42, 0.94)',
            color: '#f8fafc',
            display: 'grid',
            gap: '6px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(248, 250, 252, 0.72)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Session fee
          </span>
          <strong style={{ fontSize: '1.3rem', lineHeight: 1.1 }}>
            {formatCurrency(booking.price ?? booking.skill?.price, booking.currency)}
          </strong>
          <span style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.72)' }}>
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
              border: '1px solid rgba(148, 163, 184, 0.16)',
              background: 'rgba(255, 255, 255, 0.75)',
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
            <span style={{ color: item.accent, fontWeight: 700, lineHeight: 1.45 }}>{item.value}</span>
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
              background: booking.accent || 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {status === 'pending' && onConfirm ? (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onConfirm(booking);
            }}
            size="sm"
            style={{
              background: booking.accent || 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
              border: 'none',
              minWidth: '140px',
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)',
            }}
          >
            Confirm slot
          </Button>
        ) : null}

        {(status === 'pending' || status === 'confirmed') && onCancel ? (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onCancel(booking);
            }}
            variant="outline"
            size="sm"
            style={{
              minWidth: '120px',
              background: '#ffffff',
            }}
          >
            Cancel
          </Button>
        ) : null}

        <Button
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          variant="secondary"
          size="sm"
          style={{
            minWidth: '130px',
            background: 'rgba(15, 23, 42, 0.08)',
          }}
        >
          View details
        </Button>
      </div>
    </article>
  );
}
