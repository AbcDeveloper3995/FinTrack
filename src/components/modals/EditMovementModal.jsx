import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';

export const EditMovementModal = ({ movement, isOpen, onClose }) => {
  const {
    updateTransaction,
    accounts,
    categories,
    tags,
    showToast,
  } = useFinance();

  const [type, setType] = useState('expense');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate data when movement or isOpen changes
  useEffect(() => {
    if (movement) {
      setType(movement.type || 'expense');
      setConcept(movement.concept || '');
      setAmount(movement.amount !== undefined ? String(Math.abs(movement.amount)) : '');
      setCategoryId(movement.categoryId || '');
      setSubcategoryId(movement.subcategoryId || '');
      setAccountId(movement.accountId || '');
      setDate(movement.date || new Date().toISOString().split('T')[0]);
      setNotes(movement.notes || '');
      setSelectedTagIds(movement.tags ? movement.tags.map((t) => t.id) : []);
      setErrorMsg('');
    }
  }, [movement, isOpen]);

  // Categories filtered by type
  const availableCategories = categories.filter((c) => c.type === type);

  // Subcategories for current category
  const currentCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = currentCategory?.subcategories || [];

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (!isOpen || !movement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept.trim() || !amount) return;

    setErrorMsg('');
    setSaving(true);

    const res = await updateTransaction(movement.id, {
      concept: concept.trim(),
      amount,
      type,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      accountId: accountId || null,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      tagIds: selectedTagIds,
    });

    setSaving(false);

    if (res.error) {
      setErrorMsg('Error al actualizar movimiento: ' + res.error);
      return;
    }

    showToast('Movimiento actualizado correctamente.');
    onClose();
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
                <span className="material-symbols-outlined text-[24px]">edit_note</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Editar Movimiento
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Modifica importe, categoría o cuenta. El balance se recalculará automáticamente.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
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
                onClick={() => {
                  setType('expense');
                  setCategoryId('');
                  setSubcategoryId('');
                }}
                className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
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
                onClick={() => {
                  setType('income');
                  setCategoryId('');
                  setSubcategoryId('');
                }}
                className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                  type === 'income'
                    ? 'bg-secondary text-on-secondary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">arrow_upward</span>
                <span>Ingreso</span>
              </button>
            </div>

            {/* Concept */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Concepto o Comercio
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="ej. Supermercado, Pago Nómina..."
                required
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full h-11 pl-8 pr-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
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
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Subcategoría <span className="text-xs text-on-surface-variant/70 font-normal">(opcional)</span>
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

            {/* Account */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
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
                    badge: `$${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${acc.currency}`,
                    color: acc.color,
                    icon: acc.icon,
                  })),
                ]}
                placeholder="Selecciona una cuenta"
              />
            </div>

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

            {/* Notes */}
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

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-body-md font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold shadow-md hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                {saving && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
