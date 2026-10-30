import { supabase } from '../lib/supabase';

/**
 * Transaction & Transfer CRUD operations against Supabase
 */
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
        accountColor: tx.accounts?.color || '#4338ca',
        accountId: tx.account_id,
        tags: txTags,
        notes: tx.notes || '',
        icon,
        iconBg,
      };
    });
  },

  async addTransaction(userId, accounts, { concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [] }) {
    if (!userId) throw new Error('No user authenticated');

    const numAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

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

    return newTx;
  },

  async addTransfer(userId, accounts, exchangeRate, {
    fromAccountId,
    toAccountId,
    amount,
    convertedAmount = null,
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

    // Calculate amount received by destination account
    let destAmount = numAmount;
    if (convertedAmount && !isNaN(parseFloat(convertedAmount)) && parseFloat(convertedAmount) > 0) {
      destAmount = parseFloat(convertedAmount);
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

    // 3. Update From Account Balance
    const fromCurrentBal = Number(fromAcc.balance) || 0;
    const fromUpdatedBal = fromAcc.type === 'credito'
      ? fromCurrentBal + numAmount
      : fromCurrentBal - numAmount;

    await supabase
      .from('accounts')
      .update({ balance: fromUpdatedBal })
      .eq('id', fromAccountId);

    // 4. Update To Account Balance
    const toCurrentBal = Number(toAcc.balance) || 0;
    const toUpdatedBal = toAcc.type === 'credito'
      ? toCurrentBal - destAmount
      : toCurrentBal + destAmount;

    await supabase
      .from('accounts')
      .update({ balance: toUpdatedBal })
      .eq('id', toAccountId);

    return { outTx, inTx };
  },

  async deleteTransactions(userId, transactions, accounts, ids, revertBalance = true) {
    if (!userId || !ids || ids.length === 0) throw new Error('No IDs provided');

    // Revert account balances before deleting
    if (revertBalance) {
      const txsToDelete = transactions.filter((t) => ids.includes(t.id));
      for (const tx of txsToDelete) {
        if (tx.accountId) {
          const acc = accounts.find((a) => a.id === tx.accountId);
          if (acc) {
            const currentBal = Number(acc.balance) || 0;
            const absAmount = Math.abs(tx.amount);
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
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async updateTransaction(userId, transactions, accounts, id, { concept, amount, type, categoryId, subcategoryId, accountId, date, notes, tagIds = [] }) {
    if (!userId) throw new Error('No user authenticated');

    const numAmount = parseFloat(amount);
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

    const oldTx = transactions.find((t) => t.id === id);

    // 1. Revert old transaction balance impact
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

    // 2. Apply new transaction balance impact
    if (accountId) {
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
