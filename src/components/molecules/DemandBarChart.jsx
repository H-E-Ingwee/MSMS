import React, { useState } from 'react';

export default function DemandBarChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Extract demand volumes
  const volumes = data.map(d => d.demandVol);
  const maxVolume = Math.max(...volumes);
  const minVolume = 0;
  const range = maxVolume;

  // Calculate SVG dimensions
  const viewBoxWidth = 1000;
  const viewBoxHeight = 400;
  const padding = 40;
  const plotWidth = viewBoxWidth - padding * 2;
  const plotHeight = viewBoxHeight - padding * 2;

  // Calculate bar positions
  const barWidth = plotWidth / (data.length * 1.5);
  const barGap = barWidth * 0.5;

  // Y-axis labels
  const yLabels = [
    { value: minVolume, y: padding + plotHeight },
    { value: Math.round(range / 2), y: padding + plotHeight / 2 },
    { value: maxVolume, y: padding },
  ];

  return (
    <div className="h-64 w-full relative">
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
        <line
          x1={padding}
          y1={padding + plotHeight}
          x2={viewBoxWidth - padding}
          y2={padding + plotHeight}
          stroke="#d1d5db"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + plotHeight}
          stroke="#d1d5db"
          strokeWidth="2"
        />

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
            {label.value.toLocaleString()}
          </text>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.demandVol / range) * plotHeight;
          const barX = padding + (i * (barWidth + barGap)) + barGap / 2;
          const barY = padding + plotHeight - barHeight;

          return (
            <g key={`bar-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {/* Bar */}
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={hoveredIndex === i ? '#8b5cf6' : '#a78bfa'}
                rx="4"
                className="transition-colors duration-200"
              />

              {/* Tooltip */}
              {hoveredIndex === i && (
                <>
                  <rect
                    x={barX - 35}
                    y={barY - 35}
                    width="70"
                    height="30"
                    rx="6"
                    fill="rgba(17, 24, 39, 0.9)"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                  />
                  <text
                    x={barX + barWidth / 2}
                    y={barY - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                    fontWeight="bold"
                  >
                    {d.demandVol.toLocaleString()}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* X-axis labels (day names) */}
        {data.map((d, i) => {
          const barX = padding + (i * (barWidth + barGap)) + barGap / 2 + barWidth / 2;
          return (
            <text
              key={`xlabel-${i}`}
              x={barX}
              y={padding + plotHeight + 25}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {d.day}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-4 flex gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-purple-400 rounded"></div>
          <span className="text-gray-600">Market Demand (kg)</span>
        </div>
      </div>
    </div>
  );
}
