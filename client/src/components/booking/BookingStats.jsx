export default function BookingStats({ stats }) {
  return (
    <section
      className="booking-metrics-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
      }}
    >
      {stats.map((item) => (
        <article
          key={item.label}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            padding: '22px',
            background: 'rgba(255, 255, 255, 0.82)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            boxShadow: '0 18px 34px rgba(15, 23, 42, 0.06)',
            display: 'grid',
            gap: '10px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0 auto auto 0',
              width: '100%',
              height: '4px',
              background: item.accent,
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
            }}
          >
            {item.label}
          </span>
          <strong
            style={{
              fontSize: 'clamp(1.45rem, 3vw, 2rem)',
              color: '#0f172a',
              lineHeight: 1.08,
              fontFamily: '"Sora", "Segoe UI", sans-serif',
            }}
          >
            {item.value}
          </strong>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
