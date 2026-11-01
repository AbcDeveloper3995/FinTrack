import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomDatePicker: Modern, custom calendar popup tailored for FinTrack.
 * Features:
 * - Beautiful glassmorphic / dark mode floating calendar window
 * - Month and Year navigation
 * - Day grid with current selection, today highlight, and max-date limits
 * - Quick shortcuts: "Hoy", "Ayer", "Hace 2 días", "Inicio de mes"
 * - Click-outside & Escape dismissal
 */
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export const CustomDatePicker = ({
  value,
  onChange,
  maxDate,
  minDate,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to today
  const parseYMD = (ymdStr) => {
    if (!ymdStr) return new Date();
    const [y, m, d] = ymdStr.split('-').map(Number);
    return new Date(y, m - 1, d || 1);
  };

  const toYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateObj = parseYMD(value);
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth());

  const todayStr = toYMD(new Date());

  // Keep view aligned when value changes externally
  useEffect(() => {
    if (value) {
      const d = parseYMD(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prev / Next Month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Build Calendar Days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const daysArray = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    daysArray.push({
      day: daysInPrevMonth - i,
      month: viewMonth - 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remainingCells = (7 - (daysArray.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      month: viewMonth + 1,
      year: viewYear,
      isCurrentMonth: false,
    });
  }

  const handleDaySelect = (dayObj) => {
    const targetDate = new Date(dayObj.year, dayObj.month, dayObj.day);
    const dateStr = toYMD(targetDate);

    if (maxDate && dateStr > maxDate) return;
    if (minDate && dateStr < minDate) return;

    onChange?.(dateStr);
    setIsOpen(false);
  };

  // Friendly human format for display
  const formatDisplay = (val) => {
    if (!val) return 'Seleccionar fecha';
    if (val === todayStr) return 'Hoy';
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (val === toYMD(yest)) return 'Ayer';
    try {
      const [y, m, d] = val.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: dt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return val;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 bg-surface-container-lowest dark:bg-surface-container-lowest text-on-surface rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-xs flex items-center justify-between gap-2 text-left ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container-low/40'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-base">calendar_month</span>
          </div>
          <div className="truncate">
            <span className="capitalize">{formatDisplay(value)}</span>
            <span className="text-[11px] text-on-surface-variant font-normal ml-2 hidden sm:inline">
              ({value})
            </span>
          </div>
        </div>

        <span className="material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 shrink-0">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Floating Popup Window */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-full sm:w-[320px] bg-surface-container-lowest dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-surface-container-high/80 dark:border-slate-800 p-4 animate-fade-in backdrop-blur-md">
          {/* Header: Month & Year Navigator */}
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-surface-container dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-on-surface dark:text-slate-100">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="font-semibold text-xs text-on-surface-variant dark:text-slate-400">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                }}
                className="px-2 py-0.5 rounded-md text-[11px] font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_LABELS.map((label, idx) => (
              <span
                key={label}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 || idx === 6
                    ? 'text-on-surface-variant/70 dark:text-slate-500'
                    : 'text-on-surface-variant dark:text-slate-400'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((item, idx) => {
              const itemDate = new Date(item.year, item.month, item.day);
              const itemStr = toYMD(itemDate);
              const isSelected = itemStr === value;
              const isToday = itemStr === todayStr;
              const isFuture = maxDate && itemStr > maxDate;
              const isPastLimit = minDate && itemStr < minDate;
              const isDisabled = isFuture || isPastLimit;

              return (
                <button
                  key={`${itemStr}-${idx}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDaySelect(item)}
                  className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isDisabled
                      ? 'opacity-25 cursor-not-allowed text-on-surface-variant'
                      : isSelected
                      ? 'bg-primary text-white shadow-md font-bold scale-105 z-10'
                      : isToday
                      ? 'bg-primary/15 text-primary font-bold hover:bg-primary/25 border border-primary/30'
                      : item.isCurrentMonth
                      ? 'text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-800'
                      : 'text-on-surface-variant/40 dark:text-slate-600 hover:bg-surface-container/50'
                  }`}
                >
                  <span>{item.day}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-surface-container dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-on-surface-variant dark:text-slate-400">
              Atajos rápidos:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onChange?.(todayStr);
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-lg bg-surface-container-low dark:bg-slate-800 hover:bg-primary hover:text-white text-on-surface dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date();
                  y.setDate(y.getDate() - 1);
                  onChange?.(toYMD(y));
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded-lg bg-surface-container-low dark:bg-slate-800 hover:bg-primary hover:text-white text-on-surface dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
              >
                Ayer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
