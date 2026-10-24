import React from 'react';
import { useFinance } from '../../context/FinanceContext';

export const AnalyticsView = () => {
  const { transactions, kpis, categories, accounts, setIsNewMovementModalOpen } = useFinance();

  const hasTransactions = transactions.length > 0;

  // Breakdown by category from real transactions
  const categoryTotals = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = transactions
        .filter((t) => t.category === c.name && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        id: c.id,
        name: c.name,
        spent,
        pct: kpis.monthlyExpenses > 0 ? (spent / kpis.monthlyExpenses) * 100 : 0,
        icon: c.icon || 'category',
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Breakdown by income categories
  const incomeCategoryTotals = categories
    .filter((c) => c.type === 'income')
    .map((c) => {
      const amount = transactions
        .filter((t) => t.category === c.name && t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        id: c.id,
        name: c.name,
        amount,
        pct: kpis.monthlyIncome > 0 ? (amount / kpis.monthlyIncome) * 100 : 0,
        icon: c.icon || 'payments',
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
          <span>Motor de Inteligencia Financiera</span>
          <span className="text-outline">/</span>
          <span className="text-primary font-bold">Diagnóstico Patrimonial</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
          Análisis de Flujo y Rendimiento
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Visualiza la distribución real de tus ingresos y egresos, ratios de ahorro y la salud integral de tus cuentas en tiempo real.
        </p>
      </section>

      {!hasTransactions ? (
        /* Empty State Informativo cuando no hay datos */
        <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-10 sm:p-14 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-low text-primary flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-4xl">analytics</span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            Sin datos suficientes para generar análisis
          </h2>
          <p className="text-on-surface-variant font-body-md text-body-md mt-2 max-w-lg">
            Actualmente tu base de datos no cuenta con movimientos registrados. El motor analítico calculará automáticamente la dispersión de gastos por categoría, comparativas mensuales y tasa de ahorro en cuanto ingreses tus transacciones.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Registrar primer movimiento</span>
            </button>
          </div>
        </div>
      ) : (
        /* Real Analytics View */
        <div className="space-y-6">
          {/* Top 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Ingresos Totales Registrados
              </span>
              <div className="text-2xl font-bold text-secondary mt-1 tabular-nums">
                ${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                {incomeCategoryTotals.length} fuente(s) de ingreso activas
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Gastos Totales Registrados
              </span>
              <div className="text-2xl font-bold text-on-surface mt-1 tabular-nums">
                ${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                {categoryTotals.length} categoría(s) de gasto con salidas
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Tasa de Retención / Ahorro
              </span>
              <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
                {kpis.savingsRate}%
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                Saldo a favor: ${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gastos por Categoría */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-4">
                Desglose de Gastos por Categoría
              </h3>

              {categoryTotals.length > 0 ? (
                <div className="space-y-4">
                  {categoryTotals.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary">{c.icon}</span>
                          <span className="font-semibold text-on-surface">{c.name}</span>
                        </div>
                        <div className="tabular-nums">
                          <span className="font-bold text-on-surface">
                            ${c.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-on-surface-variant ml-2">
                            ({c.pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${c.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic py-6 text-center">
                  Sin egresos registrados todavía.
                </p>
              )}
            </div>

            {/* Fuentes de Ingreso */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-4">
                Fuentes de Ingreso Registradas
              </h3>

              {incomeCategoryTotals.length > 0 ? (
                <div className="space-y-4">
                  {incomeCategoryTotals.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-secondary">{c.icon}</span>
                          <span className="font-semibold text-on-surface">{c.name}</span>
                        </div>
                        <div className="tabular-nums">
                          <span className="font-bold text-secondary">
                            +${c.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-on-surface-variant ml-2">
                            ({c.pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${c.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic py-6 text-center">
                  Sin ingresos registrados todavía.
                </p>
              )}
            </div>
          </div>

          {/* Accounts Liquidity Snapshot */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-3">
              Concentración de Liquidez por Cuenta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface text-sm">{acc.name}</span>
                    <span className="text-xs uppercase text-on-surface-variant font-medium">{acc.type}</span>
                  </div>
                  <div className="font-bold text-on-surface text-base mt-1 tabular-nums">
                    ${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
