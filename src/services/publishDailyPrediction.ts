import { MIN_NEYNAR_USER_SCORE_THRESHOLD } from 'utils/constants'
import { sendDailyPredictionFrameNotification } from 'utils/sendFrameNotifications'
import {
  fetchActiveFrameUsersFids,
  fetchLargestActivePrediction,
} from '../services/supabase'

export const publishDailyPrediction = async () => {
  // get active frames users
  const targetFids = await fetchActiveFrameUsersFids(
    'predictive',
    MIN_NEYNAR_USER_SCORE_THRESHOLD
  )

  const largestDailyPrediction = (await fetchLargestActivePrediction()) as any

  const tokenAmount =
    largestDailyPrediction.bounty.token_amount +
    (largestDailyPrediction.bounty.bounty_seed?.[0]?.amount || 0) +
    (largestDailyPrediction.bounty.bounty_claims?.reduce(
      (sum: number, claim: any) => sum + claim.amount,
      0
    ) || 0)

  await sendDailyPredictionFrameNotification(
    targetFids,
    largestDailyPrediction.title,
    tokenAmount,
    largestDailyPrediction.bounty.token.name,
    largestDailyPrediction.id
  )

  return { message: 'Published daily prediction', error: null }
}
