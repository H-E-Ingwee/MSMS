import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id || label} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id || label}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
          required={required}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
