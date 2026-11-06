import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const EditMovementModal = ({ movement, isOpen, onClose }) => {
  const { updateTransaction, accounts, categories, tags, showToast } = useFinance();

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
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
      setErrorMsg('');
    }
  }, [movement, isOpen]);

  if (!isOpen || !movement) return null;

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

    const res = await updateTransaction(movement.id, {
      concept: concept.trim(),
      amount: numericAmount,
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

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
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

            {/* Grid 2 Cols: Category & Subcategory */}
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

            {/* Grid 2 Cols: Account & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Cuenta / Tarjeta
                </label>
                <CustomSelect
                  value={accountId}
                  onChange={(val) => setAccountId(val)}
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
