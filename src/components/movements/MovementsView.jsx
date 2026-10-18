import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const MovementsView = () => {
  const { transactions, kpis, setIsNewMovementModalOpen } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState(['tx-1', 'tx-2']);

  // Extended movements based on fintrack_registro_de_movimientos
  const allMovements = [
    {
      id: 'tx-1',
      date: '28 Oct, 2026',
      time: '14:32 hrs',
      concept: 'Supermercado Walmart',
      detail: 'Despensa quincenal sucursal insurgentes',
      category: 'Despensa',
      subcategory: 'Cárnicos y verduras',
      tags: ['#Walmart', '#Semanal'],
      account: 'BBVA ••4829',
      type: 'expense',
      amount: -2430.5,
      icon: 'shopping_cart',
    },
    {
      id: 'tx-2',
      date: '28 Oct, 2026',
      time: '09:00 hrs',
      concept: 'Depósito Nómina Quincena 2',
      detail: 'Tech Consulting Group S.A.',
      category: 'Salario',
      subcategory: 'Honorarios directos',
      tags: ['#Nomina', '#Trabajo'],
      account: 'BBVA ••4829',
      type: 'income',
      amount: 24125.0,
      icon: 'work',
    },
    {
      id: 'tx-3',
      date: '27 Oct, 2026',
      time: '11:15 hrs',
      concept: 'Renta Departamento',
      detail: 'Mensualidad Departamento Nápoles',
      category: 'Vivienda',
      subcategory: 'Alquiler',
      tags: ['#Fijo', '#Hogar'],
      account: 'BBVA ••4829',
      type: 'expense',
      amount: -12500.0,
      icon: 'home',
    },
    {
      id: 'tx-4',
      date: '26 Oct, 2026',
      time: '18:40 hrs',
      concept: 'Farmacias del Ahorro',
      detail: 'Antibióticos y analgésicos',
      category: 'Salud',
      subcategory: 'Farmacia',
      tags: ['#Salud', '#Receta'],
      account: 'Nu ••9102',
      type: 'expense',
      amount: -740.0,
      icon: 'medical_services',
    },
    {
      id: 'tx-5',
      date: '25 Oct, 2026',
      time: '12:00 hrs',
      concept: 'Intereses CETES 28d',
      detail: 'Rendimiento mensual Bono M',
      category: 'Inversión',
      subcategory: 'Renta Fija',
      tags: ['#Cetes', '#Rendimiento'],
      account: 'Cetesdirecto',
      type: 'income',
      amount: 1032.4,
      icon: 'trending_up',
    },
    {
      id: 'tx-6',
      date: '24 Oct, 2026',
      time: '16:20 hrs',
      concept: 'Uber Trip Santa Fe',
      detail: 'Viaje reunión cliente',
      category: 'Transporte',
      subcategory: 'Taxis / App',
      tags: ['#Uber', '#Deducible'],
      account: 'Nu ••9102',
      type: 'expense',
      amount: -185.0,
      icon: 'local_taxi',
    },
    {
      id: 'tx-7',
      date: '22 Oct, 2026',
      time: '20:10 hrs',
      concept: 'Suscripción Netflix Premium',
      detail: 'Cargo recurrente mensual',
      category: 'Entretenimiento',
      subcategory: 'Streaming',
      tags: ['#Suscripcion'],
      account: 'Nu ••9102',
      type: 'expense',
      amount: -299.0,
      icon: 'movie',
    },
    {
      id: 'tx-8',
      date: '20 Oct, 2026',
      time: '13:45 hrs',
      concept: 'Amazon México',
      detail: 'Teclado mecánico ergonómico',
      category: 'Trabajo',
      subcategory: 'Equipo de Cómputo',
      tags: ['#Amazon', '#Tech'],
      account: 'Nu ••9102',
      type: 'expense',
      amount: -1890.0,
      icon: 'shopping_bag',
    },
  ];

  // Filter logic
  const filtered = allMovements.filter((m) => {
    const matchSearch =
      m.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === 'all' || m.type === filterType;
    const matchCategory = filterCategory === 'all' || m.category === filterCategory;

    return matchSearch && matchType && matchCategory;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((m) => m.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Movimientos
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label-md text-label-md bg-surface-container-high text-on-surface-variant font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block mr-1.5"></span>
              142 movimientos en Octubre 2026
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Bitácora unificada de flujos de efectivo, transferencias y dispersión de gasto.
          </p>
        </div>

        {/* Quick Stat Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-sm font-bold">arrow_downward</span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">
                Ingresos
              </span>
              <span className="font-metric-md text-metric-md text-secondary font-bold tabular-nums">
                +${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">
                Gastos
              </span>
              <span className="font-metric-md text-metric-md text-tertiary font-bold tabular-nums">
                -${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-on-primary shadow-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed">
              <span className="material-symbols-outlined text-sm">account_balance</span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-primary-fixed uppercase font-semibold">
                Balance Neto
              </span>
              <span className="font-metric-md text-metric-md text-on-primary font-bold tabular-nums">
                +${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Command Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-4">
        {/* Search & Actions */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-2xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descripción, comercio, etiqueta o nota..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-20 py-2.5 rounded-xl font-body-md text-body-md border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-on-surface-variant hover:text-on-surface"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Bulk Action Strip & New Movement CTA */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-body-md text-body-md">
                <span className="font-label-md text-label-md bg-primary-container text-on-primary px-2 py-0.5 rounded-full font-bold">
                  {selectedIds.length}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold mr-1">
                  Sel.
                </span>
                <button
                  type="button"
                  onClick={() => alert(`Cambiando categoría de ${selectedIds.length} elementos`)}
                  className="px-2 py-1 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
                >
                  Categoría
                </button>
                <span className="text-outline-variant">•</span>
                <button
                  type="button"
                  onClick={() => alert(`Eliminando ${selectedIds.length} elementos`)}
                  className="p-1 rounded hover:bg-error-container text-error hover:text-on-error-container"
                  title="Eliminar seleccionados"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => alert('Exportando a archivo Excel / CSV...')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-body-md font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">file_download</span>
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-body-md font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nuevo movimiento</span>
            </button>
          </div>
        </div>

        {/* Droplist Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">Tipo: Todos</option>
            <option value="expense">Solo Gastos</option>
            <option value="income">Solo Ingresos</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">Categorías: Todas</option>
            <option value="Despensa">Despensa</option>
            <option value="Salario">Salario</option>
            <option value="Vivienda">Vivienda</option>
            <option value="Transporte">Transporte</option>
            <option value="Salud">Salud</option>
            <option value="Inversión">Inversión</option>
            <option value="Entretenimiento">Entretenimiento</option>
          </select>

          {(filterType !== 'all' || filterCategory !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setSearchTerm('');
              }}
              className="text-primary font-semibold text-xs hover:underline ml-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Primary Transactions Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={selectAll}
                    className="w-4 h-4 rounded bg-surface-container text-primary focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Fecha & Hora</th>
                <th className="py-3 px-4 min-w-[200px]">Descripción / Comercio</th>
                <th className="py-3 px-3">Categoría & Subcat.</th>
                <th className="py-3 px-3">Etiquetas</th>
                <th className="py-3 px-3">Cuenta</th>
                <th className="py-3 px-3 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Monto (MXN)</th>
                <th className="py-3 px-3 text-center w-16">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
              {filtered.map((m) => {
                const isSelected = selectedIds.includes(m.id);
                const isPositive = m.amount > 0;
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-surface-container-low/80'
                        : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(m.id)}
                        className="w-4 h-4 rounded bg-surface-container text-primary focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{m.date}</div>
                      <div className="font-label-md text-label-md text-on-surface-variant">{m.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-xl">{m.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-on-surface truncate">{m.concept}</span>
                          <span className="font-label-md text-label-md text-on-surface-variant truncate">
                            {m.detail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{m.category}</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          {m.subcategory}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container font-label-md text-label-md font-semibold text-on-surface">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        {m.account}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${
                          isPositive
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-tertiary-fixed text-on-tertiary-fixed'
                        }`}
                      >
                        {isPositive ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold tabular-nums ${
                          isPositive ? 'text-secondary' : 'text-on-surface'
                        }`}
                      >
                        {isPositive ? '+' : ''}${Math.abs(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => alert(`Opciones para: ${m.concept}`)}
                        className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
