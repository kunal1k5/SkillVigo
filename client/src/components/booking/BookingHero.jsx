import { Link } from 'react-router-dom';

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Schedule pending';
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export default function BookingHero({ nextBooking, activeCount, completionRate }) {
  const nextSessionTitle =
    nextBooking?.skill?.title || nextBooking?.skillTitle || nextBooking?.title || 'Your next premium session';
  const nextSessionInstructor =
    nextBooking?.skill?.instructor?.name ||
    nextBooking?.instructor?.name ||
    nextBooking?.instructorName ||
    'Coach assignment pending';

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '32px',
        padding: 'clamp(24px, 4vw, 38px)',
        background: 'linear-gradient(135deg, #020617 0%, #1d4ed8 48%, #0f766e 100%)',
        color: '#f8fafc',
        boxShadow: '0 28px 60px rgba(15, 23, 42, 0.2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-40% auto auto -10%',
          width: '280px',
          height: '280px',
          borderRadius: '999px',
          background: 'rgba(96, 165, 250, 0.2)',
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 'auto -6% -34% auto',
          width: '280px',
          height: '280px',
          borderRadius: '999px',
          background: 'rgba(45, 212, 191, 0.18)',
          filter: 'blur(10px)',
        }}
      />

      <div className="booking-hero-grid" style={{ position: 'relative', display: 'grid', gap: '24px' }}>
        <div style={{ display: 'grid', gap: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'fit-content',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(248, 250, 252, 0.18)',
              background: 'rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Booking command center
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                lineHeight: 1.04,
                maxWidth: '12ch',
                fontFamily: '"Sora", "Segoe UI", sans-serif',
              }}
            >
              A premium booking flow for every learner.
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: '60ch',
                color: 'rgba(248, 250, 252, 0.82)',
                lineHeight: 1.7,
                fontSize: '1rem',
              }}
            >
              Track confirmations, monitor upcoming sessions and keep every class detail in one sharp,
              responsive workspace built for SkillVigo.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/search"
              style={{
                textDecoration: 'none',
                color: '#0f172a',
                fontWeight: 800,
                background: '#ffffff',
                borderRadius: '999px',
                padding: '12px 18px',
                boxShadow: '0 14px 28px rgba(15, 23, 42, 0.2)',
              }}
            >
              Book a new skill
            </Link>
            <a
              href="#booking-list"
              style={{
                textDecoration: 'none',
                color: '#f8fafc',
                fontWeight: 700,
                borderRadius: '999px',
                padding: '12px 18px',
                border: '1px solid rgba(248, 250, 252, 0.28)',
                background: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              Jump to my sessions
            </a>
          </div>
        </div>

        <aside
          style={{
            display: 'grid',
            gap: '16px',
            borderRadius: '28px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(248, 250, 252, 0.14)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(248, 250, 252, 0.7)',
                fontWeight: 700,
              }}
            >
              Closest live session
            </span>
            <strong style={{ fontSize: '1.4rem', lineHeight: 1.15 }}>{nextSessionTitle}</strong>
            <span style={{ color: 'rgba(248, 250, 252, 0.82)', lineHeight: 1.6 }}>
              {nextSessionInstructor}
            </span>
          </div>

          <div
            style={{
              borderRadius: '22px',
              padding: '18px',
              background: 'rgba(2, 6, 23, 0.22)',
              display: 'grid',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '13px', color: 'rgba(248, 250, 252, 0.72)' }}>Scheduled for</span>
            <strong style={{ fontSize: '1.05rem', lineHeight: 1.45 }}>{formatDate(nextBooking?.scheduledAt)}</strong>
            <span style={{ color: 'rgba(248, 250, 252, 0.72)' }}>
              {nextBooking?.mode || 'Private live session'} | {nextBooking?.location || 'Online room'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                borderRadius: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.09)',
                display: 'grid',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.72)' }}>Live soon</span>
              <strong style={{ fontSize: '1.4rem' }}>{activeCount}</strong>
            </div>
            <div
              style={{
                borderRadius: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.09)',
                display: 'grid',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'rgba(248, 250, 252, 0.72)' }}>Completion rate</span>
              <strong style={{ fontSize: '1.4rem' }}>{completionRate}%</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
