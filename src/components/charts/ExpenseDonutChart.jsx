import React, { useState } from 'react';

/**
 * Modern Interactive SVG Donut / Pie Chart Component
 * @param {Array} data - [{ label: string, value: number, color: string, icon?: string }]
 * @param {string} currency - 'MXN' | 'USD'
 * @param {number} size - pixel dimension (default 260)
 */
export const ExpenseDonutChart = ({
  data = [],
  currency = 'MXN',
  size = 260,
  onSelectSlice = null,
  selectedLabel = null,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2 text-outline">pie_chart</span>
        <p className="text-sm font-medium">Sin gastos registrados para graficar</p>
      </div>
    );
  }

  // Pre-curated harmonic colors palette
  const defaultColors = [
    '#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899',
    '#eab308', '#06b6d4', '#6366f1', '#64748b', '#84cc16'
  ];

  // SVG dimensions
  const center = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.16;
  const circumference = 2 * Math.PI * radius;

  // Calculate SVG stroke dashes cleanly
  const slices = data.reduce((acc, item, idx) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -acc.accumulatedAngle;
    const nextAngle = acc.accumulatedAngle + (percentage / 100) * circumference;

    acc.items.push({
      ...item,
      color: item.color || defaultColors[idx % defaultColors.length],
      percentage,
      strokeDasharray,
      strokeDashoffset,
    });
    acc.accumulatedAngle = nextAngle;
    return acc;
  }, { items: [], accumulatedAngle: 0 }).items;

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
      {/* SVG Donut Circle */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-container"
          />

          {/* Slices */}
          {slices.map((slice, index) => {
            const isHovered = hoveredIndex === index;
            const isSelected = selectedLabel === slice.label;
            return (
              <circle
                key={slice.label + index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered || isSelected ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-300 cursor-pointer ${
                  selectedLabel && !isSelected && !isHovered ? 'opacity-40' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectSlice && onSelectSlice(slice)}
              />
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeSlice ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate max-w-[130px]">
                {activeSlice.label}
              </span>
              <span className="text-xl font-black text-on-surface tabular-nums">
                ${activeSlice.value.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span
                style={{ color: activeSlice.color }}
                className="text-xs font-bold"
              >
                {activeSlice.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total Gastos
              </span>
              <span className="text-xl font-black text-on-surface tabular-nums">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {currency}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full max-w-sm space-y-2">
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedLabel === slice.label;
          return (
            <div
              key={slice.label + index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelectSlice && onSelectSlice(slice)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                  : isHovered
                  ? 'bg-surface-container shadow-xs translate-x-1'
                  : 'hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  style={{ backgroundColor: slice.color }}
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                />
                <span className={`text-sm truncate ${isSelected ? 'font-bold text-primary' : 'font-semibold text-on-surface'}`}>
                  {slice.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right shrink-0">
                <span className="text-sm font-bold text-on-surface tabular-nums">
                  ${slice.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant tabular-nums w-12 text-right">
                  {slice.percentage.toFixed(1)}%
                </span>
                {onSelectSlice && (
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">
                    {isSelected ? 'expand_less' : 'chevron_right'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

