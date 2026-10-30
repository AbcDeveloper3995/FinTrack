import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FEATURES } from '../../config/features';
import { Logo } from '../common/Logo';

export const AppSidebar = ({ activeTab, onNavigate, onLogout, isOpen = false, onClose }) => {
  const { kpis } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'dashboard' },
    { id: 'movimientos', label: 'Movimientos', icon: 'receipt_long' },
    { id: 'cuentas', label: 'Cuentas', icon: 'account_balance_wallet' },
    { id: 'categorias', label: 'Categorías y Etiquetas', icon: 'label' },
    { id: 'analisis', label: 'Análisis del Mes', icon: 'monitoring', isPro: true },
    { id: 'presupuestos', label: 'Presupuestos', icon: 'pie_chart' },
    { id: 'configuracion', label: 'Configuración', icon: 'settings' },
  ];

  const handleNavClick = (tabId) => {
    onNavigate(tabId);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* Sidebar Drawer (Slides in on mobile, fixed on desktop lg:translate-x-0) */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest shadow-2xl lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high/60 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Top Brand Logo & Mobile Close Button */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-surface-container-low">
            <Logo size={32} showText={true} textClassName="font-headline-md text-headline-md text-primary font-bold" />

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

        {/* Quick Net Worth Summary Card */}
        <div className="px-4 py-3">
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                Tu Dinero Total
              </span>
              <span className="flex items-center text-secondary font-label-md text-label-md font-bold">
                <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span>
                +{kpis.netWorthGrowth}%
              </span>
            </div>
            <div className="font-metric-md text-metric-md font-bold text-on-surface tracking-tight mt-1 tabular-nums">
              ${kpis.netWorth.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{' '}
              <span className="font-label-md text-label-md text-on-surface-variant font-normal">
                MXN
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-body-md text-body-md font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/20 font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'filled text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.isPro && (
                  <span
                    className={`font-label-md text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    Pro
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Sync Status & Session Footer */}
      <div className="p-3 bg-surface-container-lowest border-t border-surface-container-low">
        {FEATURES.SIDEBAR_CLOUD_SYNC_BADGE && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-secondary-fixed-dim ring-2 ring-secondary animate-pulse"></span>
              <div className="flex flex-col truncate">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Nube Sincronizada
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant truncate text-[10px]">
                  AES-256 Activo
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-1 text-on-surface-variant hover:text-on-surface transition-transform active:rotate-180 duration-300"
              title="Sincronizar ahora"
            >
              <span className="material-symbols-outlined text-lg">sync</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 text-label-md font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  </>
  );
};
