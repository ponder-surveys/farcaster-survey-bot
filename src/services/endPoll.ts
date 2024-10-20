import { Engine } from '@thirdweb-dev/engine'
import logger from '../utils/logger'
import {
  TRANSACTION_ADDRESS,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
} from '../utils/constants'
import { pollTransactionStatus } from '../clients/thirdweb'
import { closeBounty } from '../services/supabase'
import getChainDetails from '../utils/getChainDetails'
import { Poll } from '../types/polls'
import { Bounty } from '../types/common'
import getErrorMessage from '../utils/getErrorMessage'
import { Sentry } from '../clients/sentry'

if (!WEB3_ACCESS_TOKEN) {
  throw new Error('Web3 access token not found')
}

const web3Engine = new Engine({
  url: `https://${WEB3_ENGINE_URL}`,
  accessToken: WEB3_ACCESS_TOKEN,
})

export const endPoll = async (poll: Poll, bounty: Bounty) => {
  // Check here so we prevent a non-null assertion later
  if (!TRANSACTION_ADDRESS) {
    throw new Error('Transaction address not found')
  }

  try {
    logger.debug(poll)

    const { status } = poll

    const { smart_contract_id: smartContractId } = bounty

    if (
      bounty &&
      status === 'calculated' &&
      bounty.status === 'active' &&
      smartContractId !== undefined
    ) {
      const chain = await getChainDetails(bounty)

      if (!chain) {
        const msg = `Could not fetch chain details for bounty ${bounty.id}`
        Sentry.captureMessage(msg)
        throw new Error(msg)
      }

      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.POLL_CONTRACT_ADDRESS,
        TRANSACTION_ADDRESS,
        {
          functionName: 'endPoll',
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
        logger.error(getErrorMessage(errorMessage))
        Sentry.captureMessage(getErrorMessage(errorMessage))
      }
    }

    return
  } catch (error) {
    logger.error(error)
    Sentry.captureException(error)
  }
}
