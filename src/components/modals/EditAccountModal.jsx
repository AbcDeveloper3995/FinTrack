import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const EditAccountModal = ({ account, isOpen, onClose }) => {
  const { updateAccount, exchangeRate } = useFinance();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState('debito');
  const [currency, setCurrency] = useState('MXN');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [last4, setLast4] = useState('');
  const [color, setColor] = useState('#4338ca');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setInstitution(account.institution || '');
      setType(account.type || 'debito');
      setCurrency(account.currency || 'MXN');
      setBalance(account.balance !== undefined && account.balance !== null ? String(account.balance) : '0');
      setCreditLimit(account.credit_limit !== undefined && account.credit_limit !== null ? String(account.credit_limit) : '');
      setLast4(account.last4 || '');
      setColor(account.color || '#4338ca');
      setErrorMsg('');
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setErrorMsg('');
    setSaving(true);

    const res = await updateAccount(account.id, {
      name: name.trim(),
      institution: institution.trim() || 'Bancaria',
      type,
      currency,
      balance: balance === '' ? 0 : balance,
      credit_limit: type === 'credito' && creditLimit !== '' ? creditLimit : null,
      last4: last4.trim() ? last4.trim().slice(-4) : null,
      color,
    });

    setSaving(false);

    if (res.error) {
      setErrorMsg('Error al actualizar cuenta: ' + res.error);
      return;
    }

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
              <div
                style={{ backgroundColor: color }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Editar Cuenta / Tarjeta
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ajusta el saldo, nombre, moneda o retira la cuenta.
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
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Nombre de la cuenta
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. BBVA Nómina, Chase Checking..."
                required
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Institución o Emisor
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="ej. BBVA, Nu, Chase"
                  className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Tipo de Cuenta
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="debito">Débito / Cheques</option>
                  <option value="credito">Tarjeta de Crédito</option>
                  <option value="inversion">Inversión / Bonos</option>
                  <option value="ahorro">Ahorro / Cajita</option>
                  <option value="efectivo">Efectivo Físico</option>
                </select>
              </div>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Moneda de la Cuenta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrency('MXN')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    currency === 'MXN'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>🇲🇽 Pesos (MXN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    currency === 'USD'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>🇺🇸 Dólares (USD)</span>
                </button>
              </div>
              {currency === 'USD' && (
                <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">currency_exchange</span>
                  <span>1 USD ≈ ${exchangeRate.toFixed(2)} MXN</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  {type === 'credito' ? `Saldo Deudor (${currency})` : `Saldo Actual (${currency})`}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold">
                    {currency === 'USD' ? 'US$' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full h-11 pl-10 pr-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {type === 'credito' ? (
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Límite de Crédito ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-on-surface-variant font-bold">
                      {currency === 'USD' ? 'US$' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 pl-10 pr-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Últimos 4 dígitos <span className="text-xs text-on-surface-variant/70 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value)}
                    placeholder="ej. 4829"
                    className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Color identificador
              </label>
              <div className="flex items-center gap-3">
                {[
                  '#4338ca', '#006c4a', '#0284c7', '#7e22ce', '#be123c', '#d97706', '#334155'
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-125 border-on-surface' : 'border-transparent hover:scale-110'
                    }`}
                  />
                ))}
              </div>
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
