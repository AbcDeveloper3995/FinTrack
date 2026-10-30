/**
 * Calculations & metrics utilities for FinTrack
 * Pure functions: easy to unit test and maintain.
 */

export const calculatePeriodMetrics = ({
  accounts = [],
  categories = [],
  transactions = [],
  exchangeRate = 1,
}) => {
  // 1. Calculate Net Worth & Credit Debt in MXN (Converting USD accounts with live exchange rate)
  let totalLiquidAssetsMXN = 0;
  let totalCreditDebtMXN = 0;
  let totalCreditLimitMXN = 0;

  accounts.forEach((acc) => {
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

  // 2. Dates & Month Keys
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

  transactions.forEach((tx) => {
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
  const expenseDifference = monthlyExpenses - prevMonthExpenses;
  const expenseChangePct = prevMonthExpenses > 0
    ? Number(((expenseDifference / prevMonthExpenses) * 100).toFixed(1))
    : (monthlyExpenses > 0 ? 100 : 0);

  const savingsDifference = netBalance - prevNetBalance;

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

  // Pacing & Overall Trend alert
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

  // Category Budget Thresholds alert
  categories
    .filter((c) => c.type === 'expense' && Number(c.budget_monthly) > 0)
    .forEach((c) => {
      const limit = Number(c.budget_monthly);
      const catSpent = transactions
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

  const kpis = {
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
    savingsTarget: 25.0,
    monthlyHistory,
    currentMonthKey,
    prevMonthKey,
    currentDay,
    daysInCurrentMonth,
    dailySpendingRate,
    projectedMonthEndExpenses,
    projectedVsPrevExpensesDiff,
    projectedSavingsVsPrev,
    smartNotifications,
  };

  const creditDebt = {
    amount: totalCreditDebtMXN,
    dueDate: totalCreditDebtMXN > 0 ? 'Revisa tus fechas de corte' : 'Sin saldo por pagar',
    limitUsage: totalCreditLimitMXN > 0 ? `${((totalCreditDebtMXN / totalCreditLimitMXN) * 100).toFixed(1)}%` : '0.0%',
  };

  return { kpis, creditDebt };
};
