/**
 * Component: Button
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'premium'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - onClick: function
 * - children: ReactNode
 * - className: additional CSS classes
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm font-medium',
    md: 'px-6 py-2.5 text-base font-semibold',
    lg: 'px-8 py-3 text-lg font-bold',
  };

  // Variant classes
  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-blue-600 shadow-md hover:shadow-lg',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 border border-gray-200 shadow-sm hover:shadow-md',
    outline:
      'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 active:bg-blue-100 shadow-none',
    premium:
      'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white hover:shadow-xl hover:shadow-pink-500/50 active:scale-95 border-none font-bold tracking-wide',
  };

  // Disabled state
  const disabledClass = disabled
    ? 'opacity-60 cursor-not-allowed'
    : 'cursor-pointer transition-all duration-200 ease-out transform hover:scale-105 active:scale-95';

  const baseClasses =
    'rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-out';

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${disabledClass}
    ${className}
  `;

  return (
    <button
      className={combinedClasses.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
