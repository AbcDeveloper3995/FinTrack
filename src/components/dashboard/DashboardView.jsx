import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const DashboardView = ({ onNavigate }) => {
  const { kpis, accounts, creditDebt, transactions, setIsNewMovementModalOpen } = useFinance();
  const [showInsight, setShowInsight] = useState(true);
  const [timeRange, setTimeRange] = useState('6M');

  return (
    <div className="space-y-6">
      {/* 1. Top Insight Banner (Diagnóstico Inteligente con IA) */}
      {showInsight && (
        <section className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-surface-container shadow-sm transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-surface-container-high/60 to-surface-container-highest/40 pointer-events-none"></div>
          <div className="relative px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-xl filled">insights</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body-md text-body-md text-on-surface">
                <span className="font-bold text-primary">Diagnóstico Inteligente:</span>
                <span>
                  Gastaste <strong className="text-on-surface font-semibold">18% más en Despensa</strong> que el mes previo ($8,450 vs $7,160).
                </span>
                <span className="text-outline hidden sm:inline">•</span>
                <span className="text-secondary font-semibold">
                  Tasa de ahorro en 32.4% (+2.4% sobre tu meta mensual).
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('analisis')}
                className="text-primary hover:text-on-primary-fixed font-label-md text-label-md px-3.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-variant transition-colors flex items-center gap-1 font-semibold"
              >
                <span>Ver detalle</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInsight(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container-high transition-colors"
                title="Descartar"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Row of 4 Metric KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Ingresos */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Ingresos del mes
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
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xs mr-0.5">arrow_upward</span>
              {kpis.incomeGrowth}%
            </span>
            <span className="text-on-surface-variant font-label-md text-label-md">vs. Septiembre</span>
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Gastos del mes
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">payments</span>
            </div>
          </div>
          <div className="mt-2 font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
            ${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="font-label-md text-label-md font-normal text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xs mr-0.5">arrow_downward</span>
              {kpis.expenseSavingsRate}%
            </span>
            <span className="text-on-surface-variant font-label-md text-label-md">vs. Septiembre (Ahorro)</span>
          </div>
        </div>

        {/* Card 3: Balance Neto */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Balance neto
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
          </div>
          <div className="mt-2 font-metric-lg text-metric-lg font-bold text-secondary tabular-nums tracking-tight">
            +${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="font-label-md text-label-md font-normal text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-xs mr-0.5">add</span>$3,450.00
            </span>
            <span className="text-on-surface-variant font-label-md text-label-md">vs. mes anterior</span>
          </div>
        </div>

        {/* Card 4: Tasa de Ahorro con progreso circular */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-shadow flex items-center justify-between">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tasa de ahorro
            </span>
            <div className="mt-2 font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
              {kpis.savingsRate}%
            </div>
            <div className="mt-1 text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Meta: {kpis.savingsTarget}% (+2.4%)</span>
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
                strokeDasharray="108, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-label-md text-label-md font-bold text-on-surface">32%</span>
          </div>
        </div>
      </section>

      {/* 3. Main Row 1 (Grid 7:5) - Patrimonio Consolidado & Comparativa Semestral */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Saldo Total & Cuentas */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Patrimonio Consolidado
                </span>
                <div className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-on-surface tabular-nums tracking-tight mt-1">
                  ${kpis.netWorth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                  <span className="font-metric-md text-metric-md font-normal text-on-surface-variant">MXN</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('cuentas')}
                className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-on-primary-fixed bg-surface-container px-3 py-2 rounded-lg transition-colors"
              >
                <span>Ver todas las cuentas</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            {/* Desglose de cuentas */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs">
                      {acc.institution}
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">
                        {acc.name}
                      </div>
                      <div className="font-label-md text-label-md text-secondary font-medium">
                        {acc.tag}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-body-md text-body-md font-bold text-on-surface tabular-nums">
                      ${acc.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="font-label-md text-label-md text-on-surface-variant">
                      {acc.share} del total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta Deuda / Pasivo Strip */}
          <div className="mt-4 p-3.5 rounded-xl bg-error-container/40 flex items-center justify-between border border-error-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-xl">credit_card</span>
              <div>
                <span className="font-body-md text-body-md font-semibold text-on-error-container">
                  Deuda Tarjetas de Crédito (Pasivo)
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant ml-2">
                  {creditDebt.dueDate} • Uso {creditDebt.limitUsage}
                </span>
              </div>
            </div>
            <div className="font-metric-md text-metric-md font-bold text-error tabular-nums">
              -${creditDebt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
              <span className="font-label-md text-label-md font-normal">MXN</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Comparativa Semestral (Ingresos vs Gastos) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Comparativa Semestral
                </span>
                <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Ingresos vs. Gastos
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTimeRange('6M')}
                  className={`px-2.5 py-1 rounded-md text-label-md font-label-md font-semibold transition-all ${
                    timeRange === '6M' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  6M
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('1A')}
                  className={`px-2.5 py-1 rounded-md text-label-md font-label-md font-semibold transition-all ${
                    timeRange === '1A' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  1A
                </button>
              </div>
            </div>

            {/* Gráfico de barras Semestral */}
            <div className="mt-4 w-full">
              <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 pb-2">
                {[
                  { month: 'May', inc: '72%', exp: '60%' },
                  { month: 'Jun', inc: '78%', exp: '64%' },
                  { month: 'Jul', inc: '70%', exp: '58%' },
                  { month: 'Ago', inc: '75%', exp: '52%' },
                  { month: 'Sep', inc: '76%', exp: '56%' },
                  { month: 'Oct', inc: '85%', exp: '54%', current: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-32">
                      <div
                        className={`w-3 rounded-t bg-secondary transition-all group-hover:opacity-80 ${
                          bar.current ? 'ring-2 ring-secondary-fixed' : ''
                        }`}
                        style={{ height: bar.inc }}
                        title={`Ingresos ${bar.month}`}
                      ></div>
                      <div
                        className={`w-3 rounded-t bg-primary-container transition-all group-hover:opacity-80 ${
                          bar.current ? 'ring-2 ring-primary-fixed' : ''
                        }`}
                        style={{ height: bar.exp }}
                        title={`Gastos ${bar.month}`}
                      ></div>
                    </div>
                    <span className={`font-label-md text-label-md ${bar.current ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-between pt-2 bg-surface-container-low px-4 py-2 rounded-xl mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-secondary"></span>
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-primary-container"></span>
                <span>Gastos</span>
              </div>
            </div>
            <span className="font-label-md text-label-md text-secondary font-bold">
              Superávit continuo
            </span>
          </div>
        </div>
      </section>

      {/* 4. Main Row 2 (Grid 3 Columnas) - Gastos por Categoría, Acumulado Día a Día y Top Comercios */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Gastos por Categoría Donut */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                Distribución
              </span>
              <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                Gastos por Categoría
              </div>
            </div>
            <span className="text-on-surface-variant font-label-md text-label-md font-medium">Octubre</span>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#2a14b4" strokeDasharray="101 163" strokeDashoffset="0" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#006c4a" strokeDasharray="68 196" strokeDashoffset="-101" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#4338ca" strokeDasharray="33 231" strokeDashoffset="-169" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#777586" strokeDasharray="30 234" strokeDashoffset="-202" strokeWidth="12" />
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#a6002f" strokeDasharray="17 247" strokeDashoffset="-232" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total</span>
              <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums">$32,600</span>
            </div>
          </div>

          <div className="space-y-2 mt-2 flex-1">
            {[
              { label: 'Vivienda', color: 'bg-primary', amount: '$12,500', pct: '38.3%' },
              { label: 'Despensa', color: 'bg-secondary', amount: '$8,450', pct: '25.9%' },
              { label: 'Entretenimiento', color: 'bg-primary-container', amount: '$4,150', pct: '12.7%' },
              { label: 'Transporte', color: 'bg-outline', amount: '$3,800', pct: '11.6%' },
              { label: 'Salud', color: 'bg-tertiary-container', amount: '$2,100', pct: '6.4%' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-body-md font-body-md">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
                  <span className="text-on-surface">{cat.label}</span>
                </div>
                <div className="tabular-nums font-semibold text-on-surface">
                  {cat.amount} <span className="text-on-surface-variant text-label-md font-normal">({cat.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Ritmo de Consumo Día a Día */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Ritmo de consumo
                </span>
                <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Acumulado Día a Día
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed">
                -$2,400 vs mes anterior
              </span>
            </div>
            <div className="mt-2 text-body-md font-body-md text-on-surface-variant">
              Día 28: <strong className="text-on-surface font-semibold tabular-nums">$32,600</strong> gastados vs <span className="tabular-nums font-medium">$35,000</span> a esta fecha en Septiembre.
            </div>
          </div>

          <div className="relative w-full h-40 my-3">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 130">
              <defs>
                <linearGradient id="indigoGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,120 Q 50,110 100,90 T 200,50 T 290,15" fill="none" opacity="0.6" stroke="#777586" strokeDasharray="4,4" strokeWidth="2" />
              <path d="M 0,120 Q 50,115 100,98 T 200,68 T 270,38 L 270,120 L 0,120 Z" fill="url(#indigoGrad)" />
              <path d="M 0,120 Q 50,115 100,98 T 200,68 T 270,38" fill="none" stroke="#2a14b4" strokeLinecap="round" strokeWidth="3" />
              <circle cx="270" cy="38" fill="#2a14b4" r="5" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="absolute right-2 top-1 bg-surface-container-highest px-2 py-1 rounded text-on-surface font-label-md text-label-md font-bold shadow-sm">
              Hoy: $32.6k
            </div>
          </div>

          <div className="flex items-center justify-between text-label-md font-label-md text-on-surface-variant pt-2 border-t border-surface-container">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <span className="w-3 h-1 bg-primary rounded"></span>
              <span>Octubre (Actual)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-outline border-b border-dashed"></span>
              <span>Septiembre</span>
            </div>
          </div>
        </div>

        {/* Card 3: Top Comercios */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                Mayor Frecuencia
              </span>
              <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                Top Comercios
              </div>
            </div>
            <span className="font-label-md text-label-md font-bold text-primary">5 Comercios</span>
          </div>

          <div className="space-y-3 flex-1">
            {[
              { name: 'Walmart Express', letter: 'W', movs: '5 movs', amount: '$4,230.00', pct: '85%', color: 'bg-primary' },
              { name: 'Amazon MX', letter: 'A', movs: '3 movs', amount: '$3,490.00', pct: '70%', color: 'bg-primary-container' },
              { name: 'Uber & Rides', letter: 'U', movs: '8 movs', amount: '$2,150.00', pct: '48%', color: 'bg-surface-tint' },
              { name: 'Cadena OXXO', letter: 'O', movs: '14 movs', amount: '$1,840.00', pct: '38%', color: 'bg-outline' },
              { name: 'Farmacias Ahorro', letter: 'F', movs: '2 movs', amount: '$1,420.00', pct: '29%', color: 'bg-secondary' },
            ].map((com, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-body-md font-body-md">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-xs text-on-surface">
                      {com.letter}
                    </div>
                    <span className="font-semibold text-on-surface">{com.name}</span>
                    <span className="text-on-surface-variant font-label-md text-label-md">{com.movs}</span>
                  </div>
                  <span className="font-bold text-on-surface tabular-nums">{com.amount}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                  <div className={`${com.color} h-full rounded-full`} style={{ width: com.pct }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bottom Section (Grid 7:5) - Actividad Reciente & Top Presupuestos */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Últimos Movimientos */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
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
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm"
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
                  {transactions.slice(0, 6).map((tx) => {
                    const isPositive = tx.amount > 0;
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
                        <td className="py-3 px-3 text-on-surface-variant">{tx.account}</td>
                        <td className="py-3 px-3 text-on-surface-variant tabular-nums">{tx.date}</td>
                        <td className={`py-3 px-3 text-right font-bold tabular-nums ${
                          isPositive ? 'text-secondary' : 'text-on-surface'
                        }`}>
                          {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Top 5 Categorías Presupuestadas */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Presupuesto Ejecutado
                </span>
                <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Top 5 Categorías
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('presupuestos')}
                className="font-label-md text-label-md font-semibold text-primary hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Vivienda', spent: '$12,500', cap: '$12,500', pct: 100, barColor: 'bg-primary' },
                { name: 'Alimentación y Supermercado', spent: '$8,450', cap: '$9,000', pct: 93.8, barColor: 'bg-secondary' },
                { name: 'Entretenimiento & Ocio', spent: '$4,150', cap: '$4,500', pct: 92.2, barColor: 'bg-primary-container' },
                { name: 'Transporte & Gasolina', spent: '$3,800', cap: '$4,500', pct: 84.4, barColor: 'bg-outline' },
                { name: 'Salud y Farmacia', spent: '$2,100', cap: '$2,500', pct: 84.0, barColor: 'bg-tertiary-container' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between font-body-md text-body-md mb-1.5">
                    <span className="font-semibold text-on-surface">{item.name}</span>
                    <span className="text-on-surface tabular-nums font-bold">
                      {item.spent} <span className="text-on-surface-variant font-normal text-xs">/ {item.cap}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${item.barColor} rounded-full transition-all`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
              <span className="text-xs font-semibold text-on-surface">93.1% del presupuesto global consumido</span>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">Quedan 3 días</span>
          </div>
        </div>
      </section>
    </div>
  );
};
