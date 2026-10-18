import React from 'react';

export const PlaceholderView = ({ title, icon, description, onBackToDashboard }) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-8 sm:p-12 shadow-sm border border-surface-container-high/60 text-center max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-[36px]">{icon}</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
        {title}
      </h2>
      <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
        {description}
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md mb-6 font-semibold">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span>Próximo módulo del plan de implementación</span>
      </div>
      <div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold transition-all shadow-sm"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
};
