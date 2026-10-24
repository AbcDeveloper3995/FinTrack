import React from 'react';

/**
 * ConfirmModal
 * A clean, dedicated confirmation dialog replacing native window.confirm alerts.
 * Features:
 * - Destructive action styling (red button for deletes)
 * - Clear title and explanatory body text
 * - Backdrop click or cancel to dismiss
 */
export const ConfirmModal = ({
  isOpen = false,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high/80 animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-error-container text-error' : 'bg-primary-container/20 text-primary'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {isDestructive ? 'delete_forever' : 'help'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface leading-snug">
                {title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isDestructive
                  ? 'bg-error hover:bg-error/90 text-on-error'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
            >
              {isLoading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
