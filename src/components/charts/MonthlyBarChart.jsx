import React, { useState } from 'react';

/**
 * Modern Interactive SVG Bar Chart Component for Monthly Comparison
 * Displays 6-month bars of Income vs Expenses and Balance trend.
 * @param {Array} history - [{ key, label, income, expense, balance }]
 */
export const MonthlyBarChart = ({ history = [] }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl mb-2 text-outline">bar_chart</span>
        <p className="text-sm font-medium">Sin historial suficiente para graficar barras</p>
      </div>
    );
  }

  // Find max value to normalize bar heights
  const maxVal = Math.max(
    ...history.map((m) => Math.max(m.income, m.expense)),
    1000 // default minimum floor
  );

  return (
    <div className="w-full space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-surface-container">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-secondary"></span>
            <span className="text-on-surface">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-primary"></span>
            <span className="text-on-surface">Gastos</span>
          </div>
        </div>

        {hoveredMonth && (
          <div className="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
            <span>{hoveredMonth.label}:</span>
            <span className="text-secondary font-bold">
              +${hoveredMonth.income.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-primary font-bold">
              -${hoveredMonth.expense.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
            </span>
            <span className={`font-bold ${hoveredMonth.balance >= 0 ? 'text-emerald-500' : 'text-error'}`}>
              (Neto: {hoveredMonth.balance >= 0 ? '+' : ''}${hoveredMonth.balance.toLocaleString('es-MX', { minimumFractionDigits: 0 })})
            </span>
          </div>
        )}
      </div>

      {/* Bars Container */}
      <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
        {history.map((m) => {
          const incomeHeight = maxVal > 0 ? (m.income / maxVal) * 100 : 0;
          const expenseHeight = maxVal > 0 ? (m.expense / maxVal) * 100 : 0;
          const isHovered = hoveredMonth?.key === m.key;

          return (
            <div
              key={m.key}
              onMouseEnter={() => setHoveredMonth(m)}
              onMouseLeave={() => setHoveredMonth(null)}
              className={`flex-1 flex flex-col items-center h-full justify-end cursor-pointer group transition-all duration-200 ${
                isHovered ? 'scale-105' : ''
              }`}
            >
              {/* Tooltip on top of bar */}
              <div className="h-6 flex items-center justify-center mb-1">
                {isHovered && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface shadow-xs whitespace-nowrap">
                    ${m.expense.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </span>
                )}
              </div>

              {/* Double Bar column */}
              <div className="w-full max-w-[50px] flex items-end justify-center gap-1 sm:gap-1.5 h-40 bg-surface-container-low/40 rounded-t-xl p-1 relative">
                {/* Income Bar */}
                <div
                  style={{ height: `${Math.max(4, incomeHeight)}%` }}
                  className="w-1/2 bg-gradient-to-t from-secondary/80 to-secondary rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs"
                />

                {/* Expense Bar */}
                <div
                  style={{ height: `${Math.max(4, expenseHeight)}%` }}
                  className="w-1/2 bg-gradient-to-t from-primary/80 to-primary rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs"
                />
              </div>

              {/* Month Label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-xs font-semibold transition-colors block ${
                    isHovered ? 'text-primary font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
