import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect: Premium, custom dropdown selector.
 * Replaces native HTML <select> with a rich, tactile, floating menu
 * with search filter, icons, badges, smooth animations and keyboard/click-outside navigation.
 * Supports auto-placement (opens upwards if near bottom of modal/screen).
 */
export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  className = '',
  buttonClassName = '',
  disabled = false,
  searchable = 'auto', // true | false | 'auto' (enabled if >= 6 options)
  placement = 'auto', // 'auto' | 'down' | 'up'
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualPlacement, setActualPlacement] = useState('down');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Determine whether search should be enabled
  const shouldShowSearch =
    searchable === true || (searchable === 'auto' && options.length >= 6);

  // Auto-detect placement (up or down) based on available room in viewport & modal
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setActualPlacement('down');
      return;
    }

    if (placement === 'up' || placement === 'down') {
      setActualPlacement(placement);
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Check distance to bottom of scroll container (modal) if inside one
      const scrollParent = containerRef.current.closest('.overflow-y-auto');
      let parentSpaceBelow = spaceBelow;
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        parentSpaceBelow = parentRect.bottom - rect.bottom;
      }

      // If less than 220px below and there is ample space above, open upwards
      if ((parentSpaceBelow < 220 || spaceBelow < 220) && spaceAbove > 180) {
        setActualPlacement('up');
      } else {
        setActualPlacement('down');
      }
    }

    if (shouldShowSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, placement, shouldShowSearch]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optValue, optDisabled) => {
    if (optDisabled) return;
    onChange?.(optValue);
    setIsOpen(false);
  };

  // Normalize string helper for accent-insensitive search
  const normalizeText = (txt) =>
    String(txt || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredOptions = shouldShowSearch && searchQuery.trim()
    ? options.filter((opt) => {
        const query = normalizeText(searchQuery);
        const matchLabel = normalizeText(opt.label).includes(query);
        const matchBadge = normalizeText(opt.badge).includes(query);
        return matchLabel || matchBadge;
      })
    : options;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none cursor-pointer border ${
          disabled
            ? 'bg-surface-container-low/50 text-on-surface-variant/40 border-surface-container cursor-not-allowed dark:bg-slate-900/40 dark:border-slate-800'
            : isOpen
            ? 'bg-surface-container-lowest text-on-surface border-primary ring-2 ring-primary/20 shadow-sm dark:bg-[#131c31] dark:border-primary dark:ring-primary/30'
            : 'bg-surface-container-lowest text-on-surface border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/40 shadow-xs dark:bg-[#131c31] dark:border-slate-700/70 dark:hover:border-primary/60 dark:hover:bg-[#1a2540]'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="material-symbols-outlined text-lg text-primary dark:text-indigo-400 shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              {selectedOption.color && (
                <span
                  style={{ backgroundColor: selectedOption.color }}
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                />
              )}
              <span className="truncate text-on-surface font-semibold text-xs sm:text-sm">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant dark:bg-slate-800 dark:text-slate-300 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-on-surface-variant text-xs sm:text-sm truncate">
              {placeholder}
            </span>
          )}
        </div>

        <span
          className={`material-symbols-outlined text-lg text-on-surface-variant shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary dark:text-indigo-400' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Menu Popover (Opens Upwards or Downwards with room for 4+ items) */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 overflow-hidden flex flex-col rounded-2xl bg-surface-container-lowest border border-surface-container-high/90 shadow-2xl duration-150 dark:bg-[#0f172a] dark:border-slate-700 ${
            actualPlacement === 'up'
              ? 'bottom-full mb-1.5 origin-bottom animate-in fade-in slide-in-from-bottom-2'
              : 'top-full mt-1.5 origin-top animate-in fade-in slide-in-from-top-2'
          }`}
        >
          {/* Integrated Search Input */}
          {shouldShowSearch && (
            <div className="p-1.5 border-b border-surface-container-high/60 dark:border-slate-800/80 bg-surface-container-lowest dark:bg-[#0f172a] shrink-0">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-base text-on-surface-variant/70 pointer-events-none">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full h-7 pl-8 pr-7 text-xs bg-surface-container-low/70 dark:bg-slate-800/80 text-on-surface rounded-lg border border-outline-variant/30 focus:border-primary dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List (min-h-[140px] and max-h-52 fits 4-5 items cleanly) */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 min-h-[135px] max-h-52">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm transition-colors select-none ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                        : isSelected
                        ? 'bg-primary/10 text-primary font-bold cursor-pointer dark:bg-indigo-500/25 dark:text-indigo-300'
                        : 'text-on-surface hover:bg-surface-container hover:text-on-surface dark:text-slate-200 dark:hover:bg-slate-800/90 dark:hover:text-white cursor-pointer font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      {opt.icon && (
                        <span
                          className={`material-symbols-outlined text-base shrink-0 ${
                            isSelected
                              ? 'text-primary dark:text-indigo-400'
                              : 'text-on-surface-variant group-hover:text-on-surface dark:text-slate-400'
                          }`}
                        >
                          {opt.icon}
                        </span>
                      )}
                      {opt.color && (
                        <span
                          style={{ backgroundColor: opt.color }}
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20"
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant dark:bg-slate-800 dark:text-slate-300 shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="material-symbols-outlined text-base text-primary dark:text-indigo-400 shrink-0">
                        check
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-on-surface-variant italic dark:text-slate-400">
                {searchQuery ? 'No se encontraron coincidencias' : 'Sin opciones disponibles'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
