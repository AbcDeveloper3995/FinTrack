import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useToast } from '../hooks/useToast';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { calculatePeriodMetrics } from '../services/calculations';
import { offlineStorage } from '../services/offlineStorage';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modular Hook: Exchange Rate USD/MXN
  const { exchangeRate, exchangeRateLastUpdated, fetchExchangeRate } = useExchangeRate(17.85);

  // Modular Hook: Network Connectivity
  const isOnline = useOnlineStatus();

  // Modular Hook: Notifications / Toasts
  const { toast, showToast, hideToast } = useToast(4000);

  // Modals UI State
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

  // Global Period - Dynamic to Current Month
  const currentPeriodLabel = useMemo(() => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const [currentPeriod, setCurrentPeriod] = useState(currentPeriodLabel);

  // Domain Data State
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // KPIs and Credit Debt State
  const [kpis, setKpis] = useState({
    netWorth: 0.0,
    netWorthGrowth: 0.0,
    monthlyIncome: 0.0,
    incomeGrowth: 0.0,
    monthlyExpenses: 0.0,
    expenseSavingsRate: 0.0,
    netBalance: 0.0,
    savingsRate: 0.0,
    savingsTarget: 25.0,
  });

  const [creditDebt, setCreditDebt] = useState({
    amount: 0.0,
    dueDate: 'Sin vencimientos pendientes',
    limitUsage: '0.0%',
  });

  // Supabase Auth listener
  useEffect(() => {
    const mapUser = (user) => {
      if (!user) return null;
      return {
        ...user,
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name?.trim() || '',
      };
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(mapUser(session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(mapUser(session?.user));
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Fetch financial data from backend
  const refreshFinancialData = useCallback(async () => {
    if (!currentUser) {
      setAccounts([]);
      setCategories([]);
      setTags([]);
      setTransactions([]);
      setKpis({
        netWorth: 0.0,
        netWorthGrowth: 0.0,
        monthlyIncome: 0.0,
        incomeGrowth: 0.0,
        monthlyExpenses: 0.0,
        expenseSavingsRate: 0.0,
        netBalance: 0.0,
        savingsRate: 0.0,
        savingsTarget: 25.0,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [userAccounts, userCategories, userTags, userTransactions] = await Promise.all([
        accountService.fetchAccounts(currentUser.id),
        transactionService.fetchCategories(currentUser.id),
        transactionService.fetchTags(currentUser.id),
        transactionService.fetchTransactions(currentUser.id),
      ]);

      setAccounts(userAccounts);
      setCategories(userCategories);
      setTags(userTags);
      setTransactions(userTransactions);

      // Calculate KPIs & Credit Metrics via pure function
      const metrics = calculatePeriodMetrics({
        accounts: userAccounts,
        categories: userCategories,
        transactions: userTransactions,
        exchangeRate,
      });

      setKpis(metrics.kpis);
      setCreditDebt(metrics.creditDebt);

      // Save offline snapshot to local cache
      offlineStorage.saveSnapshot(currentUser.id, {
        accounts: userAccounts,
        categories: userCategories,
        tags: userTags,
        transactions: userTransactions,
        kpis: metrics.kpis,
        creditDebt: metrics.creditDebt,
        exchangeRate,
      });
    } catch (err) {
      console.warn('Conexión con Supabase no disponible o error de red. Intentando cargar datos desde la caché local:', err);

      // Fallback: Read from local cache
      const cached = offlineStorage.loadSnapshot(currentUser.id);
      if (cached && cached.data) {
        setAccounts(cached.data.accounts || []);
        setCategories(cached.data.categories || []);
        setTags(cached.data.tags || []);
        setTransactions(cached.data.transactions || []);
        if (cached.data.kpis) setKpis(cached.data.kpis);
        if (cached.data.creditDebt) setCreditDebt(cached.data.creditDebt);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, exchangeRate]);

  useEffect(() => {
    refreshFinancialData();
  }, [refreshFinancialData]);

  // Account operations
  const addAccount = useCallback(async (params) => {
    try {
      const data = await accountService.addAccount(currentUser?.id, params);
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error agregando cuenta:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, refreshFinancialData]);

  const updateAccount = useCallback(async (id, params) => {
    try {
      const data = await accountService.updateAccount(currentUser?.id, id, params);
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando cuenta:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, refreshFinancialData]);

  const deleteAccount = useCallback(async (id) => {
    try {
      await accountService.deleteAccount(currentUser?.id, id);
      await refreshFinancialData();
      return { error: null };
    } catch (err) {
      console.error('Error eliminando cuenta:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, refreshFinancialData]);

  // Transaction operations
  const addTransaction = useCallback(async (params) => {
    try {
      const data = await transactionService.addTransaction(currentUser?.id, accounts, params);
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error agregando movimiento:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, accounts, refreshFinancialData]);

  const addTransfer = useCallback(async (params) => {
    try {
      const result = await transactionService.addTransfer(currentUser?.id, accounts, exchangeRate, params);
      await refreshFinancialData();
      return { success: true, ...result, error: null };
    } catch (err) {
      console.error('Error realizando transferencia:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, accounts, exchangeRate, refreshFinancialData]);

  const deleteTransactions = useCallback(async (ids, revertBalance = true) => {
    try {
      await transactionService.deleteTransactions(currentUser?.id, transactions, accounts, ids, revertBalance);
      await refreshFinancialData();
      return { error: null };
    } catch (err) {
      console.error('Error eliminando movimientos:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, transactions, accounts, refreshFinancialData]);

  const updateTransaction = useCallback(async (id, params) => {
    try {
      const data = await transactionService.updateTransaction(currentUser?.id, transactions, accounts, id, params);
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando movimiento:', err);
      return { error: err.message };
    }
  }, [currentUser?.id, transactions, accounts, refreshFinancialData]);

  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    currentPeriod,
    setCurrentPeriod,
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
    kpis,
    accounts,
    categories,
    tags,
    creditDebt,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    addTransfer,
    updateTransaction,
    deleteTransactions,
    refreshFinancialData,
    isNewMovementModalOpen,
    setIsNewMovementModalOpen,
    isNewAccountModalOpen,
    setIsNewAccountModalOpen,
    toast,
    showToast,
    hideToast,
    isOnline,
  }), [
    currentUser,
    loading,
    currentPeriod,
    exchangeRate,
    exchangeRateLastUpdated,
    fetchExchangeRate,
    kpis,
    accounts,
    categories,
    tags,
    creditDebt,
    transactions,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    addTransfer,
    updateTransaction,
    deleteTransactions,
    refreshFinancialData,
    isNewMovementModalOpen,
    isNewAccountModalOpen,
    toast,
    showToast,
    hideToast,
    isOnline,
  ]);

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
