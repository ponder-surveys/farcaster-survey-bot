import { Sentry } from '../../clients/sentry'
import getErrorMessage from '../../utils/getErrorMessage'
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

function getEventSignatureHash(eventName: string, web3: Web3): string {
  return web3.utils.keccak256(eventName)
}

function getFirstTopic(eventLog: any, web3: Web3): string {
  const encoded = eventLog.topics[1]
  const actual = web3.utils.toBigInt(encoded).toString()

  return actual
}

export {
  loadWeb3Provider,
  getTransactionReceipt,
  getEventSignatureHash,
  getFirstTopic,
}
