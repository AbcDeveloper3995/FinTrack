import React, { useState } from 'react';

export const AnalyticsView = () => {
  const [activeSection, setActiveSection] = useState('tab-a'); // 'tab-a' | 'tab-b' | 'tab-c'
  const [periodA, setPeriodA] = useState('Septiembre 2026 (30d)');
  const [periodB, setPeriodB] = useState('Octubre 2026 (31d)');
  const [normalized, setNormalized] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Interactive Navigation & Context Bar */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span>Motor de Inteligencia Financiera</span>
            <span className="text-outline">/</span>
            <span className="text-primary font-bold">Diagnóstico Comparativo</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
            Corte contable: 31 Octubre 2026, 23:59 CST
          </span>
        </div>

        {/* Section Tabs and Period Selectors */}
        <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-surface-container-low rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('tab-a')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-body-md font-semibold transition-all whitespace-nowrap ${
                activeSection === 'tab-a'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Sección A: Comparativa Mes vs Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tab-b')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-body-md font-semibold transition-all whitespace-nowrap ${
                activeSection === 'tab-b'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">pie_chart</span>
              <span>Sección B: Análisis Detallado</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tab-c')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-md text-body-md font-semibold transition-all whitespace-nowrap ${
                activeSection === 'tab-c'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">query_stats</span>
              <span>Sección C: Tendencias y Proyecciones</span>
            </button>
          </div>

          {/* Period Selectors */}
          <div className="flex flex-wrap items-center gap-2 px-2">
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface">
              <span className="font-label-md text-label-md font-bold text-on-surface-variant uppercase">Mes A</span>
              <select
                value={periodA}
                onChange={(e) => setPeriodA(e.target.value)}
                className="bg-transparent font-body-md text-body-md font-medium text-on-surface outline-none cursor-pointer"
              >
                <option>Septiembre 2026 (30d)</option>
                <option>Agosto 2026 (31d)</option>
              </select>
            </div>

            <span className="font-label-md text-label-md font-bold text-primary px-1">VS</span>

            <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg text-on-surface shadow-inner">
              <span className="font-label-md text-label-md font-bold text-primary uppercase">Mes B</span>
              <select
                value={periodB}
                onChange={(e) => setPeriodB(e.target.value)}
                className="bg-transparent font-body-md text-body-md font-bold text-primary outline-none cursor-pointer"
              >
                <option>Octubre 2026 (31d)</option>
                <option>Noviembre 2026 (Est.)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => alert('Generando informe ejecutivo comparativo en PDF...')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base text-primary">picture_as_pdf</span>
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Highlight Verdict Executive Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-container via-surface-tint to-primary text-on-primary p-6 sm:p-8 shadow-md">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-surface-container-lowest/15 backdrop-blur-md flex items-center justify-center text-secondary-fixed shadow-sm">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md uppercase tracking-wider font-bold">
                  Veredicto Ejecutivo
                </span>
                <span className="font-label-md text-label-md text-on-primary-container">
                  Eficacia Presupuestaria: Grado A+
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-primary font-bold tracking-tight">
                🎉 ¡Excelente progreso! En Octubre ahorraste <span className="text-secondary-fixed">$3,450.00 MXN MÁS</span> que en Septiembre.
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container mt-1 max-w-3xl">
                La ganancia neta estuvo impulsada por una disciplina del <span className="text-on-primary font-bold">-23.6% en Entretenimiento</span> (-$1,280.00 MXN) sumada a una aceleración de entradas operativas del <span className="text-on-primary font-bold">+5.2%</span>.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-surface-container-lowest/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="font-label-md text-label-md text-on-primary-container uppercase font-semibold">
                Salud Financiera
              </div>
              <div className="font-metric-md text-headline-md font-bold text-on-primary">94 / 100</div>
            </div>
            <span className="material-symbols-outlined text-secondary-fixed text-3xl">speed</span>
          </div>
        </div>
      </section>

      {/* 4 Comparative Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Ingresos */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant font-bold">
                Ingresos Totales
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">payments</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
                $48,250.00
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">Oct</span>
            </div>
            <div className="font-body-md text-on-surface-variant flex items-center gap-1 text-xs">
              <span>Sep:</span>
              <span className="tabular-nums font-medium">$45,850.00</span>
            </div>
          </div>
          <div className="mt-4 bg-surface-container-low/60 rounded-xl p-2 flex items-center justify-between">
            <span className="flex items-center text-secondary font-label-md text-label-md font-bold">
              <span className="material-symbols-outlined text-base">arrow_drop_up</span>
              +$2,400.00 MXN
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              +5.2%
            </span>
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant font-bold">
                Gastos Totales
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
                $32,600.00
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">Oct</span>
            </div>
            <div className="font-body-md text-on-surface-variant flex items-center gap-1 text-xs">
              <span>Sep:</span>
              <span className="tabular-nums font-medium">$33,650.00</span>
            </div>
          </div>
          <div className="mt-4 bg-surface-container-low/60 rounded-xl p-2 flex items-center justify-between">
            <span className="flex items-center text-secondary font-label-md text-label-md font-bold">
              <span className="material-symbols-outlined text-base">arrow_drop_down</span>
              -$1,050.00 MXN
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              -3.1% (Favorable)
            </span>
          </div>
        </div>

        {/* Card 3: Ahorro Neto */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant font-bold">
                Ahorro Neto Real
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">savings</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-metric-lg text-metric-lg font-bold text-secondary tabular-nums tracking-tight">
                $15,650.00
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">Oct</span>
            </div>
            <div className="font-body-md text-on-surface-variant flex items-center gap-1 text-xs">
              <span>Sep:</span>
              <span className="tabular-nums font-medium">$12,200.00</span>
            </div>
          </div>
          <div className="mt-4 bg-surface-container-low/60 rounded-xl p-2 flex items-center justify-between">
            <span className="flex items-center text-secondary font-label-md text-label-md font-bold">
              <span className="material-symbols-outlined text-base">arrow_drop_up</span>
              +$3,450.00 MXN
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              +28.3%
            </span>
          </div>
        </div>

        {/* Card 4: Tasa de Conversión */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant font-bold">
                Tasa de Retención
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">percent</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-metric-lg text-metric-lg font-bold text-on-surface tabular-nums tracking-tight">
                32.4%
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">de ingresos</span>
            </div>
            <div className="font-body-md text-on-surface-variant flex items-center gap-1 text-xs">
              <span>Sep:</span>
              <span className="tabular-nums font-medium">26.6%</span>
            </div>
          </div>
          <div className="mt-4 bg-surface-container-low/60 rounded-xl p-2 flex items-center justify-between">
            <span className="flex items-center text-secondary font-label-md text-label-md font-bold">
              <span className="material-symbols-outlined text-base">trending_up</span>
              +5.8 pp
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-bold">
              Meta 30% Superada
            </span>
          </div>
        </div>
      </section>

      {/* Comparative Grouped Bars by Category */}
      <section className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Comparativa por Categoría (Septiembre vs Octubre)
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Desglose directo de variaciones en pesos y porcentaje
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-outline-variant"></span>
              <span className="text-on-surface-variant">Septiembre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary"></span>
              <span className="text-on-surface">Octubre</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {[
            { cat: 'Vivienda', sep: '$12,500', oct: '$12,500', var: '$0.00 (0%)', sepW: '100%', octW: '100%', ok: true },
            { cat: 'Despensa y Víveres', sep: '$7,160', oct: '$8,450', var: '+$1,290 (+18.0%)', sepW: '60%', octW: '71%', ok: false },
            { cat: 'Entretenimiento & Ocio', sep: '$5,430', oct: '$4,150', var: '-$1,280 (-23.6%)', sepW: '46%', octW: '35%', ok: true },
            { cat: 'Transporte y Movilidad', sep: '$4,100', oct: '$3,800', var: '-$300 (-7.3%)', sepW: '35%', octW: '32%', ok: true },
            { cat: 'Salud y Farmacia', sep: '$2,360', oct: '$2,100', var: '-$260 (-11.0%)', sepW: '20%', octW: '18%', ok: true },
            { cat: 'Inversión & Rendimientos', sep: '$12,200', oct: '$15,650', var: '+$3,450 (+28.3%)', sepW: '78%', octW: '100%', ok: true, isInv: true },
          ].map((row, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-surface-container-low/50 border border-surface-container space-y-2">
              <div className="flex items-center justify-between font-body-md text-sm">
                <span className="font-bold text-on-surface">{row.cat}</span>
                <span className={`font-bold tabular-nums ${
                  row.ok ? 'text-secondary' : 'text-tertiary'
                }`}>
                  {row.var}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Sep: {row.sep}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-outline-variant h-full rounded-full" style={{ width: row.sepW }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface mb-1 font-semibold">
                    <span>Oct: {row.oct}</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: row.octW }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
