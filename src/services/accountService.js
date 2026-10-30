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

  async addAccount(userId, { name, institution, type, currency = 'MXN', balance, credit_limit, last4, color }) {
    if (!userId) throw new Error('No user authenticated');

    const { data, error } = await supabase
      .from('accounts')
      .insert([
        {
          user_id: userId,
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
    return data;
  },

  async updateAccount(userId, id, { name, institution, type, currency, balance, credit_limit, last4, color }) {
    if (!userId) throw new Error('No user authenticated');

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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
