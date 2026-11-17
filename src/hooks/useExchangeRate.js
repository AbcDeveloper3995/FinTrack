import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage real-time USD/MXN exchange rate.
 * Uses Coinbase spot market and fxratesapi matching Google Finance live rates,
 * with fallbacks (open.er-api, cloudflare pages) and custom rate override support.
 */
export const useExchangeRate = (defaultRate = 18.52) => {
  const [customRate, setCustomRateState] = useState(() => {
    try {
      const stored = localStorage.getItem('fintrack_custom_exchange_rate');
      if (stored) {
        const num = parseFloat(stored);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [exchangeRate, setExchangeRate] = useState(() => {
    // If user has a custom rate set, respect it
    try {
      const stored = localStorage.getItem('fintrack_custom_exchange_rate');
      if (stored) {
        const num = parseFloat(stored);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch {
      // ignore
    }

    try {
      const cached = sessionStorage.getItem('fintrack_exchange_rate');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.rate && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          return Number(parsed.rate);
        }
      }
    } catch {
      // ignore
    }
    return defaultRate;
  });

  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState(() => {
    try {
      const cached = sessionStorage.getItem('fintrack_exchange_rate');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.updated) return parsed.updated;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const setCustomRate = useCallback((rate) => {
    if (rate === null || rate === undefined || rate === '' || Number(rate) <= 0) {
      try {
        localStorage.removeItem('fintrack_custom_exchange_rate');
      } catch {
        // ignore
      }
      setCustomRateState(null);
      // Re-trigger fetch to restore live rate
      fetchExchangeRate();
    } else {
      const num = Number(rate);
      if (!isNaN(num) && num > 0) {
        try {
          localStorage.setItem('fintrack_custom_exchange_rate', String(num));
        } catch {
          // ignore
        }
        setCustomRateState(num);
        setExchangeRate(num);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setExchangeRateLastUpdated(`${timeStr} (Personalizado)`);
      }
    }
  }, []);

  const updateRate = useCallback((rate, sourceName = '') => {
    const num = Number(rate);
    if (!isNaN(num) && num > 0) {
      // If a custom rate is set by user, don't overwrite it with live feed
      const isManual = localStorage.getItem('fintrack_custom_exchange_rate');
      if (isManual) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setExchangeRate(num);
      setExchangeRateLastUpdated(timeStr);
      try {
        sessionStorage.setItem(
          'fintrack_exchange_rate',
          JSON.stringify({
            rate: num,
            timestamp: Date.now(),
            updated: timeStr,
            source: sourceName,
          })
        );
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    // If custom rate is locked, do not fetch
    try {
      const stored = localStorage.getItem('fintrack_custom_exchange_rate');
      if (stored) {
        const num = parseFloat(stored);
        if (!isNaN(num) && num > 0) {
          setExchangeRate(num);
          return;
        }
      }
    } catch {
      // ignore
    }

    const ts = Date.now();

    // 1. Primary: Coinbase Live Spot Feed (matching Google Finance in real time)
    try {
      const res = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=USD&_t=${ts}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const rate = parseFloat(data?.data?.rates?.MXN);
        if (rate && !isNaN(rate) && rate > 0) {
          updateRate(rate, 'Google Finance / Coinbase');
          return;
        }
      }
    } catch {
      // Continue to next provider
    }

    // 2. Secondary: FXRates API (real-time spot rate)
    try {
      const res = await fetch(`https://api.fxratesapi.com/latest?base=USD&currencies=MXN&_t=${ts}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const rate = parseFloat(data?.rates?.MXN);
        if (rate && !isNaN(rate) && rate > 0) {
          updateRate(rate, 'FXRates');
          return;
        }
      }
    } catch {
      // Continue to next provider
    }

    // 3. Tertiary: Open.er-api.com
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/USD?_t=${ts}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const rate = parseFloat(data?.rates?.MXN);
        if (rate && !isNaN(rate) && rate > 0) {
          updateRate(rate, 'Open-ER');
          return;
        }
      }
    } catch {
      // Continue to next provider
    }

    // 4. Quaternary: Cloudflare Pages Currency API
    try {
      const res = await fetch(`https://latest.currency-api.pages.dev/v1/currencies/usd.json?_t=${ts}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.usd?.mxn) {
          updateRate(data.usd.mxn, 'Cloudflare');
          return;
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener tasa de cambio en vivo, usando última tasa conocida:', err);
    }
  }, [updateRate]);

  useEffect(() => {
    fetchExchangeRate();
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  return {
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
    customRate,
    setCustomRate,
    isCustomRate: !!customRate,
  };
};
