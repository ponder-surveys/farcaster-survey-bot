import { createPublicClient, http } from 'viem'
import { optimism } from 'viem/chains'

export const viemClient = createPublicClient({
  chain: optimism,
  transport: http(),
})
