import { supabase } from '../lib/supabase';

/**
 * Transaction & Transfer CRUD operations against Supabase
 */
/**
 * Calculates updated balance based on signed transaction amount:
 * - Positive amount (> 0) means money entered the account (income / incoming transfer).
 * - Negative amount (< 0) means money left the account (expense / outgoing transfer).
 * For credit cards: spending (negative) increases debt (+), income/payments (positive) reduce debt (-).
 * For debit/cash/investments/savings: positive increases balance, negative decreases balance.
 */
export const calculateUpdatedBalance = (currentBalance, signedAmount, accountType) => {
  const current = Number(currentBalance) || 0;
  const num = Number(signedAmount) || 0;
  const isCredit = accountType === 'credito';
  if (isCredit) {
    return current - num;
  }
  return current + num;
};

export const transactionService = {
  async fetchCategories(userId) {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `)
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error cargando categorías:', error);
      throw error;
    }
    return data || [];
  },

  async fetchTags(userId) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error cargando etiquetas:', error);
      throw error;
    }
    return data || [];
  },

  async fetchTransactions(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name, institution, type, currency, color),
        categories (name, icon, color, type),
        subcategories (name),
        transaction_tags (
          tags (*)
        )
      `)
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando transacciones:', error);
      throw error;
    }

    return (data || []).map((tx) => {
      const txTags = (tx.transaction_tags || []).map((tt) => tt.tags).filter(Boolean);
      const accCurrency = tx.accounts?.currency || 'MXN';
      const isTransfer = tx.type === 'transfer';
      const isIncome = tx.type === 'income';

      // Parse custom MXN conversion tag if stored in notes (e.g. [MXN: 375.50])
      const mxnMatch = tx.notes?.match(/\[MXN:\s*\$?([\d,.]+)\]/);
      const parsedAmountMXN = mxnMatch ? parseFloat(mxnMatch[1].replace(/,/g, '')) : null;
      const cleanNotes = tx.notes ? tx.notes.replace(/\s*\|?\s*\[MXN:\s*\$?[\d,.]+\]/g, '').trim() : '';

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
        amountMXN: parsedAmountMXN,
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
        accountColor: tx.accounts?.color || '#4338ca',
        accountId: tx.account_id,
        tags: txTags,
        notes: cleanNotes,
        rawNotes: tx.notes || '',
        icon,
        iconBg,
      };
    });
  },

  async addTransaction(userId, accounts, { concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [], amountMXN = null }) {
    if (!userId) throw new Error('No user authenticated');

    const numAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

    let finalNotes = notes || '';
    if (amountMXN !== null && !isNaN(parseFloat(amountMXN)) && parseFloat(amountMXN) > 0) {
      finalNotes = finalNotes.replace(/\s*\|?\s*\[MXN:\s*\$?[\d,.]+\]/g, '').trim();
      const tag = `[MXN: ${parseFloat(amountMXN).toFixed(2)}]`;
      finalNotes = finalNotes ? `${finalNotes} | ${tag}` : tag;
    }

    const { data: newTx, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          description: concept,
          amount: finalAmount,
          type,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          account_id: accountId || null,
          transaction_date: date || new Date().toISOString().split('T')[0],
          notes: finalNotes,
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

    // Adjust account balance if accountId is present with fresh database balance
    if (accountId) {
      const { data: freshAcc } = await supabase
        .from('accounts')
        .select('id, balance, type')
        .eq('id', accountId)
        .single();

      if (freshAcc) {
        const updatedBal = calculateUpdatedBalance(freshAcc.balance, finalAmount, freshAcc.type);
        await supabase
          .from('accounts')
          .update({ balance: updatedBal })
          .eq('id', accountId);
      }
    }

    return newTx;
  },

  async addTransfer(userId, accounts, exchangeRate, {
    fromAccountId,
    toAccountId,
    amount,
    convertedAmount = null,
    destinationAmount = null,
    concept = 'Transferencia entre cuentas',
    notes = '',
    date = null,
  }) {
    if (!userId) throw new Error('No user authenticated');
    if (!fromAccountId || !toAccountId) throw new Error('Debes seleccionar cuenta de origen y cuenta de destino.');
    if (fromAccountId === toAccountId) throw new Error('La cuenta origen y destino no pueden ser la misma.');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error('Monto inválido.');

    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) throw new Error('Cuentas no encontradas.');

    const txDate = date || new Date().toISOString().split('T')[0];

    // Calculate amount received by destination account (respect custom user input if provided)
    const targetConverted = destinationAmount ?? convertedAmount;
    let destAmount = numAmount;
    if (targetConverted !== null && !isNaN(parseFloat(targetConverted)) && parseFloat(targetConverted) > 0) {
      destAmount = parseFloat(targetConverted);
    } else if (fromAcc.currency !== toAcc.currency) {
      if (fromAcc.currency === 'MXN' && toAcc.currency === 'USD') {
        destAmount = exchangeRate > 0 ? numAmount / exchangeRate : numAmount;
      } else if (fromAcc.currency === 'USD' && toAcc.currency === 'MXN') {
        destAmount = numAmount * (exchangeRate || 1);
      }
    }
    destAmount = Number(destAmount.toFixed(2));

    // 1. Insert Outgoing Transfer Transaction (Origen: debit/salida)
    const outgoingConcept = concept || `Transferencia a ${toAcc.name}`;
    const outgoingNotes = `${notes ? notes + ' | ' : ''}Transferencia enviada hacia ${toAcc.name} (${toAcc.institution || 'Bancaria'}). Destino recibe: $${destAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${toAcc.currency}.`;

    const { data: outTx, error: outError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          description: outgoingConcept,
          amount: -Math.abs(numAmount),
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
    const incomingNotes = `${notes ? notes + ' | ' : ''}Transferencia recibida de ${fromAcc.name} (${fromAcc.institution || 'Bancaria'}). Monto enviado: $${numAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${fromAcc.currency}.`;

    const { data: inTx, error: inError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          description: incomingConcept,
          amount: Math.abs(destAmount),
          type: 'transfer',
          account_id: toAccountId,
          transaction_date: txDate,
          notes: incomingNotes,
        },
      ])
      .select()
      .single();

    if (inError) throw inError;

    // 3. Update From Account Balance (outgoing transfer: -numAmount)
    const { data: freshFrom } = await supabase
      .from('accounts')
      .select('id, balance, type')
      .eq('id', fromAccountId)
      .single();

    if (freshFrom) {
      const fromUpdatedBal = calculateUpdatedBalance(freshFrom.balance, -Math.abs(numAmount), freshFrom.type);
      await supabase
        .from('accounts')
        .update({ balance: fromUpdatedBal })
        .eq('id', fromAccountId);
    }

    // 4. Update To Account Balance (incoming transfer: +destAmount)
    const { data: freshTo } = await supabase
      .from('accounts')
      .select('id, balance, type')
      .eq('id', toAccountId)
      .single();

    if (freshTo) {
      const toUpdatedBal = calculateUpdatedBalance(freshTo.balance, +Math.abs(destAmount), freshTo.type);
      await supabase
        .from('accounts')
        .update({ balance: toUpdatedBal })
        .eq('id', toAccountId);
    }

    return { outTx, inTx };
  },

  async deleteTransactions(userId, transactions, accounts, ids, revertBalance = true) {
    if (!userId || !ids || ids.length === 0) throw new Error('No IDs provided');

    // Revert account balances before deleting
    if (revertBalance) {
      const txsToDelete = transactions.filter((t) => ids.includes(t.id));
      for (const tx of txsToDelete) {
        if (tx.accountId) {
          const { data: freshAcc } = await supabase
            .from('accounts')
            .select('id, balance, type')
            .eq('id', tx.accountId)
            .single();

          if (freshAcc) {
            // To revert, apply the opposite of tx.amount: -Number(tx.amount)
            const revertedBal = calculateUpdatedBalance(freshAcc.balance, -Number(tx.amount), freshAcc.type);
            await supabase
              .from('accounts')
              .update({ balance: revertedBal })
              .eq('id', freshAcc.id);
          }
        }
      }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async updateTransaction(userId, transactions, accounts, id, { concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [], amountMXN = null }) {
    if (!userId) throw new Error('No user authenticated');

    const numAmount = parseFloat(amount);
    const oldTx = transactions.find((t) => t.id === id);

    const isNegative = type === 'expense' || (type === 'transfer' && oldTx && Number(oldTx.amount) < 0);
    const finalAmount = isNegative ? -Math.abs(numAmount) : Math.abs(numAmount);

    let finalNotes = notes || '';
    if (amountMXN !== null && !isNaN(parseFloat(amountMXN)) && parseFloat(amountMXN) > 0) {
      finalNotes = finalNotes.replace(/\s*\|?\s*\[MXN:\s*\$?[\d,.]+\]/g, '').trim();
      const tag = `[MXN: ${parseFloat(amountMXN).toFixed(2)}]`;
      finalNotes = finalNotes ? `${finalNotes} | ${tag}` : tag;
    } else {
      finalNotes = finalNotes.replace(/\s*\|?\s*\[MXN:\s*\$?[\d,.]+\]/g, '').trim();
    }

    // Determine if balance impact actually changed:
    // If user only edited the date, concept, category, notes, or tags, balance impact has NOT changed.
    // In that case, we MUST NOT touch account balances to prevent accidental recalculations or race conditions.
    const oldAmount = oldTx ? Number(oldTx.amount) : null;
    const oldAccountId = oldTx ? oldTx.accountId : null;
    const oldType = oldTx ? oldTx.type : null;

    const balanceImpactChanged = (
      oldAmount !== finalAmount ||
      oldAccountId !== accountId ||
      oldType !== type
    );

    if (balanceImpactChanged) {
      if (oldAccountId === accountId && accountId) {
        // Same account: apply the difference (delta = finalAmount - oldAmount) in ONE atomic step
        const { data: freshAcc } = await supabase
          .from('accounts')
          .select('id, balance, type')
          .eq('id', accountId)
          .single();

        if (freshAcc) {
          const delta = finalAmount - (oldAmount || 0);
          const updatedBal = calculateUpdatedBalance(freshAcc.balance, delta, freshAcc.type);
          await supabase
            .from('accounts')
            .update({ balance: updatedBal })
            .eq('id', accountId);
        }
      } else {
        // Different accounts: revert old account balance and apply to new account
        if (oldTx && oldAccountId) {
          const { data: freshOldAcc } = await supabase
            .from('accounts')
            .select('id, balance, type')
            .eq('id', oldAccountId)
            .single();

          if (freshOldAcc) {
            const revertedBal = calculateUpdatedBalance(freshOldAcc.balance, -(oldAmount || 0), freshOldAcc.type);
            await supabase
              .from('accounts')
              .update({ balance: revertedBal })
              .eq('id', oldAccountId);
          }
        }

        if (accountId) {
          const { data: freshNewAcc } = await supabase
            .from('accounts')
            .select('id, balance, type')
            .eq('id', accountId)
            .single();

          if (freshNewAcc) {
            const updatedBal = calculateUpdatedBalance(freshNewAcc.balance, finalAmount, freshNewAcc.type);
            await supabase
              .from('accounts')
              .update({ balance: updatedBal })
              .eq('id', accountId);
          }
        }
      }
    }

    // If it's a transfer and the date changed, automatically sync the date on the paired transfer leg!
    if (oldTx && oldTx.type === 'transfer' && date && date !== oldTx.date) {
      const pairedTx = transactions.find((t) =>
        t.id !== id &&
        t.type === 'transfer' &&
        t.date === oldTx.date &&
        Math.sign(Number(t.amount)) !== Math.sign(Number(oldTx.amount))
      );

      if (pairedTx) {
        await supabase
          .from('transactions')
          .update({ transaction_date: date })
          .eq('id', pairedTx.id);
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
        notes: finalNotes,
      })
      .eq('id', id)
      .eq('user_id', userId)
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

    return updatedTx;
  },
};
