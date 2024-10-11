import { Poll } from '../types/polls'
import { SURVEY_FRAME_URL, WARPCAST_API_KEY } from './constants'
import { v4 as uuidv4 } from 'uuid'

export default async function sendDirectCastForPredictivePolls(
  poll: Poll,
  recipientFid: number,
  username: string,
  amount: number,
  tokenName: string,
  transactionHash: string
) {
  const frameUrl = `${SURVEY_FRAME_URL}/${poll.id}/results`

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
        message: `💰 Congrats! You won ${amount} ${tokenName} on the recent predictive poll by @${username}.\n\nTx: ${transactionHash}\n\n${frameUrl}`,
        idempotencyKey: uuidv4(),
      }),
    }
  )

  return await directCastRequest.json()
}
