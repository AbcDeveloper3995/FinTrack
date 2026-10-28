import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const handleQuickAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  if (!isNewMovementModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    if (type === 'transfer') {
      if (!accountId || !toAccountId) {
        setErrorMsg('Selecciona la cuenta de salida y la de llegada.');
        setSaving(false);
        return;
      }
      if (accountId === toAccountId) {
        setErrorMsg('La cuenta de salida y llegada no pueden ser la misma.');
        setSaving(false);
        return;
      }

      const transferConcept = concept.trim() || `Paso de dinero: ${fromAccount?.name || 'Origen'} a ${toAccount?.name || 'Destino'}`;
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
        setErrorMsg('Error al transferir: ' + res.error);
        return;
      }
      showToast('¡Listo! Transferencia guardada correctamente.');
    } else {
      if (!concept.trim()) {
        setErrorMsg(type === 'expense' ? '¿En qué lo gastaste? Escribe un concepto.' : '¿De qué es este dinero? Escribe un concepto.');
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
        setErrorMsg('Error al guardar: ' + res.error);
        return;
      }
      showToast(type === 'expense' ? '¡Gasto guardado con éxito!' : '¡Ingreso guardado con éxito!');
    }

    // Reset and close
    setConcept('');
    setAmount('');
    setCustomConvertedAmount('');
    setNotes('');
    setSubcategoryId('');
    setSelectedTagIds([]);
    setShowAdvanced(false);
    setIsNewMovementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Color accent line matching type */}
        <div
          className={`h-1.5 transition-colors duration-300 shrink-0 ${
            type === 'expense'
              ? 'bg-error'
              : type === 'income'
              ? 'bg-secondary'
              : 'bg-primary'
          }`}
        />

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                  type === 'expense'
                    ? 'bg-error-container/40 text-error'
                    : type === 'income'
                    ? 'bg-secondary-fixed/60 text-secondary'
                    : 'bg-primary-fixed text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-2xl font-bold">
                  {type === 'expense' ? 'arrow_downward' : type === 'income' ? 'arrow_upward' : 'swap_horiz'}
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {type === 'expense' ? 'Anotar un Gasto' : type === 'income' ? 'Anotar un Ingreso' : 'Mover entre Cuentas'}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {type === 'expense' ? 'Registra lo que pagaste o compraste' : type === 'income' ? 'Registra el dinero que entró' : 'Pasa saldo de una cuenta a otra'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNewMovementModalOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Visual 3-Button Type Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container-low rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 sm:py-2.5 rounded-xl font-body-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'expense'
                    ? 'bg-error text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">remove_circle</span>
                <span>Gasto</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 sm:py-2.5 rounded-xl font-body-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'income'
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`py-2 sm:py-2.5 rounded-xl font-body-md text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'transfer'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
                <span>Transferir</span>
              </button>
            </div>

            {/* Giant Hero Amount Input */}
            <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-surface-container flex flex-col items-center justify-center">
              <label className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                ¿Cuánto fue? ({fromAccount?.currency || 'MXN'})
              </label>
              <div className="flex items-center justify-center w-full">
                <span className={`text-2xl sm:text-3xl font-extrabold mr-1 ${
                  type === 'expense' ? 'text-error' : type === 'income' ? 'text-secondary' : 'text-primary'
                }`}>
                  {type === 'expense' ? '-' : type === 'income' ? '+' : ''}$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  required
                  className="w-48 sm:w-56 text-center text-3xl sm:text-4xl font-extrabold bg-transparent text-on-surface outline-none tabular-nums placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Quick Add Amount Chips */}
              <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
                <span className="text-[10px] text-on-surface-variant mr-1">Rápido:</span>
                {[50, 100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold tabular-nums transition-colors cursor-pointer border border-outline-variant/30 active:scale-95"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Concept / Description */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                {type === 'transfer' ? '¿Para qué es esta transferencia?' : type === 'expense' ? '¿En qué lo gastaste?' : '¿De qué es este ingreso?'}
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={
                  type === 'transfer'
                    ? 'ej. Pago de tarjeta, Guardar en ahorro...'
                    : type === 'expense'
                    ? 'ej. Oxxo, Tacos, Súper, Netflix...'
                    : 'ej. Nómina, Venta, Pago que me debían...'
                }
                required={type !== 'transfer'}
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-xl text-sm border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Account Selector (or Dual Account for Transfer) */}
            {type === 'transfer' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      <span>De esta cuenta (sale):</span>
                    </label>
                    <CustomSelect
                      value={accountId}
                      onChange={(val) => setAccountId(val)}
                      options={accounts.map((acc) => ({
                        value: acc.id,
                        label: `${acc.name} - Saldo: $${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                        color: acc.color,
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span>A esta cuenta (entra):</span>
                    </label>
                    <CustomSelect
                      value={toAccountId}
                      onChange={(val) => setToAccountId(val)}
                      options={accounts.map((acc) => ({
                        value: acc.id,
                        label: acc.id === accountId ? `${acc.name} (Misma cuenta)` : acc.name,
                        disabled: acc.id === accountId,
                        color: acc.color,
                      }))}
                    />
                  </div>
                </div>

                {isMultiCurrencyTransfer && (
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span>Conversión de divisa ({fromAccount?.currency} ➔ {toAccount?.currency})</span>
                      <span>1 USD ≈ ${exchangeRate.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Recibe aprox:</span>
                      <input
                        type="number"
                        step="0.01"
                        value={customConvertedAmount}
                        placeholder={autoCalculatedDestAmount > 0 ? autoCalculatedDestAmount.toFixed(2) : '0.00'}
                        onChange={(e) => setCustomConvertedAmount(e.target.value)}
                        className="w-28 h-8 px-2 bg-surface-container-lowest rounded-lg border border-primary/40 text-on-surface font-bold text-xs"
                      />
                      <span>{toAccount?.currency}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Account */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface">
                      ¿Con qué cuenta o tarjeta?
                    </label>
                    {accounts.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMovementModalOpen(false);
                          setIsNewAccountModalOpen(true);
                        }}
                        className="text-[11px] text-primary hover:underline font-bold"
                      >
                        + Crear cuenta
                      </button>
                    )}
                  </div>
                  <CustomSelect
                    value={accountId}
                    onChange={(val) => setAccountId(val)}
                    options={accounts.length > 0 ? accounts.map((acc) => ({
                      value: acc.id,
                      label: `${acc.name} ($${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 0 })} ${acc.currency})`,
                      color: acc.color,
                    })) : [{ value: '', label: 'Efectivo / General' }]}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Categoría
                  </label>
                  <CustomSelect
                    value={categoryId}
                    onChange={(val) => {
                      setCategoryId(val);
                      setSubcategoryId('');
                    }}
                    options={availableCategories.length > 0 ? availableCategories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                      icon: cat.icon || 'category',
                    })) : [{ value: '', label: 'General' }]}
                  />
                </div>
              </div>
            )}

            {/* Toggle for optional extra details (keeps modal super clean for everyday use) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer py-1"
              >
                <span className="material-symbols-outlined text-base">
                  {showAdvanced ? 'expand_less' : 'tune'}
                </span>
                <span>{showAdvanced ? 'Ocultar detalles opcionales' : '+ Agregar nota, etiqueta o subcategoría (opcional)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 bg-surface-container-low rounded-2xl border border-surface-container space-y-3 animate-fade-in">
                  {/* Subcategory if available */}
                  {type !== 'transfer' && availableSubcategories.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Subcategoría
                      </label>
                      <CustomSelect
                        value={subcategoryId}
                        onChange={(val) => setSubcategoryId(val)}
                        placeholder="-- Sin subcategoría --"
                        options={[
                          { value: '', label: '-- Sin subcategoría --' },
                          ...availableSubcategories.map((sub) => ({
                            value: sub.id,
                            label: sub.name,
                          })),
                        ]}
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">
                      Nota o comentario personal
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ej. Pagado a medias con Carlos, factura #12..."
                      className="w-full h-9 px-3 bg-surface-container-lowest text-on-surface rounded-xl text-xs border border-outline-variant/60 focus:border-primary outline-none"
                    />
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                        Etiquetas (#)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
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
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
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
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-error hover:bg-red-700'
                    : type === 'income'
                    ? 'bg-secondary hover:bg-emerald-700'
                    : 'bg-primary hover:bg-primary-container'
                }`}
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                <span>{saving ? 'Guardando...' : type === 'expense' ? 'Guardar Gasto' : type === 'income' ? 'Guardar Ingreso' : 'Guardar Transferencia'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
