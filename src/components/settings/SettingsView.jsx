import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabase } from '../../lib/supabase';

export const SettingsView = () => {
  const { currentUser, refreshFinancialData } = useFinance();

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSavingProfile(true);
    setProfileMsg({ text: '', type: '' });

    try {
      // 1. Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (authError) throw authError;

      // 2. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', currentUser.id);
      if (profileError) console.warn('Aviso perfil db:', profileError);

      setProfileMsg({ text: 'Perfil actualizado exitosamente.', type: 'success' });
      await refreshFinancialData();
    } catch (err) {
      setProfileMsg({ text: 'Error al actualizar perfil: ' + err.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setPasswordMsg({ text: 'Contraseña actualizada con éxito.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ text: 'Error al cambiar contraseña: ' + err.message, type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
            Configuración de Cuenta
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
          Perfil de Usuario y Seguridad
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Administra la información de tu cuenta personal y actualiza tus credenciales de acceso.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Información de Perfil */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Información del Perfil
              </h2>
              <p className="text-xs text-on-surface-variant">
                Tu nombre de usuario visible en la plataforma.
              </p>
            </div>
          </div>

          {profileMsg.text && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-secondary-fixed/30 text-secondary border border-secondary/30'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Correo Electrónico (No editable)
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full h-11 px-3.5 bg-surface-container-low text-on-surface-variant/80 rounded-xl font-body-md text-body-md border border-surface-container cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
                className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-xl font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {savingProfile && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>{savingProfile ? 'Guardando...' : 'Actualizar Perfil'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Cambiar Contraseña */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed/30 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">lock_reset</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-on-surface-variant">
                Actualiza tu clave de acceso para mayor seguridad.
              </p>
            </div>
          </div>

          {passwordMsg.text && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                passwordMsg.type === 'success'
                  ? 'bg-secondary-fixed/30 text-secondary border border-secondary/30'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-xl font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  minLength={6}
                  className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-xl font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                {savingPassword && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>{savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
