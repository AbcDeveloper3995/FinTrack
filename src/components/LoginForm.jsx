import React, { useState } from 'react';

export const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('sofia.ramirez@ejemplo.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        onLoginSuccess({ email, name: 'Sofía Ramírez' });
      } else {
        setError('Por favor completa todos los campos requeridos.');
      }
    }, 700);
  };

  return (
    <div className="w-full">
      {/* Switcher & SSL Status */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-surface-container">
        <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Crear Cuenta</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-secondary-container/40 rounded-full text-on-secondary-container font-label-md text-label-md">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Portal Seguro SSL</span>
        </div>
      </div>

      {/* Headline Header */}
      <div className="mb-8">
        <span className="text-secondary font-label-md text-label-md tracking-wider uppercase block mb-1">
          Acceso Patrimonial
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Bienvenido de nuevo a FinTrack
        </h1>
        <p className="text-on-surface-variant font-body-md text-body-md mt-1">
          Ingresa a tu control financiero patrimonial con auditoría en tiempo real.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-body-md flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Auth Form Body */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="login-email">
              Correo Electrónico Registrado
            </label>
            <span className="text-secondary font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Verificación 2FA activa
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
              className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all outline-none"
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="login-password">
              Contraseña de Acceso
            </label>
            <button
              type="button"
              className="text-primary hover:text-primary-container text-label-md font-label-md hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">key</span>
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu clave de seguridad"
              required
              className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Device & Security Token */}
        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-outline-variant"
            />
            <span className="text-body-md text-on-surface-variant">Recordar este dispositivo por 30 días</span>
          </label>
          <span className="hidden sm:inline-flex items-center gap-1 text-label-md text-on-surface-variant/70">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Hardware Token Ready
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-headline-md text-headline-md tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-primary/30 disabled:opacity-70 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Ingresar a FinTrack</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>

        {/* Footnote */}
        <div className="pt-4 text-center">
          <p className="text-body-md text-on-surface-variant">
            ¿No tienes cuenta patrimonial todavía?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary font-semibold hover:underline"
            >
              Comienza tu registro aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
