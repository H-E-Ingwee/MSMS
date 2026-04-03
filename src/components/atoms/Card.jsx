import React from 'react';

export function Card({ children, onClick, className = '' }) {
  const interactiveStyles = onClick ? 'hover:shadow-md cursor-pointer transition-shadow' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-xl shadow-sm ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 flex items-start justify-between ${className}`}>
      <div>
        {typeof title === 'string' ? (
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        ) : (
          title
        )}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export default Card;
