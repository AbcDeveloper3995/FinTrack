import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage real-time USD/MXN exchange rate.
 * Uses high-frequency primary provider matching Google Finance (JSDelivr Currency API)
 * with graceful fallback to open.er-api.com.
 */
export const useExchangeRate = (defaultRate = 18.62) => {
  const [exchangeRate, setExchangeRate] = useState(defaultRate);
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState(null);

  const fetchExchangeRate = useCallback(async () => {
    // 1. Try Primary Real-Time Provider (Updated continuously throughout the day)
    try {
      const res = await fetch(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.usd?.mxn) {
          setExchangeRate(Number(data.usd.mxn));
          setExchangeRateLastUpdated(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
          return;
        }
      }
    } catch {
      // Primary failed, continue to fallback
    }

    // 2. Secondary Fallback Provider (open.er-api.com)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data?.rates?.MXN) {
          setExchangeRate(Number(data.rates.MXN));
          setExchangeRateLastUpdated(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
          return;
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener tasa de cambio en vivo, usando última tasa conocida:', err);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    // Refresh rate every 10 minutes
    const interval = setInterval(fetchExchangeRate, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  return {
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
  };
};
