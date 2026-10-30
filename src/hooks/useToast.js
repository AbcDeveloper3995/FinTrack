import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing UI toasts
 */
export const useToast = (autoDismissTime = 4000) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', title = null) => {
    setToast({
      id: Date.now(),
      message,
      type,
      title: title || (type === 'success' ? '¡Operación exitosa!' : type === 'error' ? 'Atención' : 'Notificación'),
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, autoDismissTime);
    return () => clearTimeout(timer);
  }, [toast, autoDismissTime]);

  return { toast, showToast, hideToast };
};
