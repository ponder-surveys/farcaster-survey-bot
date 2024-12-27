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
  status: 'awarded' | 'not_awarded',
  amountAwarded?: number
): Promise<void> {
  const table = 'bounty_claims'

  const updateData: { status: string; amount_awarded?: number } = { status }
  if (amountAwarded !== undefined) {
    updateData.amount_awarded = amountAwarded
  }

  const { error } = await supabaseClient
    .from(table)
    .update(updateData)
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

  return data || []
}

export async function fetchBountyClaimsForPoll(
  pollId: number
): Promise<BountyClaim[]> {
  const { data, error } = await supabaseClient
    .from('bounty_claims')
    .select(
      `
      *,
      response:responses!inner(
        id,
        selected_option,
        user:users(
          id,
          fid,
          username,
          smart_wallet
        )
      )
    `
    )
    .eq('responses.question_id', pollId)

  if (error) {
    Sentry.captureException(error)
    throw new Error(`Error fetching bounty claims: ${getErrorMessage(error)}`)
  }

  return data || []
}

export async function fetchActiveFrameUsersFids(
  pollType: string,
  userScoreThreshold: number
) {
  const { data, error } = await supabaseClient.rpc('get_active_frame_users', {
    p_type: pollType,
    user_score_threshold: userScoreThreshold,
  })

  if (error) {
    console.error('Error fetching frame users:', error)
    throw new Error('Failed to fetch frame users')
  }

  const fids = data ? data.map((user: any) => user.fid) : []

  return fids
}

export async function fetchLargestActivePrediction() {
  const now = new Date()
  // Add 30 minutes to current time for the minimum expiration threshold
  const minExpirationTime = new Date(now.getTime() + 30 * 60 * 1000)

  const { data, error } = await supabaseClient
    .from('questions')
    .select(
      `
      id,
      title, 
      bounty:bounties!inner(
        *,
        token:tokens(*),
        bounty_seed:bounty_seeds(*),
        bounty_claims(*)
      )
    `
    )
    .eq('poll_type', 'predictive')
    .eq('bounties.status', 'active')
    .gte('expires_at', minExpirationTime.toISOString())
    // Only get polls created today (comparing the date portion)
    .gte('created_at', now.toISOString().split('T')[0])
    .lt(
      'created_at',
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )

  if (error) {
    Sentry.captureException(error)
    throw new Error(
      `Error fetching largest active predictive poll: ${getErrorMessage(error)}`
    )
  }

  const largestPoll = data?.reduce((max: any, current: any) => {
    const currentTotal =
      current.bounty.token_amount +
      (current.bounty.bounty_seed?.[0]?.amount || 0) +
      (current.bounty.bounty_claims?.reduce(
        (sum: number, claim: any) => sum + claim.amount,
        0
      ) || 0)

    const maxTotal =
      max.bounty.token_amount +
      (max.bounty.bounty_seed?.[0]?.amount || 0) +
      (max.bounty.bounty_claims?.reduce(
        (sum: number, claim: any) => sum + claim.amount,
        0
      ) || 0)

    return currentTotal > maxTotal ? current : max
  })

  return largestPoll
}

export async function fetchPollById(pollId: number) {
  const { data, error } = await supabaseClient
    .from('questions')
    .select(
      `
      id,
      title, 
      bounty:bounties!inner(
        *,
        token:tokens(*)
      )
    `
    )
    .eq('poll_type', 'predictive')
    .eq('id', pollId)
    .limit(1)
    .single()

  if (error) {
    Sentry.captureException(error)
    throw new Error(
      `Error fetching largest active predictive poll: ${getErrorMessage(error)}`
    )
  }

  return data
}
