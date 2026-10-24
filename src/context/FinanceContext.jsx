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

  // Toast Notifications State & Helper
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success', title = null) => {
    setToast({
      id: Date.now(),
      message,
      type,
      title: title || (type === 'success' ? '¡Operación exitosa!' : type === 'error' ? 'Atención' : 'Notificación'),
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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
        const isTransfer = tx.type === 'transfer';
        const isIncome = tx.type === 'income';

        let icon = tx.categories?.icon;
        if (!icon) {
          if (isTransfer) icon = 'swap_horiz';
          else if (isIncome) icon = 'payments';
          else icon = 'shopping_bag';
        }

        let iconBg = 'bg-surface-container-highest text-primary';
        if (isTransfer) {
          iconBg = 'bg-primary-container/20 text-primary';
        } else if (isIncome) {
          iconBg = 'bg-secondary-fixed/50 text-secondary';
        }

        return {
          id: tx.id,
          concept: tx.description,
          amount: Number(tx.amount),
          date: tx.transaction_date,
          createdAt: tx.created_at,
          type: tx.type,
          currency: accCurrency,
          category: tx.categories?.name || (isTransfer ? 'Transferencia' : 'General'),
          categoryId: tx.category_id,
          categoryType: tx.type,
          categoryIcon: icon,
          subcategory: tx.subcategories?.name || '',
          subcategoryId: tx.subcategory_id,
          account: tx.accounts?.name || 'Cuenta General',
          accountId: tx.account_id,
          tags: txTags,
          notes: tx.notes || '',
          icon,
          iconBg,
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

      // Calculate Monthly Income & Expenses in MXN for Current & Previous Months
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      const padMonth = (m) => String(m + 1).padStart(2, '0');
      const currentMonthKey = `${currentYear}-${padMonth(currentMonth)}`;

      // Previous Month
      const prevDate = new Date(currentYear, currentMonth - 1, 1);
      const prevMonthKey = `${prevDate.getFullYear()}-${padMonth(prevDate.getMonth())}`;

      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      let prevMonthIncome = 0;
      let prevMonthExpenses = 0;

      // 6-Month History Array for charts
      const monthsHistoryMap = {};
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const key = `${d.getFullYear()}-${padMonth(d.getMonth())}`;
        monthsHistoryMap[key] = {
          key,
          label: `${monthNames[d.getMonth()]} ${d.getFullYear() === currentYear ? '' : String(d.getFullYear()).slice(-2)}`.trim(),
          income: 0,
          expense: 0,
          balance: 0,
        };
      }

      userTransactions.forEach((tx) => {
        if (!tx.date) return;
        const rateMultiplier = tx.currency === 'USD' ? exchangeRate : 1;
        const valInMXN = Math.abs(tx.amount) * rateMultiplier;
        const txMonthKey = tx.date.slice(0, 7);

        // Current Month
        if (txMonthKey === currentMonthKey) {
          if (tx.type === 'income') {
            monthlyIncome += valInMXN;
          } else if (tx.type === 'expense') {
            monthlyExpenses += valInMXN;
          }
        }

        // Previous Month
        if (txMonthKey === prevMonthKey) {
          if (tx.type === 'income') {
            prevMonthIncome += valInMXN;
          } else if (tx.type === 'expense') {
            prevMonthExpenses += valInMXN;
          }
        }

        // 6-Month Accumulator
        if (monthsHistoryMap[txMonthKey]) {
          if (tx.type === 'income') {
            monthsHistoryMap[txMonthKey].income += valInMXN;
          } else if (tx.type === 'expense') {
            monthsHistoryMap[txMonthKey].expense += valInMXN;
          }
        }
      });

      // Finalize 6-month array
      const monthlyHistory = Object.values(monthsHistoryMap).map((m) => ({
        ...m,
        balance: m.income - m.expense,
      }));

      const netBalance = monthlyIncome - monthlyExpenses;
      const prevNetBalance = prevMonthIncome - prevMonthExpenses;
      const savingsRate = monthlyIncome > 0 ? Number(((netBalance / monthlyIncome) * 100).toFixed(1)) : 0;
      const prevSavingsRate = prevMonthIncome > 0 ? Number(((prevNetBalance / prevMonthIncome) * 100).toFixed(1)) : 0;

      // Expense comparison vs previous month
      // Did user spend more or save more?
      const expenseDifference = monthlyExpenses - prevMonthExpenses;
      const expenseChangePct = prevMonthExpenses > 0
        ? Number(((expenseDifference / prevMonthExpenses) * 100).toFixed(1))
        : (monthlyExpenses > 0 ? 100 : 0);

      // Savings/Balance comparison vs previous month
      const savingsDifference = netBalance - prevNetBalance;

      // Comparison diagnostics status:
      // 'saved_more' if user saved more than previous month
      // 'spent_more' if user spent more than previous month
      let comparisonStatus = 'neutral';
      if (prevMonthExpenses > 0 || monthlyExpenses > 0) {
        if (expenseDifference < 0) {
          comparisonStatus = 'saved_more';
        } else if (expenseDifference > 0) {
          comparisonStatus = 'spent_more';
        }
      }
      // Pacing & End of Month Run-rate calculation
      const currentDay = now.getDate();
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dailySpendingRate = currentDay > 0 ? monthlyExpenses / currentDay : 0;
      const projectedMonthEndExpenses = dailySpendingRate * daysInCurrentMonth;
      const projectedVsPrevExpensesDiff = prevMonthExpenses > 0
        ? projectedMonthEndExpenses - prevMonthExpenses
        : 0;
      const projectedSavingsVsPrev = prevMonthExpenses > 0
        ? ((projectedVsPrevExpensesDiff / prevMonthExpenses) * 100)
        : 0;

      // Smart Notifications / Alerts Engine
      const smartNotifications = [];

      // 1. Alert: Pacing & Overall Trend
      if (prevMonthExpenses > 0 && monthlyExpenses > 0) {
        if (projectedVsPrevExpensesDiff > 0) {
          smartNotifications.push({
            id: 'pacing-warning',
            type: 'warning',
            title: 'Ritmo de gasto acelerado',
            message: `Al ritmo actual ($${dailySpendingRate.toFixed(0)}/día), proyectas cerrar el mes con $${projectedMonthEndExpenses.toFixed(0)} MXN, superando en un ${Math.abs(projectedSavingsVsPrev).toFixed(1)}% tu mes pasado.`,
            time: 'En tiempo real',
            icon: 'trending_up',
          });
        } else {
          smartNotifications.push({
            id: 'pacing-good',
            type: 'success',
            title: '¡Excelente ritmo de ahorro!',
            message: `A este paso ($${dailySpendingRate.toFixed(0)}/día), proyectas gastar $${Math.abs(projectedVsPrevExpensesDiff).toFixed(0)} MXN menos que el mes pasado.`,
            time: 'En tiempo real',
            icon: 'savings',
          });
        }
      }

      // 2. Alert: Category Budget Thresholds
      userCategories
        .filter((c) => c.type === 'expense' && Number(c.budget_monthly) > 0)
        .forEach((c) => {
          const limit = Number(c.budget_monthly);
          const catSpent = userTransactions
            .filter((t) => (t.categoryId === c.id || t.category === c.name) && t.type === 'expense' && t.date?.startsWith(currentMonthKey))
            .reduce((sum, t) => {
              const mult = t.currency === 'USD' ? exchangeRate : 1;
              return sum + Math.abs(t.amount) * mult;
            }, 0);

          const pct = (catSpent / limit) * 100;

          if (pct >= 100) {
            smartNotifications.push({
              id: `budget-exceeded-${c.id}`,
              type: 'error',
              title: `Presupuesto excedido: ${c.name}`,
              message: `Has consumido el ${pct.toFixed(0)}% ($${catSpent.toFixed(0)} de $${limit.toFixed(0)} MXN) de tu límite mensual.`,
              time: 'Alerta crítica',
              icon: 'error',
            });
          } else if (pct >= 80) {
            smartNotifications.push({
              id: `budget-warning-${c.id}`,
              type: 'warning',
              title: `Alerta preventiva: ${c.name}`,
              message: `Llevas el ${pct.toFixed(0)}% ($${catSpent.toFixed(0)} de $${limit.toFixed(0)} MXN) presupuestado.`,
              time: 'Atención requerida',
              icon: 'warning',
            });
          }
        });

      setAccounts(userAccounts);
      setCategories(userCategories);
      setTags(userTags);
      setTransactions(userTransactions);

      setKpis({
        netWorth,
        netWorthGrowth: 0.0,
        monthlyIncome,
        prevMonthIncome,
        monthlyExpenses,
        prevMonthExpenses,
        expenseDifference,
        expenseChangePct,
        savingsDifference,
        comparisonStatus,
        netBalance,
        prevNetBalance,
        savingsRate: Math.max(0, savingsRate),
        prevSavingsRate: Math.max(0, prevSavingsRate),
        monthlyHistory,
        currentMonthKey,
        prevMonthKey,
        // Pacing metrics
        currentDay,
        daysInCurrentMonth,
        dailySpendingRate,
        projectedMonthEndExpenses,
        projectedVsPrevExpensesDiff,
        projectedSavingsVsPrev,
        smartNotifications,
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

  /**
   * Transfer funds between two accounts taking currencies and account types into account.
   * If currencies differ (e.g. MXN -> USD or USD -> MXN), convertedAmount handles the destination credit.
   */
  const addTransfer = async ({
    fromAccountId,
    toAccountId,
    amount,
    convertedAmount = null,
    concept = 'Transferencia entre cuentas',
    notes = '',
    date = null,
  }) => {
    if (!currentUser) return { error: 'No user authenticated' };
    if (!fromAccountId || !toAccountId) return { error: 'Debes seleccionar cuenta de origen y cuenta de destino.' };
    if (fromAccountId === toAccountId) return { error: 'La cuenta origen y destino no pueden ser la misma.' };

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return { error: 'Monto inválido.' };

    try {
      const fromAcc = accounts.find((a) => a.id === fromAccountId);
      const toAcc = accounts.find((a) => a.id === toAccountId);
      if (!fromAcc || !toAcc) throw new Error('Cuentas no encontradas.');

      const txDate = date || new Date().toISOString().split('T')[0];

      // Calculate amount received by destination account
      let destAmount = numAmount;
      if (convertedAmount && !isNaN(parseFloat(convertedAmount)) && parseFloat(convertedAmount) > 0) {
        destAmount = parseFloat(convertedAmount);
      } else if (fromAcc.currency !== toAcc.currency) {
        // Automatic conversion based on current live exchangeRate
        if (fromAcc.currency === 'MXN' && toAcc.currency === 'USD') {
          destAmount = exchangeRate > 0 ? numAmount / exchangeRate : numAmount;
        } else if (fromAcc.currency === 'USD' && toAcc.currency === 'MXN') {
          destAmount = numAmount * (exchangeRate || 1);
        }
      }
      destAmount = Number(destAmount.toFixed(2));

      // 1. Insert Outgoing Transfer Transaction (Origen: debit/salida)
      const outgoingConcept = concept || `Transferencia a ${toAcc.name}`;
      const outgoingNotes = `${notes ? notes + ' | ' : ''}Transferencia enviada hacia ${toAcc.name} (${toAcc.institution || 'Bancaria'}). Destino recibe: ${toAcc.currency === 'USD' ? '$' : '$'}${destAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${toAcc.currency}.`;

      const { data: outTx, error: outError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: currentUser.id,
            description: outgoingConcept,
            amount: -Math.abs(numAmount), // negative = exit
            type: 'transfer',
            account_id: fromAccountId,
            transaction_date: txDate,
            notes: outgoingNotes,
          },
        ])
        .select()
        .single();

      if (outError) throw outError;

      // 2. Insert Incoming Transfer Transaction (Destino: credit/entrada)
      const incomingConcept = concept || `Transferencia desde ${fromAcc.name}`;
      const incomingNotes = `${notes ? notes + ' | ' : ''}Transferencia recibida de ${fromAcc.name} (${fromAcc.institution || 'Bancaria'}). Monto enviado: ${fromAcc.currency === 'USD' ? '$' : '$'}${numAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${fromAcc.currency}.`;

      const { data: inTx, error: inError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: currentUser.id,
            description: incomingConcept,
            amount: Math.abs(destAmount), // positive = arrival
            type: 'transfer',
            account_id: toAccountId,
            transaction_date: txDate,
            notes: incomingNotes,
          },
        ])
        .select()
        .single();

      if (inError) throw inError;

      // 3. Update From Account Balance
      // For credit cards: an exit/outgoing transfer from a credit card is like a cash advance / expense (increases debt)
      // For standard accounts: decreases balance
      const fromCurrentBal = Number(fromAcc.balance) || 0;
      const fromUpdatedBal = fromAcc.type === 'credito'
        ? fromCurrentBal + numAmount
        : fromCurrentBal - numAmount;

      await supabase
        .from('accounts')
        .update({ balance: fromUpdatedBal })
        .eq('id', fromAccountId);

      // 4. Update To Account Balance
      // For credit cards: an incoming transfer pays down debt (decreases balance/debt)
      // For standard accounts: increases balance
      const toCurrentBal = Number(toAcc.balance) || 0;
      const toUpdatedBal = toAcc.type === 'credito'
        ? toCurrentBal - destAmount
        : toCurrentBal + destAmount;

      await supabase
        .from('accounts')
        .update({ balance: toUpdatedBal })
        .eq('id', toAccountId);

      await refreshFinancialData();
      return { success: true, outTx, inTx, error: null };
    } catch (err) {
      console.error('Error realizando transferencia:', err);
      return { error: err.message };
    }
  };

  // Update account in Supabase
  const updateAccount = async (id, { name, institution, type, currency, balance, credit_limit, last4, color }) => {
    if (!currentUser) return { error: 'No user authenticated' };

    try {
      const updatePayload = {
        name,
        institution,
        type,
        currency,
        balance: parseFloat(balance) || 0,
        credit_limit: type === 'credito' && credit_limit ? parseFloat(credit_limit) : null,
        last4: last4 ? String(last4).slice(-4) : null,
        color: color || '#4338ca',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('accounts')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      await refreshFinancialData();
      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando cuenta:', err);
      return { error: err.message };
    }
  };

  // Delete account from Supabase
  const deleteAccount = async (id) => {
    if (!currentUser) return { error: 'No user authenticated' };

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      await refreshFinancialData();
      return { error: null };
    } catch (err) {
      console.error('Error eliminando cuenta:', err);
      return { error: err.message };
    }
  };

  // Delete single or multiple transactions with optional account balance revert
  const deleteTransactions = async (ids, revertBalance = true) => {
    if (!currentUser || !ids || ids.length === 0) return { error: 'No IDs provided' };

    try {
      // If we want to revert account balances before deleting
      if (revertBalance) {
        const txsToDelete = transactions.filter((t) => ids.includes(t.id));
        for (const tx of txsToDelete) {
          if (tx.accountId) {
            const acc = accounts.find((a) => a.id === tx.accountId);
            if (acc) {
              const currentBal = Number(acc.balance) || 0;
              const absAmount = Math.abs(tx.amount);
              // Revert logic:
              // For credit: expense originally increased balance, so revert decreases balance; income increased available / decreased balance, so revert increases balance
              // For standard: expense originally decreased balance, so revert increases balance; income originally increased balance, so revert decreases balance
              let revertedBal = currentBal;
              if (acc.type === 'credito') {
                revertedBal = tx.type === 'expense' ? currentBal - absAmount : currentBal + absAmount;
              } else {
                revertedBal = tx.type === 'expense' ? currentBal + absAmount : currentBal - absAmount;
              }

              await supabase
                .from('accounts')
                .update({ balance: revertedBal })
                .eq('id', acc.id);
            }
          }
        }
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      await refreshFinancialData();
      return { error: null };
    } catch (err) {
      console.error('Error eliminando movimientos:', err);
      return { error: err.message };
    }
  };

  // Update existing transaction in Supabase with account balance delta adjustment
  const updateTransaction = async (id, { concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [] }) => {
    if (!currentUser) return { error: 'No user authenticated' };

    try {
      const numAmount = parseFloat(amount);
      const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

      // Find original transaction to revert old balance impact
      const oldTx = transactions.find((t) => t.id === id);

      // 1. Revert old transaction balance impact if it had an account
      if (oldTx && oldTx.accountId) {
        const oldAcc = accounts.find((a) => a.id === oldTx.accountId);
        if (oldAcc) {
          const oldBal = Number(oldAcc.balance) || 0;
          const oldAbs = Math.abs(oldTx.amount);
          const revertedBal = oldAcc.type === 'credito'
            ? (oldTx.type === 'expense' ? oldBal - oldAbs : oldBal + oldAbs)
            : (oldTx.type === 'expense' ? oldBal + oldAbs : oldBal - oldAbs);

          await supabase
            .from('accounts')
            .update({ balance: revertedBal })
            .eq('id', oldAcc.id);
        }
      }

      // 2. Apply new transaction balance impact to new (or same) account
      if (accountId) {
        // Fetch freshest balance or get updated target
        const { data: freshAcc } = await supabase
          .from('accounts')
          .select('id, balance, type')
          .eq('id', accountId)
          .single();

        if (freshAcc) {
          const currentBal = Number(freshAcc.balance) || 0;
          const updatedBal = freshAcc.type === 'credito'
            ? (type === 'expense' ? currentBal + Math.abs(numAmount) : currentBal - Math.abs(numAmount))
            : (type === 'income' ? currentBal + Math.abs(numAmount) : currentBal - Math.abs(numAmount));

          await supabase
            .from('accounts')
            .update({ balance: updatedBal })
            .eq('id', accountId);
        }
      }

      // 3. Update the transaction row
      const { data: updatedTx, error: txError } = await supabase
        .from('transactions')
        .update({
          description: concept,
          amount: finalAmount,
          type,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          account_id: accountId || null,
          transaction_date: date || new Date().toISOString().split('T')[0],
          notes: notes || '',
        })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (txError) throw txError;

      // 4. Update tags associations
      await supabase.from('transaction_tags').delete().eq('transaction_id', id);
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map((tId) => ({
          transaction_id: id,
          tag_id: tId,
        }));
        await supabase.from('transaction_tags').insert(tagRelations);
      }

      await refreshFinancialData();
      return { data: updatedTx, error: null };
    } catch (err) {
      console.error('Error actualizando movimiento:', err);
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
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
