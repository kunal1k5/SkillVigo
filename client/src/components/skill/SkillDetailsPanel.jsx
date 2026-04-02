import { Link } from 'react-router-dom';

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export default function SkillDetailsPanel({ skill }) {
  if (!skill) {
    return (
      <aside
        className="skill-detail-panel"
        style={{
          borderRadius: '28px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
          display: 'grid',
          gap: '12px',
        }}
      >
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>Skill detail panel</h2>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
          Pick a skill card to inspect price, local area, delivery mode and next action.
        </p>
      </aside>
    );
  }

  const stats = [
    { label: 'Price', value: formatCurrency(skill.price, skill.currency) },
    { label: 'Distance', value: skill.distanceLabel || `${skill.distanceKm?.toFixed(1)} km away` },
    { label: 'Mode', value: skill.mode || 'Hybrid' },
    { label: 'Rating', value: `${Number(skill.rating ?? 0).toFixed(1)} / 5.0` },
  ];

  return (
    <aside
      className="skill-detail-panel"
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
            background: skill.accent || 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.16)',
            display: 'grid',
            gap: '12px',
          }}
        >
          <span
            style={{
              width: 'fit-content',
              borderRadius: '999px',
              padding: '7px 11px',
              background: 'rgba(255, 255, 255, 0.14)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {skill.category}
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.35rem, 3vw, 1.9rem)',
              lineHeight: 1.15,
              fontFamily: '"Sora", "Segoe UI", sans-serif',
            }}
          >
            {skill.title}
          </h2>
          <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.82)', lineHeight: 1.7 }}>
            {skill.instructorName} | {skill.area}
          </p>
        </div>

        <p style={{ margin: 0, color: '#475569', lineHeight: 1.75 }}>
          {skill.description}
        </p>

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
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>What you get</h3>
          {(skill.outcomes || []).map((item) => (
            <div
              key={item}
              style={{
                borderRadius: '18px',
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.04)',
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(skill.tags || []).map((tag) => (
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
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Next steps</h3>
          <p style={{ margin: 0, color: 'rgba(248, 250, 252, 0.72)', lineHeight: 1.6 }}>
            Nearby skill dekho, chat karo, fit ho to booking ki taraf move karo.
          </p>
        </div>

        <Link
          to="/chat"
          style={{
            textDecoration: 'none',
            borderRadius: '18px',
            padding: '13px 16px',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
          }}
        >
          Start chat
        </Link>
        <Link
          to="/bookings"
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
          Open booking flow
        </Link>
      </section>
    </aside>
  );
}
