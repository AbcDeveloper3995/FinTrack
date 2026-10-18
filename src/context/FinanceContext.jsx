import React, { createContext, useContext, useState } from 'react';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  // Global Period
  const [currentPeriod, setCurrentPeriod] = useState('Octubre 2026');

  // Master KPIs
  const [kpis, setKpis] = useState({
    netWorth: 248500.0,
    netWorthGrowth: 3.4,
    monthlyIncome: 48250.0,
    incomeGrowth: 5.2,
    monthlyExpenses: 32600.0,
    expenseSavingsRate: 3.8,
    netBalance: 15650.0,
    savingsRate: 32.4,
    savingsTarget: 30.0,
  });

  // Accounts summary
  const [accounts, setAccounts] = useState([
    {
      id: 'acc-1',
      name: 'Cuenta Nu (Rendimiento)',
      institution: 'Nu',
      tag: '13.5% Tasa anual',
      balance: 85320.0,
      share: '34.3%',
      type: 'inversion',
    },
    {
      id: 'acc-2',
      name: 'Cetesdirecto',
      institution: 'Cetes',
      tag: 'Bonos Gubernamentales',
      balance: 115000.0,
      share: '46.3%',
      type: 'inversion',
    },
    {
      id: 'acc-3',
      name: 'BBVA Nómina',
      institution: 'BBVA',
      tag: '•••• 4892',
      balance: 42180.0,
      share: '17.0%',
      type: 'nomina',
    },
    {
      id: 'acc-4',
      name: 'Efectivo Físico',
      institution: 'Efectivo',
      tag: 'Billetera de emergencia',
      balance: 6000.0,
      share: '2.4%',
      type: 'efectivo',
    },
  ]);

  // Credit card debt
  const [creditDebt] = useState({
    amount: 14200.0,
    dueDate: 'Corte en 5 días',
    limitUsage: '18.9%',
  });

  // Recent transactions
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1',
      concept: 'Pago Nómina Quincenal',
      category: 'Sueldo',
      categoryType: 'income',
      account: 'BBVA Nómina',
      date: '28 Oct',
      amount: 24125.0,
      icon: 'payments',
      iconBg: 'bg-secondary-fixed/50 text-secondary',
    },
    {
      id: 'tx-2',
      concept: 'Renta Departamento',
      category: 'Vivienda',
      categoryType: 'expense',
      account: 'BBVA Nómina',
      date: '27 Oct',
      amount: -12500.0,
      icon: 'home',
      iconBg: 'bg-surface-container-highest text-primary',
    },
    {
      id: 'tx-3',
      concept: 'Walmart Express Patio',
      category: 'Despensa',
      categoryType: 'expense',
      account: 'Nu Débito',
      date: '26 Oct',
      amount: -2140.5,
      icon: 'shopping_cart',
      iconBg: 'bg-surface-container-highest text-secondary',
    },
    {
      id: 'tx-4',
      concept: 'Intereses Devengados 28d',
      category: 'Inversión',
      categoryType: 'income',
      account: 'Cetesdirecto',
      date: '24 Oct',
      amount: 1032.4,
      icon: 'trending_up',
      iconBg: 'bg-secondary-fixed/50 text-secondary',
    },
    {
      id: 'tx-5',
      concept: 'Suscripción Netflix Premium',
      category: 'Entretenimiento',
      categoryType: 'expense',
      account: 'Nu Débito',
      date: '22 Oct',
      amount: -299.0,
      icon: 'movie',
      iconBg: 'bg-surface-container-highest text-primary',
    },
    {
      id: 'tx-6',
      concept: 'Uber Trip Santa Fe',
      category: 'Transporte',
      categoryType: 'expense',
      account: 'BBVA Nómina',
      date: '21 Oct',
      amount: -185.0,
      icon: 'local_taxi',
      iconBg: 'bg-surface-container-highest text-outline',
    },
    {
      id: 'tx-7',
      concept: 'Medicamentos y Cuidado',
      category: 'Salud',
      categoryType: 'expense',
      account: 'Nu Débito',
      date: '19 Oct',
      amount: -740.0,
      icon: 'medical_services',
      iconBg: 'bg-surface-container-highest text-tertiary',
    },
    {
      id: 'tx-8',
      concept: 'Teclado Mecánico Inalámbrico',
      category: 'Trabajo / Hogar',
      categoryType: 'expense',
      account: 'Nu Débito',
      date: '17 Oct',
      amount: -1890.0,
      icon: 'shopping_bag',
      iconBg: 'bg-surface-container-highest text-primary-container',
    },
  ]);

  // Modal State for New Movement
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);

  // Add new movement handler
  const addTransaction = (newTx) => {
    const formattedTx = {
      ...newTx,
      id: `tx-${Date.now()}`,
      date: 'Hoy',
      iconBg:
        newTx.categoryType === 'income'
          ? 'bg-secondary-fixed/50 text-secondary'
          : 'bg-surface-container-highest text-primary',
      icon:
        newTx.icon ||
        (newTx.categoryType === 'income' ? 'payments' : 'shopping_bag'),
    };

    setTransactions((prev) => [formattedTx, ...prev]);

    // Update balances
    if (formattedTx.amount > 0) {
      setKpis((prev) => ({
        ...prev,
        monthlyIncome: prev.monthlyIncome + formattedTx.amount,
        netBalance: prev.netBalance + formattedTx.amount,
        netWorth: prev.netWorth + formattedTx.amount,
      }));
    } else {
      const absAmount = Math.abs(formattedTx.amount);
      setKpis((prev) => ({
        ...prev,
        monthlyExpenses: prev.monthlyExpenses + absAmount,
        netBalance: prev.netBalance - absAmount,
        netWorth: prev.netWorth - absAmount,
      }));
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        currentPeriod,
        setCurrentPeriod,
        kpis,
        accounts,
        creditDebt,
        transactions,
        addTransaction,
        isNewMovementModalOpen,
        setIsNewMovementModalOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
