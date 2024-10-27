import { Engine } from '@thirdweb-dev/engine'
import Web3 from 'web3'
import { Sentry } from '../clients/sentry'
import { pollTransactionStatus } from '../clients/thirdweb'
import {
  closeBounty,
  fetchBountyClaimsForPoll,
  updateBountyClaim,
} from '../services/supabase'
import { Bounty, BountyClaim } from '../types/common'
import { Poll } from '../types/polls'
import {
  TRANSACTION_ADDRESS,
  WEB3_ACCESS_TOKEN,
  WEB3_ENGINE_URL,
} from '../utils/constants'
import { PredictivePollABI } from '../utils/contracts'
import getChainDetails from '../utils/getChainDetails'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'
import sendDirectCastForPredictivePolls from '../utils/sendDirectCast'
import {
  getEventSignatureHash,
  getTransactionReceipt,
  loadWeb3Provider,
} from '../utils/services/web3'

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
      const bountyClaimsForPoll: BountyClaim[] = await fetchBountyClaimsForPoll(
        poll.id
      )

      // Calculate the winning option
      const optionCounts = bountyClaimsForPoll.reduce((acc, claim) => {
        const option = claim.response.selected_option
        acc[option] = (acc[option] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      // Find the highest count
      const maxCount = Math.max(...Object.values(optionCounts))

      // Find all options with the highest count (to handle ties)
      const winningOptions: number[] = Object.entries(optionCounts)
        .filter(([_, count]) => count === maxCount)
        .map(([option, _]) => Number(option))

      // Filter winners and prepare addresses
      const winners: BountyClaim[] = bountyClaimsForPoll.filter((claim) =>
        winningOptions.includes(claim.response.selected_option)
      )

      const rewardRecipientAddresses: string[] = winners.map(
        (winner: BountyClaim) => {
          const userAddress =
            winner.response.user.holder_address ||
            (winner.response.user.connected_addresses?.shift() as string)
          if (!userAddress) {
            throw new Error(
              `Could not find address for user id ${winner.response.user.id}`
            )
          }
          return userAddress
        }
      )

      const smartContractIdString = smartContractId.toString()
      const winningOptionsString = JSON.stringify(winningOptions)
      const rewardRecipientAddressesString = JSON.stringify(
        rewardRecipientAddresses
      )

      logger.info(
        `Calling predictive poll contract address ${chain.PREDICTIVE_POLL_CONTRACT_ADDRESS} for poll ${poll.id}`
      )
      logger.info(
        `Predictive poll ${poll.id} winning options: ${winningOptionsString}`
      )
      logger.info(
        `Predictive poll ${poll.id} reward recipient addresses: ${rewardRecipientAddressesString}`
      )
      const { result } = await web3Engine.contract.write(
        String(chain.CHAIN_ID),
        chain.PREDICTIVE_POLL_CONTRACT_ADDRESS,
        TRANSACTION_ADDRESS,
        {
          functionName: 'distributeRewards',
          args: [
            smartContractIdString,
            winningOptionsString,
            rewardRecipientAddressesString,
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
            const isWinner = winningOptions.includes(
              claim.response.selected_option
            )
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

        // Update the status to 'completed'
        closeBounty(String(smartContractId), 'predictive_poll')
        return { message: `Ended predictive poll ${poll.id}`, error: null }
      } else {
        // Handle case where the transaction did not mine successfully
        logger.error(
          `Error calling predictive poll contract address: ${getErrorMessage(
            errorMessage
          )}`
        )
        Sentry.captureMessage(getErrorMessage(errorMessage))
        return { message: null, error: getErrorMessage(errorMessage) }
      }
    } catch (error) {
      Sentry.captureException(error)
      return { message: null, error: getErrorMessage(error) }
    }
  }

  return { message: `Predictive poll ${poll.id} not processed`, error: null }
}
