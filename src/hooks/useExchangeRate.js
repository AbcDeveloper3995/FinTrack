import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage real-time USD/MXN exchange rate
 */
export const useExchangeRate = (defaultRate = 17.85) => {
  const [exchangeRate, setExchangeRate] = useState(defaultRate);
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState(null);

  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.MXN) {
          setExchangeRate(Number(data.rates.MXN));
          setExchangeRateLastUpdated(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener tasa de cambio en vivo, usando fallback:', err);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    // Refresh rate every 15 minutes
    const interval = setInterval(fetchExchangeRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  return {
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
  };
};
