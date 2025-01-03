// Keeping this as archive for now in case we want to work with DCs in the future.

import { v4 as uuidv4 } from 'uuid'
import { Poll } from '../types/polls'
import {
  COMPOSER_ACTION_PREDICTIVE_POLL_URL,
  SURVEY_FRAME_URL,
  WARPCAST_API_KEY,
} from './constants'

export default async function sendDirectCastForPredictivePolls(
  poll: Poll,
  recipientFid: number,
  username: string,
  amount: number,
  tokenName: string,
  transactionHash: string
) {
  const frameUrl = `${SURVEY_FRAME_URL}/${poll.id}/results`

  const formattedAmount = Number.isInteger(amount)
    ? amount.toString()
    : Number(amount.toFixed(4)).toString()

  const directCastRequest = await fetch(
    'https://api.warpcast.com/v2/ext-send-direct-cast',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${WARPCAST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientFid,
        message: `💰 Congrats! You won ${formattedAmount} ${tokenName} on the recent predictive poll by @${username}.\n\n${frameUrl}\n\nTx: ${transactionHash}\n\nTo create your own, go to the Ponder composer action:\n${COMPOSER_ACTION_PREDICTIVE_POLL_URL}`,
        idempotencyKey: uuidv4(),
      }),
    }
  )

  return await directCastRequest.json()
}
