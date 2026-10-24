import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Exchange Rate (USD to MXN) - Real-time fetched
  const [exchangeRate, setExchangeRate] = useState(17.85); // fallback default
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState(null);

  // Fetch live exchange rate (matches market/Google rate)
  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.MXN) {
          setExchangeRate(Number(data.rates.MXN));
          setExchangeRateLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('No se pudo obtener tasa de cambio en vivo, usando fallback:', err);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRate();
    // Refresh rate every 15 minutes
    const interval = setInterval(fetchExchangeRate, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // Global Period - Dynamic to Current Month
  const getCurrentPeriodLabel = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriodLabel());

  // Master KPIs calculated from real data in MXN
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

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [creditDebt, setCreditDebt] = useState({
    amount: 0.0,
    dueDate: 'Sin vencimientos pendientes',
    limitUsage: '0.0%',
  });

  // Modal State for New Movement & New Account
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

  // 1. Listen for user session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 2. Fetch all user data when user changes
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

      // Fetch Accounts
      const { data: accountsData, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (accError) console.error('Error cargando cuentas:', accError);

      // Fetch Categories with Subcategories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .eq('user_id', currentUser.id)
        .order('name');

      if (catError) console.error('Error cargando categorías:', catError);

      // Fetch Tags
      const { data: tagsData, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('name');

      if (tagError) console.error('Error cargando etiquetas:', tagError);

      // Fetch Transactions with tags relation
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts (name, institution, type, currency),
          categories (name, icon, color, type),
          subcategories (name),
          transaction_tags (
            tags (*)
          )
        `)
        .eq('user_id', currentUser.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (txError) console.error('Error cargando transacciones:', txError);

      const userAccounts = accountsData || [];
      const userCategories = categoriesData || [];
      const userTags = tagsData || [];
      const userTransactions = (txData || []).map((tx) => {
        const txTags = (tx.transaction_tags || []).map((tt) => tt.tags).filter(Boolean);
        const accCurrency = tx.accounts?.currency || 'MXN';
        return {
          id: tx.id,
          concept: tx.description,
          amount: Number(tx.amount),
          date: tx.transaction_date,
          createdAt: tx.created_at,
          type: tx.type,
          currency: accCurrency,
          category: tx.categories?.name || 'General',
          categoryId: tx.category_id,
          categoryType: tx.type,
          categoryIcon: tx.categories?.icon || 'payments',
          subcategory: tx.subcategories?.name || '',
          subcategoryId: tx.subcategory_id,
          account: tx.accounts?.name || 'Cuenta General',
          accountId: tx.account_id,
          tags: txTags,
          notes: tx.notes || '',
          icon: tx.categories?.icon || (tx.type === 'income' ? 'payments' : 'shopping_bag'),
          iconBg: tx.type === 'income' ? 'bg-secondary-fixed/50 text-secondary' : 'bg-surface-container-highest text-primary',
        };
      });

      // Calculate Net Worth & Credit Debt in MXN (Converting USD accounts by live exchange rate)
      let totalLiquidAssetsMXN = 0;
      let totalCreditDebtMXN = 0;
      let totalCreditLimitMXN = 0;

      userAccounts.forEach((acc) => {
        const bal = Number(acc.balance) || 0;
        const rateMultiplier = acc.currency === 'USD' ? exchangeRate : 1;
        const balInMXN = bal * rateMultiplier;

        if (acc.type === 'credito') {
          totalCreditDebtMXN += balInMXN;
          totalCreditLimitMXN += ((Number(acc.credit_limit) || 0) * rateMultiplier);
        } else {
          totalLiquidAssetsMXN += balInMXN;
        }
      });

      const netWorth = totalLiquidAssetsMXN - totalCreditDebtMXN;

      // Calculate Monthly Income & Expenses in MXN
      const currentMonthStr = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      userTransactions.forEach((tx) => {
        if (tx.date && tx.date.startsWith(currentMonthStr)) {
          const rateMultiplier = tx.currency === 'USD' ? exchangeRate : 1;
          const valInMXN = Math.abs(tx.amount) * rateMultiplier;

          if (tx.type === 'income') {
            monthlyIncome += valInMXN;
          } else if (tx.type === 'expense') {
            monthlyExpenses += valInMXN;
          }
        }
      });

      const netBalance = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? Number(((netBalance / monthlyIncome) * 100).toFixed(1)) : 0;

      setAccounts(userAccounts);
      setCategories(userCategories);
      setTags(userTags);
      setTransactions(userTransactions);

      setKpis({
        netWorth,
        netWorthGrowth: 0.0,
        monthlyIncome,
        incomeGrowth: 0.0,
        monthlyExpenses,
        expenseSavingsRate: 0.0,
        netBalance,
        savingsRate: Math.max(0, savingsRate),
        savingsTarget: 25.0,
      });

      setCreditDebt({
        amount: totalCreditDebtMXN,
        dueDate: totalCreditDebtMXN > 0 ? 'Revisa tus fechas de corte' : 'Sin saldo por pagar',
        limitUsage: totalCreditLimitMXN > 0 ? `${((totalCreditDebtMXN / totalCreditLimitMXN) * 100).toFixed(1)}%` : '0.0%',
      });
    } catch (err) {
      console.error('Error general actualizando finanzas:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, exchangeRate]);

  useEffect(() => {
    refreshFinancialData();
  }, [refreshFinancialData]);

  // Insert real account to Supabase
  const addAccount = async ({ name, institution, type, currency = 'MXN', balance, credit_limit, last4, color }) => {
    if (!currentUser) return { error: 'No user authenticated' };

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: currentUser.id,
            name,
            institution: institution || 'Bancaria',
            type,
            currency: currency || 'MXN',
            balance: parseFloat(balance) || 0,
            credit_limit: credit_limit ? parseFloat(credit_limit) : null,
            last4: last4 || null,
            color: color || '#4338ca',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error agregando cuenta:', err);
      return { error: err.message };
    }
  };

  // Insert real transaction to Supabase with tag associations
  const addTransaction = async ({ concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [] }) => {
    if (!currentUser) return { error: 'No user authenticated' };

    try {
      const numAmount = parseFloat(amount);
      const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

      const { data: newTx, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: currentUser.id,
            description: concept,
            amount: finalAmount,
            type,
            category_id: categoryId || null,
            subcategory_id: subcategoryId || null,
            account_id: accountId || null,
            transaction_date: date || new Date().toISOString().split('T')[0],
            notes: notes || '',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Link tags if any
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map((tId) => ({
          transaction_id: newTx.id,
          tag_id: tId,
        }));
        await supabase.from('transaction_tags').insert(tagRelations);
      }

      // Adjust account balance if accountId is present
      if (accountId) {
        const targetAcc = accounts.find((a) => a.id === accountId);
        if (targetAcc) {
          const currentBal = Number(targetAcc.balance) || 0;
          const updatedBal = targetAcc.type === 'credito'
            ? (type === 'expense' ? currentBal + Math.abs(numAmount) : currentBal - Math.abs(numAmount))
            : (type === 'income' ? currentBal + Math.abs(numAmount) : currentBal - Math.abs(numAmount));

          await supabase
            .from('accounts')
            .update({ balance: updatedBal })
            .eq('id', accountId);
        }
      }

      await refreshFinancialData();
      return { data: newTx, error: null };
    } catch (err) {
      console.error('Error agregando movimiento:', err);
      return { error: err.message };
    }
  };

  return (
    <FinanceContext.Provider
      value={{
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
        addTransaction,
        refreshFinancialData,
        isNewMovementModalOpen,
        setIsNewMovementModalOpen,
        isNewAccountModalOpen,
        setIsNewAccountModalOpen,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
