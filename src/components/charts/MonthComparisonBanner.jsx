import React from 'react';

/**
 * Diagnostic Banner that answers: "¿Gasté más o ahorré más comparado al mes anterior?"
 */
export const MonthComparisonBanner = ({ kpis }) => {
  const {
    monthlyExpenses = 0,
    prevMonthExpenses = 0,
    expenseDifference = 0,
    expenseChangePct = 0,
    savingsDifference = 0,
    comparisonStatus = 'neutral',
  } = kpis;

  // If no transactions in both current and previous months
  if (monthlyExpenses === 0 && prevMonthExpenses === 0) {
    return null;
  }

  const isSavedMore = comparisonStatus === 'saved_more';
  const isSpentMore = comparisonStatus === 'spent_more';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${
        isSavedMore
          ? 'bg-gradient-to-r from-emerald-500/10 via-surface-container-lowest to-emerald-500/5 border-emerald-500/30'
          : isSpentMore
          ? 'bg-gradient-to-r from-amber-500/10 via-surface-container-lowest to-red-500/5 border-amber-500/30'
          : 'bg-surface-container-lowest border-surface-container-high'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0 ${
              isSavedMore
                ? 'bg-emerald-500 text-white'
                : isSpentMore
                ? 'bg-amber-500 text-white'
                : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">
              {isSavedMore ? 'savings' : isSpentMore ? 'warning' : 'insights'}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                Comparativa Mensual
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 whitespace-nowrap ${
                  isSavedMore
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : isSpentMore
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {isSavedMore ? '🎉 Ahorraste más' : isSpentMore ? '⚠️ Gastaste más' : 'Equilibrado'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-on-surface mt-1 leading-snug">
              {isSavedMore && (
                <>
                  Gastos reducidos un{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {Math.abs(expenseChangePct)}%
                  </span>{' '}
                  (-${Math.abs(expenseDifference).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)
                </>
              )}

              {isSpentMore && (
                <>
                  Gastos aumentaron un{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                    +{Math.abs(expenseChangePct)}%
                  </span>{' '}
                  (+${Math.abs(expenseDifference).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)
                </>
              )}

              {!isSavedMore && !isSpentMore && (
                <>Tus gastos se mantienen en un rango similar al mes anterior.</>
              )}
            </h3>

            {/* Quick figures pill grid */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-on-surface-variant mt-2 pt-2 border-t border-surface-container/60">
              <span>Este mes: <strong className="text-on-surface">${monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
              <span className="text-outline">•</span>
              <span>Anterior: <strong className="text-on-surface">${prevMonthExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
              {savingsDifference !== 0 && (
                <>
                  <span className="text-outline">•</span>
                  <span>Impacto: <strong className={savingsDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-error'}>{savingsDifference >= 0 ? '+' : ''}${savingsDifference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Badge Ratio */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-container/60 shrink-0">
          <span className="text-xs text-on-surface-variant font-medium">Variación</span>
          <span
            className={`text-base sm:text-xl font-black tabular-nums ${
              isSavedMore
                ? 'text-emerald-600 dark:text-emerald-400'
                : isSpentMore
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-on-surface'
            }`}
          >
            {expenseChangePct > 0 ? `+${expenseChangePct}%` : `${expenseChangePct}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
