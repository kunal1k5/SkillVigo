export default function PageContainer({
  as = 'div',
  children,
  maxWidth = 1180,
  padding = '0 18px',
  style,
  ...props
}) {
  const Component = as;
  const resolvedMaxWidth = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <Component
      style={{
        width: '100%',
        maxWidth: resolvedMaxWidth,
        margin: '0 auto',
        padding,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
