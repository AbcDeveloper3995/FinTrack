import React from 'react';
import { Logo } from './common/Logo';

export const Header = ({ onViewChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            type="button"
            onClick={() => onViewChange && onViewChange('login')}
            className="flex items-center gap-2.5 text-primary text-left focus:outline-none cursor-pointer"
          >
            <Logo size={36} showText={true} textClassName="font-headline-md text-headline-md text-on-surface" />
          </button>
        </div>

        {/* Right Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-secondary font-label-md text-label-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Finanzas Personales</span>
          </div>
        </div>
      </div>
    </header>
  );
};
