/**
 * Account Types specification & helpers for FinTrack
 */
export const ACCOUNT_TYPES = {
  debito: {
    label: 'Débito',
    fullLabel: 'Cuenta de Débito / Cheques',
    icon: 'account_balance',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  credito: {
    label: 'Crédito',
    fullLabel: 'Tarjeta de Crédito',
    icon: 'credit_card',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  inversion: {
    label: 'Inversión',
    fullLabel: 'Inversión / CETES / Bonos',
    icon: 'trending_up',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  ahorro: {
    label: 'Ahorro',
    fullLabel: 'Ahorro / Cajita / Bóveda',
    icon: 'savings',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  efectivo: {
    label: 'Efectivo',
    fullLabel: 'Efectivo Físico',
    icon: 'payments',
    badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  },
};

export const getAccountTypeMeta = (type) => {
  const normalized = String(type || '').toLowerCase().trim();
  return (
    ACCOUNT_TYPES[normalized] || {
      label: type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Cuenta',
      fullLabel: type || 'Cuenta',
      icon: 'account_balance_wallet',
      badgeClass: 'bg-surface-container text-on-surface-variant border-outline-variant/40',
    }
  );
};

