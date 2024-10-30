import Web3 from 'web3'
import { Sentry } from '../clients/sentry'
import { distributeRewards, pollTransactionStatus } from '../clients/thirdweb'
import {
  closeBounty,
  fetchBountyClaimsForPoll,
  updateBountyClaim,
} from '../services/supabase'
import { Bounty, BountyClaim } from '../types/common'
import { Poll } from '../types/polls'
import getChainDetails from '../utils/getChainDetails'
import getErrorMessage from '../utils/getErrorMessage'
import logger from '../utils/logger'
import sendDirectCastForPredictivePolls from '../utils/sendDirectCast'
import {
  getEventSignatureHash,
  getTransactionReceipt,
  loadWeb3Provider,
} from '../utils/services/web3'

export const endPredictivePoll = async (poll: Poll, bounty: Bounty) => {
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

      logger.info(
        `Calling predictive poll contract address ${chain.PREDICTIVE_POLL_CONTRACT_ADDRESS} for poll ${poll.id}`
      )
      logger.info(
        `Predictive poll ${poll.id} winning options: ${winningOptions}`
      )
      logger.info(
        `Predictive poll ${poll.id} reward recipient addresses: ${rewardRecipientAddresses}`
      )

      // Call the smart contract
      const result = await distributeRewards(
        smartContractId,
        winningOptions,
        rewardRecipientAddresses,
        chain
      )

      // Poll transaction status
      const { status, transactionHash, errorMessage } =
        await pollTransactionStatus(result.queueId)

      if (status === 'mined' && transactionHash) {
        logger.info(
          `distributeRewards transaction mined successfully for poll ${poll.id}`
        )

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
        Sentry.captureMessage(getErrorMessage(errorMessage))
        return { message: null, error: getErrorMessage(errorMessage) }
      }
    } catch (error) {
      Sentry.captureException(error)
      logger.error(error)
      return { message: null, error }
    }
  }

  return { message: `Predictive poll ${poll.id} not processed`, error: null }
}
