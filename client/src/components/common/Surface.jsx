const toneStyles = {
  default: {
    background: 'var(--sv-surface)',
    border: '1px solid var(--sv-border)',
    boxShadow: 'var(--sv-shadow-soft)',
    color: 'var(--sv-text)',
  },
  muted: {
    background: 'var(--sv-surface-soft)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.05)',
    color: 'var(--sv-text)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.94)',
    border: '1px solid rgba(96, 165, 250, 0.14)',
    boxShadow: 'var(--sv-shadow-lg)',
    color: '#f8fafc',
  },
};

export default function Surface({
  as = 'section',
  children,
  tone = 'default',
  padding = '24px',
  radius = 'var(--sv-radius-card)',
  style,
  ...props
}) {
  const Component = as;
  const toneStyle = toneStyles[tone] || toneStyles.default;

  return (
    <Component
      style={{
        borderRadius: radius,
        padding,
        backdropFilter: 'blur(18px)',
        ...toneStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
