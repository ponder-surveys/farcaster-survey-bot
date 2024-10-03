import { Sentry } from '../clients/sentry'
import { supabaseClient } from '../clients/supabase'
import { BountyContent } from '../types/common'
import { User } from '../types/common'
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

export async function fetchUsersForMostSelectedOption(
  questionId: number
): Promise<User[]> {
  const { data, error } = await supabaseClient.rpc(
    'get_users_for_most_selected_option',
    { q_id: questionId }
  )

  if (error) {
    Sentry.captureException(error)
    throw new Error(
      `Error fetching users for most selected option: ${getErrorMessage(error)}`
    )
  }

  return data
}
