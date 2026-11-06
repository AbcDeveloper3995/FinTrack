import React from 'react';

/**
 * Reusable Pagination Component for FinTrack tables and lists.
 * Features:
 * - Page navigation with Smart ellipsis (1, 2 ... 5, 6)
 * - First / Previous / Next / Last controls
 * - Configurable page size (10, 25, 50, 100)
 * - Current range counter ("Mostrando 1 a 20 de 154")
 * - High contrast & accessible dark mode styling
 */
export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-container-high/60 text-xs sm:text-sm select-none ${className}`}
    >
      {/* Left side: Results counter & Page Size Selector */}
      <div className="flex items-center gap-3 text-on-surface-variant flex-wrap justify-center sm:justify-start">
        <span>
          Mostrando <strong className="text-on-surface font-semibold">{startItem}</strong> a{' '}
          <strong className="text-on-surface font-semibold">{endItem}</strong> de{' '}
          <strong className="text-on-surface font-semibold">{totalItems}</strong>
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-on-surface-variant/70">Filas:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 rounded-lg bg-surface-container-low dark:bg-slate-800 text-on-surface text-xs font-semibold border border-outline-variant/40 focus:border-primary outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Page Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Primera página"
        >
          <span className="material-symbols-outlined text-base">first_page</span>
        </button>

        {/* Previous Page */}
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Página anterior"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-7 text-center text-on-surface-variant text-xs">
                  •••
                </span>
              );
            }
            const isCurrent = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-primary text-white shadow-xs dark:bg-indigo-600'
                    : 'text-on-surface hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Página siguiente"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>

        {/* Last Page */}
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Última página"
        >
          <span className="material-symbols-outlined text-base">last_page</span>
        </button>
      </div>
    </div>
  );
};

