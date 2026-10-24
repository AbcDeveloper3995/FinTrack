import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

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
    if (strength <= 25) return 'Débil (mínimo 8 caracteres)';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Debes aceptar los términos y condiciones de confidencialidad para continuar.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.session && data?.user) {
        // Direct login if email confirmation is turned off in Supabase
        onRegisterSuccess({
          id: data.user.id,
          email: data.user.email,
          name: fullName || data.user.email.split('@')[0],
        });
      } else if (data?.user) {
        // If Supabase has email confirmation enabled
        setSuccessNotice('¡Cuenta creada con éxito! Si tu proyecto requiere confirmación, revisa tu bandeja de entrada o inicia sesión directamente.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2500);
      }
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      if (err.message?.includes('already registered')) {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else {
        setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Switcher & SSL Status */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-surface-container">
        <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Crear Cuenta</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-secondary-container/40 rounded-full text-on-secondary-container font-label-md text-label-md">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>100% Privado</span>
        </div>
      </div>

      {/* Main Title & Lead */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-secondary text-2xl">sparkles</span>
          <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">
            Empieza hoy
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Crea tu cuenta gratis
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Lleva el control de tus gastos, ahorros y metas en un solo lugar.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">error</span>
          <p className="font-body-md text-body-md text-on-surface">{error}</p>
        </div>
      )}

      {successNotice && (
        <div className="mb-6 p-4 rounded-xl bg-secondary-container/30 border border-secondary/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">check_circle</span>
          <p className="font-body-md text-body-md text-on-surface">{successNotice}</p>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
            ¿Cómo te llamas?
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              badge
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre o apodo"
              required
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-4 py-3 rounded-xl border border-surface-container-high/80 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-body-md text-body-md"
            />
          </div>
        </div>

        <div>
          <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
            Tu correo electrónico
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-4 py-3 rounded-xl border border-surface-container-high/80 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-body-md text-body-md"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Crea una contraseña
            </label>
            <span className="font-label-md text-[11px] text-on-surface-variant">
              Nivel: <strong className="text-on-surface font-semibold">{getStrengthLabel()}</strong>
            </span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              key
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-11 py-3 rounded-xl border border-surface-container-high/80 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-body-md text-body-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Password strength progress bar */}
          <div className="mt-2 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${Math.max(strength, 5)}%` }}
            ></div>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary/30 border-surface-container-high"
            />
            <span className="font-body-md text-body-md text-on-surface-variant leading-tight">
              Acepto los términos de uso y la política de privacidad de mis datos.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Creando tu cuenta...</span>
            </>
          ) : (
            <>
              <span>Crear mi cuenta gratis</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-8 pt-6 border-t border-surface-container text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};
