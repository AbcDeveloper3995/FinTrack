import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export const AccountsView = () => {
  const { kpis, accounts } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState('bbva');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'inflow' | 'outflow'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Expanded accounts with plastic card styles matching fintrack_cuentas_y_tarjetas
  const fullAccounts = [
    {
      id: 'bbva',
      institution: 'BBVA México',
      title: 'Nómina Principal',
      type: 'debito',
      status: 'Activa',
      statusColor: 'bg-emerald-500/20 text-emerald-300',
      balance: 42180.0,
      currency: 'MXN',
      last4: '4829',
      gradient: 'from-slate-900 via-[#1e1b4b] to-[#1e3a8a]',
      subtitle: 'Cuenta de dispersión salarial mensual y transferencias operativas',
      initials: 'BBVA',
      inflows: '+$52,000.00',
      outflows: '-$9,820.00',
      retention: '81.1%',
      isCredit: false,
    },
    {
      id: 'nu_credit',
      institution: 'Nu Bank',
      title: 'Tarjeta de Crédito',
      type: 'credito',
      status: 'Al corriente',
      statusColor: 'bg-emerald-500/20 text-emerald-300',
      balance: 9850.0,
      limit: 45000.0,
      available: 35150.0,
      currency: 'MXN',
      last4: '9102',
      gradient: 'from-[#3b0764] via-[#581c87] to-[#7e22ce]',
      subtitle: 'Tarjeta de crédito Mastercard Gold - Límite: $45,000 MXN',
      initials: 'NU',
      inflows: '+$9,850.00',
      outflows: '-$9,850.00',
      retention: '0.0%',
      isCredit: true,
      dueDate: 'Pagar antes: 02 Dic',
      cutoffDate: 'Corte: 12 Nov',
    },
    {
      id: 'santander',
      institution: 'Santander',
      title: 'Fiesta Rewards Oro',
      type: 'credito',
      status: 'Al corriente',
      statusColor: 'bg-emerald-500/20 text-emerald-300',
      balance: 4350.0,
      limit: 30000.0,
      available: 25650.0,
      currency: 'MXN',
      last4: '3301',
      gradient: 'from-[#500713] via-[#881337] to-[#be123c]',
      subtitle: 'Tarjeta de crédito Santander Fiesta Rewards con acumulación de puntos',
      initials: 'SAN',
      inflows: '+$4,350.00',
      outflows: '-$4,350.00',
      retention: '0.0%',
      isCredit: true,
      dueDate: 'Pagar antes: 10 Dic',
      cutoffDate: 'Corte: 20 Nov',
    },
    {
      id: 'cetes',
      institution: 'Gubernamental MX',
      title: 'Cetesdirecto 28d',
      type: 'inversion',
      status: '11.05% Anual',
      statusColor: 'bg-emerald-400/20 text-emerald-200',
      balance: 115000.0,
      currency: 'MXN',
      last4: 'BONDIA',
      gradient: 'from-[#022c22] via-[#064e3b] to-[#047857]',
      subtitle: 'Plataforma gubernamental de bonos soberanos con reinversión automática',
      initials: 'CET',
      inflows: '+$1,032.40',
      outflows: '$0.00',
      retention: '100%',
      isCredit: false,
    },
    {
      id: 'cajitas',
      institution: 'Nu Débito + Cuenta',
      title: 'Cajita Turbo Ahorro',
      type: 'ahorro',
      status: '14.75% Anual',
      statusColor: 'bg-cyan-400/20 text-cyan-200',
      balance: 85320.0,
      currency: 'MXN',
      last4: '6672',
      gradient: 'from-[#1e1b4b] via-[#4338ca] to-[#0284c7]',
      subtitle: 'Billetera con rendimiento diario a la vista y liquidez inmediata 24/7',
      initials: 'CAJ',
      inflows: '+$10,000.00',
      outflows: '-$4,300.00',
      retention: '57.0%',
      isCredit: false,
    },
    {
      id: 'cash',
      institution: 'Billetera Física',
      title: 'Efectivo Disponible',
      type: 'efectivo',
      status: 'Caja Chica',
      statusColor: 'bg-slate-700 text-slate-300',
      balance: 6000.0,
      currency: 'MXN',
      last4: 'EFEC',
      gradient: 'from-[#0f172a] via-[#1e293b] to-[#475569]',
      subtitle: 'Efectivo en mano para emergencias y comercios tradicionales',
      initials: 'CASH',
      inflows: '+$4,000.00',
      outflows: '-$2,800.00',
      retention: '30.0%',
      isCredit: false,
    },
  ];

  const selectedAccount = fullAccounts.find((a) => a.id === selectedAccountId) || fullAccounts[0];

  // Specific account movements for deep-dive
  const accountMovements = [
    {
      id: 'm-1',
      concept: 'Depósito Nómina Quincena 2',
      detail: 'Tech Consulting Group S.A.',
      category: 'Salario',
      date: '30 Oct 2026, 09:12 AM',
      method: 'SPEI • 849201',
      amount: 26000.0,
      type: 'inflow',
      icon: 'work',
    },
    {
      id: 'm-2',
      concept: 'Traspaso a Cetesdirecto',
      detail: 'Inversión mensual automatizada',
      category: 'Inversión',
      date: '29 Oct 2026, 14:30 PM',
      method: 'SPEI Saliente',
      amount: -5000.0,
      type: 'outflow',
      icon: 'sync_alt',
    },
    {
      id: 'm-3',
      concept: 'Pago de Tarjeta Santander',
      detail: 'Liquidación saldo para no generar intereses',
      category: 'Pago Deuda',
      date: '28 Oct 2026, 18:45 PM',
      method: 'Transferencia Inbursa',
      amount: -4350.0,
      type: 'outflow',
      icon: 'credit_score',
    },
    {
      id: 'm-4',
      concept: 'Retiro de Efectivo Cajero BBVA',
      detail: 'Sucursal Insurgentes Sur 1400',
      category: 'Efectivo',
      date: '25 Oct 2026, 11:20 AM',
      method: 'ATM • 1092',
      amount: -4000.0,
      type: 'outflow',
      icon: 'local_atm',
    },
  ];

  const filteredMovements = accountMovements.filter((m) => {
    if (filterType === 'inflow') return m.type === 'inflow';
    if (filterType === 'outflow') return m.type === 'outflow';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Portafolio Consolidado
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Cuentas y Tarjetas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Gestión patrimonial, monitoreo de liquidez y control de crédito activo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary font-body-md text-body-md font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all self-start lg:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Nueva cuenta / tarjeta</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Patrimonio Neto Total */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Patrimonio Neto Total
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-md text-label-md font-bold bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +4.2%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-on-surface tracking-tight tabular-nums">
              $248,500.00
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span>Balance real consolidado</span>
            <span className="font-label-md text-label-md text-secondary font-medium">▲ +$9,940 vs mes ant.</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        {/* KPI 2: Total Activos / Capital */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Activos / Capital
            </span>
            <span className="p-1.5 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">savings</span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-secondary tracking-tight tabular-nums">
              $262,700.00
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span className="truncate">Débito + Inversión + Efectivo</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">6 Cuentas Activas</span>
          </div>
          <div className="mt-4 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-surface-container-high">
            <div className="bg-secondary rounded-full" style={{ width: '44%' }} title="Inversión 44%"></div>
            <div className="bg-primary rounded-full" style={{ width: '32%' }} title="Ahorro 32%"></div>
            <div className="bg-primary-container rounded-full" style={{ width: '24%' }} title="Nómina 24%"></div>
          </div>
        </div>

        {/* KPI 3: Pasivos / Tarjetas */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Pasivos / Tarjetas
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-md text-label-md font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant">
              18.9% Uso Global
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display-lg text-headline-lg lg:text-display-lg font-bold text-tertiary tracking-tight tabular-nums">
              $14,200.00
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface-variant">MXN</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
            <span>Crédito a liquidar al corte</span>
            <span className="font-label-md text-label-md font-semibold text-secondary">0 moras / Al corriente</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-tertiary rounded-full" style={{ width: '18.9%' }}></div>
          </div>
        </div>
      </div>

      {/* Cards Grid: Billeteras & Plásticos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Tus Billeteras & Plásticos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-md text-label-md text-on-surface-variant font-bold">
              {fullAccounts.length} Registradas
            </span>
          </div>
          <span className="text-on-surface-variant font-label-md text-label-md hidden sm:inline-block">
            Haz clic en una tarjeta para inspeccionar su evolución y movimientos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fullAccounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`group cursor-pointer relative flex flex-col justify-between rounded-2xl p-6 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-tr ${acc.gradient} overflow-hidden min-h-[220px] ${
                  isSelected ? 'ring-4 ring-primary ring-offset-2 ring-offset-background' : ''
                }`}
              >
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Top card info */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md uppercase tracking-wider text-slate-300 font-semibold">
                      {acc.institution}
                    </span>
                    <span className="font-headline-md text-headline-md font-bold tracking-tight text-white mt-0.5">
                      {acc.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold ${acc.statusColor}`}>
                      {acc.status}
                    </span>
                    <div className="w-8 h-6 rounded bg-amber-400/80 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-xs text-amber-950 font-bold">contactless</span>
                    </div>
                  </div>
                </div>

                {/* Middle balance */}
                <div className="my-3 relative z-10">
                  <span className="font-label-md text-label-md text-slate-300 uppercase tracking-wider">
                    {acc.isCredit ? 'Saldo Usado' : 'Saldo Disponible'}
                  </span>
                  <div className="font-headline-lg text-headline-lg font-bold tracking-tight tabular-nums text-white">
                    ${acc.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-xs font-normal text-slate-300">
                      {acc.isCredit ? `/ $${(acc.limit / 1000).toFixed(0)}k` : 'MXN'}
                    </span>
                  </div>
                  {acc.isCredit && (
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-secondary-fixed h-full rounded-full"
                        style={{ width: `${(acc.balance / acc.limit) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10 text-xs">
                  <div className="flex items-center gap-1 font-mono tracking-widest text-slate-300">
                    <span>••••</span>
                    <span className="text-white font-semibold">{acc.last4}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Iniciando transferencia desde ${acc.title}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-label-md text-label-md transition-colors"
                    >
                      Transferir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Account Detail View */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 p-6 sm:p-8 space-y-6">
        {/* Selected Account Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-headline-md shadow-sm">
              {selectedAccount.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {selectedAccount.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold bg-surface-container text-on-surface-variant">
                  •••• {selectedAccount.last4}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {selectedAccount.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex rounded-lg bg-surface-container-low p-1">
              <button className="px-3 py-1 text-xs font-semibold rounded bg-surface-container-lowest text-on-surface shadow-xs">
                6 Meses
              </button>
              <button className="px-3 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                1 Año
              </button>
              <button className="px-3 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface">
                Histórico
              </button>
            </div>
          </div>
        </div>

        {/* Chart & Evolution */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                Evolución de Saldo Disponible (Mayo - Octubre 2026)
              </span>
              <span className="text-secondary font-semibold text-xs">
                Promedio mensual: $38,400 MXN
              </span>
            </div>

            <div className="w-full h-52 bg-surface-container-low/50 rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden border border-surface-container">
              <svg className="w-full h-full overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 700 170">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,130 C 70,115 140,80 210,95 C 280,110 350,60 420,70 C 490,80 560,45 630,30 L 700,20 L 700,170 L 0,170 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 0,130 C 70,115 140,80 210,95 C 280,110 350,60 420,70 C 490,80 560,45 630,30 L 700,20"
                  fill="none"
                  stroke="#2a14b4"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <circle cx="140" cy="80" fill="#ffffff" r="4" stroke="#2a14b4" strokeWidth="2.5" />
                <circle cx="280" cy="110" fill="#ffffff" r="4" stroke="#2a14b4" strokeWidth="2.5" />
                <circle cx="420" cy="70" fill="#ffffff" r="4" stroke="#2a14b4" strokeWidth="2.5" />
                <circle cx="560" cy="45" fill="#ffffff" r="4" stroke="#2a14b4" strokeWidth="2.5" />
                <circle cx="700" cy="20" fill="#2a14b4" r="5" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              <div className="flex justify-between text-[11px] font-label-md text-on-surface-variant pt-2 border-t border-surface-container-high z-10 px-1">
                <span>May: $28,200</span>
                <span>Jun: $34,800</span>
                <span>Jul: $31,500</span>
                <span>Ago: $39,100</span>
                <span>Sep: $40,500</span>
                <span className="font-bold text-primary">Oct: $42,180</span>
              </div>
            </div>
          </div>

          {/* Stats Mini Column */}
          <div className="flex flex-col space-y-4 p-5 bg-surface-container-low rounded-2xl border border-surface-container">
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Entradas este mes
              </span>
              <div className="font-metric-md text-metric-md font-bold text-secondary mt-0.5 tabular-nums">
                {selectedAccount.inflows}
              </div>
              <span className="text-[11px] text-on-surface-variant">2 depósitos registrados</span>
            </div>
            <div className="border-t border-surface-container-high pt-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Salidas / Gastos
              </span>
              <div className="font-metric-md text-metric-md font-bold text-on-surface mt-0.5 tabular-nums">
                {selectedAccount.outflows}
              </div>
              <span className="text-[11px] text-on-surface-variant">Transferencias e impuestos</span>
            </div>
            <div className="border-t border-surface-container-high pt-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Tasa de Ahorro / Retención
              </span>
              <div className="font-metric-md text-metric-md font-bold text-primary mt-0.5">
                {selectedAccount.retention} Retención
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1.5">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: selectedAccount.retention }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Account Transactions Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
              Últimos Movimientos de esta Cuenta
            </h4>
            <div className="inline-flex rounded-xl bg-surface-container p-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                  filterType === 'all'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Todos ({accountMovements.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('inflow')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                  filterType === 'inflow'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Entradas (+)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('outflow')}
                className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                  filterType === 'outflow'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Salidas (−)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl bg-surface-container-low border border-surface-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-on-surface-variant font-label-md text-label-md border-b border-surface-container-high bg-surface-container-low">
                  <th className="py-3 px-4 font-semibold uppercase">Concepto / Comercio</th>
                  <th className="py-3 px-4 font-semibold uppercase">Categoría</th>
                  <th className="py-3 px-4 font-semibold uppercase">Fecha</th>
                  <th className="py-3 px-4 font-semibold uppercase">Método / Ref</th>
                  <th className="py-3 px-4 font-semibold uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60 font-body-md text-body-md">
                {filteredMovements.map((m) => {
                  const isPositive = m.amount > 0;
                  return (
                    <tr
                      key={m.id}
                      className="bg-surface-container-lowest hover:bg-surface-container transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">{m.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{m.concept}</div>
                            <div className="text-[11px] text-on-surface-variant">{m.detail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant tabular-nums text-xs">
                        {m.date}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant text-xs">
                        {m.method}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold tabular-nums ${
                          isPositive ? 'text-secondary' : 'text-on-surface'
                        }`}
                      >
                        {isPositive ? '+' : ''}${Math.abs(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Nueva Cuenta / Tarjeta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Registrar Nueva Cuenta o Tarjeta
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Cuenta creada exitosamente');
                  setIsModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Nombre o Etiqueta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. BBVA Ahorros, Tarjeta Platinum..."
                    required
                    className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                      Tipo de Instrumento
                    </label>
                    <select className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none">
                      <option value="debito">Tarjeta de Débito</option>
                      <option value="credito">Tarjeta de Crédito</option>
                      <option value="inversion">Inversión / Bonos</option>
                      <option value="efectivo">Efectivo en Mano</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                      Saldo Inicial
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      required
                      className="w-full h-11 px-3.5 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md border border-outline-variant/60 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                  >
                    Guardar Cuenta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
