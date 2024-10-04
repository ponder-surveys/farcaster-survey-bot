import { Sentry } from '../clients/sentry'
import { Engine } from '@thirdweb-dev/engine'
import logger from '../utils/logger'
import {
  TRANSACTION_ADDRESS,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
} from '../utils/constants'
import { pollTransactionStatus } from '../clients/thirdweb'
import {
  closeBounty,
  fetchResponse,
  fetchUsersForMostSelectedOption,
  insertBountyClaim,
} from '../services/supabase'
import getChainDetails from '../utils/getChainDetails'
import { Poll } from '../types/polls'
import { Bounty, BountyClaim, UserWithSelectedOption } from '../types/common'
import getErrorMessage from '../utils/getErrorMessage'
import sendDirectCastForPredictivePolls from 'utils/sendDirectCast'
import { supabaseClient } from 'clients/supabase'

if (!WEB3_ACCESS_TOKEN) {
  throw new Error('Web3 access token not found')
}

const web3Engine = new Engine({
  url: `https://${WEB3_ENGINE_URL}`,
  accessToken: WEB3_ACCESS_TOKEN,
})

export const endPredictivePoll = async (poll: Poll, bounty: Bounty) => {
  // Check here so we prevent a non-null assertion later
  if (!TRANSACTION_ADDRESS) {
    throw new Error('Transaction address not found')
  }

  logger.debug(poll)

  const { status } = poll

  const {
    smart_contract_id: smartContractId,
    token,
    user: bountyCreator,
  } = bounty

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

    try {
      const rewardRecipients: UserWithSelectedOption[] =
        await fetchUsersForMostSelectedOption(poll.id)

      const rewardRecipientAddresses = rewardRecipients.map((user) => {
        const userAddress =
          user.holder_address || (user.connected_addresses?.shift() as string)

        if (!userAddress) {
          const msg = `Could not find address for user id ${user.id}`
          Sentry.captureMessage(msg)
          throw new Error(msg)
        }

        return userAddress
      })

      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
        TRANSACTION_ADDRESS,
        {
          functionName: 'distributeRewards(uint256,address[])',
          args: [String(smartContractId), String(rewardRecipientAddresses)],
        }
      )

      // Poll transaction status
      const { status, transactionHash, errorMessage } =
        await pollTransactionStatus(result.queueId)

      if (status === 'mined' && transactionHash) {
        logger.info('distributeRewards transaction mined successfully')

        // TODO: Get the logs from the RewardsDistributed event so you can get the bountyPerRecipient.
        // We'll have to convert the amount from wei to another magnitude.
        // Then take this amount and send a direct cast to each awardee.
        const bountyPerRecipient = 123

        for (const recipient of rewardRecipients) {
          const { id: responseId } = await fetchResponse(poll.id, recipient.id)

          const bountyClaim: BountyClaim = {
            bounty_id: bounty.id,
            response_id: responseId,
            amount: bountyPerRecipient,
          }

          await insertBountyClaim(bountyClaim)

          // TODO: The implementation needs to be updated once we have the frame url
          await sendDirectCastForPredictivePolls(
            poll,
            recipient.fid,
            bountyCreator.username,
            bountyPerRecipient,
            token.name,
            transactionHash
          )
        }
      } else {
        // Handle case where the transaction did not mine successfully
        logger.error(getErrorMessage(errorMessage))
        Sentry.captureMessage(getErrorMessage(errorMessage))
      }
    } catch (error) {
      Sentry.captureException(error)
      throw new Error(
        `Error calling distributeRewards on PredictivePoll.sol: ${getErrorMessage(
          error
        )}`
      )
    }

    try {
      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
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

        await closeBounty(String(smartContractId), 'predictive_poll')
      } else {
        // Handle case where the transaction did not mine successfully
        logger.error(getErrorMessage(errorMessage))
        Sentry.captureMessage(getErrorMessage(errorMessage))
      }
    } catch (error) {
      Sentry.captureException(error)
      throw new Error(
        `Error calling endPoll on PredictivePoll.sol: ${getErrorMessage(error)}`
      )
    }
  }

  return
}
