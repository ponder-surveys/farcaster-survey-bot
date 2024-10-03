import { Sentry } from 'clients/sentry'
import { CHAINS } from '../utils/constants'
import { logger } from 'ethers'
import { Bounty } from 'types/common'

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
