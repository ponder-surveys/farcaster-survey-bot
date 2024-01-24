import { NeynarAPIClient } from '@neynar/nodejs-sdk'

const apiKey = process.env.NEYNAR_API_KEY as string
const neynarClient = new NeynarAPIClient(apiKey)
const neynarSigner = process.env.NEYNAR_SIGNER_UUID as string

export { neynarClient, neynarSigner }
