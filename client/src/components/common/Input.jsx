import { useId, useState } from 'react';

export default function Input({
  type = 'text',
  placeholder,
  error,
  hint,
  label,
  containerStyle,
  labelStyle,
  style,
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const helperMessage = error || hint;

  return (
    <div style={{ display: 'grid', gap: '8px', ...containerStyle }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#334155',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            ...labelStyle,
          }}
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        onFocus={(event) => {
          setIsFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          props.onBlur?.(event);
        }}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: '18px',
          border: `1px solid ${
            error
              ? 'rgba(239, 68, 68, 0.42)'
              : isFocused
                ? 'rgba(37, 99, 235, 0.34)'
                : 'rgba(148, 163, 184, 0.22)'
          }`,
          background: props.readOnly ? 'rgba(248, 250, 252, 0.96)' : 'rgba(255, 255, 255, 0.92)',
          color: '#0f172a',
          outline: 'none',
          fontSize: '14px',
          lineHeight: 1.4,
          boxSizing: 'border-box',
          boxShadow: error
            ? '0 0 0 4px rgba(239, 68, 68, 0.08)'
            : isFocused
              ? '0 0 0 4px rgba(37, 99, 235, 0.08), 0 14px 28px rgba(15, 23, 42, 0.08)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 10px 24px rgba(15, 23, 42, 0.05)',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          ...style,
        }}
        {...props}
      />

      {helperMessage ? (
        <span
          style={{
            fontSize: '12px',
            color: error ? '#dc2626' : '#64748b',
            lineHeight: 1.5,
          }}
        >
          {helperMessage}
        </span>
      ) : null}
    </div>
  );
}
