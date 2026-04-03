import React, { useState } from 'react';

export default function ResponsiveLineChart({
  data = [],
  showSimulation = false,
  height = 'h-64',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className={`${height} flex items-center justify-center text-gray-400`}>
        No data available
      </div>
    );
  }

  // Extract prices
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Add 20 KES buffer
  const adjustedMin = Math.max(0, minPrice - 20);
  const adjustedMax = maxPrice + 20;
  const range = adjustedMax - adjustedMin;

  // Calculate SVG dimensions
  const viewBoxWidth = 1000;
  const viewBoxHeight = 400;
  const padding = 40;
  const plotWidth = viewBoxWidth - padding * 2;
  const plotHeight = viewBoxHeight - padding * 2;

  // Map data points to SVG coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * plotWidth;
    const y = padding + plotHeight - ((d.price - adjustedMin) / range) * plotHeight;
    return { ...d, x, y, index };
  });

  // Simulation: generate projected prices (simple trend extension)
  const simulationPoints = showSimulation
    ? data
        .slice(-3)
        .map((d, i) => {
          const projectedPrice = d.price + (Math.random() - 0.5) * 30;
          const index = data.length - 3 + i;
          const x = padding + (index / (data.length - 1 || 1)) * plotWidth;
          const y = padding + plotHeight - ((projectedPrice - adjustedMin) / range) * plotHeight;
          return { ...d, x, y, price: projectedPrice, isProjection: true };
        })
    : [];

  // Create polyline path for actual data
  const actualPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create polyline path for simulation (dashed)
  const simulationPath =
    showSimulation && simulationPoints.length > 0
      ? simulationPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  // Y-axis labels (price range)
  const yLabels = [
    { value: adjustedMin, y: padding + plotHeight },
    { value: Math.round((adjustedMin + adjustedMax) / 2), y: padding + plotHeight / 2 },
    { value: adjustedMax, y: padding },
  ];

  return (
    <div className={`${height} w-full relative`}>
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={label.y}
            x2={viewBoxWidth - padding}
            y2={label.y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}

        {/* X-axis */}
        <line x1={padding} y1={padding + plotHeight} x2={viewBoxWidth - padding} y2={padding + plotHeight} stroke="#d1d5db" strokeWidth="2" />

        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={padding + plotHeight} stroke="#d1d5db" strokeWidth="2" />

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={`ylabel-${i}`}
            x={padding - 10}
            y={label.y + 5}
            textAnchor="end"
            fontSize="12"
            fill="#6b7280"
          >
            {label.value}
          </text>
        ))}

        {/* X-axis labels (day names) */}
        {points.map((p, i) => (
          <text
            key={`xlabel-${i}`}
            x={p.x}
            y={padding + plotHeight + 25}
            textAnchor="middle"
            fontSize="11"
            fill="#6b7280"
          >
            {p.day}
          </text>
        ))}

        {/* Actual data line */}
        <path d={actualPath} fill="none" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" />

        {/* Simulation line (dashed) */}
        {showSimulation && simulationPath && (
          <path d={simulationPath} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="5,5" vectorEffect="non-scaling-stroke" />
        )}

        {/* Interactive data points */}
        {points.map((p, i) => (
          <g key={`point-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 7 : 4} fill="#10b981" className="transition-all duration-200" />

            {/* Tooltip */}
            {hoveredIndex === i && (
              <>
                <rect
                  x={p.x - 50}
                  y={p.y - 35}
                  width="100"
                  height="30"
                  rx="6"
                  fill="rgba(17, 24, 39, 0.9)"
                  stroke="#10b981"
                  strokeWidth="1"
                />
                <text
                  x={p.x}
                  y={p.y - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="bold"
                >
                  KES {p.price}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Simulation points */}
        {simulationPoints.map((p, i) => (
          <circle key={`sim-point-${i}`} cx={p.x} cy={p.y} r="4" fill="#f97316" className="opacity-60" />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-4 flex gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500"></div>
          <span className="text-gray-600">Actual Price</span>
        </div>
        {showSimulation && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f97316, #f97316 3px, transparent 3px, transparent 6px)' }}></div>
            <span className="text-gray-600">AI Projection</span>
          </div>
        )}
      </div>
    </div>
  );
}
