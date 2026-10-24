import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EditMovementModal } from '../modals/EditMovementModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const MovementsView = () => {
  const { transactions, tags, kpis, setIsNewMovementModalOpen, deleteTransactions, showToast } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [movementToEdit, setMovementToEdit] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    movement: null,
    isBulk: false,
    isLoading: false,
  });

  // Filter transactions
  const filtered = transactions.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    if (filterTag !== 'all') {
      const hasTag = m.tags && m.tags.some((t) => t.id === filterTag || t.name === filterTag);
      if (!hasTag) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchConcept = m.concept?.toLowerCase().includes(q);
      const matchCat = m.category?.toLowerCase().includes(q);
      const matchSub = m.subcategory?.toLowerCase().includes(q);
      const matchAcc = m.account?.toLowerCase().includes(q);
      const matchNote = m.notes?.toLowerCase().includes(q);
      const matchTag = m.tags?.some((t) => t.name.toLowerCase().includes(q));
      if (!matchConcept && !matchCat && !matchSub && !matchAcc && !matchNote && !matchTag) return false;
    }
    return true;
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      movement: null,
      isBulk: true,
      isLoading: false,
    });
  };

  const handleSingleDelete = (movement) => {
    setDeleteModalState({
      isOpen: true,
      movement,
      isBulk: false,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModalState((prev) => ({ ...prev, isLoading: true }));

    if (deleteModalState.isBulk) {
      const count = selectedIds.length;
      const res = await deleteTransactions(selectedIds, true);
      setDeleteModalState({ isOpen: false, movement: null, isBulk: false, isLoading: false });

      if (res.error) {
        showToast('Error eliminando movimientos: ' + res.error, 'error', 'Error');
      } else {
        setSelectedIds([]);
        showToast(`Se eliminaron ${count} movimiento(s) y sus saldos fueron revertidos.`, 'info', 'Movimientos eliminados');
      }
    } else if (deleteModalState.movement) {
      const movement = deleteModalState.movement;
      const res = await deleteTransactions([movement.id], true);
      setDeleteModalState({ isOpen: false, movement: null, isBulk: false, isLoading: false });

      if (res.error) {
        showToast('Error eliminando movimiento: ' + res.error, 'error', 'Error');
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== movement.id));
        showToast(`El movimiento "${movement.concept}" fue eliminado y su saldo revertido.`, 'info', 'Movimiento eliminado');
      }
    }
  };

  // Get unique categories for dropdown
  const uniqueCategories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Registro Financiero
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Historial de Movimientos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Bitácora unificada con desglose por categoría, subcategoría, cuenta y acciones rápidas.
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
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-primary">
              <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">
                Gastos
              </span>
              <span className="font-metric-md text-metric-md text-on-surface font-bold tabular-nums">
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
                {kpis.netBalance >= 0 ? '+' : ''}${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
              placeholder="Buscar por concepto, subcategoría, etiqueta (#) o nota..."
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
                  onClick={handleDeleteSelected}
                  className="p-1 rounded hover:bg-error-container text-error hover:text-on-error-container flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Eliminar seleccionados"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>Eliminar selección</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nuevo movimiento</span>
            </button>
          </div>
        </div>

        {/* Droplist Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">Tipo: Todos</option>
            <option value="expense">Solo Gastos</option>
            <option value="income">Solo Ingresos</option>
            <option value="transfer">Solo Transferencias</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">Categorías: Todas</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {tags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Etiqueta: Todas</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.name}
                </option>
              ))}
            </select>
          )}

          {(filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterTag('all');
                setSearchTerm('');
              }}
              className="text-primary font-semibold text-xs hover:underline ml-2 cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Primary Transactions Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden flex flex-col">
        {filtered.length > 0 ? (
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
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-4 min-w-[200px]">Descripción / Concepto</th>
                  <th className="py-3 px-3">Categoría & Subcat.</th>
                  <th className="py-3 px-3">Etiquetas</th>
                  <th className="py-3 px-3">Cuenta</th>
                  <th className="py-3 px-3 text-center">Tipo</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-3 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                {filtered.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  const isPositive = m.amount > 0;
                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors group ${
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
                      <td className="py-3 px-3 whitespace-nowrap text-on-surface-variant tabular-nums">
                        {m.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-xl">{m.icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-on-surface truncate">{m.concept}</span>
                            {m.notes && (
                              <span className="font-label-md text-label-md text-on-surface-variant truncate">
                                {m.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-sm">{m.category}</span>
                          {m.subcategory && (
                            <span className="text-xs text-on-surface-variant">
                              ↳ {m.subcategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {m.tags && m.tags.length > 0 ? (
                            m.tags.map((tag) => (
                              <span
                                key={tag.id}
                                style={{ backgroundColor: `${tag.color || '#4338ca'}20`, color: tag.color || '#4338ca' }}
                                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              >
                                #{tag.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-on-surface-variant/50">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container font-label-md text-label-md font-semibold text-on-surface">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          {m.account}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${
                            m.type === 'transfer'
                              ? 'bg-primary-container/30 text-primary border border-primary/20'
                              : isPositive
                              ? 'bg-secondary-fixed text-on-secondary-fixed'
                              : 'bg-surface-container text-primary'
                          }`}
                        >
                          {m.type === 'transfer' ? 'Transferencia' : isPositive ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold tabular-nums ${
                            m.type === 'transfer'
                              ? m.amount > 0 ? 'text-secondary' : 'text-primary'
                              : isPositive
                              ? 'text-secondary'
                              : 'text-on-surface'
                          }`}
                        >
                          {m.amount > 0 ? '+' : ''}${Math.abs(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          <span className="text-[10px] text-on-surface-variant font-normal ml-1">
                            {m.currency || 'MXN'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setMovementToEdit(m)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Editar movimiento"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSingleDelete(m)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                            title="Eliminar movimiento directamente"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Sin movimientos que mostrar
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1 max-w-md">
              Aún no tienes movimientos registrados en tu bitácora o los filtros aplicados no arrojaron resultados.
            </p>
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Registrar primer movimiento</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Movement Modal */}
      <EditMovementModal
        movement={movementToEdit}
        isOpen={Boolean(movementToEdit)}
        onClose={() => setMovementToEdit(null)}
      />

      {/* Confirm Modal para eliminar movimientos */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, movement: null, isBulk: false, isLoading: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModalState.isBulk ? `¿Eliminar ${selectedIds.length} movimiento(s)?` : '¿Eliminar este movimiento?'}
        message={
          deleteModalState.isBulk
            ? `Estás a punto de borrar ${selectedIds.length} movimientos seleccionados. Los importes se revertirán automáticamente en los saldos de sus cuentas correspondientes.`
            : `¿Deseas eliminar el movimiento "${deleteModalState.movement?.concept || 'este movimiento'}"? Su importe se revertirá automáticamente en la cuenta asociada.`
        }
        confirmText={deleteModalState.isBulk ? 'Eliminar movimientos' : 'Eliminar movimiento'}
        cancelText="Conservar"
        isLoading={deleteModalState.isLoading}
        isDestructive={true}
      />
    </div>
  );
};

