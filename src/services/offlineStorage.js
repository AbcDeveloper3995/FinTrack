/**
 * Offline & Local Cache Storage Service for FinTrack
 * Handles client-side persistence (IndexedDB / LocalStorage fallback)
 * Allows offline consultation of balances, movements, and cached exchange rate.
 */

const CACHE_PREFIX = 'fintrack_cache_';

export const offlineStorage = {
  // Save user financial snapshot to localStorage
  saveSnapshot(userId, { accounts, categories, tags, transactions, kpis, creditDebt, exchangeRate }) {
    if (!userId) return;
    try {
      const payload = {
        timestamp: Date.now(),
        data: {
          accounts: accounts || [],
          categories: categories || [],
          tags: tags || [],
          transactions: transactions || [],
          kpis: kpis || null,
          creditDebt: creditDebt || null,
          exchangeRate: exchangeRate || 17.85,
        },
      };
      localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(payload));
    } catch (err) {
      console.warn('No se pudo guardar la caché local offline:', err);
    }
  },

  // Load cached financial snapshot
  loadSnapshot(userId) {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${userId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (err) {
      console.warn('Error leyendo la caché local offline:', err);
      return null;
    }
  },

  // Clear cache on logout
  clearSnapshot(userId) {
    if (!userId) return;
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${userId}`);
    } catch (err) {
      console.warn('Error limpiando caché local:', err);
    }
  },
};
