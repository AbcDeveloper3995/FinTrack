import React from 'react';

/**
 * Traffic Light Status Banner: Answers "¿Cómo voy este mes?" in 3 seconds
 * Calm, human, encouraging, without technical financial jargon.
 */
export const MonthPeaceOfMindCard = ({ kpis, hasTransactions }) => {
  const {
    monthlyIncome = 0,
    monthlyExpenses = 0,
    netBalance = 0,
    savingsRate = 0,
  } = kpis;

  if (!hasTransactions) {
    return (
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-primary/10 via-surface-container-lowest to-surface-container-low border border-primary/20 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">spa</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              ¿Cómo voy este mes?
            </span>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              Aún no tienes movimientos este mes
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Registra tu primer gasto o ingreso para ver aquí tu semáforo de tranquilidad.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate status
  let status = 'great'; // 'great' | 'caution' | 'warning'
  let messageTitle = '';
  let messageDesc = '';
  let badgeLabel = '';
  let badgeColor = '';
  let iconName = '';
  let containerBg = '';

  if (monthlyIncome > 0) {
    const expenseRatio = monthlyExpenses / monthlyIncome;
    if (netBalance < 0) {
      status = 'warning';
      badgeLabel = '⚠️ Gastos superan ingresos';
      badgeColor = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      iconName = 'fidget_spinner';
      containerBg = 'bg-gradient-to-r from-red-500/10 via-surface-container-lowest to-red-500/5 border-red-500/30';
      messageTitle = `Tus gastos superaron tus ingresos por $${Math.abs(netBalance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
      messageDesc = 'Trata de pausar compras no urgentes estos días para volver a tener saldo a favor.';
    } else if (expenseRatio > 0.85) {
      status = 'caution';
      badgeLabel = '🟡 Queda poco margen';
      badgeColor = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300';
      iconName = 'warning';
      containerBg = 'bg-gradient-to-r from-amber-500/10 via-surface-container-lowest to-amber-500/5 border-amber-500/30';
      messageTitle = `Has usado el ${(expenseRatio * 100).toFixed(0)}% de lo que ingresó este mes`;
      messageDesc = `Aún te quedan $${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a favor para terminar el periodo con calma.`;
    } else {
      status = 'great';
      badgeLabel = '🟢 ¡Vas excelente!';
      badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      iconName = 'sentiment_very_satisfied';
      containerBg = 'bg-gradient-to-r from-emerald-500/10 via-surface-container-lowest to-emerald-500/5 border-emerald-500/30';
      messageTitle = `¡Todo en orden! Tienes un colchón de $${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a tu favor`;
      messageDesc = `Llevas un ahorro del ${savingsRate}% de tus ingresos este mes. ¡Sigue así!`;
    }
  } else {
    // Only expenses, no income recorded yet
    status = 'caution';
    badgeLabel = 'Salidas registradas';
    badgeColor = 'bg-surface-container text-on-surface';
    iconName = 'hourglass_top';
    containerBg = 'bg-surface-container-lowest border-surface-container-high';
    messageTitle = `Llevas $${monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN gastados este mes`;
    messageDesc = 'Recuerda anotar también tus ingresos (sueldo, cobros o ventas) para calcular tu balance real.';
  }

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs transition-all ${containerBg}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              status === 'great'
                ? 'bg-emerald-500 text-white'
                : status === 'caution'
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{iconName}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">
                ¿Cómo voy este mes?
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                {badgeLabel}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-on-surface mt-0.5 leading-snug">
              {messageTitle}
            </h3>

            <p className="text-xs text-on-surface-variant mt-0.5">
              {messageDesc}
            </p>
          </div>
        </div>

        {/* Quick Balance Pill */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 bg-surface-container-lowest px-3.5 py-2 rounded-xl border border-surface-container shadow-xs">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
              Te queda en el mes
            </span>
            <span className={`text-base font-extrabold tabular-nums ${netBalance >= 0 ? 'text-secondary' : 'text-error'}`}>
              {netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
