import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FEATURES } from '../../config/features';

export const AppHeader = ({ activeTab, user, onLogout: _onLogout }) => {
  const { currentPeriod, setIsNewMovementModalOpen } = useFinance();

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Panel Financiero';
      case 'movimientos':
        return 'Bitácora de Movimientos';
      case 'cuentas':
        return 'Cuentas y Tarjetas';
      case 'categorias':
        return 'Categorías y Etiquetas';
      case 'analisis':
        return 'Diagnóstico Comparativo Pro';
      case 'presupuestos':
        return 'Presupuestos y Metas';
      case 'configuracion':
        return 'Configuración y Preferencias';
      default:
        return 'Panel Financiero';
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-6">
      {/* Breadcrumb Module Title */}
      <div className="flex items-center gap-2">
        <div className="flex items-center text-on-surface-variant font-label-md text-label-md">
          <span className="hover:text-on-surface cursor-pointer">FinTrack</span>
          <span className="material-symbols-outlined text-base mx-1 text-outline-variant">chevron_right</span>
          <span className="text-on-surface font-semibold">{getBreadcrumbLabel()}</span>
        </div>
      </div>

      {/* Header Tools & Actions */}
      <div className="flex items-center gap-3">
        {/* Month Selector */}
        <div className="inline-flex items-center bg-surface-container-low rounded-lg px-2 py-1 border border-surface-container">
          <button
            type="button"
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <div className="flex items-center gap-1.5 px-2 text-on-surface font-body-md text-body-md font-medium">
            <span className="material-symbols-outlined text-base text-on-surface-variant">calendar_today</span>
            <span>{currentPeriod}</span>
          </div>
          <button
            type="button"
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        {/* Global Search Bar (Phase 2 Feature) */}
        {FEATURES.HEADER_SEARCH_BAR && (
          <div className="relative hidden md:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder="Buscar movimientos, cuentas o comercios..."
              className="w-72 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-9 pr-12 py-1.5 rounded-lg text-body-md font-body-md border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-label-md text-label-md font-semibold bg-surface-container-highest text-on-surface-variant rounded">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Global Add Movement Button */}
        <button
          type="button"
          onClick={() => setIsNewMovementModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary font-body-md text-body-md font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="hidden sm:inline">Nuevo movimiento</span>
        </button>

        {/* Theme Mode Toggle (Phase 2 Feature) */}
        {FEATURES.HEADER_THEME_TOGGLE && (
          <button
            type="button"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            title="Modo Visual"
          >
            <span className="material-symbols-outlined text-xl">light_mode</span>
          </button>
        )}

        {/* Notifications Icon with Alert Dot (Phase 2 Feature) */}
        {FEATURES.HEADER_NOTIFICATIONS && (
          <div className="relative">
            <button
              type="button"
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative cursor-pointer"
              title="Notificaciones"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
            </button>
          </div>
        )}

        {/* Profile Card & Session */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-container">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-primary-fixed">
            {user?.name ? user.name[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
              {user?.name || user?.email?.split('@')[0] || 'Usuario'}
            </span>
            <span className="font-label-md text-label-md text-secondary leading-none">
              FinTrack Pro
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
