import { Sentry } from '../clients/sentry'
import { supabaseClient } from '../clients/supabase'
import {
  BountyClaim,
  BountyContent,
  UserWithSelectedOption,
} from '../types/common'
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

export async function fetchResponse(questionId: number, userId: number) {
  const { data, error } = await supabaseClient
    .from('responses')
    .select('*')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single()

  if (error) {
    Sentry.captureException(error)
    throw new Error(getErrorMessage(error))
  }

  return data
}

// NOTE: We're using this to record those that were awarded on predictive polls as well
export async function updateBountyClaim(
  bountyId: string,
  responseId: number,
  amount: number
): Promise<void> {
  const table = 'bounty_claims'

  const { error } = await supabaseClient
    .from(table)
    .update({ amount: amount, status: 'approved' })
    .eq('bounty_id', bountyId)
    .eq('response_id', responseId)

  if (error) {
    Sentry.captureException(error)
    throw new Error(`Error updating bounty claim: ${getErrorMessage(error)}`)
  }
}

export async function fetchUsersForMostSelectedOption(
  questionId: number
): Promise<UserWithSelectedOption[]> {
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

export async function calculateWinningOption(
  pollId: number
): Promise<number | null> {
  const { data, error } = await supabaseClient.rpc('calculate_winning_option', {
    q_id: pollId,
  })

  if (error) {
    Sentry.captureException(error)
    console.error('Error calculating winning option:', error)
    return null
  }

  return data
}
