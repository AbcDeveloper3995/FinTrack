import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const NewMovementModal = () => {
  const {
    isNewMovementModalOpen,
    setIsNewMovementModalOpen,
    addTransaction,
    accounts,
    categories,
    tags,
    setIsNewAccountModalOpen,
  } = useFinance();

  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  // Set default category when type changes
  useEffect(() => {
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

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (!isNewMovementModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept || !amount) return;

    setErrorMsg('');
    setSaving(true);

    const res = await addTransaction({
      concept,
      amount,
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

    // Reset and close
    setConcept('');
    setAmount('');
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
                onClick={() => setType('income')}
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
                placeholder="ej. Supermercado, Pago Nómina, Pago Servicios..."
                required
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Monto (MXN)
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
                      {acc.name} ({acc.institution}) - ${Number(acc.balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </option>
                  ))
                ) : (
                  <option value="">Sin cuenta vinculada (Efectivo/General)</option>
                )}
              </select>
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
