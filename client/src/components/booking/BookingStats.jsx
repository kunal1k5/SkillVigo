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
            borderRadius: '24px',
            padding: '22px',
            background: '#ffffff',
            border: '1px solid #e7e5e4',
            borderLeft: `4px solid ${item.accent || '#111827'}`,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
            display: 'grid',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#78716c',
            }}
          >
            {item.label}
          </span>
          <strong
            style={{
              fontSize: 'clamp(1.45rem, 3vw, 2rem)',
              color: '#0f172a',
              lineHeight: 1.08,
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
