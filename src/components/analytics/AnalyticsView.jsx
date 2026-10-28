import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseDonutChart } from '../charts/ExpenseDonutChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { MonthComparisonBanner } from '../charts/MonthComparisonBanner';
import { MonthlyMatrixReport } from './MonthlyMatrixReport';

export const AnalyticsView = () => {
  const { transactions, kpis, categories, setIsNewMovementModalOpen, exchangeRate } = useFinance();

  const [periodFilter, setPeriodFilter] = useState('current'); // 'current' | 'prev' | 'all'
  const [selectedCategoryDrill, setSelectedCategoryDrill] = useState(null);

  const hasTransactions = transactions.length > 0;

  // Filter transactions according to selected period
  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    if (periodFilter === 'current') {
      return t.date.startsWith(kpis.currentMonthKey || '');
    }
    if (periodFilter === 'prev') {
      return t.date.startsWith(kpis.prevMonthKey || '');
    }
    return true; // 'all'
  });

  // Calculate filtered totals
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => {
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      return sum + Math.abs(t.amount) * mult;
    }, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => {
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      return sum + Math.abs(t.amount) * mult;
    }, 0);

  // Breakdown of expenses by category with subcategory detail for Pie / Donut & Drill-down
  const categoryTotals = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const catTransactions = filteredTransactions.filter(
        (t) => (t.categoryId === c.id || t.category === c.name) && t.type === 'expense'
      );

      const spent = catTransactions.reduce((sum, t) => {
        const mult = t.currency === 'USD' ? exchangeRate : 1;
        return sum + Math.abs(t.amount) * mult;
      }, 0);

      // Subcategories breakdown
      const subMap = {};
      catTransactions.forEach((t) => {
        const subName = t.subcategory || 'General / Sin subcategoría';
        const mult = t.currency === 'USD' ? exchangeRate : 1;
        const val = Math.abs(t.amount) * mult;
        if (!subMap[subName]) {
          subMap[subName] = { name: subName, amount: 0, count: 0 };
        }
        subMap[subName].amount += val;
        subMap[subName].count += 1;
      });

      const subcategories = Object.values(subMap)
        .map((sub) => ({
          ...sub,
          pctOfCategory: spent > 0 ? (sub.amount / spent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        id: c.id,
        name: c.name,
        spent,
        pct: totalFilteredExpense > 0 ? (spent / totalFilteredExpense) * 100 : 0,
        icon: c.icon || 'category',
        color: c.color || '#f97316',
        subcategories,
        transactionsCount: catTransactions.length,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Data formatted for ExpenseDonutChart
  // If user selected a category to drill down, show subcategories in the donut!
  const activeDrillCategory = categoryTotals.find((c) => c.id === selectedCategoryDrill || c.name === selectedCategoryDrill);

  const donutData = activeDrillCategory
    ? activeDrillCategory.subcategories.map((sub, idx) => ({
        label: sub.name,
        value: sub.amount,
        color: ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'][idx % 6],
      }))
    : categoryTotals.map((c) => ({
        label: c.name,
        value: c.spent,
        color: c.color,
        icon: c.icon,
      }));

  // Breakdown by income categories
  const incomeCategoryTotals = categories
    .filter((c) => c.type === 'income')
    .map((c) => {
      const amount = filteredTransactions
        .filter((t) => (t.categoryId === c.id || t.category === c.name) && t.type === 'income')
        .reduce((sum, t) => {
          const mult = t.currency === 'USD' ? exchangeRate : 1;
          return sum + Math.abs(t.amount) * mult;
        }, 0);

      return {
        id: c.id,
        name: c.name,
        amount,
        pct: totalFilteredIncome > 0 ? (amount / totalFilteredIncome) * 100 : 0,
        icon: c.icon || 'payments',
        color: c.color || '#006c4a',
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span>Inteligencia</span>
            <span className="text-outline">/</span>
            <span className="text-primary font-bold">Diagnóstico</span>
          </div>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Análisis Financiero
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5 max-w-2xl">
            Compara tus gastos e ingresos con el mes anterior y detecta patrones.
          </p>
        </div>

        {/* Period Selector Tabs (En mobile: Mes Actual y Mes Anterior a 50%/50%, Histórico solo en sm+) */}
        <div className="flex p-1 bg-surface-container-low rounded-xl self-stretch sm:self-auto border border-surface-container justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => setPeriodFilter('current')}
            className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              periodFilter === 'current'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Mes Actual
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('prev')}
            className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              periodFilter === 'prev'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Mes Anterior
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            className={`hidden sm:inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              periodFilter === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todo el Histórico
          </button>
        </div>
      </section>

      {!hasTransactions ? (
        /* Empty State Informativo */
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
        /* Analytics Dashboard View */
        <div className="space-y-6">
          {/* 1. Core Goal Banner: ¿Gasté más o ahorré más respecto al mes anterior? */}
          <MonthComparisonBanner kpis={kpis} />

          {/* 2. Top Summary KPI Cards & Run-rate pacing indicator */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Ingresos {periodFilter === 'current' ? 'del Mes Actual' : periodFilter === 'prev' ? 'del Mes Anterior' : 'Totales'}
              </span>
              <div className="text-2xl font-bold text-secondary mt-1 tabular-nums">
                +${totalFilteredIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                {incomeCategoryTotals.length} fuente(s) de ingreso activa(s)
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Gastos {periodFilter === 'current' ? 'del Mes Actual' : periodFilter === 'prev' ? 'del Mes Anterior' : 'Totales'}
              </span>
              <div className="text-2xl font-bold text-on-surface mt-1 tabular-nums">
                -${totalFilteredExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                {categoryTotals.length} categoría(s) con salidas de dinero
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                Dinero que te sobró (Ahorro)
              </span>
              <div className={`text-2xl font-bold mt-1 tabular-nums ${
                totalFilteredIncome >= totalFilteredExpense ? 'text-secondary' : 'text-error'
              }`}>
                {totalFilteredIncome >= totalFilteredExpense ? '+' : ''}${(totalFilteredIncome - totalFilteredExpense).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </div>
              <span className="text-xs text-on-surface-variant mt-1 block">
                Porcentaje ahorrado:{' '}
                {totalFilteredIncome > 0
                  ? `${Math.max(0, (((totalFilteredIncome - totalFilteredExpense) / totalFilteredIncome) * 100)).toFixed(1)}% de tus ingresos`
                  : '0.0%'}
              </span>
            </div>

            {/* Run-Rate / Pacing Card */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                    Ritmo de Gasto Actual
                  </span>
                  <span className="material-symbols-outlined text-primary text-base">speed</span>
                </div>
                <div className="text-2xl font-bold text-on-surface mt-1 tabular-nums">
                  ${(kpis.dailySpendingRate || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-xs text-on-surface-variant font-normal">/día</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-surface-container/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Cierre estimado:</span>
                  <span className="font-bold text-on-surface tabular-nums">
                    ${(kpis.projectedMonthEndExpenses || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  {kpis.projectedVsPrevExpensesDiff > 0 ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Proyecta +{Math.abs(kpis.projectedSavingsVsPrev || 0).toFixed(0)}% vs mes pasado
                    </span>
                  ) : (
                    <span className="text-secondary font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_down</span>
                      Proyecta menor gasto que mes pasado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Section: ¿En qué gasto más? (Gráfica de Pastel / Dona) & Evolución Mensual (Gráfica de Barras) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gráfica de Pastel/Dona: Distribución de Gastos */}
            <div className="lg:col-span-6 p-4 sm:p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
                        <span>
                          {activeDrillCategory ? `Subcategorías de ${activeDrillCategory.name}` : '¿En qué gasto más?'}
                        </span>
                      </h3>
                      {activeDrillCategory && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryDrill(null)}
                          className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Volver a todas las categorías"
                        >
                          <span className="material-symbols-outlined text-xs">arrow_back</span>
                          <span>Ver todas</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {activeDrillCategory
                        ? `Desglose interno de los $${activeDrillCategory.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })} gastados en ${activeDrillCategory.name}.`
                        : 'Toca cualquier categoría para ver en qué subcategorías se fue tu dinero.'}
                    </p>
                  </div>
                </div>

                {donutData.length > 0 ? (
                  <ExpenseDonutChart
                    data={donutData}
                    currency="MXN"
                    size={240}
                    selectedLabel={activeDrillCategory ? null : selectedCategoryDrill}
                    onSelectSlice={(slice) => {
                      if (!activeDrillCategory) {
                        setSelectedCategoryDrill(slice.label);
                      }
                    }}
                  />
                ) : (
                  <p className="text-sm text-on-surface-variant italic py-12 text-center">
                    No se registran gastos en el periodo seleccionado.
                  </p>
                )}
              </div>

              {categoryTotals.length > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    {activeDrillCategory ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryDrill(null)}
                        className="text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">arrow_back</span>
                        <span>Regresar al panorama general</span>
                      </button>
                    ) : (
                      <>Mayor gasto: <strong className="text-on-surface">{categoryTotals[0].name}</strong></>
                    )}
                  </span>
                  <span className="font-bold text-primary tabular-nums">
                    {activeDrillCategory
                      ? `${activeDrillCategory.pct.toFixed(1)}% del gasto total`
                      : `${categoryTotals[0].pct.toFixed(1)}% del total`}
                  </span>
                </div>
              )}
            </div>

            {/* Gráfica de Barras: Comparación Mensual Histórica */}
            <div className="lg:col-span-6 p-4 sm:p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-xl">bar_chart</span>
                      <span>Evolución Mensual (Últimos 6 Meses)</span>
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Comparativa de Ingresos vs. Gastos para verificar tu ahorro mes a mes.
                    </p>
                  </div>
                </div>

                <MonthlyBarChart history={kpis.monthlyHistory} />
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span>Mes en curso: <strong>${kpis.monthlyExpenses?.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</strong> gastos</span>
                <span>Mes previo: <strong>${kpis.prevMonthExpenses?.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</strong> gastos</span>
              </div>
            </div>
          </div>

          {/* 4. Top Categorías y Fugas de Dinero con Desglose de Subcategorías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gastos Críticos con Acordeón / Desglose de Subcategorías */}
            <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">local_fire_department</span>
                  <span>
                    Ranking de Fugas <span className="hidden sm:inline font-normal text-on-surface-variant text-sm">(Top Gastos)</span>
                  </span>
                </h3>
                {selectedCategoryDrill && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryDrill(null)}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Cerrar
                  </button>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                Toca cualquier categoría para ver su distribución interna.
              </p>

              {categoryTotals.length > 0 ? (
                <div className="space-y-3">
                  {categoryTotals.slice(0, 6).map((c, i) => {
                    const isExpanded = selectedCategoryDrill === c.name || selectedCategoryDrill === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`p-2.5 sm:p-3 rounded-xl transition-all border ${
                          isExpanded
                            ? 'bg-surface-container-low border-primary/30 shadow-xs'
                            : 'bg-transparent border-transparent hover:bg-surface-container-low/60'
                        }`}
                      >
                        <div
                          onClick={() => setSelectedCategoryDrill(isExpanded ? null : c.name)}
                          className="flex items-center justify-between gap-2 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-4 text-center text-xs font-bold text-on-surface-variant shrink-0">
                              #{i + 1}
                            </span>
                            <span
                              style={{ backgroundColor: c.color }}
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                            />
                            <span className={`text-sm truncate ${isExpanded ? 'text-primary font-bold' : 'text-on-surface font-semibold'}`}>
                              {c.name}
                            </span>
                            <span className="hidden sm:inline-block text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-semibold shrink-0">
                              {c.subcategories.length} subcat.
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 tabular-nums text-right">
                            <span className="font-bold text-on-surface text-sm">
                              ${c.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-on-surface-variant font-medium">
                              ({c.pct.toFixed(0)}%)
                            </span>
                            <span className="material-symbols-outlined text-base text-on-surface-variant">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>
                        </div>

                        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, c.pct)}%`, backgroundColor: c.color }}
                          ></div>
                        </div>

                        {/* Subcategory breakdown list when clicked */}
                        {isExpanded && (
                          <div className="mt-3.5 pt-3 border-t border-surface-container space-y-2 animate-fade-in pl-6">
                            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                              Distribución interna de {c.name}:
                            </span>
                            {c.subcategories.map((sub, sIdx) => (
                              <div key={sub.name + sIdx} className="flex items-center justify-between text-xs py-0.5">
                                <span className="text-on-surface flex items-center gap-1.5 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                  <span>{sub.name}</span>
                                </span>
                                <div className="tabular-nums flex items-center gap-2">
                                  <span className="font-bold text-on-surface">
                                    ${sub.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className="text-on-surface-variant text-[11px] w-10 text-right">
                                    {sub.pctOfCategory.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic py-6 text-center">
                  Sin egresos en este periodo.
                </p>
              )}
            </div>

            {/* Distribución de Fuentes de Ingreso */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">savings</span>
                <span>Fuentes de Ingreso Registradas</span>
              </h3>

              {incomeCategoryTotals.length > 0 ? (
                <div className="space-y-3.5">
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
                          style={{ width: `${Math.max(2, c.pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic py-6 text-center">
                  Sin ingresos registrados en este periodo.
                </p>
              )}
            </div>
          </div>

          {/* 5. Matriz Comparativa Detallada: Categoría x Categoría y Subcategoría x Subcategoría */}
          <MonthlyMatrixReport
            categories={categories}
            transactions={transactions}
            currentMonthKey={kpis.currentMonthKey}
            prevMonthKey={kpis.prevMonthKey}
            exchangeRate={exchangeRate}
          />
        </div>
      )}
    </div>
  );
};

