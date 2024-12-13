import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

export const viemClient = createPublicClient({
  chain: base,
  transport: http(),
})
