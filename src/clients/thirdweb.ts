/* eslint-disable @typescript-eslint/no-explicit-any */
import { Engine } from '@thirdweb-dev/engine'
import { PredictivePollABI } from 'utils/contracts'
import getErrorMessage from 'utils/getErrorMessage'
import {
  POLL_INTERVAL,
  POLL_TIMEOUT,
  TRANSACTION_ADDRESS,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
} from '../utils/constants'
import { Sentry } from './sentry'

if (!WEB3_ACCESS_TOKEN) {
  throw new Error('WEB3_ACCESS_TOKEN is missing')
}

const web3Engine = new Engine({
  url: `https://${WEB3_ENGINE_URL}`,
  accessToken: WEB3_ACCESS_TOKEN,
})

export async function distributeRewards(
  smartContractId: number,
  winningOptions: number[],
  rewardRecipientAddresses: string[],
  chain: { CHAIN_ID: number; PREDICTIVE_POLL_CONTRACT_ADDRESS: string }
) {
  if (!TRANSACTION_ADDRESS) {
    throw new Error('Transaction address not found')
  }

  try {
    // NOTE: Need to adjust the winning options to be zero-indexed due to discrepancies between the contract db
    const adjustedWinningOptions = winningOptions.map((option) => option - 1)

    const { result } = await web3Engine.contract.write(
      String(chain.CHAIN_ID),
      chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
      TRANSACTION_ADDRESS,
      {
        functionName: 'distributeRewards',
        args: [
          String(smartContractId),
          adjustedWinningOptions as any,
          rewardRecipientAddresses as any,
        ],
        abi: PredictivePollABI,
      }
    )

    return result
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function endPoll(
  smartContractId: number,
  chain: { CHAIN_ID: number; PREDICTIVE_POLL_CONTRACT_ADDRESS: string }
) {
  if (!TRANSACTION_ADDRESS) {
    throw new Error('Transaction address not found')
  }

  try {
    const { result } = await web3Engine.contract.write(
      String(chain.CHAIN_ID),
      chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
      TRANSACTION_ADDRESS,
      {
        functionName: 'endPoll',
        args: [String(smartContractId)],
        abi: PredictivePollABI,
      }
    )

    return result
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

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
