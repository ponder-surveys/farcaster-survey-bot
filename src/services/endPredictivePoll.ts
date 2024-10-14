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
  fetchBountyClaimsForPoll,
  updateBountyClaim,
} from '../services/supabase'
import getChainDetails from '../utils/getChainDetails'
import { Poll } from '../types/polls'
import { Bounty } from '../types/common'
import getErrorMessage from '../utils/getErrorMessage'
import sendDirectCastForPredictivePolls from '../utils/sendDirectCast'
import {
  getEventSignatureHash,
  getTransactionReceipt,
  loadWeb3Provider,
} from '../utils/services/web3'
import { PredictivePollABI } from '../utils/contracts'
import Web3 from 'web3'

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
      // Fetch all bounty claims for the poll
      const bountyClaimsForPoll = await fetchBountyClaimsForPoll(poll.id)

      // Calculate the winning option
      const optionCounts = bountyClaimsForPoll.reduce((acc, claim) => {
        const option = claim.response.selected_option
        acc[option] = (acc[option] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      const winningOption = Object.entries(optionCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0]

      // Filter winners and prepare addresses
      const winners = bountyClaimsForPoll.filter(
        (claim) => claim.response.selected_option === Number(winningOption)
      )
      const rewardRecipientAddresses = winners.map((winner) => {
        const userAddress =
          winner.response.user.holder_address ||
          (winner.response.user.connected_addresses?.shift() as string)
        if (!userAddress) {
          throw new Error(
            `Could not find address for user id ${winner.response.user.id}`
          )
        }
        return userAddress
      })

      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
        TRANSACTION_ADDRESS,
        {
          functionName: 'distributeRewards(uint256,uint8,address[])',
          args: [
            String(smartContractId),
            String(winningOption),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rewardRecipientAddresses as any,
          ],
          abi: PredictivePollABI,
        }
      )

      // Poll transaction status
      const { status, transactionHash, errorMessage } =
        await pollTransactionStatus(result.queueId)

      if (status === 'mined' && transactionHash) {
        logger.info('distributeRewards transaction mined successfully')

        const web3 = await loadWeb3Provider(chain.PROVIDER_URL)
        const receipt = await getTransactionReceipt(transactionHash, web3)

        // Get the event signature hash for the emitted event
        const eventSignatureHash = getEventSignatureHash(
          'RewardsDistributed(uint256,address[],uint256)',
          web3
        )

        const eventLog = receipt.logs.find(
          (log) => log.topics && log.topics[0] === eventSignatureHash
        )

        if (eventLog && eventLog.topics && eventLog.topics.length > 1) {
          // Parse the event data
          const totalDistributionWei = Web3.utils.hexToNumber(
            eventLog.topics[3]
          )

          // Convert wei to ether
          const totalDistribution = Number(
            Web3.utils.fromWei(totalDistributionWei.toString(), 'ether')
          )

          // Calculate bounty per recipient
          const bountyPerRecipient = totalDistribution / winners.length

          for (const claim of bountyClaimsForPoll) {
            const isWinner =
              claim.response.selected_option === Number(winningOption)
            await updateBountyClaim(
              bounty.id,
              claim.response.id,
              isWinner ? 'awarded' : 'not_awarded',
              isWinner ? bountyPerRecipient : undefined
            )

            if (isWinner) {
              await sendDirectCastForPredictivePolls(
                poll,
                claim.response.user.fid,
                bountyCreator.username,
                bountyPerRecipient,
                token.name,
                transactionHash
              )
            }
          }
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
    return
  }

  return
}
