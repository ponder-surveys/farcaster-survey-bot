import { getTokenName } from 'api/bounties'
import { getOptionText } from 'api/questions'
import { viemClient } from 'clients/viem'
import { PredictivePollABI } from 'utils/contracts'
import { sendFrameNotifications } from 'utils/sendFrameNotifications'
import Web3 from 'web3'
import { Sentry } from '../clients/sentry'
import {
  distributeRewards,
  endPoll,
  pollTransactionStatus,
} from '../clients/thirdweb'
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

  logger.debug(`bounty: ${bounty}`)
  logger.debug(`status: ${status}`)
  logger.debug(`bounty.status: ${bounty.status}`)
  logger.debug(`smartContractId: ${smartContractId}`)
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

    logger.debug(
      `chain.PREDICTIVE_POLL_CONTRACT_ADDRESS: ${chain.PREDICTIVE_POLL_CONTRACT_ADDRESS}`
    )
    // NOTE: This is a temporary fix until we confirm our lifecycle is more resilient
    const pollIsActive = await viemClient.readContract({
      address: chain.PREDICTIVE_POLL_CONTRACT_ADDRESS as `0x${string}`,
      abi: PredictivePollABI,
      functionName: 'pollIsActive',
      args: [smartContractId],
    })
    logger.debug(`poll id: ${poll.id} pollIsActive: ${pollIsActive}`)
    if (!pollIsActive) {
      // Update the status to 'completed'
      closeBounty(String(smartContractId), 'predictive_poll')
      return {
        message: `Closed predictive poll ${poll.id} on database to match contract state`,
        error: null,
      }
    }

    try {
      // Fetch all bounty claims for the poll
      const bountyClaimsForPoll: BountyClaim[] = await fetchBountyClaimsForPoll(
        poll.id
      )

      logger.debug(`bountyClaimsForPoll: ${bountyClaimsForPoll}`)
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

      const selectedOptions: number[] = winners.map(
        (winner: BountyClaim) => winner.response.selected_option
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

      // If nobody voted, end the poll
      // NOTE: This is temporary because ideally we should always be calling distributeRewards.
      // We'll remove this once we update the smart contract itself.
      if (winningOptions.length === 0) {
        const result = await endPoll(smartContractId, chain)

        // Poll transaction status
        const { errorMessage } = await pollTransactionStatus(result.queueId)

        if (errorMessage) {
          return { message: null, error: getErrorMessage(errorMessage) }
        }

        // Update the status to 'completed'
        closeBounty(String(smartContractId), 'predictive_poll')
        return {
          message: `Closed predictive poll ${poll.id} with no votes`,
          error: null,
        }
      }

      // Call the smart contract
      const result = await distributeRewards(
        smartContractId,
        winningOptions,
        rewardRecipientAddresses,
        selectedOptions,
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
          }

          // Aggregate the voters by selected option
          const votersByOption = bountyClaimsForPoll.reduce<
            Record<
              number,
              { fids: number[]; amountAwarded: number; isWinner: boolean }
            >
          >((acc, claim) => {
            const option = claim.response.selected_option
            if (!acc[option]) {
              acc[option] = {
                fids: [],
                amountAwarded: claim.amount_awarded ?? 0,
                isWinner: claim.status === 'awarded' ? true : false,
              }
            }
            acc[option].fids.push(claim.response.user.fid)
            return acc
          }, {})

          // Iterate through the aggregated winners and send batch notifications by selected option.
          // The reasoning for this is that the messaging will be different per selected option but the
          // amount awarded will be the same.
          logger.info(`Sending frame notifications for poll ${poll.id}`)
          logger.debug(`Voters by option: ${JSON.stringify(votersByOption)}`)

          for (const [
            option,
            { fids, amountAwarded, isWinner },
          ] of Object.entries(votersByOption)) {
            const optionText = await getOptionText(poll.id, Number(option))
            const tokenName = await getTokenName(bounty.id)

            // Split fids into batches of 100
            for (let i = 0; i < fids.length; i += 100) {
              const fidsBatch = fids.slice(i, i + 100)
              await sendFrameNotifications(
                fidsBatch,
                amountAwarded,
                tokenName,
                optionText,
                isWinner,
                poll.id
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
