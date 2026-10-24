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
      className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all ${
        isSavedMore
          ? 'bg-gradient-to-r from-emerald-500/10 via-surface-container-lowest to-emerald-500/5 border-emerald-500/30'
          : isSpentMore
          ? 'bg-gradient-to-r from-amber-500/10 via-surface-container-lowest to-red-500/5 border-amber-500/30'
          : 'bg-surface-container-lowest border-surface-container-high'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isSavedMore
                ? 'bg-emerald-500 text-white'
                : isSpentMore
                ? 'bg-amber-500 text-white'
                : 'bg-primary text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isSavedMore ? 'savings' : isSpentMore ? 'warning' : 'insights'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">
                Comparativa con el Mes Anterior
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isSavedMore
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : isSpentMore
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                {isSavedMore ? '🎉 ¡Ahorraste más!' : isSpentMore ? '⚠️ Gastaste más' : 'Equilibrado'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-on-surface mt-0.5">
              {isSavedMore && (
                <>
                  Redujiste tus gastos en un{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {Math.abs(expenseChangePct)}%
                  </span>{' '}
                  ($
                  {Math.abs(expenseDifference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                  MXN menos que el mes pasado)
                </>
              )}

              {isSpentMore && (
                <>
                  Tus gastos aumentaron un{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-black">
                    +{Math.abs(expenseChangePct)}%
                  </span>{' '}
                  ($
                  {Math.abs(expenseDifference).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                  MXN más que el mes pasado)
                </>
              )}

              {!isSavedMore && !isSpentMore && (
                <>Tus gastos se mantienen en un rango similar al mes anterior.</>
              )}
            </h3>

            <p className="text-xs text-on-surface-variant mt-1">
              Gasto este mes: <strong>${monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong> vs.{' '}
              Mes anterior: <strong>${prevMonthExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              {savingsDifference !== 0 && (
                <span className="ml-2 font-medium">
                  • Impacto neto en balance:{' '}
                  <span className={savingsDifference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-error'}>
                    {savingsDifference >= 0 ? '+' : ''}${savingsDifference.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Badge Ratio */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-container">
          <span className="text-xs text-on-surface-variant font-medium">Variación en Gasto</span>
          <span
            className={`text-xl font-black tabular-nums ${
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
