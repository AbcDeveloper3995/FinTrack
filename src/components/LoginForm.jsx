import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor completa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        throw authError;
      }

      if (data?.user) {
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        });
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
      } else {
        setError(err.message || 'Error al iniciar sesión. Intenta nuevamente.');
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
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Crear Cuenta</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-secondary-container/40 rounded-full text-on-secondary-container font-label-md text-label-md">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Conexión Segura</span>
        </div>
      </div>

      {/* Main Title & Lead */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-2xl">waving_hand</span>
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
            ¡Hola de nuevo!
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Entrar a tu cuenta
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Ingresa tus datos para ver y organizar tu dinero al instante.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/30 border border-error/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">error</span>
          <p className="font-body-md text-body-md text-on-surface">{error}</p>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">
            Correo Institucional o Personal
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
              Contraseña
            </label>
            <a href="#" className="font-label-md text-label-md text-primary hover:underline font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              key
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
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
        </div>

        {/* Remember me & Trust checkpoint */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-surface-container-high"
            />
            <span className="font-body-md text-body-md text-on-surface-variant">
              Recordar este dispositivo
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
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <span>Entrar a mi cuenta</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-8 pt-6 border-t border-surface-container text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          ¿Aún no tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Regístrate gratis aquí
          </button>
        </p>
      </div>
    </div>
  );
};
