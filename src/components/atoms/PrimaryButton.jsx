import React from 'react';

export default function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
