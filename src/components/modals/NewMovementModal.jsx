import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const NewMovementModal = () => {
  const {
    isNewMovementModalOpen,
    setIsNewMovementModalOpen,
    addTransaction,
    addTransfer,
    accounts,
    categories,
    tags,
    exchangeRate,
    setIsNewAccountModalOpen,
    showToast,
  } = useFinance();

  const [type, setType] = useState('expense'); // 'expense' | 'income' | 'transfer'
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [customConvertedAmount, setCustomConvertedAmount] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-initialize account selectors when modal opens or accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      if (!accountId || !accounts.find(a => a.id === accountId)) {
        setAccountId(accounts[0].id);
      }
      if (!toAccountId || toAccountId === accountId || !accounts.find(a => a.id === toAccountId)) {
        const otherAcc = accounts.find(a => a.id !== (accountId || accounts[0].id));
        if (otherAcc) setToAccountId(otherAcc.id);
      }
    }
  }, [accounts, accountId, toAccountId, isNewMovementModalOpen]);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  // Set default category when type changes
  useEffect(() => {
    if (type === 'transfer') {
      setCategoryId('');
      setSubcategoryId('');
      return;
    }
    if (availableCategories.length > 0) {
      if (!categoryId || !availableCategories.find(c => c.id === categoryId)) {
        setCategoryId(availableCategories[0].id);
      }
    } else {
      setCategoryId('');
    }
  }, [type, availableCategories, categoryId]);

  // Selected category object
  const currentCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = currentCategory?.subcategories || [];

  // Transfer accounts & currency conversion helpers
  const fromAccount = accounts.find((a) => a.id === accountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const isMultiCurrencyTransfer = type === 'transfer' && fromAccount && toAccount && fromAccount.currency !== toAccount.currency;

  // Auto-calculated converted preview amount
  const parsedAmount = parseFloat(amount) || 0;
  let autoCalculatedDestAmount = parsedAmount;
  if (isMultiCurrencyTransfer && parsedAmount > 0) {
    if (fromAccount.currency === 'MXN' && toAccount.currency === 'USD') {
      autoCalculatedDestAmount = exchangeRate > 0 ? parsedAmount / exchangeRate : parsedAmount;
    } else if (fromAccount.currency === 'USD' && toAccount.currency === 'MXN') {
      autoCalculatedDestAmount = parsedAmount * (exchangeRate || 1);
    }
  }

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (!isNewMovementModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    if (type === 'transfer') {
      if (!accountId || !toAccountId) {
        setErrorMsg('Debes seleccionar tanto la cuenta de origen como la cuenta de destino.');
        setSaving(false);
        return;
      }
      if (accountId === toAccountId) {
        setErrorMsg('La cuenta de origen y destino no pueden ser la misma.');
        setSaving(false);
        return;
      }

      const transferConcept = concept.trim() || `Transferencia de ${fromAccount?.name || 'Origen'} a ${toAccount?.name || 'Destino'}`;
      const finalDestAmount = customConvertedAmount && parseFloat(customConvertedAmount) > 0
        ? parseFloat(customConvertedAmount)
        : autoCalculatedDestAmount;

      const res = await addTransfer({
        fromAccountId: accountId,
        toAccountId,
        amount: parsedAmount,
        convertedAmount: isMultiCurrencyTransfer ? finalDestAmount : null,
        concept: transferConcept,
        notes,
      });

      setSaving(false);
      if (res.error) {
        setErrorMsg('Error al realizar transferencia: ' + res.error);
        return;
      }
      showToast('Transferencia realizada correctamente entre tus cuentas.');
    } else {
      if (!concept.trim()) {
        setErrorMsg('Por favor escribe un concepto para el movimiento.');
        setSaving(false);
        return;
      }

      const res = await addTransaction({
        concept: concept.trim(),
        amount: parsedAmount,
        type,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        accountId: accountId || (accounts[0]?.id || null),
        notes,
        tagIds: selectedTagIds,
      });

      setSaving(false);
      if (res.error) {
        setErrorMsg('Error al guardar el movimiento: ' + res.error);
        return;
      }
      showToast(type === 'expense' ? 'Gasto registrado correctamente.' : 'Ingreso registrado correctamente.');
    }

    // Reset and close
    setConcept('');
    setAmount('');
    setCustomConvertedAmount('');
    setNotes('');
    setSubcategoryId('');
    setSelectedTagIds([]);
    setIsNewMovementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-container-high max-h-[90vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary shrink-0"></div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Registrar Movimiento
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Impacto inmediato en tus saldos, categorías y presupuestos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(false)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Switcher */}
            <div className="flex p-1 bg-surface-container-low rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">arrow_downward</span>
                <span>Gasto</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-secondary text-on-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">arrow_upward</span>
                <span>Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'transfer'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
                <span>Transferencia</span>
              </button>
            </div>

            {/* Concept */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                {type === 'transfer' ? 'Motivo o Referencia de la Transferencia' : 'Concepto o Comercio'}
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={
                  type === 'transfer'
                    ? 'ej. Traspaso a ahorros, Pago tarjeta crédito, Cambio de divisas...'
                    : 'ej. Supermercado, Pago Nómina, Pago Servicios...'
                }
                required={type !== 'transfer'}
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Amount with Currency info */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-label-md font-label-md text-on-surface-variant">
                  {type === 'transfer'
                    ? `Monto a Transferir (${fromAccount?.currency || 'MXN'})`
                    : `Monto (${fromAccount?.currency || 'MXN'})`}
                </label>
                {fromAccount && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                    Moneda cuenta: {fromAccount.currency}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold">
                  {fromAccount?.currency === 'USD' ? 'US$' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full h-11 pl-10 pr-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* TRANSFER MODE: Dual Account Selectors + Currency Conversion Preview */}
            {type === 'transfer' ? (
              <div className="space-y-4 pt-2 pb-1 border-y border-surface-container">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* From Account */}
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-error">upload</span>
                      <span>Cuenta Origen (De donde sale)</span>
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency}) - Saldo: ${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Account */}
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary">download</span>
                      <span>Cuenta Destino (Hacia donde entra)</span>
                    </label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                          {acc.name} ({acc.currency}) {acc.id === accountId ? '(Misma cuenta - No permitido)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversion Banner if currencies differ */}
                {isMultiCurrencyTransfer && (
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">currency_exchange</span>
                        <span>Conversión de Divisa ({fromAccount?.currency} ➔ {toAccount?.currency})</span>
                      </span>
                      <span>T.C. actual: ${exchangeRate.toFixed(2)} MXN/USD</span>
                    </div>

                    <div>
                      <label className="block text-label-md text-on-surface-variant text-[11px] mb-1">
                        Monto recibido en cuenta destino ({toAccount?.currency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-on-surface-variant">
                          {toAccount?.currency === 'USD' ? 'US$' : '$'}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder={autoCalculatedDestAmount > 0 ? autoCalculatedDestAmount.toFixed(2) : '0.00'}
                          value={customConvertedAmount}
                          onChange={(e) => setCustomConvertedAmount(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 bg-surface-container-lowest text-on-surface rounded-lg text-xs font-semibold border border-primary/30 focus:border-primary outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant mt-1 block">
                        Calculado automáticamente: ${autoCalculatedDestAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {toAccount?.currency}. Puedes ajustarlo manualmente si tu banco aplicó otra tasa.
                      </span>
                    </div>
                  </div>
                )}

                {/* Notice for Credit Card destination */}
                {toAccount?.type === 'credito' && (
                  <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center gap-2 text-xs text-secondary font-medium">
                    <span className="material-symbols-outlined text-base">credit_card</span>
                    <span>La cuenta destino es una Tarjeta de Crédito. Esta transferencia abonará a tu saldo utilizado para reducir la deuda.</span>
                  </div>
                )}
              </div>
            ) : (
              /* EXPENSE & INCOME: Category & Account inputs */
              <>
                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setSubcategoryId('');
                      }}
                      className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer"
                    >
                      {availableCategories.length > 0 ? (
                        availableCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="">General</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                      Subcategoría <span className="text-xs text-on-surface-variant/70 font-normal">(opcional)</span>
                    </label>
                    <select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      disabled={availableSubcategories.length === 0}
                      className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">-- Ninguna --</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-label-md font-label-md text-on-surface-variant">
                      Cuenta / Tarjeta de Cargo o Abono
                    </label>
                    {accounts.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMovementModalOpen(false);
                          setIsNewAccountModalOpen(true);
                        }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        + Crear cuenta
                      </button>
                    )}
                  </div>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer"
                  >
                    {accounts.length > 0 ? (
                      accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.institution}) [{acc.currency}] - Saldo: ${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </option>
                      ))
                    ) : (
                      <option value="">Sin cuenta vinculada (Efectivo/General)</option>
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Tags Selection */}
            {tags.length > 0 && (
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1.5">
                  Etiquetas (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const isSelected = selectedTagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        style={{
                          borderColor: t.color || '#4338ca',
                          backgroundColor: isSelected ? (t.color || '#4338ca') : 'transparent',
                          color: isSelected ? '#ffffff' : 'inherit',
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          isSelected ? 'shadow-xs' : 'text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Nota o referencia adicional <span className="text-xs text-on-surface-variant/70 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Ticket fiscal, compra compartida..."
                className="w-full h-10 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="px-4 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-body-md font-medium transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold shadow-md hover:shadow transition-all flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>{saving ? 'Guardando...' : 'Guardar Movimiento'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
