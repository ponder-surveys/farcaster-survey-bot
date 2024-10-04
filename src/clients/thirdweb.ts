import { Engine } from '@thirdweb-dev/engine'
import {
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
  POLL_TIMEOUT,
  POLL_INTERVAL,
} from '../utils/constants'
import { Sentry } from './sentry'

if (!WEB3_ACCESS_TOKEN) {
  throw new Error('WEB3_ACCESS_TOKEN is missing')
}

const web3Engine = new Engine({
  url: `https://${WEB3_ENGINE_URL}`,
  accessToken: WEB3_ACCESS_TOKEN,
})

export const pollTransactionStatus = async (
  queueId: string,
  elapsedTime = 0
): Promise<{
  status: 'queued' | 'sent' | 'mined' | 'errored' | 'cancelled'
  transactionHash?: string | null
  functionArgs?: string | null
  errorMessage?: string | null
}> => {
  return new Promise((resolve, reject) => {
    try {
      web3Engine.transaction.status(queueId).then(({ result }) => {
        const { status, transactionHash, functionArgs, errorMessage } = result

        if (status === 'mined') {
          resolve({ status, transactionHash, functionArgs })
        } else if (status === 'errored') {
          resolve({
            status,
            errorMessage,
          })
        } else if (elapsedTime < POLL_TIMEOUT) {
          setTimeout(async () => {
            resolve(
              await pollTransactionStatus(queueId, elapsedTime + POLL_INTERVAL)
            )
          }, POLL_INTERVAL)
        } else {
          reject(new Error('Transaction timed out'))
        }
      })
    } catch (error) {
      Sentry.captureException(error)
      reject(error)
    }
  })
}
