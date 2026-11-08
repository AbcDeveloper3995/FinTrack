import { supabase } from '../lib/supabase';

/**
 * Account CRUD operations against Supabase
 */
export const accountService = {
  async fetchAccounts(userId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando cuentas:', error);
      throw error;
    }
    return data || [];
  },

  async addAccount(userId, { name, institution, type, currency = 'MXN', balance, credit_limit, min_balance, last4, color }) {
    if (!userId) throw new Error('No user authenticated');

    const hasMinBalance = min_balance !== undefined && min_balance !== '' && min_balance !== null;
    const insertPayload = {
      user_id: userId,
      name,
      institution: institution || 'Bancaria',
      type,
      currency: currency || 'MXN',
      balance: parseFloat(balance) || 0,
      credit_limit: credit_limit ? parseFloat(credit_limit) : null,
      last4: last4 || null,
      color: color || '#4338ca',
    };

    if (hasMinBalance) {
      insertPayload.min_balance = parseFloat(min_balance);
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      // Fallback: If min_balance does not exist in Supabase schema cache yet, retry without it
      if (err?.message?.includes('min_balance') && 'min_balance' in insertPayload) {
        console.warn('La columna min_balance no existe en la tabla accounts de Supabase. Reintentando guardado sin min_balance...');
        delete insertPayload.min_balance;
        const { data, error } = await supabase
          .from('accounts')
          .insert([insertPayload])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      throw err;
    }
  },

  async updateAccount(userId, id, { name, institution, type, currency, balance, credit_limit, min_balance, last4, color }) {
    if (!userId) throw new Error('No user authenticated');

    const hasMinBalance = min_balance !== undefined && min_balance !== '' && min_balance !== null;
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

    if (hasMinBalance) {
      updatePayload.min_balance = parseFloat(min_balance);
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      // Fallback: If min_balance does not exist in Supabase schema cache yet, retry without it
      if (err?.message?.includes('min_balance')) {
        console.warn('La columna min_balance no existe en la tabla accounts de Supabase. Reintentando guardado sin min_balance...');
        delete updatePayload.min_balance;
        const { data, error } = await supabase
          .from('accounts')
          .update(updatePayload)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      throw err;
    }
  },

  async deleteAccount(userId, id) {
    if (!userId) throw new Error('No user authenticated');

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};
