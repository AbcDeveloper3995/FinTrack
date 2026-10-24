import React, { useState } from 'react';

/**
 * Clean, Non-intrusive Matrix Comparison Report
 * Compares Current Month vs Previous Month across Categories and Subcategories
 * Displays Budget fulfillment status without cluttering.
 */
export const MonthlyMatrixReport = ({
  categories = [],
  transactions = [],
  currentMonthKey = '',
  prevMonthKey = '',
  exchangeRate = 1,
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const all = {};
    categories.forEach((c) => {
      all[c.id] = true;
    });
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Pre-filter transactions by month
  const currentMonthTxs = transactions.filter((t) => t.date && t.date.startsWith(currentMonthKey));
  const prevMonthTxs = transactions.filter((t) => t.date && t.date.startsWith(prevMonthKey));

  // Compute breakdown for categories
  const targetCategories = categories.filter((c) => c.type === activeTab);

  const reportData = targetCategories.map((cat) => {
    const budgetLimit = activeTab === 'expense' ? Number(cat.budget_monthly) || 0 : 0;

    // Filter txs
    const currCatTxs = currentMonthTxs.filter((t) => (t.categoryId === cat.id || t.category === cat.name) && t.type === activeTab);
    const prevCatTxs = prevMonthTxs.filter((t) => (t.categoryId === cat.id || t.category === cat.name) && t.type === activeTab);

    const currentSpent = currCatTxs.reduce((sum, t) => {
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      return sum + Math.abs(t.amount) * mult;
    }, 0);

    const prevSpent = prevCatTxs.reduce((sum, t) => {
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      return sum + Math.abs(t.amount) * mult;
    }, 0);

    // Difference
    const diff = currentSpent - prevSpent;
    const diffPct = prevSpent > 0 ? (diff / prevSpent) * 100 : (currentSpent > 0 ? 100 : 0);

    // Budget Status (Only for expenses)
    let budgetStatus = 'none'; // 'good' | 'warning' | 'danger'
    let budgetUsagePct = 0;
    if (budgetLimit > 0) {
      budgetUsagePct = (currentSpent / budgetLimit) * 100;
      if (budgetUsagePct >= 100) budgetStatus = 'danger';
      else if (budgetUsagePct >= 80) budgetStatus = 'warning';
      else budgetStatus = 'good';
    }

    // Subcategories Side by Side
    const subcategoryMap = {};

    // Initialize with declared subcategories
    if (cat.subcategories && Array.isArray(cat.subcategories)) {
      cat.subcategories.forEach((sub) => {
        subcategoryMap[sub.name] = { name: sub.name, current: 0, prev: 0 };
      });
    }

    // Accumulate Current
    currCatTxs.forEach((t) => {
      const sName = t.subcategory || 'General';
      if (!subcategoryMap[sName]) subcategoryMap[sName] = { name: sName, current: 0, prev: 0 };
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      subcategoryMap[sName].current += Math.abs(t.amount) * mult;
    });

    // Accumulate Prev
    prevCatTxs.forEach((t) => {
      const sName = t.subcategory || 'General';
      if (!subcategoryMap[sName]) subcategoryMap[sName] = { name: sName, current: 0, prev: 0 };
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      subcategoryMap[sName].prev += Math.abs(t.amount) * mult;
    });

    const subcategoriesList = Object.values(subcategoryMap)
      .map((sub) => {
        const subDiff = sub.current - sub.prev;
        const subDiffPct = sub.prev > 0 ? (subDiff / sub.prev) * 100 : (sub.current > 0 ? 100 : 0);
        return {
          ...sub,
          diff: subDiff,
          diffPct: subDiffPct,
        };
      })
      .filter((s) => s.current > 0 || s.prev > 0)
      .sort((a, b) => b.current - a.current);

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color || '#4338ca',
      icon: cat.icon || 'category',
      budgetLimit,
      budgetStatus,
      budgetUsagePct,
      currentSpent,
      prevSpent,
      diff,
      diffPct,
      subcategories: subcategoriesList,
    };
  }).filter((c) => c.currentSpent > 0 || c.prevSpent > 0 || c.budgetLimit > 0);

  // Totals Row
  const totalPrev = reportData.reduce((sum, c) => sum + c.prevSpent, 0);
  const totalCurr = reportData.reduce((sum, c) => sum + c.currentSpent, 0);
  const totalDiff = totalCurr - totalPrev;
  const totalDiffPct = totalPrev > 0 ? (totalDiff / totalPrev) * 100 : 0;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">table_chart</span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Matriz Comparativa: Mes Actual vs. Mes Anterior
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Compara importe por importe en qué categorías y subcategorías gastaste más o ahorraste respecto al mes pasado.
          </p>
        </div>

        {/* Tab Switcher & Expand/Collapse */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex p-0.5 bg-surface-container-low rounded-xl border border-surface-container">
            <button
              type="button"
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'expense'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Gastos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-surface-container-lowest text-secondary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Ingresos
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="px-2 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-medium transition-colors cursor-pointer"
              title="Expandir todas las subcategorías"
            >
              Expandir
            </button>
            <span className="text-outline">/</span>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2 py-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-medium transition-colors cursor-pointer"
              title="Colapsar todas las subcategorías"
            >
              Colapsar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {reportData.length > 0 ? (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Categoría & Subcategoría</th>
                <th className="py-3 px-3 text-right">Mes Anterior</th>
                <th className="py-3 px-3 text-right">Mes Actual</th>
                <th className="py-3 px-3 text-right">Variación ($ MXN)</th>
                <th className="py-3 px-3 text-center">Variación (%)</th>
                {activeTab === 'expense' && (
                  <th className="py-3 px-4 text-center min-w-[140px]">Estado de Presupuesto</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-sm font-medium text-on-surface">
              {reportData.map((cat) => {
                const isExpanded = Boolean(expandedCategories[cat.id]);
                const hasSubs = cat.subcategories.length > 0;
                const isHigher = cat.diff > 0;
                const isLower = cat.diff < 0;

                return (
                  <React.Fragment key={cat.id}>
                    {/* Category Row */}
                    <tr
                      onClick={() => hasSubs && toggleCategory(cat.id)}
                      className={`hover:bg-surface-container-low/60 transition-colors ${
                        hasSubs ? 'cursor-pointer' : ''
                      } ${isExpanded ? 'bg-surface-container-low/40' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {hasSubs ? (
                            <span className="material-symbols-outlined text-base text-on-surface-variant transition-transform">
                              {isExpanded ? 'expand_more' : 'chevron_right'}
                            </span>
                          ) : (
                            <span className="w-4"></span>
                          )}
                          <span
                            style={{ backgroundColor: cat.color }}
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          />
                          <span className="font-bold text-on-surface">
                            {cat.name}
                          </span>
                          {hasSubs && (
                            <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded font-semibold">
                              {cat.subcategories.length} subcat.
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prev Month */}
                      <td className="py-3 px-3 text-right tabular-nums text-on-surface-variant">
                        ${cat.prevSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Current Month */}
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-on-surface">
                        ${cat.currentSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Diff in $ */}
                      <td className={`py-3 px-3 text-right tabular-nums font-bold ${
                        activeTab === 'expense'
                          ? (isLower ? 'text-emerald-600 dark:text-emerald-400' : isHigher ? 'text-amber-600 dark:text-amber-400' : 'text-on-surface-variant')
                          : (isHigher ? 'text-secondary font-bold' : isLower ? 'text-error' : 'text-on-surface-variant')
                      }`}>
                        {cat.diff > 0 ? '+' : ''}${cat.diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Diff in % */}
                      <td className="py-3 px-3 text-center tabular-nums">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeTab === 'expense'
                              ? (isLower ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                 : isHigher ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                 : 'bg-surface-container text-on-surface-variant')
                              : (isHigher ? 'bg-secondary-fixed text-on-secondary-fixed'
                                 : isLower ? 'bg-error-container text-error'
                                 : 'bg-surface-container text-on-surface-variant')
                          }`}
                        >
                          {cat.diffPct > 0 ? `+${cat.diffPct.toFixed(1)}%` : `${cat.diffPct.toFixed(1)}%`}
                        </span>
                      </td>

                      {/* Budget Health Pill (Expenses only) */}
                      {activeTab === 'expense' && (
                        <td className="py-3 px-4 text-center">
                          {cat.budgetLimit > 0 ? (
                            <div className="flex flex-col items-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  cat.budgetStatus === 'good'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : cat.budgetStatus === 'warning'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-error-container text-error font-extrabold'
                                }`}
                              >
                                {cat.budgetStatus === 'good' && '🟢 En meta'}
                                {cat.budgetStatus === 'warning' && '🟡 80%+ usado'}
                                {cat.budgetStatus === 'danger' && '🔴 Excedido'}
                              </span>
                              <span className="text-[10px] text-on-surface-variant mt-0.5 tabular-nums">
                                ${cat.currentSpent.toFixed(0)} / ${cat.budgetLimit.toFixed(0)} ({cat.budgetUsagePct.toFixed(0)}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant/40">—</span>
                          )}
                        </td>
                      )}
                    </tr>

                    {/* Subcategories Rows (if expanded) */}
                    {isExpanded && cat.subcategories.map((sub, sIdx) => {
                      const isSubHigher = sub.diff > 0;
                      const isSubLower = sub.diff < 0;

                      return (
                        <tr
                          key={sub.name + sIdx}
                          className="bg-surface-container-low/20 text-xs hover:bg-surface-container-low/50 transition-colors"
                        >
                          <td className="py-2 pl-12 pr-4 text-on-surface-variant flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                            <span className="font-medium text-on-surface">{sub.name}</span>
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-on-surface-variant">
                            ${sub.prev.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-semibold text-on-surface">
                            ${sub.current.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-2 px-3 text-right tabular-nums font-semibold ${
                            activeTab === 'expense'
                              ? (isSubLower ? 'text-emerald-600 dark:text-emerald-400' : isSubHigher ? 'text-amber-600 dark:text-amber-400' : 'text-on-surface-variant')
                              : (isSubHigher ? 'text-secondary font-bold' : isSubLower ? 'text-error' : 'text-on-surface-variant')
                          }`}>
                            {sub.diff > 0 ? '+' : ''}${sub.diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-center tabular-nums text-[11px] font-semibold text-on-surface-variant">
                            {sub.diffPct > 0 ? `+${sub.diffPct.toFixed(1)}%` : `${sub.diffPct.toFixed(1)}%`}
                          </td>
                          {activeTab === 'expense' && (
                            <td className="py-2 px-4 text-center text-on-surface-variant/40">—</td>
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot>
              <tr className="bg-surface-container-low border-t-2 border-surface-container-high font-bold text-sm">
                <td className="py-3.5 px-4 text-on-surface uppercase tracking-wider text-xs">
                  Total Consolidado
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-on-surface-variant">
                  ${totalPrev.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-3 text-right tabular-nums text-on-surface text-base">
                  ${totalCurr.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className={`py-3.5 px-3 text-right tabular-nums ${
                  activeTab === 'expense'
                    ? (totalDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : totalDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-on-surface')
                    : (totalDiff > 0 ? 'text-secondary' : 'text-error')
                }`}>
                  {totalDiff > 0 ? '+' : ''}${totalDiff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-3 text-center tabular-nums">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'expense'
                      ? (totalDiff < 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300')
                      : 'bg-secondary-fixed text-on-secondary-fixed'
                  }`}>
                    {totalDiffPct > 0 ? `+${totalDiffPct.toFixed(1)}%` : `${totalDiffPct.toFixed(1)}%`}
                  </span>
                </td>
                {activeTab === 'expense' && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center text-sm text-on-surface-variant italic">
          No hay movimientos registrados en el mes actual ni en el mes anterior para comparar.
        </div>
      )}
    </div>
  );
};
