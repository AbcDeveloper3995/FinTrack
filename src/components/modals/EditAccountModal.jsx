import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CustomSelect } from '../common/CustomSelect';

export const EditAccountModal = ({ account, isOpen, onClose }) => {
  const { updateAccount, exchangeRate, showToast } = useFinance();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState('debito');
  const [currency, setCurrency] = useState('MXN');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [minBalance, setMinBalance] = useState('');
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
      setMinBalance(account.min_balance !== undefined && account.min_balance !== null ? String(account.min_balance) : '');
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
      min_balance: type !== 'credito' && minBalance !== '' ? minBalance : null,
      last4: last4.trim() ? last4.trim().slice(-4) : null,
      color,
    });

    setSaving(false);

    if (res.error) {
      setErrorMsg('Error al actualizar cuenta: ' + res.error);
      return;
    }

    showToast(`Cuenta "${name.trim()}" actualizada correctamente.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-surface-container-high max-h-[92vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary shrink-0"></div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: color }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-headline-md text-base sm:text-headline-md font-bold text-on-surface">
                  Editar Cuenta / Tarjeta
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ajusta el saldo, nombre, moneda o saldo mínimo deseado.
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
            <div className="mb-3 p-2.5 rounded-lg bg-error-container text-on-error-container text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Nombre de la cuenta
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. BBVA Nómina, Chase..."
                  required
                  className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Institución o Emisor
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="ej. BBVA, Nu, Chase"
                  className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Tipo de Cuenta
                </label>
                <CustomSelect
                  value={type}
                  onChange={(val) => setType(val)}
                  options={[
                    { value: 'debito', label: 'Débito / Cheques', icon: 'account_balance' },
                    { value: 'credito', label: 'Tarjeta de Crédito', icon: 'credit_card' },
                    { value: 'inversion', label: 'Inversión / Bonos', icon: 'trending_up' },
                    { value: 'ahorro', label: 'Ahorro / Cajita', icon: 'savings' },
                    { value: 'efectivo', label: 'Efectivo Físico', icon: 'payments' },
                  ]}
                  placeholder="Selecciona tipo de cuenta"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Moneda
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency('MXN')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currency === 'MXN'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>🇲🇽 MXN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      currency === 'USD'
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                        : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>🇺🇸 USD</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  {type === 'credito' ? `Saldo Deudor (${currency})` : `Saldo Actual (${currency})`}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-on-surface-variant font-bold text-sm">
                    {currency === 'USD' ? 'US$' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full h-10 pl-9 pr-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {type === 'credito' ? (
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Límite de Crédito ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-on-surface-variant font-bold text-sm">
                      {currency === 'USD' ? 'US$' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 pl-9 pr-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Saldo Mínimo Alerta <span className="text-[11px] text-on-surface-variant/70 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-on-surface-variant font-bold text-sm">
                      {currency === 'USD' ? 'US$' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={minBalance}
                      onChange={(e) => setMinBalance(e.target.value)}
                      placeholder="ej. 1000.00"
                      className="w-full h-10 pl-9 pr-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Últimos 4 dígitos <span className="text-[11px] text-on-surface-variant/70 font-normal">(tarjetas)</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value)}
                  placeholder="ej. 4829"
                  className="w-full h-10 px-3 bg-surface-container-lowest text-on-surface rounded-lg text-sm border border-outline-variant/60 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Color de la tarjeta
                </label>
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {[
                    '#4338ca', '#006c4a', '#0284c7', '#7e22ce', '#be123c', '#d97706', '#334155'
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        color === c ? 'scale-125 border-on-surface ring-2 ring-primary/30' : 'border-transparent hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-md hover:shadow transition-all flex items-center gap-2 cursor-pointer"
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
