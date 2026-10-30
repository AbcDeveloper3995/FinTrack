import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { TrustPanel } from './components/TrustPanel';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { AccountsView } from './components/accounts/AccountsView';
import { MovementsView } from './components/movements/MovementsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { NewMovementModal } from './components/modals/NewMovementModal';
import { NewAccountModal } from './components/modals/NewAccountModal';
import { Toast } from './components/common/Toast';
import { Logo } from './components/common/Logo';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { supabase } from './lib/supabase';

function MainApp() {
  const { toast, hideToast } = useFinance();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Listen to Supabase Auth state changes and persist session on reload
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          });
        }
      } catch (err) {
        console.error('Error verificando sesión Supabase:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        });
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
    setCurrentUser(null);
    setAuthView('login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse">
          <Logo size={48} showText={true} textClassName="font-headline-lg text-headline-lg text-primary font-bold" />
        </div>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-body-md text-body-md text-on-surface-variant font-medium">
          Cargando entorno FinTrack...
        </p>
      </div>
    );
  }

  // Render Shell Post-Login if Authenticated
  if (currentUser) {
    return (
      <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col selection:bg-primary/20 selection:text-primary">
        {/* Left Navigation Sidebar (Drawer on mobile, fixed on desktop) */}
        <AppSidebar
          activeTab={activeTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Wrapper (pl-0 on mobile/tablets, pl-64 on desktop lg) */}
        <div className="pl-0 lg:pl-64 flex flex-col min-h-screen">
          {/* Interior Header */}
          <AppHeader
            activeTab={activeTab}
            user={currentUser}
            onLogout={handleLogout}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Main Module Content View with responsive padding */}
          <main className="w-full bg-background flex-1 pt-20 pb-8 px-4 sm:px-6 lg:px-8 main-module-container">
            {activeTab === 'dashboard' && (
              <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
            )}

            {activeTab === 'movimientos' && (
              <MovementsView />
            )}

            {activeTab === 'cuentas' && (
              <AccountsView />
            )}

            {activeTab === 'categorias' && (
              <CategoriesView />
            )}

            {activeTab === 'analisis' && (
              <AnalyticsView />
            )}

            {activeTab === 'presupuestos' && (
              <BudgetsView />
            )}

            {activeTab === 'configuracion' && (
              <SettingsView />
            )}
          </main>
        </div>

        {/* Global Modal for New Movement */}
        <NewMovementModal />
        {/* Global Modal for New Account */}
        <NewAccountModal />

        {/* Global Floating Toast Notifications */}
        <Toast toast={toast} onClose={hideToast} />
      </div>
    );
  }

  // Render Public Auth Gateway (Login / Register)
  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Public Header */}
      <Header currentView={authView} onViewChange={(v) => setAuthView(v)} />

      {/* Main Public Gateway */}
      <main className="flex-1 w-full pt-16 relative overflow-hidden flex flex-col justify-center">
        {/* Ambient aura lights */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Form Box (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-6 sm:p-10 relative overflow-hidden border border-surface-container-high/60">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>

                {authView === 'login' ? (
                  <LoginForm
                    onSwitchToRegister={() => setAuthView('register')}
                    onLoginSuccess={handleLoginSuccess}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setAuthView('login')}
                    onRegisterSuccess={handleRegisterSuccess}
                  />
                )}
              </div>
            </div>

            {/* Trust Panel (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <TrustPanel mode={authView} />
            </div>
          </div>
        </div>
      </main>

      {/* Global Public Footer */}
      <footer className="py-6 border-t border-surface-container-high/60 bg-surface/80 dark:bg-surface-container-lowest/90 backdrop-blur-xl text-center text-xs text-on-surface-variant transition-colors shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 FinTrack Inc. Todos los derechos reservados. Control y claridad patrimonial.</p>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}

export default App;
