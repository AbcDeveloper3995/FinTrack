import React from 'react';

export const TrustPanel = ({ mode }) => {
  if (mode === 'login') {
    return (
      <div className="flex flex-col gap-6">
        {/* Main Benefits Card */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">savings</span>
            </div>
            <div>
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider block">
                Tu dinero bajo control
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Control claro y sin complicaciones
              </h3>
            </div>
          </div>

          <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
            Registra tus ingresos y gastos diarios, supervisa tus cuentas de débito o crédito y mantén un orden claro de tu dinero en cualquier momento.
          </p>

          <div className="space-y-3 pt-2 border-t border-surface-container">
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">account_balance_wallet</span>
                Gestión de cuentas y tarjetas
              </span>
              <span className="font-semibold text-secondary">Efectivo y bancos</span>
            </div>
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">category</span>
                Categorías y presupuestos
              </span>
              <span className="font-semibold text-secondary">A tu medida</span>
            </div>
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">wifi_off</span>
                Funciona sin conexión a internet
              </span>
              <span className="font-semibold text-on-surface">Modo offline</span>
            </div>
          </div>
        </div>

        {/* Practical Features Box */}
        <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Descarga tus reportes</p>
              <p className="text-xs text-on-surface-variant">Exporta tus movimientos en Excel y PDF en un clic</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-secondary-container/50 text-on-secondary-container text-xs font-semibold">
            Disponible
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Onboarding Benefits Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

        <span className="text-primary font-label-md text-label-md uppercase tracking-wider block mb-1">
          Bienvenido a FinTrack
        </span>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-3">
          Todo tu dinero ordenado en un solo lugar
        </h3>
        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
          Una herramienta sencilla e intuitiva pensada para ayudarte a saber exactamente cuánto ganas, cuánto gastas y cuánto puedes ahorrar mes a mes.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Registra tus gastos al instante</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Anota compras, transferencias e ingresos fácilmente para que no se te escape ningún detalle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">pie_chart</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Presupuestos mensuales</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Define límites de gasto por categoría (comida, transporte, hogar) y visualiza tu progreso día con día.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Exporta cuando quieras</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Descarga tus balances en hojas de cálculo de Excel o informes en PDF listos para imprimir o compartir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
