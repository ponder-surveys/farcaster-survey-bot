import type { SmartContractFn } from 'types/common'
import { Sentry } from 'clients/sentry'
import { match } from 'ts-pattern'
import getErrorMessage from 'utils/getErrorMessage'
import { Web3 } from 'web3'

async function loadWeb3Provider(providerUrl: string) {
  return new Web3(providerUrl)
}

async function getTransactionReceipt(transactionHash: string, web3: Web3) {
  try {
    const receipt = await web3.eth.getTransactionReceipt(transactionHash)
    return receipt
  } catch (error) {
    Sentry.captureException(error)
    throw Error(getErrorMessage(error))
  }
}

function getEventSignatureHash(
  smartContractFn: SmartContractFn,
  web3: Web3
): string {
  const eventSignature = match(smartContractFn)
    .with('startPoll', () => 'PollStarted(uint256,address)')
    .with('endPoll', () => 'PollEnded(uint256)')
    .with(
      'claimBounty_Poll',
      () => 'RewardClaimed(uint256,address,bool,uint256)'
    )
    .with('startQuestion', () => 'QuestionStarted(uint256,address)')
    .with('endQuestion', () => 'QuestionEnded(uint256)')
    .with('rewardBounty', () => 'BountyRewarded(uint256,address,uint256)')
    .with(
      'distributeRewards',
      () => 'RewardsDistributed(uint256,address[],uint256)'
    )
    .with('castVote', () => 'VoteCasted(uint256,address)')
    .otherwise((invalidFn) => {
      Sentry.captureException(
        `Unexpected smart contract function: ${invalidFn}`
      )
      throw new Error(`Unexpected smart contract function: ${invalidFn}`)
    })

  const eventSignatureHash = web3.utils.sha3(eventSignature)

  if (eventSignatureHash === undefined) {
    Sentry.captureException('eventSignatureHash is undefined')
    throw new Error('eventSignatureHash is undefined')
  }

  return eventSignatureHash
}

function getContentId(startLog: any, web3: Web3): string {
  // Assuming the content ID is the second topic (index 1) and is indexed
  const contentIdEncoded = startLog.topics[1]
  const contentId = web3.utils.toBigInt(contentIdEncoded).toString()

  return contentId
}

export {
  loadWeb3Provider,
  getTransactionReceipt,
  getEventSignatureHash,
  getContentId,
}
