import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabase } from '../../lib/supabase';

export const BudgetsView = () => {
  const { kpis, categories, transactions, refreshFinancialData, showToast } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spend per category from real transactions
  const categoryBudgets = expenseCategories.map((cat) => {
    const limit = Number(cat.budget_monthly) || 0;
    const catTransactions = transactions.filter((t) => t.category === cat.name && t.type === 'expense');
    const spent = catTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const hasLimit = limit > 0;
    const pct = hasLimit ? (spent / limit) * 100 : 0;
    const left = limit - spent;

    let status = 'Vas bien';
    let statusClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    let barColor = 'bg-secondary';
    let isWarning = false;

    if (hasLimit) {
      if (pct >= 100) {
        status = 'Superado';
        statusClass = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
        barColor = 'bg-error';
        isWarning = true;
      } else if (pct >= 85) {
        status = 'Cerca del límite';
        statusClass = 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300';
        barColor = 'bg-amber-500';
        isWarning = true;
      }
    }

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color || '#4338ca',
      spent,
      limit,
      hasLimit,
      pct: Math.min(100, pct),
      rawPct: pct,
      status,
      statusClass,
      barColor,
      left,
      icon: cat.icon || 'shopping_cart',
      isWarning,
    };
  });

  // Separate active budgets from categories without limits
  const activeBudgets = categoryBudgets.filter((b) => b.hasLimit);
  const unbudgetedCategories = categoryBudgets.filter((b) => !b.hasLimit);

  const totalBudgeted = activeBudgets.reduce((acc, b) => acc + b.limit, 0);
  const spentInBudgeted = activeBudgets.reduce((acc, b) => acc + b.spent, 0);
  const globalPct = totalBudgeted > 0 ? (spentInBudgeted / totalBudgeted) * 100 : 0;
  const globalRemaining = Math.max(0, totalBudgeted - spentInBudgeted);

  const openSetBudgetModal = (category = null) => {
    const cat = category || (unbudgetedCategories[0] || expenseCategories[0]);
    if (cat) {
      setSelectedCatId(cat.id);
      setBudgetLimit(cat.limit > 0 ? String(cat.limit) : '');
    }
    setIsModalOpen(true);
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;

    setSaving(true);
    try {
      const parsed = parseFloat(budgetLimit) || 0;
      const { error } = await supabase
        .from('categories')
        .update({ budget_monthly: parsed })
        .eq('id', selectedCatId);

      if (error) throw error;
      
      const targetCat = expenseCategories.find(c => c.id === selectedCatId);
      setBudgetLimit('');
      setIsModalOpen(false);
      await refreshFinancialData();

      if (parsed > 0) {
        showToast?.(`Límite de $${parsed.toLocaleString('es-MX')} fijado para "${targetCat?.name || 'la categoría'}".`);
      } else {
        showToast?.(`Se quitó el límite de gasto para "${targetCat?.name || 'la categoría'}".`, 'info');
      }
    } catch (err) {
      alert('Error guardando límite: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Control de tus gastos
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Mis Presupuestos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ponte un tope mensual en lo que quieras controlar y evita sorpresas a fin de mes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openSetBudgetModal()}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-body-md text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Fijar un tope de gasto</span>
        </button>
      </div>

      {/* When user has NO budgets defined yet: Friendly Clean Welcome */}
      {activeBudgets.length === 0 ? (
        <div className="rounded-2xl p-6 sm:p-8 bg-surface-container-lowest border border-dashed border-outline-variant/60 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto my-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">pie_chart</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-on-surface">
            Aún no tienes presupuestos fijados
          </h3>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-md">
            Tus categorías inician sin límites para que tú decidas libremente en cuáles deseas ponerte un tope mensual (por ejemplo en Comida, Salidas o Transporte).
          </p>
          <button
            type="button"
            onClick={() => openSetBudgetModal()}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Crear mi primer presupuesto</span>
          </button>
        </div>
      ) : (
        /* Hero Summary when budgets ARE active */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-2xl">account_balance</span>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                      Lo que has gastado bajo presupuesto
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                      <span className="font-metric-lg text-headline-lg font-bold text-on-surface tabular-nums">
                        ${spentInBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        de <strong className="text-on-surface font-semibold">${totalBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start ${
                  globalPct >= 100
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : globalPct >= 85
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  <span>{globalPct.toFixed(0)}% del límite usado</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="relative h-3.5 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className={`h-full transition-all ${
                      globalPct >= 100 ? 'bg-error' : globalPct >= 85 ? 'bg-amber-500' : 'bg-secondary'
                    }`}
                    style={{ width: `${Math.min(100, globalPct)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <span>$0.00</span>
                  <span>Tope total fijado: ${totalBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col border border-surface-container">
                  <span className="text-xs text-on-surface-variant font-medium">Aún puedes gastar este mes</span>
                  <span className={`text-lg font-extrabold tabular-nums mt-0.5 ${globalRemaining > 0 ? 'text-secondary' : 'text-error'}`}>
                    ${globalRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col border border-surface-container">
                  <span className="text-xs text-on-surface-variant font-medium">Categorías controladas</span>
                  <span className="text-lg font-extrabold text-primary tabular-nums mt-0.5">
                    {activeBudgets.length} de {expenseCategories.length} con límite
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
            <div>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                ¿Cómo funciona?
              </span>
              <div className="mt-2 text-base font-bold text-on-surface">
                Tú decides en qué ponerte un tope
              </div>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Cada vez que anotas un gasto en una categoría con presupuesto, la barra avanza sola en tiempo real para avisarte si estás cerca de pasarte.
              </p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl mt-4 text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary shrink-0">lightbulb</span>
              <span>Tip: Puedes ajustar o quitar cualquier tope cuando cambien tus planes.</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Presupuestos que el usuario sí fijó */}
      {activeBudgets.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-headline-md text-lg sm:text-headline-md font-bold text-on-surface flex items-center gap-2">
            <span>Tus Categorías con Presupuesto</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {activeBudgets.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBudgets.map((b) => (
              <div
                key={b.id}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: `${b.color}20`, color: b.color }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                      >
                        <span className="material-symbols-outlined text-xl">{b.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-base">{b.name}</h4>
                        <span className="text-xs text-on-surface-variant">
                          Tope: ${b.limit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${b.statusClass}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1.5">
                      <span>Llevas gastado: ${b.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      <span className="tabular-nums">{b.rawPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${b.barColor} rounded-full transition-all`}
                        style={{ width: `${b.pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="font-medium">
                    {b.left >= 0 ? (
                      <span className="text-secondary font-bold">
                        Te quedan ${b.left.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-error font-bold">
                        Te pasaste por ${Math.abs(b.left).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCatId(b.id);
                      setBudgetLimit(String(b.limit));
                      setIsModalOpen(true);
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Cambiar tope
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Categorías que están en $0 (sin límite) */}
      {unbudgetedCategories.length > 0 && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                Otras categorías (sin límite de gasto)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Puedes dejar que corran libres o ponerles un tope si deseas controlarlas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unbudgetedCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container flex items-center justify-between hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">{cat.name}</div>
                    <div className="text-[11px] text-on-surface-variant tabular-nums">
                      {cat.spent > 0 ? `Gastado: $${cat.spent.toLocaleString('es-MX')} MXN` : 'Sin gastos este mes'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openSetBudgetModal(cat)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all cursor-pointer shrink-0"
                >
                  + Fijar tope
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ajustar Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                  <h3 className="font-headline-md font-bold text-on-surface text-lg">
                    Fijar Presupuesto Mensual
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    ¿En qué categoría?
                  </label>
                  <select
                    value={selectedCatId || (expenseCategories[0]?.id || '')}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-xl text-sm border border-outline-variant focus:border-primary outline-none cursor-pointer"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    ¿Cuál es el tope máximo que deseas gastar al mes? (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-on-surface-variant">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      placeholder="ej. 3000.00 (o 0 para quitar tope)"
                      required
                      autoFocus
                      className="w-full h-11 pl-8 pr-3.5 bg-surface-container-lowest text-on-surface rounded-xl text-sm border border-outline-variant focus:border-primary outline-none tabular-nums font-bold"
                    />
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1 block">
                    Tip: Si pones 0, esta categoría no tendrá límite y correrá libre.
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-on-surface-variant mr-1">Sugerido:</span>
                  {[1000, 2000, 3000, 5000, 8000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBudgetLimit(String(val))}
                      className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold tabular-nums cursor-pointer"
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <span>{saving ? 'Guardando...' : 'Guardar Tope'}</span>
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
