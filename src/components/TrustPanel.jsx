import React from 'react';

export const TrustPanel = ({ mode }) => {
  if (mode === 'login') {
    return (
      <div className="flex flex-col gap-6">
        {/* Main Bank Grade Security Card */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-md border border-surface-container-high/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">lock_clock</span>
            </div>
            <div>
              <span className="text-secondary font-label-md text-label-md uppercase tracking-wider block">
                Cifrado Militar AES-256
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Seguridad Grado Bancario
              </h3>
            </div>
          </div>

          <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
            Tus datos patrimoniales y credenciales se encuentran aislados criptográficamente. Ningún dato sensible se almacena sin doble factor ni cifrado de punto a punto.
          </p>

          <div className="space-y-3 pt-2 border-t border-surface-container">
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                Auditoría en tiempo real
              </span>
              <span className="font-semibold text-secondary">Activa</span>
            </div>
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">shield_person</span>
                Protección contra accesos no autorizados
              </span>
              <span className="font-semibold text-secondary">100%</span>
            </div>
            <div className="flex items-center justify-between text-body-md">
              <span className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">cloud_sync</span>
                Sincronización multi-dispositivo
              </span>
              <span className="font-semibold text-on-surface">SSL TLS 1.3</span>
            </div>
          </div>
        </div>

        {/* Live System Status Widget */}
        <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Red Bancaria FinTrack</p>
              <p className="text-xs text-on-surface-variant">Sistemas 100% operativos</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-secondary-container/50 text-on-secondary-container text-xs font-semibold">
            99.99% Uptime
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
          Potencial FinTrack
        </span>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-3">
          Todo tu patrimonio en un solo lugar
        </h3>
        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
          Diseñado con estándares bancarios para brindarte claridad total sobre cuentas, gastos, presupuestos e inversiones.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Control de Cuentas & Tarjetas</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Centraliza cuentas bancarias, efectivo y líneas de crédito sin fricción.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">pie_chart</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Presupuestos Inteligentes</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Categorización automática y metas de ahorro con advertencias preventivas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Análisis Patrimonial y Tendencias</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Reportes claros del valor neto mensual y comparativas temporales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Quote / Proof */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container">
        <div className="flex items-center gap-1 text-yellow-500 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="material-symbols-outlined text-[16px] filled">
              star
            </span>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant italic">
          "FinTrack transformó la forma en que superviso mis cuentas familiares y de negocio. La precisión y seguridad son impecables."
        </p>
        <p className="text-xs font-semibold text-on-surface mt-2">— Sofía Ramírez, Inversionista</p>
      </div>
    </div>
  );
};
