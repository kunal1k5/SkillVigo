const toneStyles = {
  neutral: {
    background: 'rgba(15, 23, 42, 0.05)',
    color: '#334155',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  brand: {
    background: 'rgba(37, 99, 235, 0.08)',
    color: '#1d4ed8',
    borderColor: 'rgba(37, 99, 235, 0.16)',
  },
  success: {
    background: 'rgba(15, 118, 110, 0.08)',
    color: '#0f766e',
    borderColor: 'rgba(15, 118, 110, 0.16)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.88)',
    color: '#f8fafc',
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
};

export default function Badge({
  children,
  tone = 'neutral',
  uppercase = false,
  style,
  ...props
}) {
  const toneStyle = toneStyles[tone] || toneStyles.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 12px',
        borderRadius: '999px',
        border: `1px solid ${toneStyle.borderColor}`,
        background: toneStyle.background,
        color: toneStyle.color,
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: uppercase ? '0.08em' : '0.01em',
        textTransform: uppercase ? 'uppercase' : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
