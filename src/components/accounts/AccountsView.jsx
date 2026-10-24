import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { EditAccountModal } from '../modals/EditAccountModal';

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
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || null);
  const [refreshingRate, setRefreshingRate] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  const handleDeleteAccount = async (acc) => {
    const confirmMsg = `¿Deseas eliminar la cuenta "${acc.name}"? Los movimientos que estaban vinculados a esta cuenta se conservarán en el historial pero quedarán sin cuenta asignada.`;
    if (!window.confirm(confirmMsg)) return;

    const res = await deleteAccount(acc.id);
    if (res.error) {
      alert('Error eliminando cuenta: ' + res.error);
    } else if (selectedAccountId === acc.id) {
      const remaining = accounts.filter((a) => a.id !== acc.id);
      setSelectedAccountId(remaining[0]?.id || null);
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

  const getAccountGradient = (acc) => {
    switch (acc.type) {
      case 'credito':
        return 'from-[#3b0764] via-[#581c87] to-[#7e22ce]';
      case 'inversion':
        return 'from-[#022c22] via-[#064e3b] to-[#047857]';
      case 'ahorro':
        return 'from-[#1e1b4b] via-[#4338ca] to-[#0284c7]';
      case 'efectivo':
        return 'from-[#0f172a] via-[#1e293b] to-[#475569]';
      default:
        return 'from-slate-900 via-[#1e1b4b] to-[#1e3a8a]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Portafolio Multidivisa
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Cuentas y Tarjetas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Monitoreo en tiempo real de saldos en Pesos Mexicanos (MXN) y Dólares (USD).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewAccountModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all self-start lg:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Nueva cuenta / tarjeta</span>
        </button>
      </div>

      {/* Tipo de Cambio en Directo (Widget Google Finance / Mercado Interbancario) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-5 border border-primary/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shadow-xs flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">currency_exchange</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-primary">
                Tipo de Cambio en Directo
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                <span>En vivo</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-on-surface tabular-nums">
                1 USD = ${exchangeRate.toFixed(4)} MXN
              </span>
              <span className="text-xs text-on-surface-variant">
                (Google Finance / Mercado Spot)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {exchangeRateLastUpdated && (
            <span className="text-xs text-on-surface-variant font-medium">
              Actualizado: {exchangeRateLastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={handleManualRateRefresh}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Patrimonio Neto Total */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Patrimonio Consolidado
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-md text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed">
              Valuado en MXN
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-on-surface tracking-tight tabular-nums">
              ${kpis.netWorth.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span>Conversión automática de USD a MXN</span>
          </div>
        </div>

        {/* KPI 2: Total Activos / Capital */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Activos (Liquidez)
            </span>
            <span className="p-1.5 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">savings</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-secondary tracking-tight tabular-nums">
              ${totalAssetsMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span>{accounts.filter(a => a.type !== 'credito').length} cuentas activas</span>
          </div>
        </div>

        {/* KPI 3: Pasivo en Tarjetas */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Deuda en Crédito (Pasivo)
            </span>
            <span className="p-1.5 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-base">credit_card</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-error tracking-tight tabular-nums">
              ${totalLiabilitiesMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span>{accounts.filter(a => a.type === 'credito').length} plásticos de crédito</span>
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
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant font-bold">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((acc) => {
              const isSelected = selectedAccount?.id === acc.id;
              const isCredit = acc.type === 'credito';
              const isUSD = acc.currency === 'USD';
              const bal = Number(acc.balance) || 0;
              const limit = Number(acc.credit_limit) || 0;
              const gradient = getAccountGradient(acc);

              // Converted value to MXN if USD
              const convertedToMXN = isUSD ? bal * exchangeRate : null;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`group cursor-pointer relative flex flex-col justify-between rounded-2xl p-6 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-tr ${gradient} overflow-hidden min-h-[220px] ${
                    isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                >
                  <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Top card info */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md uppercase tracking-wider text-slate-300 font-semibold">
                        {acc.institution}
                      </span>
                      <span className="font-headline-md text-headline-md font-bold tracking-tight text-white mt-0.5">
                        {acc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToEdit(acc);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Editar datos y saldo"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAccount(acc);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-500/80 text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Eliminar cuenta"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <span className="px-2 py-0.5 rounded-full font-label-md text-xs font-bold bg-white/20 text-white flex items-center gap-1">
                        <span>{isUSD ? '🇺🇸 USD' : '🇲🇽 MXN'}</span>
                      </span>
                      <div className="w-8 h-6 rounded bg-amber-400/80 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-xs text-amber-950 font-bold">contactless</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle balance */}
                  <div className="my-3 relative z-10">
                    <span className="font-label-md text-label-md text-slate-300 uppercase tracking-wider">
                      {isCredit ? 'Saldo Deudor' : 'Saldo Disponible'}
                    </span>
                    <div className="font-headline-lg text-headline-lg font-bold tracking-tight tabular-nums text-white">
                      {isUSD ? 'US$' : '$'}{bal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-xs font-normal text-slate-300">
                        {acc.currency}
                      </span>
                    </div>

                    {/* Show live conversion if account is in USD */}
                    {isUSD && (
                      <div className="mt-1 text-xs text-emerald-300 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">sync_alt</span>
                        <span>
                          ≈ ${convertedToMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN (al cambio actual)
                        </span>
                      </div>
                    )}

                    {isCredit && limit > 0 && (
                      <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-secondary-fixed h-full rounded-full"
                          style={{ width: `${Math.min(100, (bal / limit) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10 text-xs">
                    <div className="flex items-center gap-1 font-mono tracking-widest text-slate-300">
                      <span>••••</span>
                      <span className="text-white font-semibold">{acc.last4 || '0000'}</span>
                    </div>
                    <span className="text-slate-300 capitalize font-medium">{acc.type}</span>
                  </div>
                </div>
              );
            })}
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
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-4">
              <div
                style={{ backgroundColor: selectedAccount.color || '#4338ca' }}
                className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-headline-md shadow-sm uppercase"
              >
                {selectedAccount.institution.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    {selectedAccount.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold bg-surface-container text-on-surface-variant">
                    •••• {selectedAccount.last4 || '0000'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-label-md text-xs font-bold bg-primary/10 text-primary">
                    {selectedAccount.currency || 'MXN'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {selectedAccount.institution} • Tipo: {selectedAccount.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs uppercase text-on-surface-variant font-semibold">Saldo Nominal</span>
                <div className="font-headline-lg text-headline-lg font-bold text-on-surface tabular-nums">
                  {selectedAccount.currency === 'USD' ? 'US$' : '$'}
                  {Number(selectedAccount.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {selectedAccount.currency || 'MXN'}
                </div>
                {selectedAccount.currency === 'USD' && (
                  <span className="text-xs text-secondary font-medium block">
                    ≈ ${(Number(selectedAccount.balance) * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN al tipo de cambio actual
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAccountToEdit(selectedAccount)}
                  className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Editar cuenta y saldo"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(selectedAccount)}
                  className="p-2.5 rounded-xl bg-error-container/40 hover:bg-error-container text-error flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Eliminar esta cuenta"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>Eliminar</span>
                </button>
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
    </div>
  );
};

