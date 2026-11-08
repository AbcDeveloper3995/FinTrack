/**
 * Account Types specification & helpers for FinTrack
 * Ultra-premium micro-pill styling with subtle gradients, luminous borders and micro-icons.
 */
export const ACCOUNT_TYPES = {
  debito: {
    label: 'Débito',
    fullLabel: 'Cuenta de Débito / Cheques',
    icon: 'account_balance',
    badgeClass:
      'bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-400/25 shadow-xs',
    dotClass: 'bg-blue-500',
  },
  credito: {
    label: 'Crédito',
    fullLabel: 'Tarjeta de Crédito',
    icon: 'credit_card',
    badgeClass:
      'bg-gradient-to-r from-purple-500/15 to-pink-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 dark:border-purple-400/25 shadow-xs',
    dotClass: 'bg-purple-500',
  },
  inversion: {
    label: 'Inversión',
    fullLabel: 'Inversión / CETES / Bonos',
    icon: 'trending_up',
    badgeClass:
      'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/25 shadow-xs',
    dotClass: 'bg-amber-500',
  },
  ahorro: {
    label: 'Ahorro',
    fullLabel: 'Ahorro / Cajita / Bóveda',
    icon: 'savings',
    badgeClass:
      'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/25 shadow-xs',
    dotClass: 'bg-emerald-500',
  },
  efectivo: {
    label: 'Efectivo',
    fullLabel: 'Efectivo Físico',
    icon: 'payments',
    badgeClass:
      'bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 dark:border-teal-400/25 shadow-xs',
    dotClass: 'bg-teal-500',
  },
};

export const getAccountTypeMeta = (type) => {
  const normalized = String(type || '').toLowerCase().trim();
  return (
    ACCOUNT_TYPES[normalized] || {
      label: type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Cuenta',
      fullLabel: type || 'Cuenta',
      icon: 'account_balance_wallet',
      badgeClass:
        'bg-surface-container text-on-surface-variant border-outline-variant/40 shadow-xs',
      dotClass: 'bg-on-surface-variant',
    }
  );
};
