import { Link } from 'react-router-dom';

function createStat(label, value) {
  return { label, value };
}

export default function ChatContextPanel({ conversation }) {
  if (!conversation) {
    return (
      <aside
        className="chat-context-shell"
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '10px',
        }}
      >
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>Chat context panel</h2>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
          Select a conversation to inspect nearby skill details, hire status and meeting context.
        </p>
      </aside>
    );
  }

  const stats = [
    createStat('Distance', conversation.distanceLabel),
    createStat('Rate', conversation.rateLabel),
    createStat('Mode', conversation.meetingMode),
    createStat('Replies', conversation.responseTime),
  ];

  return (
    <aside
      className="chat-context-shell"
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
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
          display: 'grid',
          gap: '18px',
        }}
      >
        <div
          style={{
            borderRadius: '24px',
            padding: '22px',
            color: '#f8fafc',
            background: conversation.avatarGradient,
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.16)',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.16)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '16px',
              }}
            >
              {conversation.avatar}
            </div>
            <div style={{ display: 'grid', gap: '4px' }}>
              <strong style={{ fontSize: '1.1rem' }}>{conversation.participantName}</strong>
              <span style={{ color: 'rgba(248, 250, 252, 0.8)' }}>{conversation.role}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                borderRadius: '999px',
                padding: '7px 10px',
                background: 'rgba(255, 255, 255, 0.14)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {conversation.bookingStatus}
            </span>
            <span
              style={{
                borderRadius: '999px',
                padding: '7px 10px',
                background: 'rgba(255, 255, 255, 0.14)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {conversation.isOnline ? 'Online now' : 'Replies later today'}
            </span>
          </div>

          <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.82)', lineHeight: 1.7 }}>
            {conversation.profileBlurb}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '12px',
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: '18px',
                padding: '15px',
                background: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.16)',
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

        <div style={{ display: 'grid', gap: '8px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>Local plan</h3>
          <div
            style={{
              borderRadius: '20px',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.04)',
              display: 'grid',
              gap: '8px',
            }}
          >
            <strong style={{ color: '#0f172a' }}>{conversation.skillTitle}</strong>
            <span style={{ color: '#475569', lineHeight: 1.6 }}>
              Next slot: {conversation.nextSlotLabel}
            </span>
            <span style={{ color: '#475569', lineHeight: 1.6 }}>
              Preferred spot: {conversation.meetingSpot}
            </span>
            <span style={{ color: '#475569', lineHeight: 1.6 }}>
              Area: {conversation.area}
            </span>
          </div>
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '14px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>Shared context</h3>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Quick details that keep the conversation clear and actionable.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {conversation.sharedTags.map((tag) => (
            <span
              key={tag}
              style={{
                borderRadius: '999px',
                padding: '7px 11px',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {conversation.notes.map((note) => (
            <div
              key={note}
              style={{
                borderRadius: '18px',
                padding: '14px 16px',
                background: '#ffffff',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              {note}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: 'rgba(15, 23, 42, 0.96)',
          color: '#f8fafc',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div style={{ display: 'grid', gap: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Quick actions</h3>
          <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.72)', lineHeight: 1.6 }}>
            Move from chat to hiring and booking without losing context.
          </p>
        </div>

        <Link
          to="/bookings"
          style={{
            textDecoration: 'none',
            borderRadius: '18px',
            padding: '13px 16px',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
          }}
        >
          Open booking flow
        </Link>
        <Link
          to="/search"
          style={{
            textDecoration: 'none',
            borderRadius: '18px',
            padding: '13px 16px',
            border: '1px solid rgba(248, 250, 252, 0.18)',
            color: '#f8fafc',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          Explore more nearby skills
        </Link>
      </section>
    </aside>
  );
}
