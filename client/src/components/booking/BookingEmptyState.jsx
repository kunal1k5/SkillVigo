export default function BookingEmptyState({ onReset }) {
  return (
    <section
      style={{
        borderRadius: '28px',
        padding: '28px',
        background: '#ffffff',
        border: '1px solid #e7e5e4',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
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
          background: '#f5f5f4',
          color: '#44403c',
          border: '1px solid #d6d3d1',
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
        Try a different keyword or reset the filters to bring back your full booking list.
      </p>
      <div>
        <button
          type="button"
          onClick={onReset}
          style={{
            border: '1px solid #0f172a',
            borderRadius: '999px',
            padding: '12px 18px',
            background: '#0f172a',
            color: '#ffffff',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)',
          }}
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}
