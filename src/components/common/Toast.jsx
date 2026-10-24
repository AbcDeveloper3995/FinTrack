import React from 'react';

/**
 * Toast Container & Toast Notification
 * Displays pleasant floating status banners (success, error, info)
 */
export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  const iconName = isSuccess ? 'check_circle' : isError ? 'error' : isWarning ? 'warning' : 'info';
  const borderColor = isSuccess ? 'border-secondary/40' : isError ? 'border-error/40' : isWarning ? 'border-amber-500/40' : 'border-primary/40';
  const iconColor = isSuccess ? 'text-secondary' : isError ? 'text-error' : isWarning ? 'text-amber-500' : 'text-primary';
  const badgeBg = isSuccess ? 'bg-secondary/15' : isError ? 'bg-error/15' : isWarning ? 'bg-amber-500/15' : 'bg-primary/15';

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl border ${borderColor} flex items-start gap-3.5`}>
        <div className={`w-9 h-9 rounded-xl ${badgeBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <span className="material-symbols-outlined text-xl">{iconName}</span>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4 className="text-sm font-bold text-on-surface leading-tight">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
          title="Cerrar"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};
