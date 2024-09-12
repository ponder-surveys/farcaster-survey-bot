import * as Sentry from '@sentry/node'
import { Engine } from '@thirdweb-dev/engine'
import {
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
  POLL_TIMEOUT,
  POLL_INTERVAL,
} from '../utils/constants'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
})

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
): Promise<TransactionStatus> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { result } = await web3Engine.transaction.status(queueId)
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
    } catch (error) {
      Sentry.captureException(error)
      reject(error)
    }
  })
}
