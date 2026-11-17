import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const EditMovementModal = ({ movement, isOpen, onClose }) => {
  const { updateTransaction, accounts, categories, tags, showToast, exchangeRate } = useFinance();

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [customUsdToMxnAmount, setCustomUsdToMxnAmount] = useState('');
  const [isUsdConversionManuallyEdited, setIsUsdConversionManuallyEdited] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate fields when modal opens
  useEffect(() => {
    if (movement) {
      setConcept(movement.concept || '');
      setAmount(Math.abs(movement.amount || 0).toString());
      setType(movement.type || 'expense');
      setDate(movement.date || new Date().toISOString().split('T')[0]);
      setCategoryId(movement.categoryId || '');
      setSubcategoryId(movement.subcategoryId || '');
      setAccountId(movement.accountId || '');
      setNotes(movement.notes || '');
      setSelectedTagIds(movement.tags ? movement.tags.map((t) => t.id) : []);
      if (movement.amountMXN) {
        setCustomUsdToMxnAmount(movement.amountMXN.toString());
        setIsUsdConversionManuallyEdited(true);
      } else {
        setCustomUsdToMxnAmount('');
        setIsUsdConversionManuallyEdited(false);
      }
      setErrorMsg('');
    }
  }, [movement, isOpen]);

  if (!isOpen || !movement) return null;

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isUsdMovement = type !== 'transfer' && selectedAccount?.currency === 'USD';
  const parsedAmount = parseFloat(amount) || 0;
  const autoCalculatedMxnAmount = isUsdMovement && parsedAmount > 0
    ? parsedAmount * (exchangeRate || 1)
    : 0;

  const handleResetUsdToMxn = () => {
    setIsUsdConversionManuallyEdited(false);
    if (parsedAmount > 0) {
      setCustomUsdToMxnAmount(autoCalculatedMxnAmount.toFixed(2));
    } else {
      setCustomUsdToMxnAmount('');
    }
  };

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);
  const currentCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = currentCategory?.subcategories || [];

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      setErrorMsg('El concepto es obligatorio.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    const finalAmountMXN = isUsdMovement
      ? (customUsdToMxnAmount && parseFloat(customUsdToMxnAmount) > 0
          ? parseFloat(customUsdToMxnAmount)
          : autoCalculatedMxnAmount)
      : null;

    const res = await updateTransaction(movement.id, {
      concept: concept.trim(),
      amount: numericAmount,
      amountMXN: finalAmountMXN,
      type,
      date,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      accountId: accountId || null,
      notes: notes.trim() || null,
      tagIds: selectedTagIds,
    });

    setSaving(false);

    if (res.error) {
      setErrorMsg('Error al actualizar: ' + res.error);
      return;
    }

    showToast(`Movimiento "${concept.trim()}" actualizado correctamente.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl sm:max-w-2xl overflow-hidden border border-surface-container-high max-h-[92vh] flex flex-col">
        {/* Color accent line */}
        <div
          className={`h-1.5 transition-colors duration-300 shrink-0 ${
            type === 'expense' ? 'bg-error' : type === 'income' ? 'bg-secondary' : 'bg-primary'
          }`}
        />

        <div className="p-4 sm:p-5 pb-8 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  type === 'expense'
                    ? 'bg-error-container/40 text-error'
                    : 'bg-secondary-fixed/60 text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">
                  {type === 'expense' ? 'edit_document' : 'edit_document'}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-headline-md font-bold text-on-surface leading-tight">
                  Editar Movimiento
                </h3>
                <p className="text-[11px] sm:text-xs text-on-surface-variant">
                  Modifica los datos del registro y sus saldos asociados.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Type Switcher */}
            {movement.type === 'transfer' ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">swap_horiz</span>
                  <span>Transferencia entre cuentas</span>
                </div>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                  {movement.amount > 0 ? 'Entrada (Destino)' : 'Salida (Origen)'}
                </span>
              </div>
            ) : (
              <div className="flex p-1 bg-surface-container-low rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategoryId('');
                    setSubcategoryId('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-error text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                  <span>Gasto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategoryId('');
                    setSubcategoryId('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-secondary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                  <span>Ingreso</span>
                </button>
              </div>
            )}

            {/* Concept */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Concepto o Comercio
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="ej. Supermercado, Pago Nómina..."
                required
                className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-xl text-xs sm:text-sm border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Grid 2 Cols: Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-on-surface-variant font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full h-10 pl-8 pr-3 bg-surface-container-lowest text-on-surface rounded-xl text-sm border border-outline-variant/60 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Fecha
                </label>
                <CustomDatePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                />
              </div>
            </div>

            {/* Grid 2 Cols: Category & Subcategory (hidden for transfers) */}
            {movement.type !== 'transfer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    options={[
                      { value: '', label: '-- Sin categoría --' },
                      ...availableCategories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                        color: cat.color,
                        icon: cat.icon,
                      })),
                    ]}
                    placeholder="Selecciona una categoría"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Subcategoría <span className="text-[11px] text-on-surface-variant/70 font-normal">(opcional)</span>
                  </label>
                  <CustomSelect
                    value={subcategoryId}
                    onChange={(val) => setSubcategoryId(val)}
                    disabled={availableSubcategories.length === 0}
                    options={[
                      { value: '', label: '-- Ninguna --' },
                      ...availableSubcategories.map((sub) => ({
                        value: sub.id,
                        label: sub.name,
                        color: sub.color,
                      })),
                    ]}
                    placeholder="Selecciona subcategoría"
                  />
                </div>
              </div>
            )}

            {/* Grid 2 Cols: Account & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Cuenta / Tarjeta {movement.type === 'transfer' && <span className="text-[10px] text-on-surface-variant font-normal">(fija)</span>}
                </label>
                <CustomSelect
                  value={accountId}
                  onChange={(val) => setAccountId(val)}
                  disabled={movement.type === 'transfer'}
                  options={[
                    { value: '', label: '-- Sin cuenta vinculada (Efectivo/General) --' },
                    ...accounts.map((acc) => ({
                      value: acc.id,
                      label: `${acc.name} (${acc.institution})`,
                      badge: `$${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 0 })} ${acc.currency}`,
                      color: acc.color,
                      icon: acc.icon,
                    })),
                  ]}
                  placeholder="Selecciona una cuenta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Nota personal <span className="text-[11px] text-on-surface-variant/70 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ej. Ticket fiscal, compra compartida..."
                  className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-xl text-xs sm:text-sm border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Currency conversion preview & MXN equivalent input for USD expense/income */}
            {isUsdMovement && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-container-low border border-primary/25 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <span className="material-symbols-outlined text-base">currency_exchange</span>
                    <span>Equivalente en Pesos Mexicanos (MXN)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                    1 USD ≈ ${exchangeRate.toFixed(4)} MXN
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="text-xs text-on-surface-variant">
                    <span className="font-semibold text-on-surface">Total en MXN para tus presupuestos y balance:</span>
                    <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                      {isUsdConversionManuallyEdited ? (
                        <span className="text-primary font-medium">✏️ Monto en MXN personalizado por ti</span>
                      ) : (
                        <span>⚡ Calculado según tipo de cambio actual</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-on-surface-variant">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customUsdToMxnAmount}
                        onChange={(e) => {
                          setCustomUsdToMxnAmount(e.target.value);
                          setIsUsdConversionManuallyEdited(true);
                        }}
                        placeholder={autoCalculatedMxnAmount > 0 ? autoCalculatedMxnAmount.toFixed(2) : '0.00'}
                        className="w-32 sm:w-36 h-9 pl-7 pr-2.5 bg-surface-container-lowest rounded-xl border border-primary/40 focus:border-primary text-on-surface font-bold text-xs sm:text-sm outline-none transition-all shadow-xs"
                      />
                    </div>
                    <span className="font-bold text-xs text-primary">MXN</span>
                    {isUsdConversionManuallyEdited && (
                      <button
                        type="button"
                        onClick={handleResetUsdToMxn}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer shrink-0 ml-0.5 flex items-center gap-0.5"
                        title="Restablecer al cálculo automático según tipo de cambio"
                      >
                        <span className="material-symbols-outlined text-[13px]">restart_alt</span>
                        <span>Recalcular</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tags Selection */}
            {tags.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Etiquetas (Tags)
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
                          backgroundColor: isSelected ? t.color || '#4338ca' : 'transparent',
                          color: isSelected ? '#ffffff' : 'inherit',
                        }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
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

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold shadow-md hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {saving && (
                  <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
