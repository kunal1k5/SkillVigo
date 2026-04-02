export default function BookingEmptyState({ onReset }) {
  return (
    <section
      style={{
        borderRadius: '28px',
        padding: '28px',
        background: 'rgba(255, 255, 255, 0.88)',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
        display: 'grid',
        gap: '14px',
        minHeight: '240px',
        alignContent: 'center',
      }}
    >
      <span
        style={{
          width: 'fit-content',
          padding: '8px 12px',
          borderRadius: '999px',
          background: 'rgba(37, 99, 235, 0.1)',
          color: '#1d4ed8',
          fontWeight: 700,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        No matching booking
      </span>
      <h2 style={{ margin: 0, color: '#0f172a', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
        Your filter is sharper than the current list.
      </h2>
      <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, maxWidth: '56ch' }}>
        Try a different keyword or reset the filters to bring back your full booking dashboard.
      </p>
      <div>
        <button
          type="button"
          onClick={onReset}
          style={{
            border: 'none',
            borderRadius: '999px',
            padding: '12px 18px',
            background: 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
            color: '#ffffff',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 14px 28px rgba(37, 99, 235, 0.16)',
          }}
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}
