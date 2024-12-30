/* eslint-disable @typescript-eslint/no-explicit-any */
import { MIN_NEYNAR_USER_SCORE_THRESHOLD } from 'utils/constants'
import { sendDailyPredictionFrameNotification } from 'utils/sendFrameNotifications'
import {
  fetchActiveFrameUsersFids,
  fetchLargestActivePrediction,
} from '../services/supabase'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'

export const publishDailyPrediction = async () => {
  try {
    const targetFids = await fetchActiveFrameUsersFids(
      'predictive',
      MIN_NEYNAR_USER_SCORE_THRESHOLD
    )

    if (targetFids.length === 0) {
      logger.info('No eligible target FIDs found')
      return { message: 'No eligible target FIDs found', error: null }
    }

    const largestDailyPrediction = (await fetchLargestActivePrediction()) as any
    if (!largestDailyPrediction) {
      logger.info('No eligible daily predictions found')
      return { message: 'No eligible predictions found', error: null }
    }

    logger.info(
      `Found largest daily prediction ${largestDailyPrediction.id} with ${targetFids.length} target FIDs`
    )

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

    logger.info('Successfully published daily prediction')
    return { message: 'Published daily prediction', error: null }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    logger.error('Failed to publish daily prediction:', errorMessage)
    return {
      message: 'Failed to publish daily prediction',
      error: errorMessage,
    }
  }
}
