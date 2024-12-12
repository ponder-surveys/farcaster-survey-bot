import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import { NeynarAPIClient as NeynarAPIClientV2, Configuration } from 'neynarv2'

const apiKey = process.env.NEYNAR_API_KEY as string
const config = new Configuration({
  apiKey,
})

const neynarClient = new NeynarAPIClient(apiKey)
const neynarClientV2 = new NeynarAPIClientV2(config)

const neynarSigner = process.env.NEYNAR_SIGNER_UUID as string
const neynarPollSigner = process.env.NEYNAR_POLL_SIGNER_UUID as string

export { neynarClient, neynarClientV2, neynarSigner, neynarPollSigner }
