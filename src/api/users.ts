import { supabaseClient } from '../clients/supabase'
import { getDateTag } from '../utils/getDateTag'

const getUsername = async (userId?: number): Promise<string | null> => {
  if (!userId) return null;

  const { data, error } = await supabaseClient
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`${getDateTag()} ${error}`)
    throw new Error(error.message)
  }

  return data?.username || null;
}

export { getUsername }
