import { neynarClientV2 } from 'clients/neynar'
import { v4 as uuidv4 } from 'uuid'
import { APP_URL } from './constants'
import logger from './logger'

export async function sendFrameNotifications(
  targetFids: number[],
  amountAwarded: number,
  tokenName: string,
  optionText: string,
  isWinner: boolean,
  pollId: number
) {
  logger.debug(`Target FIDs: ${targetFids}`)
  logger.debug(`Amount Awarded: ${amountAwarded}`)
  logger.debug(`Token Name: ${tokenName}`)
  logger.debug(`Option Text: ${optionText}`)
  logger.debug(`Is Winner: ${isWinner}`)

  if (isWinner) {
    const formattedAmount = Number.isInteger(amountAwarded)
      ? amountAwarded.toString()
      : amountAwarded.toFixed(2)

    await neynarClientV2.publishFrameNotifications({
      targetFids,
      notification: {
        title: `You won ${formattedAmount} ${tokenName}`,
        body: `Your answer '${optionText}' was right! Tap to view results.`,
        target_url: `${APP_URL}/fc-mini-app/predictive-polls/${pollId}`,
        uuid: uuidv4(),
      },
    })
  } else {
    await neynarClientV2.publishFrameNotifications({
      targetFids,
      notification: {
        title: `Prediction Ended`,
        body: `Your vote '${optionText}' wasn't the consensus pick this time. Tap to view winner.`,
        target_url: `${APP_URL}/fc-mini-app/predictive-polls/${pollId}`,
        uuid: uuidv4(),
      },
    })
  }
}

export async function sendDailyPredictionFrameNotification(
  targetFids: number[],
  pollText: string,
  tokenAmount: number,
  tokenName: string,
  pollId: number
) {
  const formattedAmount = Number.isInteger(tokenAmount)
    ? tokenAmount.toString()
    : tokenAmount.toFixed(2)

  const formattedPollText =
    pollText.slice(0, 40) + (pollText.length > 40 ? '...' : '')

  // Split targetFids into chunks of 100
  const chunkSize = 100
  for (let i = 0; i < targetFids.length; i += chunkSize) {
    const chunk = targetFids.slice(i, i + chunkSize)

    try {
      await neynarClientV2.publishFrameNotifications({
        targetFids: chunk,
        notification: {
          title: `💥 Daily prediction: ${formattedAmount} ${tokenName}`,
          body: `'${formattedPollText}' Tap to vote.`,
          target_url: `${APP_URL}/fc-mini-app/predictive-polls/${pollId}`,
          uuid: uuidv4(),
        },
      })

      // Add a small delay between batches to avoid rate limits
      if (i + chunkSize < targetFids.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      logger.error(
        `Error sending notification batch ${i / chunkSize + 1}:`,
        error
      )
    }
  }
}
