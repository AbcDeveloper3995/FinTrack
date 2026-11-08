import React from 'react';

export const TrustPanel = ({ mode }) => {
  if (mode === 'login') {
    return (
      <div className="flex flex-col gap-6">
        {/* Main Benefits Card */}
        <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
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

          <div className="space-y-3 pt-3 border-t border-surface-container">
            {/* Cuentas y tarjetas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  account_balance_wallet
                </span>
                <span className="text-xs sm:text-body-md text-on-surface font-medium">
                  Gestión de cuentas y tarjetas
                </span>
              </div>
              <span className="self-start sm:self-auto ml-7.5 sm:ml-0 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
                Efectivo y bancos
              </span>
            </div>

            {/* Categorías */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  category
                </span>
                <span className="text-xs sm:text-body-md text-on-surface font-medium">
                  Categorías y presupuestos
                </span>
              </div>
              <span className="self-start sm:self-auto ml-7.5 sm:ml-0 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20 shrink-0">
                A tu medida
              </span>
            </div>

            {/* Modo offline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  wifi_off
                </span>
                <span className="text-xs sm:text-body-md text-on-surface font-medium">
                  Funciona sin conexión a internet
                </span>
              </div>
              <span className="self-start sm:self-auto ml-7.5 sm:ml-0 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold bg-surface-container-high text-on-surface-variant border border-surface-container-highest shrink-0">
                Modo offline
              </span>
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
          <span className="px-2.5 py-1 rounded-md bg-secondary-container/50 text-on-secondary-container text-xs font-semibold shrink-0">
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
