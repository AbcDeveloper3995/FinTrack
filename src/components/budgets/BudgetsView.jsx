import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabase } from '../../lib/supabase';
import { CustomSelect } from '../common/CustomSelect';

export const BudgetsView = () => {
  const { kpis, categories, transactions, refreshFinancialData, showToast } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

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

  // Only categories that HAVE an active budget set (> 0)
  const activeBudgets = categoryBudgets.filter((b) => b.hasLimit);
  // Categories that do NOT have a budget yet (for the creation dropdown)
  const availableToBudget = expenseCategories.filter((c) => (Number(c.budget_monthly) || 0) === 0);

  const totalBudgeted = activeBudgets.reduce((acc, b) => acc + b.limit, 0);
  const spentInBudgeted = activeBudgets.reduce((acc, b) => acc + b.spent, 0);
  const globalPct = totalBudgeted > 0 ? (spentInBudgeted / totalBudgeted) * 100 : 0;
  const globalRemaining = Math.max(0, totalBudgeted - spentInBudgeted);

  // Open modal to create a NEW budget (filters out already budgeted categories)
  const handleOpenCreateModal = () => {
    setIsEditingExisting(false);
    if (availableToBudget.length > 0) {
      setSelectedCatId(availableToBudget[0].id);
      setBudgetLimit('');
      setIsModalOpen(true);
    } else {
      showToast?.('Ya asignaste presupuesto a todas tus categorías de gasto.', 'info');
    }
  };

  // Open modal to EDIT an EXISTING budget
  const handleOpenEditModal = (budget) => {
    setIsEditingExisting(true);
    setSelectedCatId(budget.id);
    setBudgetLimit(String(budget.limit));
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
        showToast?.(`Tope de $${parsed.toLocaleString('es-MX')} guardado para "${targetCat?.name || 'la categoría'}".`);
      } else {
        showToast?.(`Se quitó el presupuesto para "${targetCat?.name || 'la categoría'}".`, 'info');
      }
    } catch (err) {
      alert('Error guardando tope: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header: Clean, only shows the button if there are active budgets and remaining categories */}
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

        {/* Action button in header: ONLY visible if the user already has budgets active */}
        {activeBudgets.length > 0 && availableToBudget.length > 0 && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-body-md text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>+ Presupuesto para otra categoría</span>
          </button>
        )}
      </div>

      {/* STATE 1: User has NO budgets defined yet (Single clear action) */}
      {activeBudgets.length === 0 ? (
        <div className="rounded-3xl p-8 sm:p-12 bg-surface-container-lowest border border-dashed border-outline-variant/60 shadow-sm flex flex-col items-center text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">pie_chart</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
            Aún no tienes presupuestos fijados
          </h3>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md leading-relaxed">
            Todas tus categorías inician libres de topes. Si deseas ponerle un límite a alguna en específico (por ejemplo solo a <strong>Comida</strong> o <strong>Salidas</strong>), puedes crearlo aquí.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span>Crear mi primer presupuesto</span>
          </button>
        </div>
      ) : (
        /* STATE 2: User has active budgets (Cards + Overview) */
        <div className="space-y-6">
          {/* Hero Summary */}
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
                        Gasto en categorías presupuestadas
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
                    <span>Tope total: ${totalBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col border border-surface-container">
                    <span className="text-xs text-on-surface-variant font-medium">Te queda disponible</span>
                    <span className={`text-lg font-extrabold tabular-nums mt-0.5 ${globalRemaining > 0 ? 'text-secondary' : 'text-error'}`}>
                      ${globalRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col border border-surface-container">
                    <span className="text-xs text-on-surface-variant font-medium">Categorías controladas</span>
                    <span className="text-lg font-extrabold text-primary tabular-nums mt-0.5">
                      {activeBudgets.length} de {expenseCategories.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guidance Box */}
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
              <div>
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                  Consejo de ahorro
                </span>
                <div className="mt-2 text-base font-bold text-on-surface">
                  Tu progreso en tiempo real
                </div>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Cada vez que anotes un gasto, las barras avanzan solas. Si quieres quitar un tope o cambiarlo, puedes hacerlo en cualquier momento desde su tarjeta.
                </p>
              </div>

              {availableToBudget.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-primary/20"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Fijar tope a otra categoría</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards ONLY for active budgets */}
          <div className="space-y-3 pt-2">
            <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
              <span>Tus Presupuestos Activos</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
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
                      onClick={() => handleOpenEditModal(b)}
                      className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">tune</span>
                      <span>Modificar o quitar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Fijar / Editar Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                  <h3 className="font-headline-md font-bold text-on-surface text-lg">
                    {isEditingExisting ? 'Modificar Presupuesto' : 'Crear Presupuesto'}
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
                  {isEditingExisting ? (
                    // In edit mode, show current category name
                    <div className="w-full h-11 px-3.5 bg-surface-container-low rounded-xl text-sm font-semibold text-on-surface flex items-center border border-surface-container">
                      {expenseCategories.find(c => c.id === selectedCatId)?.name || 'Categoría'}
                    </div>
                  ) : (
                    // In create mode: ONLY show categories that do NOT have a budget yet
                    <CustomSelect
                      value={selectedCatId || (availableToBudget[0]?.id || '')}
                      onChange={(val) => setSelectedCatId(val)}
                      options={availableToBudget.map((c) => ({
                        value: c.id,
                        label: c.name,
                        color: c.color,
                        icon: c.icon,
                      }))}
                      placeholder="Selecciona una categoría"
                    />
                  )}
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
                      placeholder="ej. 3000.00"
                      required
                      autoFocus
                      className="w-full h-11 pl-8 pr-3.5 bg-surface-container-lowest text-on-surface rounded-xl text-sm border border-outline-variant focus:border-primary outline-none tabular-nums font-bold"
                    />
                  </div>
                  {isEditingExisting && (
                    <span className="text-[11px] text-on-surface-variant mt-1 block">
                      Tip: Escribe <strong>0</strong> si deseas eliminar este presupuesto y dejar libre la categoría.
                    </span>
                  )}
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
