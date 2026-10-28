import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect: Premium, custom dropdown selector.
 * Replaces native HTML <select> with a rich, tactile, floating menu
 * with icons, badges, smooth animations and keyboard/click-outside navigation.
 */
export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  className = '',
  buttonClassName = '',
  disabled = false,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

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

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none cursor-pointer border ${
          disabled
            ? 'bg-surface-container-low/50 text-on-surface-variant/40 border-surface-container cursor-not-allowed'
            : isOpen
            ? 'bg-surface-container-lowest text-on-surface border-primary ring-2 ring-primary/20 shadow-sm'
            : 'bg-surface-container-lowest text-on-surface border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/40 shadow-xs'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="material-symbols-outlined text-lg text-primary shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              {selectedOption.color && (
                <span
                  style={{ backgroundColor: selectedOption.color }}
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                />
              )}
              <span className="truncate text-on-surface font-semibold text-xs sm:text-sm">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant shrink-0">
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
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-surface-container-lowest border border-surface-container-high/90 shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {options.length > 0 ? (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={String(opt.value)}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors select-none ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                      : isSelected
                      ? 'bg-primary/10 text-primary font-bold cursor-pointer'
                      : 'text-on-surface hover:bg-surface-container-low cursor-pointer font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                    {opt.icon && (
                      <span className={`material-symbols-outlined text-base shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {opt.icon}
                      </span>
                    )}
                    {opt.color && (
                      <span
                        style={{ backgroundColor: opt.color }}
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-base text-primary shrink-0">
                      check
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-3 text-center text-xs text-on-surface-variant italic">
              Sin opciones disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};
