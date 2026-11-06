import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';

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
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
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

  // Auto-initialize account selectors and date when modal opens
  useEffect(() => {
    if (isNewMovementModalOpen && !date) {
      setDate(new Date().toISOString().split('T')[0]);
    }
    if (accounts.length > 0) {
      if (!accountId || !accounts.find((a) => a.id === accountId)) {
        setAccountId(accounts[0].id);
      }
      if (!toAccountId || toAccountId === accountId || !accounts.find((a) => a.id === toAccountId)) {
        const otherAcc = accounts.find((a) => a.id !== (accountId || accounts[0].id));
        if (otherAcc) setToAccountId(otherAcc.id);
      }
    }
  }, [accounts, accountId, toAccountId, isNewMovementModalOpen, date]);

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
      if (!categoryId || !availableCategories.find((c) => c.id === categoryId)) {
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
  const isMultiCurrencyTransfer =
    type === 'transfer' && fromAccount && toAccount && fromAccount.currency !== toAccount.currency;

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
    const currentVal = parseFloat(amount) || 0;
    setAmount((currentVal + addVal).toString());
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!isNewMovementModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }

    if (type !== 'transfer' && !concept.trim()) {
      setErrorMsg('Ingresa un concepto o comercio');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      setErrorMsg('Selecciona dos cuentas diferentes para transferir');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    let res;
    if (type === 'transfer') {
      const finalDestAmount =
        isMultiCurrencyTransfer && customConvertedAmount && parseFloat(customConvertedAmount) > 0
          ? parseFloat(customConvertedAmount)
          : autoCalculatedDestAmount;

      res = await addTransfer({
        fromAccountId: accountId,
        toAccountId: toAccountId,
        amount: numericAmount,
        destinationAmount: finalDestAmount,
        date: date || todayStr,
        concept: concept.trim() || `Transferencia: ${fromAccount?.name} ➔ ${toAccount?.name}`,
        notes: notes.trim() || null,
        tagIds: selectedTagIds,
      });
    } else {
      res = await addTransaction({
        type,
        concept: concept.trim(),
        amount: numericAmount,
        date: date || todayStr,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        accountId: accountId || null,
        notes: notes.trim() || null,
        tagIds: selectedTagIds,
      });
    }

    setSaving(false);

    if (res.error) {
      setErrorMsg('Error al registrar: ' + res.error);
      return;
    }

    showToast(
      type === 'transfer'
        ? `Transferencia de $${numericAmount} realizada.`
        : `${type === 'expense' ? 'Gasto' : 'Ingreso'} de $${numericAmount} registrado.`
    );

    // Reset fields
    setAmount('');
    setConcept('');
    setCustomConvertedAmount('');
    setNotes('');
    setSubcategoryId('');
    setSelectedTagIds([]);
    setShowAdvanced(false);
    setIsNewMovementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl overflow-hidden border border-surface-container-high max-h-[92vh] flex flex-col">
        {/* Color accent line matching type */}
        <div
          className={`h-1.5 transition-colors duration-300 shrink-0 ${
            type === 'expense' ? 'bg-error' : type === 'income' ? 'bg-secondary' : 'bg-primary'
          }`}
        />

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  type === 'expense'
                    ? 'bg-error-container/40 text-error'
                    : type === 'income'
                    ? 'bg-secondary-fixed/60 text-secondary'
                    : 'bg-primary-fixed text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">
                  {type === 'expense' ? 'arrow_downward' : type === 'income' ? 'arrow_upward' : 'swap_horiz'}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-headline-md font-bold text-on-surface leading-tight">
                  {type === 'expense' ? 'Anotar un Gasto' : type === 'income' ? 'Anotar un Ingreso' : 'Mover entre Cuentas'}
                </h3>
                <p className="text-[11px] sm:text-xs text-on-surface-variant">
                  {type === 'expense' ? 'Registra una salida o compra' : type === 'income' ? 'Registra dinero que entró' : 'Pasa saldo de una cuenta a otra'}
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
            <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Visual 3-Button Type Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'expense' ? 'bg-error text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">remove_circle</span>
                <span>Gasto</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'income' ? 'bg-secondary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold ${
                  type === 'transfer' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
                <span>Transferir</span>
              </button>
            </div>

            {/* Compact Amount Input with Quick Add Chips */}
            <div className="bg-surface-container-low/60 dark:bg-slate-900/40 rounded-xl p-2.5 sm:p-3 border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center">
                <span
                  className={`text-xl sm:text-2xl font-extrabold mr-1 ${
                    type === 'expense' ? 'text-error' : type === 'income' ? 'text-secondary' : 'text-primary'
                  }`}
                >
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
                  className="w-36 sm:w-44 text-2xl sm:text-3xl font-extrabold bg-transparent text-on-surface outline-none tabular-nums placeholder:text-on-surface-variant/40"
                />
                <span className="text-xs text-on-surface-variant font-bold ml-1">
                  {fromAccount?.currency || 'MXN'}
                </span>
              </div>

              {/* Quick Add Chips */}
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {[50, 100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold tabular-nums transition-colors cursor-pointer border border-outline-variant/30 active:scale-95"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Fields in a Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Column: Concept / Origin */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {type === 'transfer' ? 'Motivo de la transferencia' : 'Concepto o Comercio'}
                  </label>
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder={
                      type === 'transfer'
                        ? 'ej. Pago de tarjeta, Ahorro...'
                        : type === 'expense'
                        ? 'ej. Súper, Netflix, Gasolina...'
                        : 'ej. Nómina, Venta, Honorarios...'
                    }
                    required={type !== 'transfer'}
                    className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-xl text-xs sm:text-sm border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 gap-2 whitespace-nowrap">
                    <label className="text-xs font-bold text-on-surface truncate">
                      {type === 'transfer' ? 'Cuenta Origen (sale):' : 'Cuenta / Tarjeta'}
                    </label>
                    {accounts.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewMovementModalOpen(false);
                          setIsNewAccountModalOpen(true);
                        }}
                        className="text-[11px] text-primary hover:underline font-bold shrink-0"
                      >
                        + Crear cuenta
                      </button>
                    )}
                  </div>
                  <CustomSelect
                    value={accountId}
                    onChange={(val) => setAccountId(val)}
                    options={
                      accounts.length > 0
                        ? accounts.map((acc) => ({
                            value: acc.id,
                            label: `${acc.name} ($${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 0 })} ${acc.currency})`,
                            color: acc.color,
                          }))
                        : [{ value: '', label: 'Efectivo / General' }]
                    }
                  />
                </div>
              </div>

              {/* Right Column: Date / Category or Destination */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-primary">event</span>
                      <span>Fecha</span>
                    </label>

                    {/* Quick Presets: Hoy / Ayer */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDate(todayStr)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          date === todayStr
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setDate(yesterdayStr)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          date === yesterdayStr
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        Ayer
                      </button>
                    </div>
                  </div>

                  <CustomDatePicker
                    value={date}
                    onChange={(newVal) => setDate(newVal)}
                    maxDate={todayStr}
                  />
                </div>

                {type === 'transfer' ? (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Cuenta Destino (entra):
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
                ) : (
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
                      options={
                        availableCategories.length > 0
                          ? availableCategories.map((cat) => ({
                              value: cat.id,
                              label: cat.name,
                              icon: cat.icon || 'category',
                              color: cat.color,
                            }))
                          : [{ value: '', label: 'General' }]
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Currency conversion preview if multi-currency transfer */}
            {isMultiCurrencyTransfer && (
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center justify-between gap-2 flex-wrap">
                <div className="font-bold">
                  Conversión ({fromAccount?.currency} ➔ {toAccount?.currency}): 1 USD ≈ ${exchangeRate.toFixed(2)} MXN
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Recibe:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={customConvertedAmount}
                    placeholder={autoCalculatedDestAmount > 0 ? autoCalculatedDestAmount.toFixed(2) : '0.00'}
                    onChange={(e) => setCustomConvertedAmount(e.target.value)}
                    className="w-24 h-7 px-2 bg-surface-container-lowest rounded-lg border border-primary/40 text-on-surface font-bold text-xs"
                  />
                  <span>{toAccount?.currency}</span>
                </div>
              </div>
            )}

            {/* Optional details expandable: Subcategory, Notes, Tags */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer py-0.5"
              >
                <span className="material-symbols-outlined text-sm">
                  {showAdvanced ? 'expand_less' : 'tune'}
                </span>
                <span>
                  {showAdvanced
                    ? 'Ocultar detalles opcionales'
                    : '+ Subcategoría, nota o etiquetas (#)'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-2 p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-2.5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Subcategory */}
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
                    <div className={type === 'transfer' || availableSubcategories.length === 0 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Nota o comentario personal
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="ej. Factura #12, compra compartida..."
                        className="w-full h-8 px-2.5 bg-surface-container-lowest text-on-surface rounded-lg text-xs border border-outline-variant/60 focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Etiquetas (#)
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((t) => {
                          const isSelected = selectedTagIds.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleTag(t.id)}
                              style={{
                                borderColor: t.color || '#4338ca',
                                backgroundColor: isSelected ? t.color || '#4338ca' : 'transparent',
                                color: isSelected ? '#ffffff' : 'inherit',
                              }}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
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
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-error hover:bg-red-700'
                    : type === 'income'
                    ? 'bg-secondary hover:bg-emerald-700'
                    : 'bg-primary hover:bg-primary-container'
                }`}
              >
                {saving && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>
                  {saving
                    ? 'Guardando...'
                    : type === 'expense'
                    ? 'Guardar Gasto'
                    : type === 'income'
                    ? 'Guardar Ingreso'
                    : 'Guardar Transferencia'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
