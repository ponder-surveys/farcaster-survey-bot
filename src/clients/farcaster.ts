import { NeynarAPIClient } from '@standard-crypto/farcaster-js-neynar'

const apiKey = process.env.NEYNAR_API_KEY as string

const farcasterClient = new NeynarAPIClient(apiKey)

export { farcasterClient }
