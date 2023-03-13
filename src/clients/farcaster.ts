import { Wallet } from 'ethers'
import { MerkleAPIClient } from '@standard-crypto/farcaster-js'

const buildFarcasterClient = () => {
  const farcasterMnemonic = process.env.FARCASTER_MNEMONIC as string
  const wallet = Wallet.fromMnemonic(farcasterMnemonic)
  const client = new MerkleAPIClient(wallet)

  return client
}

export { buildFarcasterClient }
