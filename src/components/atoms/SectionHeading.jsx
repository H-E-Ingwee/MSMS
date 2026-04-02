import React from 'react';

export default function SectionHeading({ title, subtitle }) {
  return (
    <header className="mb-4">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </header>
  );
}
