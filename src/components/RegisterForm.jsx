import React, { useState } from 'react';

export const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [fullName, setFullName] = useState('Sofía Ramírez Delgado');
  const [email, setEmail] = useState('sofia.ramirez@ejemplo.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const strength = getPasswordStrength();

  const getStrengthLabel = () => {
    if (strength === 0) return 'Sin ingresar';
    if (strength <= 25) return 'Débil';
    if (strength <= 50) return 'Aceptable';
    if (strength <= 75) return 'Buena';
    return 'Robusta (Nivel Bancario)';
  };

  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-error';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-secondary';
    return 'bg-secondary';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess({ fullName, email });
    }, 700);
  };

  return (
    <div className="w-full">
      {/* Switcher & SSL Status */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-surface-container">
        <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary shadow-sm flex items-center justify-center gap-2 transition-all"
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
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md mb-2">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>Acceso Ilimitado • Plan Starter Gratuito</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Comienza a dominar tus finanzas
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Únete a FinTrack y toma el control de tus ingresos, gastos y metas de ahorro con precisión bancaria.
        </p>
      </div>

      {/* Quick Social Authentication */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          className="w-full h-11 px-4 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-colors rounded-xl flex items-center justify-center gap-2.5 text-on-surface font-label-md text-label-md shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" fill="#4285F4"></path>
            <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24Z" fill="#34A853"></path>
            <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.89 0 12s.45 3.86 1.24 5.42l4.04-3.15Z" fill="#FBBC05"></path>
            <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" fill="#EA4335"></path>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <button
          type="button"
          className="w-full h-11 px-4 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-colors rounded-xl flex items-center justify-center gap-2.5 text-on-surface font-label-md text-label-md shadow-sm"
        >
          <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.7-7.85-12.01-14.34-6.3-9.45-11.13-19.86-14.49-31.25-3.37-11.38-5.06-22.39-5.06-33.02 0-14.93 3.68-27.18 11.04-36.75 7.36-9.56 16.59-14.44 27.69-14.63 4.8 0 10.23 1.34 16.3 4.02 6.07 2.68 9.94 4.07 11.61 4.17 1.48-.1 5.46-1.55 11.95-4.35 6.49-2.8 12.06-4.08 16.71-3.84 12.63.78 22.84 5.37 30.64 13.78-10.98 6.64-16.37 15.64-16.16 27 0 9.87 3.82 18.25 11.45 25.13 7.64 6.89 16.89 10.77 27.77 11.66-2.22 7.02-4.87 13.82-7.97 20.4zM119.22 33.15c0-6.9 2.45-13.3 7.35-19.21 4.9-5.91 11.01-9.96 18.33-12.15.54 1.83.81 3.64.81 5.43 0 7.02-2.58 13.56-7.75 19.62-5.17 6.05-11.4 10.15-18.74 12.31-.07-2-.1-3.7-.1-5.1l.1-.9z"></path>
          </svg>
          <span>Continuar con Apple</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow bg-surface-container h-[1px]"></div>
        <span className="flex-shrink mx-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          o con tu email institucional o personal
        </span>
        <div className="flex-grow bg-surface-container h-[1px]"></div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-body-md flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="reg-fullname">
            Nombre Completo
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline">badge</span>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sofía Ramírez Delgado"
              required
              className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="reg-email">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline">mail</span>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sofia.ramirez@ejemplo.com"
              required
              className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="reg-password">
              Contraseña de Acceso
            </label>
            <span className="text-label-md font-label-md text-on-surface-variant">
              Seguridad: <span className="font-semibold text-primary">{getStrengthLabel()}</span>
            </span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-outline">lock</span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña segura (mín. 8 caracteres)"
              required
              className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all outline-none"
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

          {/* Password strength progress bar */}
          <div className="w-full h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            ></div>
          </div>
        </div>

        {/* Legal Agreements */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary/30 border-outline-variant"
            />
            <span className="text-body-md text-on-surface-variant text-sm leading-relaxed">
              He leído y acepto los{' '}
              <a href="#" className="text-primary font-medium hover:underline">
                Términos del Servicio
              </a>{' '}
              y la{' '}
              <a href="#" className="text-primary font-medium hover:underline">
                Política de Privacidad y Cumplimiento Financiero
              </a>.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-headline-md text-headline-md tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-primary/30 disabled:opacity-70 cursor-pointer mt-4"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Crear Cuenta Gratuita</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>

        {/* Footnote */}
        <div className="pt-4 text-center">
          <p className="text-body-md text-on-surface-variant">
            ¿Ya tienes una cuenta patrimonial?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary font-semibold hover:underline"
            >
              Iniciar sesión aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
