import * as Sentry from '@sentry/node'
import { fetchBounty } from '../services/supabase'
import { CHAINS } from '../utils/constants'

export default async function getChainDetails(bountyId: string) {
  const bounty = await fetchBounty(bountyId)

  const chainName = bounty.token?.chain

  if (!chainName) {
    const msg = `Failed to fetch chain details for chain ${chainName}, bounty ${bountyId}`
    Sentry.captureMessage(msg)
    throw new Error(msg)
  }

  return CHAINS.get(chainName)
}
