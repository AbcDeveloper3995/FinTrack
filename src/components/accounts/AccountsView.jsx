import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EditAccountModal } from '../modals/EditAccountModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Pagination } from '../common/Pagination';
import { BankCard } from './BankCard';
import { getAccountTypeMeta } from '../../lib/accountTypes';
import { formatDisplayDate } from '../../lib/dateUtils';
import { generateAccountStatementPDF } from '../../services/pdfReportService';
import { exportMovementsToCSV } from '../../services/exportService';

export const AccountsView = () => {
  const {
    kpis,
    accounts,
    transactions,
    setIsNewAccountModalOpen,
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
    customRate,
    setCustomRate,
    isCustomRate,
    deleteAccount,
    showToast,
    currentUser,
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || null);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInputValue, setRateInputValue] = useState('');
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statementPeriod, setStatementPeriod] = useState('this_week');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  // Reset pagination to page 1 when switching selected account or period
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAccountId, statementPeriod]);

  const handleDeleteAccount = (acc) => {
    setAccountToDelete(acc);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    const res = await deleteAccount(accountToDelete.id);
    setIsDeleting(false);

    if (res.error) {
      showToast('Error eliminando cuenta: ' + res.error, 'error', 'Error');
    } else {
      showToast(`La cuenta "${accountToDelete.name}" fue eliminada.`, 'info', 'Cuenta eliminada');
      if (selectedAccountId === accountToDelete.id) {
        const remaining = accounts.filter((a) => a.id !== accountToDelete.id);
        setSelectedAccountId(remaining[0]?.id || null);
      }
      setAccountToDelete(null);
    }
  };

  // Helper for applying hex alpha opacity
  const getTintedBg = (hex, alphaHex) => {
    if (!hex || typeof hex !== 'string') return `#4338ca${alphaHex}`;
    const clean = hex.trim();
    if (clean.startsWith('#') && clean.length === 7) return `${clean}${alphaHex}`;
    return clean;
  };

  const accountColor = selectedAccount?.color || '#4338ca';

  // Filter transactions belonging to selected account
  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return [];
    return transactions.filter((t) => t.accountId === selectedAccount.id);
  }, [transactions, selectedAccount]);

  // Compute date range based on weekly / monthly period
  const statementRange = useMemo(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (statementPeriod === 'this_week') {
      const day = now.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        startDate: toYMD(mon),
        endDate: toYMD(sun),
        label: 'Esta Semana',
      };
    }

    if (statementPeriod === 'last_week') {
      const day = now.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day) - 7;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return {
        startDate: toYMD(mon),
        endDate: toYMD(sun),
        label: 'Semana Pasada',
      };
    }

    if (statementPeriod === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: toYMD(start),
        endDate: toYMD(end),
        label: 'Este Mes',
      };
    }

    return {
      startDate: null,
      endDate: null,
      label: 'Todo el Historial',
    };
  }, [statementPeriod]);

  // Filter transactions within the statement period
  const filteredAccountTransactions = useMemo(() => {
    if (!statementRange.startDate || !statementRange.endDate) {
      return accountTransactions;
    }
    return accountTransactions.filter(
      (t) => t.date >= statementRange.startDate && t.date <= statementRange.endDate
    );
  }, [accountTransactions, statementRange]);

  // Paginated slice for selected account movements
  const paginatedAccountTransactions = filteredAccountTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Statement financial metrics (Opening, Income, Expense, Closing)
  const statementMetrics = useMemo(() => {
    if (!selectedAccount) {
      return { openingBalance: 0, closingBalance: 0, totalIncome: 0, totalExpense: 0, netPeriod: 0 };
    }

    const currentBal = Number(selectedAccount.balance) || 0;
    const isCredit = selectedAccount.type === 'credito';

    // Transactions happening strictly after the statement period end
    const txsAfter = statementRange.endDate
      ? accountTransactions.filter((t) => t.date > statementRange.endDate)
      : [];

    let netAfter = 0;
    txsAfter.forEach((t) => {
      const num = Number(t.amount) || 0;
      if (isCredit) {
        // For credit, negative amount (expense) increased debt (+), positive reduced debt (-)
        netAfter += -num;
      } else {
        // For debit, positive increased balance (+), negative decreased balance (-)
        netAfter += num;
      }
    });

    const closingBalance = currentBal - netAfter;

    let totalIncome = 0;
    let totalExpense = 0;

    filteredAccountTransactions.forEach((t) => {
      const num = Number(t.amount) || 0;
      if (num > 0) {
        totalIncome += num;
      } else if (num < 0) {
        totalExpense += Math.abs(num);
      }
    });

    let netPeriod = 0;
    if (isCredit) {
      netPeriod = totalExpense - totalIncome;
    } else {
      netPeriod = totalIncome - totalExpense;
    }

    const openingBalance = closingBalance - netPeriod;

    return {
      openingBalance,
      closingBalance,
      totalIncome,
      totalExpense,
      netPeriod,
    };
  }, [selectedAccount, accountTransactions, filteredAccountTransactions, statementRange]);

  const handleExportStatementPDF = () => {
    if (!selectedAccount) return;
    try {
      const rangeStr = statementRange.startDate && statementRange.endDate
        ? `${formatDisplayDate(statementRange.startDate)} — ${formatDisplayDate(statementRange.endDate)}`
        : 'Historial Completo';

      generateAccountStatementPDF({
        account: selectedAccount,
        movements: filteredAccountTransactions,
        periodLabel: statementRange.label,
        dateRangeStr: rangeStr,
        openingBalance: statementMetrics.openingBalance,
        closingBalance: statementMetrics.closingBalance,
        totalIncome: statementMetrics.totalIncome,
        totalExpense: statementMetrics.totalExpense,
        currency: selectedAccount.currency || 'MXN',
        userName: currentUser?.name || currentUser?.email || 'Titular FinTrack',
      });
      showToast('Estado de cuenta descargado en PDF.', 'success', 'PDF Generado');
    } catch (err) {
      showToast('Error al generar PDF: ' + err.message, 'error', 'Error');
    }
  };

  const handleExportStatementExcel = async () => {
    if (!selectedAccount) return;
    try {
      const rangeStr = statementRange.startDate && statementRange.endDate
        ? `${formatDisplayDate(statementRange.startDate)} — ${formatDisplayDate(statementRange.endDate)}`
        : 'Historial Completo';

      await exportMovementsToCSV(filteredAccountTransactions, {
        periodLabel: `Estado de Cuenta (${statementRange.label}: ${rangeStr}) - ${selectedAccount.name}`,
        customFilename: `FinTrack_Estado_Cuenta_${selectedAccount.name.replace(/\s+/g, '_')}_${statementRange.label.replace(/\s+/g, '_')}.xlsx`,
        userName: currentUser?.name || currentUser?.email || 'Titular FinTrack',
      });
      showToast('Estado de cuenta exportado a Excel.', 'success', 'Excel Generado');
    } catch (err) {
      showToast('Error al exportar Excel: ' + err.message, 'error', 'Error');
    }
  };

  // Calculate totals in MXN
  const totalAssetsMXN = accounts
    .filter((a) => a.type !== 'credito')
    .reduce((sum, a) => {
      const bal = Number(a.balance) || 0;
      return sum + (a.currency === 'USD' ? bal * exchangeRate : bal);
    }, 0);

  const totalLiabilitiesMXN = accounts
    .filter((a) => a.type === 'credito')
    .reduce((sum, a) => {
      const bal = Number(a.balance) || 0;
      return sum + (a.currency === 'USD' ? bal * exchangeRate : bal);
    }, 0);

  const handleManualRateRefresh = async () => {
    setRefreshingRate(true);
    await fetchExchangeRate();
    setTimeout(() => setRefreshingRate(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Portafolio Multidivisa
            </span>
          </div>
          <h1 className="text-2xl sm:text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Cuentas
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Monitoreo en tiempo real de saldos en MXN y USD.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewAccountModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Nueva cuenta</span>
        </button>
      </div>

      {/* Tipo de Cambio en Directo (Widget Google Finance / Mercado Interbancario / Ajuste Manual) */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low/70 p-4 sm:p-5 border border-primary/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <span className="material-symbols-outlined text-xl sm:text-2xl">currency_exchange</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
                Tipo de Cambio
              </span>
              {isCustomRate ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Fijada manual / ARQ</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span>En vivo (Google Finance)</span>
                </span>
              )}
            </div>

            {isEditingRate ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = parseFloat(rateInputValue);
                  if (!isNaN(num) && num > 0) {
                    setCustomRate(num);
                    showToast(`Tipo de cambio fijado a $${num.toFixed(4)} MXN`, 'success', 'Tasa guardada');
                  }
                  setIsEditingRate(false);
                }}
                className="flex items-center gap-2 mt-2 flex-wrap"
              >
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-on-surface-variant">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    min="1"
                    autoFocus
                    value={rateInputValue}
                    onChange={(e) => setRateInputValue(e.target.value)}
                    placeholder={exchangeRate.toFixed(4)}
                    className="w-32 h-8 pl-6 pr-2 bg-surface-container rounded-lg border border-primary text-xs font-bold text-on-surface outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all cursor-pointer"
                >
                  Fijar tasa
                </button>
                {isCustomRate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomRate(null);
                      setIsEditingRate(false);
                      showToast('Restablecida cotización en vivo.', 'info', 'Tasa restaurada');
                    }}
                    className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-all cursor-pointer"
                  >
                    Usar en vivo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingRate(false)}
                  className="px-2 py-1 text-on-surface-variant text-xs hover:text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                <span className="text-lg sm:text-xl font-bold text-on-surface tabular-nums">
                  1 USD = ${exchangeRate.toFixed(4)} MXN
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRateInputValue(exchangeRate.toFixed(4));
                    setIsEditingRate(true);
                  }}
                  className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Fijar tasa manual (ej. valor de ARQ)"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {isCustomRate ? '(Tasa fija establecida)' : '(Spot / Google Finance)'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-container/60 shrink-0">
          {exchangeRateLastUpdated && (
            <span className="text-xs text-on-surface-variant font-medium">
              Actualizado: {exchangeRateLastUpdated}
            </span>
          )}
          {isCustomRate ? (
            <button
              type="button"
              onClick={() => {
                setCustomRate(null);
                showToast('Restablecida cotización en vivo.', 'info', 'Tasa restaurada');
              }}
              className="p-1.5 sm:p-2 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ml-auto sm:ml-0"
              title="Volver a cotización automática en vivo"
            >
              <span className="material-symbols-outlined text-base">restore</span>
              <span>Revertir a en vivo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualRateRefresh}
              className="p-1.5 sm:p-2 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ml-auto sm:ml-0"
              title="Refrescar cotización"
            >
              <span className={`material-symbols-outlined text-base ${refreshingRate ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Actualizar</span>
            </button>
          )}
        </div>
      </section>

      {/* KPI Cards Grid (Consolidated in MXN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* KPI 1: Patrimonio Neto Total */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-label-md text-xs sm:text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Tu Dinero Total (Neto)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-secondary-fixed text-on-secondary-fixed shrink-0 whitespace-nowrap">
              En MXN
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-headline-lg lg:text-display-lg font-bold text-on-surface tracking-tight tabular-nums">
              ${kpis.netWorth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 text-on-surface-variant text-xs sm:text-body-md">
            <span>Disponible descontando tarjetas</span>
          </div>
        </div>

        {/* KPI 2: Total Activos / Capital */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-md text-xs sm:text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Cuentas y Efectivo
            </span>
            <span className="p-1.5 rounded-lg bg-secondary-container text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">savings</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-headline-lg lg:text-display-lg font-bold text-secondary tracking-tight tabular-nums">
              ${totalAssetsMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 text-on-surface-variant text-xs sm:text-body-md">
            <span>{accounts.filter(a => a.type !== 'credito').length} cuenta(s) activa(s)</span>
          </div>
        </div>

        {/* KPI 3: Pasivo en Tarjetas */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-md text-xs sm:text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Por pagar en Tarjetas
            </span>
            <span className="p-1.5 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">credit_card</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-headline-lg lg:text-display-lg font-bold text-error tracking-tight tabular-nums">
              ${totalLiabilitiesMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 text-on-surface-variant text-xs sm:text-body-md">
            <span>{accounts.filter(a => a.type === 'credito').length} tarjeta(s) de crédito</span>
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Tus Billeteras & Cuentas
            </h2>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant font-bold">
              {accounts.length} Registradas
            </span>
          </div>
          {accounts.length > 0 && (
            <span className="text-on-surface-variant font-label-md text-label-md hidden sm:inline-block">
              Haz clic en una tarjeta para inspeccionar sus movimientos o editarla
            </span>
          )}
        </div>

        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <BankCard
                key={acc.id}
                account={acc}
                isSelected={selectedAccount?.id === acc.id}
                exchangeRate={exchangeRate}
                onSelect={() => setSelectedAccountId(acc.id)}
                onEdit={(accToEdit) => setAccountToEdit(accToEdit)}
                onDelete={(accToDelete) => handleDeleteAccount(accToDelete)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Sin cuentas bancarias registradas
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1 max-w-md">
              Añade tus cuentas de débito, crédito o efectivo en MXN o USD para comenzar a controlar tus saldos reales.
            </p>
            <button
              type="button"
              onClick={() => setIsNewAccountModalOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>Crear mi primera cuenta</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Account Detail View if accounts exist */}
      {selectedAccount && (
        <div
          style={{
            backgroundColor: getTintedBg(accountColor, '0a'),
            borderColor: getTintedBg(accountColor, '30'),
          }}
          className="rounded-2xl shadow-sm border p-4 sm:p-8 space-y-6 transition-colors duration-300"
        >
          <div
            style={{ borderBottomColor: getTintedBg(accountColor, '20') }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                style={{ backgroundColor: accountColor }}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl text-white flex items-center justify-center font-bold text-base sm:text-headline-md shadow-sm uppercase shrink-0"
              >
                {selectedAccount.institution.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-headline-lg font-bold text-on-surface truncate">
                    {selectedAccount.name}
                  </h3>
                  {(() => {
                    const typeMeta = getAccountTypeMeta(selectedAccount.type);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border inline-flex items-center gap-1 shrink-0 ${typeMeta.badgeClass}`}>
                        <span className="material-symbols-outlined text-[11px]">{typeMeta.icon}</span>
                        <span>{typeMeta.label}</span>
                      </span>
                    );
                  })()}
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {selectedAccount.currency || 'MXN'}
                  </span>
                </div>
                <div className="font-body-md text-xs sm:text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap mt-1">
                  <span>{selectedAccount.institution}</span>
                  {selectedAccount.min_balance && (
                    <>
                      <span>•</span>
                      <span className="text-xs">
                        Saldo mín. deseado: <strong>${Number(selectedAccount.min_balance).toLocaleString('es-MX')} {selectedAccount.currency}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-left md:text-right pt-2 md:pt-0 border-t md:border-0 border-surface-container/60">
                <div className="flex items-center justify-start md:justify-end gap-1.5">
                  <span className="text-[11px] uppercase text-on-surface-variant font-semibold">Saldo Nominal</span>
                  <button
                    type="button"
                    onClick={() => setAccountToEdit(selectedAccount)}
                    className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                    title="Ajustar o corregir saldo de esta cuenta"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div className="text-xl sm:text-headline-lg font-bold text-on-surface tabular-nums">
                  {selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {Number(selectedAccount.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {selectedAccount.currency || 'MXN'}
                </div>
                {selectedAccount.currency === 'USD' && (
                  <span className="text-xs text-secondary font-medium block">
                    ≈ ${(Number(selectedAccount.balance) * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN al tipo de cambio actual
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Header: Titulo de Estado de Cuenta & Controles de Periodo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">receipt_long</span>
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Estado de Cuenta
                  </h4>
                  {statementRange.startDate && statementRange.endDate && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant border border-surface-container-high/60 tabular-nums">
                      {formatDisplayDate(statementRange.startDate)} — {formatDisplayDate(statementRange.endDate)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Balance, depósitos y cargos registrados en esta cuenta.
                </p>
              </div>

              {/* Controles de Periodo y Exportación */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Selector de Periodo */}
                <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-surface-container-high/60 shadow-xs">
                  {[
                    { id: 'this_week', label: 'Esta semana' },
                    { id: 'last_week', label: 'Semana pasada' },
                    { id: 'this_month', label: 'Este mes' },
                    { id: 'all', label: 'Todo' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStatementPeriod(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        statementPeriod === p.id
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Botones de Descarga / Exportación */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportStatementPDF}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-surface-container-high/60 shadow-xs transition-colors cursor-pointer"
                    title="Descargar Estado de Cuenta en PDF"
                  >
                    <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">picture_as_pdf</span>
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportStatementExcel}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-surface-container-high/60 shadow-xs transition-colors cursor-pointer"
                    title="Exportar Estado de Cuenta a Excel (.xlsx)"
                  >
                    <span className="material-symbols-outlined text-base text-emerald-600 dark:text-emerald-400">table_chart</span>
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Micro-tarjetas de Balance de la Semana / Periodo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                  Saldo Inicial
                </span>
                <span className="font-bold text-sm sm:text-base text-on-surface tabular-nums mt-0.5 truncate">
                  {selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {statementMetrics.openingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                  Depósitos (+)
                </span>
                <span className="font-bold text-sm sm:text-base text-secondary tabular-nums mt-0.5 truncate">
                  +{selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {statementMetrics.totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-error tracking-wider">
                  Cargos (-)
                </span>
                <span className="font-bold text-sm sm:text-base text-error tabular-nums mt-0.5 truncate">
                  -{selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {statementMetrics.totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                  Saldo Cierre
                </span>
                <span className="font-bold text-sm sm:text-base text-on-surface tabular-nums mt-0.5 truncate">
                  {selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {statementMetrics.closingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Tabla de Movimientos del Estado de Cuenta */}
            {filteredAccountTransactions.length > 0 ? (
              <div
                style={{
                  borderColor: getTintedBg(accountColor, '26'),
                }}
                className="overflow-hidden rounded-2xl border bg-surface-container-lowest/80 backdrop-blur-xs shadow-xs"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: getTintedBg(accountColor, '15'),
                          borderBottomColor: getTintedBg(accountColor, '26'),
                        }}
                        className="text-on-surface-variant font-label-md text-label-md uppercase border-b"
                      >
                        <th className="py-2.5 px-3.5 font-semibold">Concepto</th>
                        <th className="py-2.5 px-3.5 font-semibold">Categoría</th>
                        <th className="py-2.5 px-3.5 font-semibold">Fecha (DD/MM/AAAA)</th>
                        <th className="py-2.5 px-3.5 text-right font-semibold">Monto ({selectedAccount.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low text-body-md font-body-md">
                      {paginatedAccountTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3 px-3.5 font-semibold text-on-surface">{tx.concept}</td>
                          <td className="py-3 px-3.5 text-on-surface-variant">{tx.category}</td>
                          <td className="py-3 px-3.5 text-on-surface-variant tabular-nums">
                            {formatDisplayDate(tx.date)}
                          </td>
                          <td className={`py-3 px-3.5 text-right font-bold tabular-nums ${
                            tx.amount > 0 ? 'text-secondary' : 'text-on-surface'
                          }`}>
                            {tx.amount > 0 ? '+' : ''}
                            {selectedAccount.currency === 'USD' ? 'US$' : '$'}
                            {Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div
                  style={{
                    borderTopColor: getTintedBg(accountColor, '20'),
                    backgroundColor: getTintedBg(accountColor, '08'),
                  }}
                  className="p-3 sm:p-4 border-t"
                >
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredAccountTransactions.length}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 20]}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    accentColor={accountColor}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic py-6 text-center bg-surface-container-low/40 rounded-xl">
                No hay movimientos registrados en {statementRange.label.toLowerCase()} ({formatDisplayDate(statementRange.startDate)} — {formatDisplayDate(statementRange.endDate)}).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      <EditAccountModal
        account={accountToEdit}
        isOpen={Boolean(accountToEdit)}
        onClose={() => setAccountToEdit(null)}
      />

      {/* Modal de confirmación para eliminar cuenta */}
      <ConfirmModal
        isOpen={Boolean(accountToDelete)}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleConfirmDeleteAccount}
        title="¿Eliminar esta cuenta?"
        message={`¿Estás seguro de que deseas eliminar "${accountToDelete?.name}"? Los movimientos que estaban vinculados a esta cuenta se conservarán en tu historial pero quedarán sin cuenta asignada.`}
        confirmText="Sí, eliminar cuenta"
        cancelText="Conservar cuenta"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};

