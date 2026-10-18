import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const BudgetsView = () => {
  const { kpis } = useFinance();
  const [periodType, setPeriodType] = useState('current'); // 'current' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Category Budgets Data
  const [categoryBudgets] = useState([
    {
      id: 'b-1',
      name: 'Despensa y Víveres',
      typeLabel: 'Gasto Variable Esencial',
      spent: 8450.0,
      limit: 8500.0,
      pct: 99.4,
      status: 'Alerta',
      statusClass: 'bg-error-container text-on-error-container',
      barColor: 'bg-tertiary-container',
      left: '$50.00 MXN',
      icon: 'shopping_cart',
      alertMsg: 'Te quedan: $50.00 MXN',
      isWarning: true,
    },
    {
      id: 'b-2',
      name: 'Renta y Servicios',
      typeLabel: 'Gasto Fijo Mensual',
      spent: 12500.0,
      limit: 12500.0,
      pct: 100.0,
      status: 'Límite Justo',
      statusClass: 'bg-surface-variant text-primary',
      barColor: 'bg-surface-tint',
      left: '$0.00 por pagar',
      icon: 'home',
      alertMsg: 'Justo al límite pactado',
      isWarning: false,
    },
    {
      id: 'b-3',
      name: 'Transporte y Gasolina',
      typeLabel: 'Movilidad Urbana',
      spent: 3800.0,
      limit: 4500.0,
      pct: 84.4,
      status: '84.4%',
      statusClass: 'bg-secondary-fixed text-on-secondary-fixed',
      barColor: 'bg-secondary',
      left: '$700.00 MXN',
      icon: 'directions_car',
      alertMsg: 'Disponible: $700.00 MXN',
      isWarning: false,
    },
    {
      id: 'b-4',
      name: 'Entretenimiento & Ocio',
      typeLabel: 'Restaurantes, Cine, Salidas',
      spent: 4150.0,
      limit: 5000.0,
      pct: 83.0,
      status: '83.0%',
      statusClass: 'bg-secondary-fixed text-on-secondary-fixed',
      barColor: 'bg-secondary',
      left: '$850.00 MXN',
      icon: 'movie',
      alertMsg: 'Disponible: $850.00 MXN',
      isWarning: false,
    },
    {
      id: 'b-5',
      name: 'Salud y Farmacia',
      typeLabel: 'Consultas y Suplementos',
      spent: 2100.0,
      limit: 2500.0,
      pct: 84.0,
      status: '84.0%',
      statusClass: 'bg-secondary-fixed text-on-secondary-fixed',
      barColor: 'bg-secondary',
      left: '$400.00 MXN',
      icon: 'medical_services',
      alertMsg: 'Disponible: $400.00 MXN',
      isWarning: false,
    },
    {
      id: 'b-6',
      name: 'Ropa y Calzado',
      typeLabel: 'Gasto No Esencial',
      spent: 800.0,
      limit: 2000.0,
      pct: 40.0,
      status: '40.0%',
      statusClass: 'bg-secondary-container text-on-secondary-container',
      barColor: 'bg-secondary',
      left: '$1,200.00 MXN',
      icon: 'apparel',
      alertMsg: 'Disponible: $1,200.00 MXN',
      isWarning: false,
    },
  ]);

  // Historical compliance
  const historyCompliance = [
    { month: 'Mayo 2026', cap: '$33,000', spent: '$31,450 (95.3%)', pct: '95.3%', ok: true },
    { month: 'Junio 2026', cap: '$34,000', spent: '$32,100 (94.4%)', pct: '94.4%', ok: true },
    { month: 'Julio 2026', cap: '$34,000', spent: '$36,200 (+6.4%)', pct: '100%', ok: false, error: true },
    { month: 'Agosto 2026', cap: '$35,000', spent: '$33,800 (96.5%)', pct: '96.5%', ok: true },
    { month: 'Sept. 2026', cap: '$35,000', spent: '$33,900 (96.8%)', pct: '96.8%', ok: true },
    { month: 'Oct. 2026', cap: '$35,000', spent: '$32,600 (93.1%)', pct: '93.1%', ok: true, current: true },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Command & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full font-label-md text-label-md bg-primary-fixed text-on-primary-fixed font-bold tracking-wider uppercase">
              Día 28 de 31
            </span>
            <span className="text-on-surface-variant font-label-md text-label-md">• Quedan 3 días</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1">
            Presupuestos de Octubre 2026
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Supervisión en tiempo real de techos de gasto operativo y fondeo patrimonial.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center bg-surface-container rounded-xl p-1">
            <button
              type="button"
              onClick={() => setPeriodType('current')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                periodType === 'current'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mes actual
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('history')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                periodType === 'history'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Histórico
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary font-body-md text-body-md font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Crear nuevo presupuesto</span>
          </button>
        </div>
      </div>

      {/* Hero Summary: Master Budget Progress & Monthly Savings Target */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Master Budget Card (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                    Gasto Operativo Consolidado
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-metric-lg text-headline-lg font-bold text-on-surface tabular-nums">
                      $32,600.00
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      de <strong className="text-on-surface font-semibold">$35,000.00 MXN</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>93.1% Consumido</span>
              </div>
            </div>

            {/* Segmented Tricolor Master Track */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="relative h-4 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                {/* Green zone (75%) */}
                <div className="h-full bg-secondary transition-all" style={{ width: '75%' }}></div>
                {/* Amber zone (15%) */}
                <div className="h-full bg-surface-tint opacity-80 transition-all" style={{ width: '15%' }}></div>
                {/* Crimson warning zone (3.1%) */}
                <div className="h-full bg-tertiary-container transition-all" style={{ width: '3.1%' }}></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-label-md text-on-surface-variant font-medium">
                <span>0% Inicial</span>
                <span>Umbral Seguro 75% ($26,250)</span>
                <span className="text-tertiary font-bold">Límite $35,000.00</span>
              </div>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-surface-container">
                <span className="font-label-md text-label-md text-on-surface-variant">Disponible Restante</span>
                <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums mt-0.5">
                  $2,400.00 <span className="text-xs font-normal text-on-surface-variant">MXN</span>
                </span>
                <span className="text-[11px] text-secondary font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">hourglass_top</span> 3 días restantes
                </span>
              </div>

              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-surface-container">
                <span className="font-label-md text-label-md text-on-surface-variant">Ritmo Diario Permitido</span>
                <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums mt-0.5">
                  $800.00 <span className="text-xs font-normal text-on-surface-variant">/día</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium mt-1">Hasta el 31 de Octubre</span>
              </div>

              <div className="bg-secondary-fixed/20 rounded-xl p-3 flex flex-col border border-secondary-fixed/40">
                <span className="font-label-md text-label-md text-on-secondary-fixed-variant">Proyección Cierre</span>
                <span className="font-metric-md text-metric-md font-bold text-secondary tabular-nums mt-0.5">
                  $34,800.00
                </span>
                <span className="text-[11px] text-secondary font-bold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span> Semáforo Verde (-$200)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Savings Target Card (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary shadow-sm">
                <span className="material-symbols-outlined text-2xl">savings</span>
              </div>
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                  Meta de Ahorro
                </span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Octubre 2026
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              104.3% 🎉
            </span>
          </div>

          <div className="flex flex-col gap-2 my-4">
            <div className="flex items-baseline justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant">Fondo acumulado</span>
              <div className="text-right">
                <span className="font-metric-lg text-metric-lg font-bold text-secondary tabular-nums">
                  $15,650.00
                </span>
                <span className="text-xs text-on-surface-variant block">Meta: $15,000.00 MXN</span>
              </div>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
              <div className="bg-secondary h-full rounded-full transition-all" style={{ width: '100%' }}></div>
            </div>
            <span className="font-label-md text-label-md text-secondary font-semibold flex items-center gap-1 text-xs">
              <span className="material-symbols-outlined text-sm">stars</span> Excedente de $650.00 transferido a liquidez
            </span>
          </div>

          {/* Emergency Cushion Micro-panel */}
          <div className="bg-surface-container-low rounded-xl p-3.5 flex items-center justify-between border border-surface-container">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Fondo de Emergencia Total
              </span>
              <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums mt-0.5">
                $156,000 <span className="text-xs font-normal text-on-surface-variant">MXN</span>
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 font-label-md text-label-md px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-primary-fixed font-bold">
                <span className="material-symbols-outlined text-xs">shield</span> 4.8 Meses
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">Cobertura segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Presupuestos por Categoría
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant font-bold">
              {categoryBudgets.length} Activos
            </span>
          </div>
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span> Óptimo &lt;75%</span>
            <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-surface-tint"></span> Atención 75%-95%</span>
            <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Alerta &gt;95%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryBudgets.map((b) => (
            <div
              key={b.id}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined text-xl">{b.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg font-bold text-on-surface leading-tight">
                        {b.name}
                      </h4>
                      <span className="font-label-md text-label-md text-on-surface-variant">{b.typeLabel}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${b.statusClass}`}>
                    {b.pct}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums">
                      ${b.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Consumido a la fecha</span>
                  </div>
                  <div className="text-right">
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant tabular-nums">
                      ${b.limit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-on-surface-variant block">Límite Asignado</span>
                  </div>
                </div>

                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className={`${b.barColor} h-full rounded-full transition-all`} style={{ width: `${b.pct}%` }}></div>
                </div>
              </div>

              <div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-surface-container">
                <div className={`flex items-center gap-1.5 ${b.isWarning ? 'text-error font-bold' : 'text-secondary font-semibold'}`}>
                  <span className="material-symbols-outlined text-base">
                    {b.isWarning ? 'warning' : 'check_circle'}
                  </span>
                  <span className="font-label-md text-label-md">{b.alertMsg}</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">3 días restantes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Compliance */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Histórico de Cumplimiento Presupuestario
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Rendimiento mensual de asignación vs gasto real en los últimos 6 períodos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> 5 Meses Cumplidos
            </span>
            <span className="flex items-center gap-1 font-label-md text-label-md text-tertiary font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> 1 Con Sobregiro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {historyCompliance.map((h, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 flex flex-col justify-between gap-2 border ${
                h.error
                  ? 'bg-error-container/20 border-error-container'
                  : 'bg-surface-container-low border-surface-container'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-bold text-on-surface">{h.month}</span>
                <span className={`material-symbols-outlined text-base ${h.error ? 'text-tertiary' : 'text-secondary'}`}>
                  {h.error ? 'error' : 'check_circle'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant">Presupuesto</span>
                <span className="font-body-md font-bold text-on-surface tabular-nums">{h.cap}</span>
                <span className={`text-[11px] mt-1 font-medium ${h.error ? 'text-tertiary font-bold' : 'text-secondary'}`}>
                  {h.spent}
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${h.error ? 'bg-tertiary-container' : 'bg-secondary'}`}
                  style={{ width: h.pct }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nuevo Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Crear Nuevo Presupuesto Mensual
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Presupuesto configurado exitosamente');
                  setIsModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Categoría Asociada
                  </label>
                  <select className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer">
                    <option>Despensa y Víveres</option>
                    <option>Transporte y Movilidad</option>
                    <option>Educación & Cursos</option>
                    <option>Vacaciones & Viajes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Límite Mensual Máximo (MXN)
                  </label>
                  <input
                    type="number"
                    placeholder="ej. 5000"
                    required
                    className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md border border-outline-variant/60 focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                  >
                    Guardar Presupuesto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
