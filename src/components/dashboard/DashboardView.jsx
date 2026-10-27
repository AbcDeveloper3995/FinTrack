import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { MonthComparisonBanner } from '../charts/MonthComparisonBanner';
import { MonthPeaceOfMindCard } from './MonthPeaceOfMindCard';

export const DashboardView = ({ onNavigate }) => {
  const {
    kpis,
    accounts,
    creditDebt,
    transactions,
    setIsNewMovementModalOpen,
    setIsNewAccountModalOpen,
  } = useFinance();

  const hasAccounts = accounts.length > 0;
  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* 0. Semáforo de tranquilidad: ¿Cómo voy este mes? */}
      <MonthPeaceOfMindCard kpis={kpis} hasTransactions={hasTransactions} />

      {/* 0.1 Comparativa con mes anterior */}
      {hasTransactions && <MonthComparisonBanner kpis={kpis} />}

      {/* 1. Empty State Banner de Bienvenida Informativo si es usuario nuevo */}
      {(!hasAccounts || !hasTransactions) && (
        <section className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-primary/20 p-6 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-surface-container-high/40 to-secondary/10 pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-md flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">waving_hand</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  ¡Te damos la bienvenida a FinTrack!
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-2xl">
                  Tu plataforma está lista para llevar tus finanzas con calma. Agrega tus cuentas bancarias, tarjetas o efectivo, o anota tu primer gasto o ingreso.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              {!hasAccounts && (
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                  <span>Agregar mi primera cuenta</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Anotar un movimiento</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Row of 4 Metric KPI Cards con vocabulario humano */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Lo que entró */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Entró este mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </div>
          </div>
          <div className="mt-2 font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
            ${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="font-label-md text-label-md font-normal text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-on-surface-variant font-label-md text-label-md">
              {hasTransactions ? 'Ingresos acumulados' : 'Sin ingresos registrados aún'}
            </span>
          </div>
        </div>

        {/* Card 2: Lo que gastaste */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Gastaste este mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-error-container/40 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
            </div>
          </div>
          <div className="mt-2 font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
            ${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="font-label-md text-label-md font-normal text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-on-surface-variant font-label-md text-label-md">
              {hasTransactions ? 'Salidas y compras registradas' : 'Sin gastos registrados este mes'}
            </span>
          </div>
        </div>

        {/* Card 3: Te queda (Balance) */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Te queda este mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
          </div>
          <div className={`mt-2 font-metric-lg text-metric-lg font-bold tabular-nums tracking-tight ${
            kpis.netBalance >= 0 ? 'text-secondary' : 'text-error'
          }`}>
            {kpis.netBalance >= 0 ? '+' : ''}${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="font-label-md text-label-md font-normal text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-on-surface-variant font-label-md text-label-md">
              {kpis.netBalance >= 0 ? 'Saldo a tu favor' : 'Gastaste más de lo que entró'}
            </span>
          </div>
        </div>

        {/* Card 4: Porcentaje de ahorro */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Ahorraste
            </span>
            <div className="mt-2 font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
              {kpis.savingsRate}%
            </div>
            <div className="mt-1 text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>De lo que recibiste</span>
            </div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3.5"
              />
              <path
                className="text-secondary stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray={`${Math.min(100, kpis.savingsRate)}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-label-md text-label-md font-bold text-on-surface">
              {Math.round(kpis.savingsRate)}%
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Row 1 (Grid 7:5) - Patrimonio Consolidado & Cuentas */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Saldo Total & Cuentas */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Tu Dinero Total (Disponible - Tarjetas)
                </span>
                <div className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-on-surface tabular-nums tracking-tight mt-1">
                  ${kpis.netWorth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                  <span className="font-metric-md text-metric-md font-normal text-on-surface-variant">MXN</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(true)}
                  className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-on-primary-fixed bg-surface-container px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Nueva Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('cuentas')}
                  className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-on-surface-variant hover:text-on-surface bg-surface-container-low px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Ver todas</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Desglose de cuentas reales */}
            {hasAccounts ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map((acc) => {
                  const bal = Number(acc.balance) || 0;
                  const isCredit = acc.type === 'credito';
                  return (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: acc.color || '#4338ca' }}
                          className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-xs uppercase"
                        >
                          {acc.institution ? acc.institution.slice(0, 3) : 'FIN'}
                        </div>
                        <div>
                          <div className="font-body-md text-body-md font-semibold text-on-surface">
                            {acc.name}
                          </div>
                          <div className="font-label-md text-label-md text-on-surface-variant font-medium">
                            {acc.last4 ? `•••• ${acc.last4}` : (isCredit ? 'Tarjeta de Crédito' : 'Cuenta / Efectivo')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-body-md text-body-md font-bold tabular-nums ${
                          isCredit ? 'text-error' : 'text-on-surface'
                        }`}>
                          {isCredit ? '-' : ''}${bal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="font-label-md text-label-md text-on-surface-variant capitalize">
                          {isCredit ? 'Por pagar' : acc.currency}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 p-6 rounded-2xl bg-surface-container-low/70 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">account_balance_wallet</span>
                <p className="font-body-md text-body-md font-semibold text-on-surface">No has agregado cuentas aún</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                  Agrega tus cuentas de débito, crédito o efectivo para saber exactamente cuánto dinero tienes.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                >
                  + Agregar primera cuenta
                </button>
              </div>
            )}
          </div>

          {/* Tarjeta Deuda / Pasivo Strip si hay crédito */}
          {creditDebt.amount > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-error-container/40 flex items-center justify-between border border-error-container">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">credit_card</span>
                <div>
                  <span className="font-body-md text-body-md font-semibold text-on-error-container">
                    Saldo por pagar en Tarjetas
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant ml-2">
                    {creditDebt.dueDate} • Has usado el {creditDebt.limitUsage} de tu línea
                  </span>
                </div>
              </div>
              <div className="font-metric-md text-metric-md font-bold text-error tabular-nums">
                -${creditDebt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                <span className="font-label-md text-label-md font-normal">MXN</span>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Resumen Informativo */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Resumen rápido
                </span>
                <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Tu dinero en números
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Todo lo que ingresó</div>
                    <div className="text-xs text-on-surface-variant">Sueldo, ventas y cobros</div>
                  </div>
                </div>
                <div className="text-right font-bold text-secondary tabular-nums">
                  +${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center">
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Todo lo que gastaste</div>
                    <div className="text-xs text-on-surface-variant">Compras, cuentas y servicios</div>
                  </div>
                </div>
                <div className="text-right font-bold text-error tabular-nums">
                  -${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">savings</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Dinero que te sobró</div>
                    <div className="text-xs text-on-surface-variant">Ahorro libre del mes</div>
                  </div>
                </div>
                <div className={`text-right font-bold tabular-nums ${kpis.netBalance >= 0 ? 'text-secondary' : 'text-error'}`}>
                  {kpis.netBalance >= 0 ? '+' : ''}${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-surface-container text-xs text-on-surface-variant text-center">
            Tus datos están protegidos y respaldados.
          </div>
        </div>
      </section>

      {/* 4. Bottom Section: Actividad Reciente */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Actividad Reciente
            </span>
            <div className="font-headline-md text-headline-md font-semibold text-on-surface">
              Últimos Movimientos
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Nuevo</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('movimientos')}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors"
            >
              Ver todos ({transactions.length})
            </button>
          </div>
        </div>

        {hasTransactions ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase">
                  <th className="py-2.5 px-3 rounded-l-lg font-semibold">Concepto</th>
                  <th className="py-2.5 px-3 font-semibold">Cuenta</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 text-body-md font-body-md">
                {transactions.slice(0, 8).map((tx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${tx.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <span className="material-symbols-outlined text-base">{tx.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface leading-snug">{tx.concept}</div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container text-primary">
                              {tx.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: tx.accountColor || '#4338ca' }}
                          ></span>
                          <span className="text-on-surface font-medium">{tx.account}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant tabular-nums">{tx.date}</td>
                      <td className={`py-3 px-3 text-right font-bold tabular-nums ${
                        tx.type === 'transfer'
                          ? 'text-on-surface'
                          : tx.type === 'expense'
                          ? 'text-error'
                          : 'text-secondary'
                      }`}>
                        {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Sin movimientos registrados
            </h4>
            <p className="text-on-surface-variant text-sm mt-1 max-w-sm">
              Cada gasto, ingreso o transferencia que registres aparecerá aquí en tiempo real.
            </p>
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Registrar primer movimiento</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
