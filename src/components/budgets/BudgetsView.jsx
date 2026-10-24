import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabase } from '../../lib/supabase';

export const BudgetsView = () => {
  const { kpis, categories, transactions, refreshFinancialData } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter expense categories that have budgets set
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spend per category from real transactions
  const categoryBudgets = expenseCategories.map((cat) => {
    const limit = Number(cat.budget_monthly) || 0;
    const catTransactions = transactions.filter((t) => t.category === cat.name && t.type === 'expense');
    const spent = catTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    const left = limit - spent;

    let status = 'Holgado';
    let statusClass = 'bg-secondary-fixed text-on-secondary-fixed';
    let barColor = 'bg-secondary';
    let isWarning = false;

    if (limit > 0) {
      if (pct >= 100) {
        status = 'Excedido';
        statusClass = 'bg-error-container text-on-error-container';
        barColor = 'bg-error';
        isWarning = true;
      } else if (pct >= 85) {
        status = 'Alerta';
        statusClass = 'bg-tertiary-fixed text-on-tertiary-fixed';
        barColor = 'bg-tertiary';
        isWarning = true;
      }
    }

    return {
      id: cat.id,
      name: cat.name,
      spent,
      limit,
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

  const totalBudgeted = categoryBudgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = kpis.monthlyExpenses;
  const globalPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const globalRemaining = Math.max(0, totalBudgeted - totalSpent);

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !budgetLimit) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ budget_monthly: parseFloat(budgetLimit) })
        .eq('id', selectedCatId);

      if (error) throw error;
      setBudgetLimit('');
      setIsModalOpen(false);
      await refreshFinancialData();
    } catch (err) {
      alert('Error asignando presupuesto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Control Preventivo de Egresos
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Presupuestos Mensuales
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Límites de gasto calibrados por categoría con monitoreo de consumo en tiempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          <span>Ajustar presupuesto</span>
        </button>
      </div>

      {/* Hero Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                    Gasto Consolidado del Periodo
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-metric-lg text-headline-lg font-bold text-on-surface tabular-nums">
                      ${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      de <strong className="text-on-surface font-semibold">${totalBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>{globalPct.toFixed(1)}% Consumido</span>
              </div>
            </div>

            {/* Track */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="relative h-4 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                <div
                  className={`h-full transition-all ${globalPct > 100 ? 'bg-error' : 'bg-secondary'}`}
                  style={{ width: `${Math.min(100, globalPct)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>$0.00 MXN</span>
                <span>Límite total presupuestado: ${totalBudgeted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium">Disponible Restante</span>
                <span className="text-lg font-bold text-on-surface tabular-nums mt-0.5">
                  ${globalRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col border border-surface-container">
                <span className="text-xs text-on-surface-variant font-medium">Categorías con límite</span>
                <span className="text-lg font-bold text-secondary tabular-nums mt-0.5">
                  {categoryBudgets.filter(b => b.limit > 0).length} activas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Meta de Ahorro
            </span>
            <div className="mt-2 text-headline-md font-bold text-on-surface">
              {kpis.savingsRate}% <span className="text-xs font-normal text-on-surface-variant">del ingreso</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {kpis.monthlyIncome > 0
                ? `De tus ingresos ($${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}) has conservado $${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}.`
                : 'Registra tus ingresos de nómina o rendimientos para calcular tu tasa de ahorro.'}
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl mt-4 text-xs text-on-surface-variant">
            Recomendación: Destina al menos 20% a fondo de emergencias e inversiones.
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
          Presupuesto por Categoría
        </h2>

        {categoryBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgets.map((b) => (
              <div
                key={b.id}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">{b.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-on-surface">{b.name}</h4>
                        <span className="text-xs text-on-surface-variant">
                          Límite: ${b.limit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${b.statusClass}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-on-surface mb-1.5">
                      <span>Gastado: ${b.spent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      <span>{b.rawPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full ${b.barColor} rounded-full transition-all`}
                        style={{ width: `${b.pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                  <span>
                    {b.left >= 0
                      ? `Te quedan $${b.left.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                      : `Excedido por $${Math.abs(b.left).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCatId(b.id);
                      setBudgetLimit(String(b.limit));
                      setIsModalOpen(true);
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Editar límite
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
            <p className="text-on-surface-variant font-medium">No hay categorías de gastos configuradas.</p>
          </div>
        )}
      </div>

      {/* Modal Ajustar Presupuesto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md font-bold text-on-surface">Asignar Presupuesto</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateBudget} className="space-y-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Categoría
                  </label>
                  <select
                    value={selectedCatId || (expenseCategories[0]?.id || '')}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant focus:border-primary outline-none"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Límite Mensual (MXN)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-on-surface-variant">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      placeholder="ej. 5000.00"
                      required
                      className="w-full h-11 pl-8 pr-3 bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                  >
                    {saving ? 'Guardando...' : 'Guardar Límite'}
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
