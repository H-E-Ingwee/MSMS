import React from 'react';

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  // Variant styles
  const variantStyles = {
    default: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  const baseStyles = 'inline-flex items-center justify-center rounded-xl transition duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 active:scale-95';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
}
