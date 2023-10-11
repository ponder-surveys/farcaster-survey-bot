import { Alchemy, Network } from 'alchemy-sdk'

const alchemyKey = process.env.NFT_ALCHEMY_KEY as string
const config = {
  apiKey: alchemyKey,
  network: Network.BASE_MAINNET,
}
const alchemyClient = new Alchemy(config)

export { alchemyClient }
