import { neynarClientV2 } from 'clients/neynar'
import { v4 as uuidv4 } from 'uuid'
import { APP_URL } from './constants'

export async function sendFrameNotifications(
  targetFids: number[],
  amountAwarded: number,
  tokenName: string,
  optionText: string
) {
  const formattedAmount = Number.isInteger(amountAwarded)
    ? amountAwarded.toString()
    : amountAwarded.toFixed(3)

  await neynarClientV2.publishFrameNotifications({
    targetFids,
    notification: {
      title: `You won ${formattedAmount} ${tokenName}!`,
      body: JSON.stringify(`For your correct answer: "${optionText}"`),
      target_url: `${APP_URL}/predictive/235`,
      uuid: uuidv4(),
    },
  })
}
