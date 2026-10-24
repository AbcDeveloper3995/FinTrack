import React from 'react';

/**
 * Realistic Physical Bank Card (Mastercard style)
 * Features:
 * - Proportional ISO credit card aspect ratio (1.586 : 1)
 * - Custom dark tone based on selected account color
 * - Realistic EMV Gold Chip with circuit contacts
 * - Contactless NFC symbol
 * - Interlocking Mastercard logo circles
 * - Embossed silver/white card number typography
 * - Edit and delete actions accessible on hover or tap
 */
export const BankCard = ({
  account,
  isSelected = false,
  exchangeRate = 1,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isCredit = account.type === 'credito';
  const isUSD = account.currency === 'USD';
  const bal = Number(account.balance) || 0;
  const limit = Number(account.credit_limit) || 0;
  const last4 = account.last4 || '8842';

  // Base hex color chosen by user (e.g. #4338ca, #059669, #dc2626, #d97706, #0284c7)
  const baseColor = account.color || '#1e1b4b';

  return (
    <div
      onClick={onSelect}
      className={`group relative w-full aspect-[1.586/1] min-h-[200px] rounded-2xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer overflow-hidden border border-white/10 select-none flex flex-col justify-between ${
        isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
      style={{
        background: `radial-gradient(circle at 85% 15%, ${baseColor}cc 0%, #09090b 80%, #030712 100%)`,
      }}
    >
      {/* Metallic Card Sheen & Holographic Diagonal Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-white/[0.03] pointer-events-none"></div>
      <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/[0.04] blur-2xl pointer-events-none"></div>

      {/* Top Header: Institution, Type Badge & Quick Actions */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-white/80 font-mono">
              {account.institution || 'BANCARIA'}
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-white/15 text-white tracking-wider uppercase border border-white/10">
              {isCredit ? 'Crédito' : 'Débito'}
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate max-w-[160px] sm:max-w-[200px]">
            {account.name}
          </span>
        </div>

        {/* Action Buttons & Currency */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(account);
            }}
            className="w-7 h-7 rounded-lg bg-black/40 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Editar cuenta"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(account);
            }}
            className="w-7 h-7 rounded-lg bg-black/40 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Eliminar cuenta"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/10">
            {isUSD ? 'USD' : 'MXN'}
          </span>
        </div>
      </div>

      {/* Chip EMV & Contactless Icon */}
      <div className="flex items-center gap-3 relative z-10 my-1">
        {/* Realistic Gold EMV Chip */}
        <div className="w-11 h-8 sm:w-12 sm:h-8.5 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1.5px] shadow-sm shadow-amber-900/40 relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 rounded-[3px] relative flex flex-col justify-between py-1 px-1 border border-amber-500/40">
            <div className="h-[1px] w-full bg-amber-700/40"></div>
            <div className="h-[1px] w-full bg-amber-700/40"></div>
            <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-amber-700/40"></div>
            <div className="absolute top-0 bottom-0 right-1/3 w-[1px] bg-amber-700/40"></div>
          </div>
        </div>

        {/* Contactless Signal Wave */}
        <span className="material-symbols-outlined text-lg sm:text-xl text-white/60 -rotate-90">
          wifi
        </span>
      </div>

      {/* Embossed Card Number */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-base sm:text-lg tracking-widest text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span className="text-white font-bold">{last4}</span>
        </div>
      </div>

      {/* Card Footer: Balance & Mastercard Logo */}
      <div className="flex items-end justify-between relative z-10 pt-1 border-t border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold block">
            {isCredit ? 'Saldo por pagar' : 'Saldo Disponible'}
          </span>
          <div className="text-base sm:text-lg font-bold text-white tabular-nums drop-shadow-sm leading-tight">
            {isUSD ? 'US$' : '$'}{bal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-[10px] font-normal text-white/70">{account.currency}</span>
          </div>

          {/* USD approximate in MXN */}
          {isUSD && (
            <span className="text-[10px] text-emerald-300 font-medium block">
              ≈ ${(bal * exchangeRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          )}

          {/* Credit Limit Usage Bar */}
          {isCredit && limit > 0 && (
            <div className="w-28 sm:w-36 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (bal / limit) * 100)}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Official-Style Mastercard Logo */}
        <div className="flex items-center relative pl-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#eb001b] opacity-90 shadow-sm"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f79e1b] opacity-90 -ml-3 sm:-ml-3.5 mix-blend-screen shadow-sm"></div>
        </div>
      </div>
    </div>
  );
};
