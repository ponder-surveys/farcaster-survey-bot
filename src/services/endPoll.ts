import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { Engine } from '@thirdweb-dev/engine'
import logger from '../utils/logger'
import {
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  TRANSACTION_ADDRESS,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
} from '../utils/constants'
import { pollTransactionStatus } from '../clients/thirdweb'
import { closeBounty } from '../services/supabase'
import getChainDetails from '../utils/getChainDetails'
import { Poll } from '../types/polls'

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  // Performance Monitoring
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})

if (!WEB3_ACCESS_TOKEN) {
  throw new Error('Web3 access token not found')
}

const web3Engine = new Engine({
  url: `https://${WEB3_ENGINE_URL}`,
  accessToken: WEB3_ACCESS_TOKEN,
})

export const endPoll = async (poll: any, bounty: any) => {
  // Check here so we prevent a non-null assertion later
  if (!TRANSACTION_ADDRESS) {
    throw new Error('Transaction address not found')
  }

  try {
    logger.debug(poll)

    const { bounty_id: bountyId, status } = poll

    const { smart_contract_id: smartContractId } = bounty

    if (
      bounty &&
      status === 'calculated' &&
      bounty.status === 'active' &&
      smartContractId !== undefined
    ) {
      const chain = await getChainDetails(bountyId)

      if (!chain) {
        const msg = `Could not fetch chain details for bounty ${bountyId}`
        Sentry.captureMessage(msg)
        throw new Error(msg)
      }

      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.SMART_CONTRACT_ADDRESS,
        TRANSACTION_ADDRESS,
        {
          functionName: 'endPoll(uint256)',
          args: [String(smartContractId)],
        }
      )

      // Poll transaction status
      const { status, transactionHash, errorMessage } =
        await pollTransactionStatus(result.queueId)

      // Update response in database
      if (status === 'mined' && transactionHash) {
        logger.info('endPoll transaction mined successfully')

        await closeBounty(String(smartContractId), 'survey')
      } else {
        // Handle case where the transaction did not mine successfully
        logger.error(errorMessage)
        Sentry.captureMessage(errorMessage)
      }
    }

    return
  } catch (error) {
    logger.error(error)
    Sentry.captureException(error)
  }
}