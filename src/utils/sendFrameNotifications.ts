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
      : amountAwarded.toFixed(3)

    await neynarClientV2.publishFrameNotifications({
      targetFids,
      notification: {
        title: `You won ${formattedAmount} ${tokenName}`,
        body: JSON.stringify(
          `Your answer '${optionText}' was right! Tap to view results.`
        ),
        target_url: `${APP_URL}/fc-mini-app/predictive-polls/${pollId}`,
        uuid: uuidv4(),
      },
    })
  } else {
    await neynarClientV2.publishFrameNotifications({
      targetFids,
      notification: {
        title: `Prediction Ended`,
        body: JSON.stringify(
          `Your vote '${optionText}' wasn't the consensus pick this time. Tap to view winner.`
        ),
        target_url: `${APP_URL}/fc-mini-app/predictive-polls/${pollId}`,
        uuid: uuidv4(),
      },
    })
  }
}
