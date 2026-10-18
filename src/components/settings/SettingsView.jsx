import React, { useState } from 'react';

export const SettingsView = () => {
  const [userName, setUserName] = useState('Sofía Ramírez Delgado');
  const [userEmail, setUserEmail] = useState('sofia.ramirez@ejemplo.com');
  const [currency, setCurrency] = useState('MXN');
  const [firstDay, setFirstDay] = useState('15');
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container-lowest text-on-surface shadow-2xl border border-secondary/40 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-lg">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-on-surface">Cambios guardados</span>
            <span className="text-xs text-on-surface-variant">Preferencias actualizadas exitosamente en la nube.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Top Page Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-primary-fixed text-on-primary-fixed">
              Sistema y Cuenta
            </span>
            <span className="text-on-surface-variant text-label-md">•</span>
            <span className="text-on-surface-variant text-label-md">Sincronizado vía AES-256</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Configuración y Preferencias
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Personaliza el motor de cálculo contable, seguridad, aspecto visual e integración de extractos bancarios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-md hover:bg-primary-container shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Lateral rail + Setting Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Rail (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col gap-1">
            <div className="px-3 py-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Secciones
              </span>
            </div>
            <a href="#perfil" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium text-sm">
              <span className="material-symbols-outlined text-lg">person</span>
              <span>Perfil de Usuario</span>
            </a>
            <a href="#reglas" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold shadow-sm text-sm">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span>Preferencias Financieras</span>
            </a>
            <a href="#seguridad" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium text-sm">
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Seguridad y Cifrado</span>
            </a>
          </div>

          {/* Quick Storage Indicator Card */}
          <div className="bg-surface-container p-4 rounded-2xl border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-bold text-on-surface uppercase">
                Bóveda Cifrada
              </span>
              <span className="font-label-md text-label-md text-secondary font-bold">14.2 MB / 1 GB</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '14%' }}></div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-tight">
              4,812 transacciones y comprobantes en caché local optimizado.
            </p>
          </div>
        </div>

        {/* Right Detail Sections (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Section 1: Perfil y Datos Personales */}
          <div id="perfil" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Perfil y Datos Personales
                  </h2>
                  <p className="text-xs text-on-surface-variant">Información de la titular de la cuenta principal.</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                Verificado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant font-semibold mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant font-semibold mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant font-semibold mb-1">
                  Moneda Base
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest outline-none cursor-pointer"
                >
                  <option value="MXN">Peso Mexicano (MXN - $)</option>
                  <option value="USD">Dólar Estadounidense (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant font-semibold mb-1">
                  Primer día del mes financiero
                </label>
                <select
                  value={firstDay}
                  onChange={(e) => setFirstDay(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-transparent focus:border-primary/30 focus:bg-surface-container-lowest outline-none cursor-pointer"
                >
                  <option value="1">Día 1 del mes calendario</option>
                  <option value="15">Día 15 (Día de nómina quincenal)</option>
                  <option value="25">Día 25 (Pago fin de mes)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Seguridad y Cifrado */}
          <div id="seguridad" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">lock</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Seguridad y Cifrado de Bóveda
                </h2>
                <p className="text-xs text-on-surface-variant">Parámetros de acceso biométrico, 2FA y hardware token.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                  <div>
                    <h4 className="font-semibold text-sm text-on-surface">Doble Factor de Autenticación (2FA)</h4>
                    <p className="text-xs text-on-surface-variant">Protegido con TOTP (Google Authenticator / Authy)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                  Activo
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-surface-container">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">cloud_done</span>
                  <div>
                    <h4 className="font-semibold text-sm text-on-surface">Copia de Seguridad Automática</h4>
                    <p className="text-xs text-on-surface-variant">Instantánea cifrada en servidor seguro cada 24 horas</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-fixed text-on-primary-fixed">
                  Sincronizado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
