import * as Sentry from '@sentry/node'
import { supabaseClient } from '../clients/supabase'
import { BountyContent } from '../types/common'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'

//
// Bounties
//

export async function fetchBounty(bountyId: string) {
  // Fetch the question id for the smart contract
  const { data, error } = await supabaseClient
    .from('bounties')
    .select('*, user:users(*), token:tokens(*)')
    .eq('id', bountyId)
    .single()

  if (error) {
    Sentry.captureException(error)
    throw new Error(getErrorMessage(error))
  }

  logger.trace(data)
  return data
}

export async function closeBounty(
  contentId: string,
  content: BountyContent
): Promise<void> {
  const table = 'bounties'

  // Update the bounty status to "completed"
  const { error } = await supabaseClient
    .from(table)
    .update({ status: 'completed' })
    .eq('smart_contract_id', contentId)
    .eq('content', content)

  if (error) {
    Sentry.captureException(error)
    throw new Error(getErrorMessage(error))
  }
}
