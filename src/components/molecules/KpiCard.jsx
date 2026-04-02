import React from 'react';

export default function KpiCard({ label, value, deltaText, icon, accent }) {
  return (
    <div className="p-4 rounded-2xl shadow-sm border border-gray-100 bg-white">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-xl md:text-2xl font-bold ${accent}`}>{value}</h3>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      {deltaText && <p className="text-xs text-gray-500 mt-2">{deltaText}</p>}
    </div>
  );
}
