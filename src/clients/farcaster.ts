import { Wallet } from 'ethers'
import { MerkleAPIClient } from '@standard-crypto/farcaster-js'

const farcasterMnemonic = process.env.FARCASTER_MNEMONIC as string
const wallet = Wallet.fromMnemonic(farcasterMnemonic)
const farcasterClient = new MerkleAPIClient(wallet)

export { farcasterClient }
