const loaderSize = {
  sm: {
    spinner: 18,
    stroke: 4,
    text: '13px',
    padding: '12px 14px',
  },
  md: {
    spinner: 28,
    stroke: 5,
    text: '14px',
    padding: '14px 18px',
  },
  lg: {
    spinner: 40,
    stroke: 6,
    text: '15px',
    padding: '18px 22px',
  },
};

export default function Loader({ size = 'md', message = 'Loading...' }) {
  const resolvedSize = loaderSize[size] || loaderSize.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: resolvedSize.padding,
        borderRadius: '999px',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        background: 'rgba(255, 255, 255, 0.84)',
        boxShadow: '0 14px 28px rgba(15, 23, 42, 0.06)',
        color: '#334155',
        backdropFilter: 'blur(16px)',
      }}
      role="status"
      aria-live="polite"
    >
      <svg
        width={resolvedSize.spinner}
        height={resolvedSize.spinner}
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skillvigo-loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={resolvedSize.stroke}
        />
        <path
          d="M25 5a20 20 0 0 1 20 20"
          fill="none"
          stroke="url(#skillvigo-loader-gradient)"
          strokeLinecap="round"
          strokeWidth={resolvedSize.stroke}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      {message ? <span style={{ fontSize: resolvedSize.text, fontWeight: 700 }}>{message}</span> : null}
    </div>
  );
}
