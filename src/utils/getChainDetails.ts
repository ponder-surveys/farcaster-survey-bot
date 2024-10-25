import { logger } from 'ethers'
import { Sentry } from '../clients/sentry'
import { Bounty } from '../types/common'
import { CHAINS } from '../utils/constants'

export default async function getChainDetails(bounty: Bounty) {
  const chainName = bounty.token?.chain

  logger.info(`Chain: '${chainName}'`)

  if (!chainName) {
    const msg = `Failed to fetch chain details for chain ${chainName}, bounty ${bounty.id}`
    Sentry.captureMessage(msg)
    throw new Error(msg)
  }

  return CHAINS.get(chainName)
}
