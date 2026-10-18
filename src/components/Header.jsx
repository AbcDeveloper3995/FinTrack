import React from 'react';

export const Header = ({ currentView, onViewChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Security Pill */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            type="button"
            onClick={() => onViewChange('login')}
            className="flex items-center gap-2.5 text-primary text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-bold">
              FinTrack
            </span>
          </button>
          
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-secondary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>256-bit Bank Grade Security</span>
          </div>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => onViewChange('login')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-label-md font-label-md transition-all ${
                currentView === 'login'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onViewChange('register')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-label-md font-label-md transition-all ${
                currentView === 'register'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Create Account
            </button>
          </nav>

          <div className="flex items-center gap-2 border-l border-surface-container pl-3">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface text-label-md font-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">language</span>
              <span>ES</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
