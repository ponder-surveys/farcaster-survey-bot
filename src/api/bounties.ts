import { supabaseClient } from '../clients/supabase'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'

const getTokenName = async (bountyId: string) => {
  const { data, error } = await supabaseClient
    .from('bounties')
    .select('tokens (name)')
    .eq('id', bountyId)
    .limit(1)
    .single()

  if (error) {
    logger.error(getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }

  return Object.values(data.tokens)[0]
}

export { getTokenName }
