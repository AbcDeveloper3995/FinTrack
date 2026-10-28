import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EditAccountModal } from '../modals/EditAccountModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { BankCard } from './BankCard';

export const AccountsView = () => {
  const {
    kpis,
    accounts,
    transactions,
    setIsNewAccountModalOpen,
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
    deleteAccount,
    showToast,
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || null);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

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

  // Filter transactions belonging to selected account
  const accountTransactions = selectedAccount
    ? transactions.filter((t) => t.accountId === selectedAccount.id)
    : [];

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

      {/* Tipo de Cambio en Directo (Widget Google Finance / Mercado Interbancario) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-4 sm:p-5 border border-primary/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <span className="material-symbols-outlined text-xl sm:text-2xl">currency_exchange</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
                Tipo de Cambio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                <span>En vivo</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
              <span className="text-lg sm:text-xl font-bold text-on-surface tabular-nums">
                1 USD = ${exchangeRate.toFixed(4)} MXN
              </span>
              <span className="text-[11px] text-on-surface-variant">
                (Google Finance)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-container/60 shrink-0">
          {exchangeRateLastUpdated && (
            <span className="text-xs text-on-surface-variant font-medium">
              Actualizado: {exchangeRateLastUpdated}
            </span>
          )}
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
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 p-4 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                style={{ backgroundColor: selectedAccount.color || '#4338ca' }}
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl text-white flex items-center justify-center font-bold text-base sm:text-headline-md shadow-sm uppercase shrink-0"
              >
                {selectedAccount.institution.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-headline-lg font-bold text-on-surface truncate">
                    {selectedAccount.name}
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold bg-surface-container text-on-surface-variant shrink-0">
                    •••• {selectedAccount.last4 || '0000'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-label-md text-xs font-bold bg-primary/10 text-primary shrink-0">
                    {selectedAccount.currency || 'MXN'}
                  </span>
                </div>
                <p className="font-body-md text-xs sm:text-body-md text-on-surface-variant truncate">
                  {selectedAccount.institution} • Tipo: {selectedAccount.type}
                </p>
              </div>
            </div>

            <div>
              <div className="text-left md:text-right pt-2 md:pt-0 border-t md:border-0 border-surface-container/60">
                <span className="text-[11px] uppercase text-on-surface-variant font-semibold">Saldo Nominal</span>
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

          <div>
            <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-3">
              Movimientos de esta cuenta ({accountTransactions.length})
            </h4>

            {accountTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase">
                      <th className="py-2.5 px-3 rounded-l-lg font-semibold">Concepto</th>
                      <th className="py-2.5 px-3 font-semibold">Categoría</th>
                      <th className="py-2.5 px-3 font-semibold">Fecha</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg font-semibold">Monto ({selectedAccount.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0 text-body-md font-body-md">
                    {accountTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-3 font-semibold text-on-surface">{tx.concept}</td>
                        <td className="py-3 px-3 text-on-surface-variant">{tx.category}</td>
                        <td className="py-3 px-3 text-on-surface-variant tabular-nums">{tx.date}</td>
                        <td className={`py-3 px-3 text-right font-bold tabular-nums ${
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
            ) : (
              <p className="text-sm text-on-surface-variant italic py-4">
                No hay movimientos asociados a esta cuenta todavía.
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

