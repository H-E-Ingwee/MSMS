import React from 'react';

export default function Input({ label, id, type = 'text', value, onChange, placeholder, error, required, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id || label} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id || label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
        required={required}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
