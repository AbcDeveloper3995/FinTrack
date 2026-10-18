import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const NewMovementModal = () => {
  const { isNewMovementModalOpen, setIsNewMovementModalOpen, addTransaction, accounts } = useFinance();

  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Despensa');
  const [account, setAccount] = useState('Nu Débito');

  if (!isNewMovementModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!concept || !amount) return;

    const numAmount = parseFloat(amount);
    addTransaction({
      concept,
      category,
      categoryType: type,
      account,
      amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
    });

    // Reset and close
    setConcept('');
    setAmount('');
    setIsNewMovementModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-container-high">
        {/* Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Registrar Movimiento
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Impacto inmediato en tus saldos y presupuestos.
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
                placeholder="ej. Walmart Express, Pago de Internet..."
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full h-11 pl-8 pr-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Category & Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  <option value="Despensa">Despensa</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Salud">Salud</option>
                  <option value="Sueldo">Sueldo</option>
                  <option value="Inversión">Inversión</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Cuenta / Tarjeta
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                  <option value="Tarjeta de Crédito Nu">Tarjeta de Crédito Nu</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="px-4 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-body-md font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md font-semibold shadow-md hover:shadow transition-all"
              >
                Guardar Movimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
