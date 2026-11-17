import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EditMovementModal } from '../modals/EditMovementModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomSelect } from '../common/CustomSelect';
import { Pagination } from '../common/Pagination';
import { exportMovementsToCSV } from '../../services/exportService';
import { formatDisplayDate } from '../../lib/dateUtils';

export const MovementsView = () => {
  const {
    accounts,
    transactions,
    tags,
    kpis,
    currentUser,
    currentPeriod,
    setIsNewMovementModalOpen,
    deleteTransactions,
    showToast,
    exchangeRate,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'expense' | 'income'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [movementToEdit, setMovementToEdit] = useState(null);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [groupedPage, setGroupedPage] = useState(1);
  const [groupedPageSize, setGroupedPageSize] = useState(5); // 5 days per page
  const [collapsedDays, setCollapsedDays] = useState(new Set());
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    movement: null,
    isBulk: false,
    isLoading: false,
  });

  // Reset to page 1 when any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
    setGroupedPage(1);
  }, [searchTerm, filterType, filterCategory, filterTag]);

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

  // Helper for applying hex alpha opacity
  const getTint = (hex, alpha) => {
    if (!hex || typeof hex !== 'string') return `#4338ca${alpha}`;
    const clean = hex.trim();
    if (clean.startsWith('#') && clean.length === 7) return `${clean}${alpha}`;
    return clean;
  };

  // Format day label: "Hoy — Domingo, 15 de Noviembre", "Ayer...", etc.
  const formatDayLabel = (dateStr) => {
    if (!dateStr || dateStr === 'Sin Fecha') return 'Sin Fecha';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`;

    const dateFormatted = dateObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const capitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

    if (dateStr === todayStr) {
      return `Hoy — ${capitalized}`;
    }
    if (dateStr === yestStr) {
      return `Ayer — ${capitalized}`;
    }
    return capitalized;
  };

  // Grouped by Date and then by Account with subtotals and day totals
  const groupedByDateAndAccount = useMemo(() => {
    const dateMap = {};

    filtered.forEach((tx) => {
      const dateKey = tx.date || 'Sin Fecha';
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          accountsMap: {},
          totalDayExpenseMXN: 0,
          totalDayIncomeMXN: 0,
          totalDayNetMXN: 0,
          txCount: 0,
        };
      }

      const dayGroup = dateMap[dateKey];
      dayGroup.txCount += 1;

      const rateMultiplier = tx.currency === 'USD' ? exchangeRate : 1;
      const valMXN = tx.amountMXN ? Math.abs(tx.amountMXN) : Math.abs(tx.amount) * rateMultiplier;

      if (tx.type === 'expense') {
        dayGroup.totalDayExpenseMXN += valMXN;
        dayGroup.totalDayNetMXN -= valMXN;
      } else if (tx.type === 'income') {
        dayGroup.totalDayIncomeMXN += valMXN;
        dayGroup.totalDayNetMXN += valMXN;
      }

      const accId = tx.accountId || 'unassigned';
      if (!dayGroup.accountsMap[accId]) {
        const accObj = accounts.find((a) => a.id === accId);
        dayGroup.accountsMap[accId] = {
          accountId: accId,
          accountName: accObj?.name || tx.account || 'Efectivo / General',
          institution: accObj?.institution || 'Efectivo',
          color: accObj?.color || tx.accountColor || '#4338ca',
          currency: accObj?.currency || tx.currency || 'MXN',
          transactions: [],
          totalExpense: 0,
          totalIncome: 0,
          netTotal: 0,
        };
      }

      const accGroup = dayGroup.accountsMap[accId];
      accGroup.transactions.push(tx);

      if (tx.type === 'expense') {
        accGroup.totalExpense += Math.abs(tx.amount);
        accGroup.netTotal -= Math.abs(tx.amount);
      } else if (tx.type === 'income') {
        accGroup.totalIncome += Math.abs(tx.amount);
        accGroup.netTotal += Math.abs(tx.amount);
      }
    });

    return Object.values(dateMap)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((day) => ({
        ...day,
        accounts: Object.values(day.accountsMap),
      }));
  }, [filtered, accounts, exchangeRate]);

  // Paginated days slice for grouped view
  const paginatedDays = groupedByDateAndAccount.slice(
    (groupedPage - 1) * groupedPageSize,
    groupedPage * groupedPageSize
  );

  // Paginated slice for classic table
  const paginatedMovements = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const pageIds = viewMode === 'table'
      ? paginatedMovements.map((m) => m.id)
      : paginatedDays.flatMap((day) => day.accounts.flatMap((acc) => acc.transactions.map((tx) => tx.id)));

    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleDayCollapse = (date) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const allCurrentDaysCollapsed = paginatedDays.length > 0 && paginatedDays.every((d) => collapsedDays.has(d.date));

  const toggleAllDays = () => {
    if (allCurrentDaysCollapsed) {
      setCollapsedDays(new Set());
    } else {
      setCollapsedDays(new Set(groupedByDateAndAccount.map((d) => d.date)));
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

  const handleExportCSV = async () => {
    try {
      const itemsToExport = selectedIds.length > 0
        ? filtered.filter((m) => selectedIds.includes(m.id))
        : filtered;

      if (itemsToExport.length === 0) {
        showToast('No hay movimientos que coincidan con los filtros para exportar.', 'warning', 'Exportación vacía');
        return;
      }

      const result = await exportMovementsToCSV(itemsToExport, {
        userName: currentUser?.name || currentUser?.email || 'Usuario FinTrack',
        periodLabel: currentPeriod || 'Historial Completo',
      });
      showToast(
        `Se exportaron ${result.count} movimientos a ${result.filename} (Neto: $${result.netResult.toFixed(2)} MXN)`,
        'success',
        'Reporte Ejecutivo Descargado'
      );
    } catch (err) {
      showToast(err.message, 'error', 'Error al exportar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tus Movimientos
            </span>
          </div>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Historial de Movimientos
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Lleva el control de cada movimiento de tus cuentas y tarjetas día a día.
          </p>
        </div>

        {/* Quick Stat Chips (Balanced 3-column grid on mobile, row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
          {/* Ingresos: Verde con flecha hacia ARRIBA */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
              <span className="material-symbols-outlined text-base font-bold">arrow_upward</span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">
                Ingresos
              </span>
              <span className="font-metric-md text-metric-md text-secondary font-bold tabular-nums truncate">
                +${kpis.monthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Gastos: Rojo con flecha hacia ABAJO */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-error-container/50 text-error shrink-0">
              <span className="material-symbols-outlined text-base font-bold">arrow_downward</span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase font-semibold">
                Gastos
              </span>
              <span className="font-metric-md text-metric-md text-error font-bold tabular-nums truncate">
                -${kpis.monthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Balance Neto */}
          <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-sm text-on-primary ${
            kpis.netBalance >= 0 ? 'bg-primary' : 'bg-primary'
          }`}>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed shrink-0">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[10px] text-primary-fixed uppercase font-semibold">
                Balance Neto
              </span>
              <span className="font-metric-md text-metric-md text-on-primary font-bold tabular-nums truncate">
                {kpis.netBalance >= 0 ? '+' : ''}${kpis.netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Command Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3.5">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por concepto, subcategoría, etiqueta (#)..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-16 py-2.5 rounded-xl font-body-md text-sm border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-label-md text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Bulk Action Strip & New Movement CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-on-surface font-body-md text-body-md">
                <span className="font-label-md text-xs bg-primary-container text-on-primary px-2 py-0.5 rounded-full font-bold">
                  {selectedIds.length}
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="p-1 rounded hover:bg-error-container text-error hover:text-on-error-container flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Eliminar seleccionados"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span className="text-xs font-semibold">Eliminar</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-body-md font-medium transition-all border border-surface-container-high/60 shadow-xs cursor-pointer"
              title="Descargar reporte financiero en formato nativo de Microsoft Excel (.xlsx)"
            >
              <span className="material-symbols-outlined text-lg text-secondary">table_chart</span>
              <span className="text-xs sm:text-sm font-semibold">Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nuevo movimiento</span>
            </button>
          </div>
        </div>

        {/* Droplist Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            <CustomSelect
              value={filterType}
              onChange={(val) => setFilterType(val)}
              options={[
                { value: 'all', label: 'Tipo: Todos' },
                { value: 'expense', label: 'Solo Gastos', icon: 'arrow_downward' },
                { value: 'income', label: 'Solo Ingresos', icon: 'arrow_upward' },
                { value: 'transfer', label: 'Solo Transferencias', icon: 'swap_horiz' },
              ]}
              buttonClassName="bg-surface-container-low hover:bg-surface-container border-transparent focus:border-primary/30"
            />

            <CustomSelect
              value={filterCategory}
              onChange={(val) => setFilterCategory(val)}
              options={[
                { value: 'all', label: 'Categorías: Todas' },
                ...uniqueCategories.map((cat) => ({
                  value: cat,
                  label: cat,
                })),
              ]}
              buttonClassName="bg-surface-container-low hover:bg-surface-container border-transparent focus:border-primary/30"
            />

            {tags.length > 0 && (
              <CustomSelect
                value={filterTag}
                onChange={(val) => setFilterTag(val)}
                options={[
                  { value: 'all', label: 'Etiqueta: Todas' },
                  ...tags.map((t) => ({
                    value: t.id,
                    label: `#${t.name}`,
                    color: t.color,
                  })),
                ]}
                buttonClassName="bg-surface-container-low hover:bg-surface-container border-transparent focus:border-primary/30"
              />
            )}
          </div>

          {(filterType !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setFilterCategory('all');
                setFilterTag('all');
                setSearchTerm('');
              }}
              className="text-primary font-semibold text-xs hover:underline cursor-pointer py-1 px-2 self-start sm:self-center shrink-0"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* View Switcher and Results Toolbar */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-lg text-primary">filter_list</span>
            <span>
              Mostrando <strong className="text-on-surface font-semibold">{filtered.length}</strong> {filtered.length === 1 ? 'movimiento' : 'movimientos'}
            </span>
            {searchTerm && <span className="truncate max-w-[200px]">para &ldquo;{searchTerm}&rdquo;</span>}
          </div>

          {/* View Toolbar: Actions & Switcher */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
            {viewMode === 'grouped' && (
              <button
                type="button"
                onClick={toggleAllDays}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-surface-container-high/60 transition-all cursor-pointer shadow-xs"
                title={allCurrentDaysCollapsed ? 'Expandir todos los días' : 'Colapsar todos los días'}
              >
                <span className="material-symbols-outlined text-base">
                  {allCurrentDaysCollapsed ? 'unfold_more' : 'unfold_less'}
                </span>
                <span>{allCurrentDaysCollapsed ? 'Expandir todo' : 'Colapsar todo'}</span>
              </button>
            )}

            {/* Segmented View Mode Switcher */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-surface-container-high/60 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Vista agrupada por fecha y por tarjeta/cuenta"
              >
                <span className="material-symbols-outlined text-base">view_agenda</span>
                <span>Por Tarjeta y Día</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Vista clásica en tabla detallada"
              >
                <span className="material-symbols-outlined text-base">table_rows</span>
                <span>Tabla Clásica</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Transactions Content */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden py-16 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            Sin movimientos que mostrar
          </h3>
          <p className="text-on-surface-variant font-body-md text-body-md mt-1 max-w-md">
            Aún no tienes movimientos registrados o los filtros aplicados no arrojaron resultados.
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
      ) : viewMode === 'grouped' ? (
        /* VISTA AGRUPADA POR TARJETA Y DÍA */
        <div className="flex flex-col gap-4">
          {paginatedDays.map((dayGroup) => {
            const isCollapsed = collapsedDays.has(dayGroup.date);
            return (
              <div
                key={dayGroup.date}
                className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3 transition-all"
              >
                {/* Encabezado del Día (Acordeón) */}
                <div
                  onClick={() => toggleDayCollapse(dayGroup.date)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCollapsed ? '' : 'pb-3 border-b border-surface-container-high/40'
                  } cursor-pointer select-none -m-1 sm:-m-2 p-2 sm:p-2.5 rounded-xl hover:bg-surface-container/40 transition-colors`}
                  title={isCollapsed ? 'Clic para expandir movimientos del día' : 'Clic para colapsar día'}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">calendar_today</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-title-md font-bold text-on-surface leading-tight text-sm sm:text-base">
                          {formatDayLabel(dayGroup.date)}
                        </h3>
                        <span
                          className={`material-symbols-outlined text-lg text-on-surface-variant transition-transform duration-200 ${
                            isCollapsed ? '' : 'rotate-180'
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {dayGroup.txCount} {dayGroup.txCount === 1 ? 'movimiento registrado' : 'movimientos registrados'}
                      </span>
                    </div>
                  </div>

                  {/* Gastos del Día */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-semibold text-on-surface-variant">Gastos del día:</span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs sm:text-sm tabular-nums bg-error/10 text-error border border-error/20">
                      <span className="material-symbols-outlined text-base">arrow_downward</span>
                      <span>
                        -${dayGroup.totalDayExpenseMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenedores por Tarjeta / Cuenta (Oculto si está colapsado) */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-3.5 pt-1">
                    {dayGroup.accounts.map((acc) => {
                      const cardColor = acc.color || '#4338ca';
                      return (
                        <div
                          key={acc.accountId}
                          style={{
                            backgroundColor: getTint(cardColor, '0d'),
                            borderColor: getTint(cardColor, '38'),
                          }}
                          className="rounded-2xl border p-3.5 sm:p-4 transition-all shadow-xs flex flex-col gap-3"
                        >
                          {/* Cabecera de la Tarjeta */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                style={{ backgroundColor: cardColor }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                              >
                                <span className="material-symbols-outlined text-base">credit_card</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-title-md font-bold text-on-surface text-sm sm:text-base">
                                  {acc.accountName}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: getTint(cardColor, '20'),
                                    color: cardColor,
                                  }}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {acc.currency}
                                </span>
                                <span className="text-xs text-on-surface-variant font-medium">
                                  ({acc.transactions.length} {acc.transactions.length === 1 ? 'mov.' : 'movs.'})
                                </span>
                              </div>
                            </div>

                            {/* Gastos de la Tarjeta en este Día */}
                            <div className="flex items-center gap-2 self-start sm:self-center pl-10 sm:pl-0">
                              <span className="text-xs font-semibold text-on-surface-variant">Gastos tarjeta:</span>
                              <div className="flex flex-col items-end">
                                <span className="font-bold tabular-nums text-sm sm:text-base text-error">
                                  -${acc.totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {acc.currency}
                                </span>
                                {acc.currency === 'USD' && (
                                  <span className="text-[10px] text-on-surface-variant font-medium tabular-nums">
                                    ≈ -${(acc.totalExpense * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                      {/* Lista de Movimientos de la Tarjeta */}
                      <div className="flex flex-col gap-2">
                        {acc.transactions.map((m) => {
                          const isSelected = selectedIds.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest border transition-all ${
                                isSelected
                                  ? 'border-primary ring-1 ring-primary/40 bg-primary/5'
                                  : 'border-surface-container-high/40 hover:border-surface-container-high hover:shadow-xs'
                              }`}
                            >
                              {/* Izquierda: Checkbox + Icono + Concepto + Subcategoría + Notas */}
                              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(m.id)}
                                  className="w-4 h-4 mt-1 sm:mt-0 rounded bg-surface-container text-primary focus:ring-0 cursor-pointer shrink-0"
                                />
                                <div className={`w-9 h-9 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                                  <span className="material-symbols-outlined text-lg">{m.icon}</span>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-on-surface text-sm truncate">
                                      {m.concept}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.2 rounded-full font-label-md text-[10px] font-bold ${
                                        m.type === 'transfer'
                                          ? 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                                          : m.type === 'expense'
                                          ? 'bg-error-container/40 text-error border border-error/20'
                                          : 'bg-secondary-fixed text-on-secondary-fixed'
                                      }`}
                                    >
                                      {m.type === 'transfer' ? 'Transferencia' : m.type === 'expense' ? 'Gasto' : 'Ingreso'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap mt-0.5">
                                    {m.category && (
                                      <span className="inline-flex items-center gap-1 font-medium">
                                        <span>{m.category}</span>
                                        {m.subcategory && (
                                          <>
                                            <span className="text-[10px] opacity-60">/</span>
                                            <span>{m.subcategory}</span>
                                          </>
                                        )}
                                      </span>
                                    )}
                                    {m.notes && (
                                      <span className="italic truncate max-w-[200px] sm:max-w-xs text-on-surface-variant/80">
                                        • {m.notes}
                                      </span>
                                    )}
                                  </div>
                                  {m.tags && m.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {m.tags.map((t) => (
                                        <span
                                          key={t.id || t.name}
                                          style={{
                                            backgroundColor: t.color ? `${t.color}18` : undefined,
                                            borderColor: t.color ? `${t.color}40` : undefined,
                                            color: t.color || undefined,
                                          }}
                                          className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-semibold border"
                                        >
                                          #{t.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Derecha: Monto + Acciones */}
                              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/30">
                                <div className="flex flex-col sm:items-end">
                                  <span
                                    className={`font-bold tabular-nums text-sm sm:text-base ${
                                      m.type === 'transfer'
                                        ? 'text-on-surface'
                                        : m.type === 'expense'
                                        ? 'text-error'
                                        : 'text-secondary'
                                    }`}
                                  >
                                    {m.type === 'expense' ? '-' : m.type === 'income' ? '+' : ''}${Math.abs(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    <span className="text-[10px] text-on-surface-variant font-normal ml-1">
                                      {m.currency || 'MXN'}
                                    </span>
                                  </span>
                                  {m.currency === 'USD' && m.type !== 'transfer' && (
                                    <span className="text-[11px] text-on-surface-variant font-medium block tabular-nums">
                                      ≈ ${(m.amountMXN ? m.amountMXN : Math.abs(m.amount) * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
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
                                    title="Eliminar movimiento"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

          {/* Grouped View Pagination */}
          <div className="p-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60">
            <Pagination
              currentPage={groupedPage}
              totalItems={groupedByDateAndAccount.length}
              pageSize={groupedPageSize}
              pageSizeOptions={[3, 5, 10, 15]}
              onPageChange={setGroupedPage}
              onPageSizeChange={(newSize) => {
                setGroupedPageSize(newSize);
                setGroupedPage(1);
              }}
            />
          </div>
        </div>
      ) : (
        /* VISTA TABLA CLÁSICA */
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedMovements.length > 0 &&
                        paginatedMovements.every((m) => selectedIds.includes(m.id))
                      }
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
                {paginatedMovements.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
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
                        {formatDisplayDate(m.date)}
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
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: m.accountColor || '#4338ca' }}
                          ></span>
                          {m.account}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold ${
                            m.type === 'transfer'
                              ? 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                              : m.type === 'expense'
                              ? 'bg-error-container/40 text-error border border-error/20'
                              : 'bg-secondary-fixed text-on-secondary-fixed'
                          }`}
                        >
                          {m.type === 'transfer' ? 'Transferencia' : m.type === 'expense' ? 'Gasto' : 'Ingreso'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold tabular-nums ${
                            m.type === 'transfer'
                              ? 'text-on-surface'
                              : m.type === 'expense'
                              ? 'text-error'
                              : 'text-secondary'
                          }`}
                        >
                          {m.type === 'expense' ? '-' : m.type === 'income' ? '+' : ''}${Math.abs(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          <span className="text-[10px] text-on-surface-variant font-normal ml-1">
                            {m.currency || 'MXN'}
                          </span>
                        </span>
                        {m.currency === 'USD' && m.type !== 'transfer' && (
                          <span className="text-[11px] text-on-surface-variant font-medium block tabular-nums">
                            ≈ ${(m.amountMXN ? m.amountMXN : Math.abs(m.amount) * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </span>
                        )}
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

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div className="p-4 bg-surface-container-lowest">
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
                pageSizeOptions={[10, 15, 25, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

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

